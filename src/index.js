require('dotenv').config();
require('./db/config.db');
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configurar Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 1. MIDDLEWARES BÁSICOS
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// 2. SERVIR ARCHIVOS ESTÁTICOS
const uploadsPath = path.join(__dirname, '..', 'uploads'); // Ruta relativa al proyecto
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('📁 Directorio uploads creado:', uploadsPath);
}
console.log('📁 Sirviendo archivos estáticos desde:', uploadsPath);

// Middleware específico para archivos estáticos con headers CORS
app.use('/uploads', (req, res, next) => {
  // Log simplificado para evitar confusión
  console.log(`📷 Sirviendo archivo: uploads${req.path}`);
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));

// 3. RUTAS DE LA API
const indexRoutes = require('./routes/index.routes');
const publicacionesRoutes = require('./routes/publicaciones.routes');
const eventosRoutes = require('./routes/eventos.routes');
const rolesRoutes = require('./routes/roles.routes');
const comentariosPerfilRoutes = require('./routes/comentariosPerfil.routes');
const meRoutes = require('./routes/me.routes');

app.use('/api', indexRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/comentarios-perfil', comentariosPerfilRoutes);
app.use('/api/me', meRoutes);


// 4. HEALTH CHECKS
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando' });
});

// 5. SOCKET.IO - MENSAJES EN TIEMPO REAL
const usuariosConectados = new Map();
// Track current chat a user is viewing to avoid notifying while inside
const usuarioChatActual = new Map(); // userId -> otherUserId they are viewing

// Cargar modelos para persistir
const Notificacion = require('./models/notificaciones.model');
const Usuario = require('./models/usuarios.model');
const MensajeModel = require('./models/mensajes.model');

