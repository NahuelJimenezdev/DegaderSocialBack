require('./db/config.db');
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// 1. MIDDLEWARES BÁSICOS
const corsOptions = {
  origin: 'http://localhost:5173',
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

// 5. MANEJO DE ERRORES
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor corriendo en puerto:', PORT);
  console.log('🌐 Servidor escuchando en todas las interfaces (0.0.0.0)');
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