io.on('connection', (socket) => {
  console.log('🔌 Usuario conectado:', socket.id);

  // Usuario se une a una sala personal
  socket.on('join', (userId) => {
    socket.join(userId);
    usuariosConectados.set(userId, socket.id);
    socket.userId = userId;
    console.log(`👤 Usuario ${userId} se unió a su sala personal`);

    // Notificar que el usuario está en línea
    socket.broadcast.emit('user_online', userId);
  });

  // Usuario sale de línea
  socket.on('disconnect', () => {
    const userId = Array.from(usuariosConectados.entries())
      .find(([_, socketId]) => socketId === socket.id)?.[0];

    if (userId) {
      usuariosConectados.delete(userId);
      socket.broadcast.emit('user_offline', userId);
      console.log(`👤 Usuario ${userId} se desconectó`);
    }
  });

  // Enviar mensaje
  socket.on('send_message', async (data) => {
    try {
      const { destinatarioId, contenido, tipo = 'texto' } = data;

      // Persistir mensaje en la base de datos
      const created = await MensajeModel.create({
        remitente: socket.userId,
        destinatario: destinatarioId,
        contenido,
        tipo
      });
      const populated = await created.populate('remitente', 'primernombreUsuario primerapellidoUsuario fotoPerfil');
      const nuevoMensaje = {
        _id: populated._id.toString(),
        remitente: populated.remitente,
        destinatario: destinatarioId,
        contenido,
        tipo,
        fechaEnvio: populated.fechaEnvio,
        estado: populated.estado
      };

      // Enviar mensaje al destinatario si está conectado
      if (usuariosConectados.has(destinatarioId)) {
        io.to(destinatarioId).emit('receive_message', nuevoMensaje);
      }

      // Confirmar envío al remitente
      socket.emit('message_sent', nuevoMensaje);

      // Crear notificación de mensaje si el destinatario NO está mirando este chat
      const viendoCon = usuarioChatActual.get(destinatarioId);
      const estaViendoEsteChat = viendoCon && (viendoCon.toString() === socket.userId?.toString());
      if (!estaViendoEsteChat) {
        // Persistir notificación
        try {
          const remitente = await Usuario.findById(socket.userId).select('primernombreUsuario primerapellidoUsuario fotoPerfil');

          // Buscar notificación no leída existente del mismo remitente
          const existente = await Notificacion.findOne({
            destinatarioId,
            remitenteId: socket.userId,
            tipo: 'mensaje',
            leida: false
          });

          let notif;
          if (existente) {
            // Incrementar contador y actualizar preview/fecha
            const nuevoConteo = (existente.datos?.count || 1) + 1;
            existente.mensaje = `${remitente?.primernombreUsuario || 'Usuario'} te envió ${nuevoConteo} mensaje${nuevoConteo > 1 ? 's' : ''}`;
            existente.datos = {
              ...(existente.datos || {}),
              count: nuevoConteo,
              preview: contenido,
              remitenteInfo: remitente
            };
            await existente.save();
            notif = existente;
          } else {
            notif = await Notificacion.create({
              destinatarioId,
              remitenteId: socket.userId,
              tipo: 'mensaje',
              mensaje: `${remitente?.primernombreUsuario || 'Usuario'} te envió 1 mensaje`,
              datos: {
                remitenteInfo: remitente,
                preview: contenido,
                count: 1
              },
              enlace: '/mensajes'
            });
          }

          io.to(destinatarioId).emit('notification_message', {
            _id: notif._id.toString(),
            tipo: 'mensaje',
            titulo: 'Nuevo mensaje',
            mensaje: notif.datos?.count > 1 ? `${remitente?.primernombreUsuario || 'Usuario'} te envió ${notif.datos.count} mensajes` : (contenido.length > 80 ? `${contenido.slice(0, 77)}...` : contenido),
            remitenteId: socket.userId,
            destinatarioId,
            createdAt: notif.createdAt,
            remitente,
            count: notif.datos?.count || 1,
            preview: notif.datos?.preview
          });
        } catch (e) {
          console.error('No se pudo persistir notificación de mensaje:', e);
        }
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      socket.emit('message_error', { error: 'Error al enviar mensaje' });
    }
  });

  // Marcar mensaje como leído
  socket.on('mark_as_read', (data) => {
    const { mensajeId, remitenteId } = data;

    // Notificar al remitente que su mensaje fue leído
    if (usuariosConectados.has(remitenteId)) {
      io.to(remitenteId).emit('message_read', { mensajeId });
    }
  });

  // Unirse a sala de grupo
  socket.on('join_group', (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`👥 Usuario se unió al grupo ${groupId}`);
  });

  // Salir de sala de grupo
  socket.on('leave_group', (groupId) => {
    socket.leave(`group_${groupId}`);
    console.log(`👥 Usuario salió del grupo ${groupId}`);
  });

  // Enviar mensaje a grupo
  socket.on('send_group_message', (data) => {
    const { groupId, contenido, tipo = 'texto' } = data;

    const mensajeGrupo = {
      _id: Date.now().toString(),
      remitente: socket.userId,
      grupo: groupId,
      contenido,
      tipo,
      fechaEnvio: new Date()
    };

    // Enviar a todos en el grupo excepto al remitente
    socket.to(`group_${groupId}`).emit('receive_group_message', mensajeGrupo);
  });

  // Typing indicators
  socket.on('typing_start', (data) => {
    const { destinatarioId } = data;
    if (usuariosConectados.has(destinatarioId)) {
      io.to(destinatarioId).emit('user_typing', { userId: socket.userId });
    }
  });

  socket.on('typing_stop', (data) => {
    const { destinatarioId } = data;
    if (usuariosConectados.has(destinatarioId)) {
      io.to(destinatarioId).emit('user_stop_typing', { userId: socket.userId });
    }
  });

  // Registrar que el usuario entró a ver chat con otro usuario
  socket.on('enter_chat', (otroUsuarioId) => {
    if (socket.userId) {
      usuarioChatActual.set(socket.userId.toString(), otroUsuarioId?.toString());
    }
  });

  // Registrar que el usuario salió del chat
  socket.on('leave_chat', () => {
    if (socket.userId) {
      usuarioChatActual.delete(socket.userId.toString());
    }
  });
});

// 6. MANEJO DE ERRORES
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor corriendo en puerto:', PORT);
  console.log('🌐 Servidor escuchando en todas las interfaces (0.0.0.0)');
  console.log('🔌 Socket.IO inicializado');
});

server.on('error', (error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`💥 El puerto ${PORT} ya está en uso`);
  }
});

server.on('listening', () => {
  console.log('✅ Servidor confirmado: listening en puerto', server.address().port);
});