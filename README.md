# Degader Social - Backend API

## Node.js + Express + MongoDB - Sistema de Gestión Social y Administrativa

> **Versión:** v1.0  
> **Fecha:** Septiembre 2025  
> **Puerto:** 3001  
> **Base de datos:** MongoDB

---

## 🔍 Visión General

**Degader Social Backend** es una API REST robusta construida con Node.js, Express y MongoDB que proporciona todas las funcionalidades necesarias para una plataforma social empresarial completa. Diseñado específicamente para organizaciones religiosas con estructura jerárquica compleja.

### ✨ Características Principales

- **API REST** completa con autenticación JWT
- **Sistema de roles** multinivel con jerarquías organizacionales
- **Upload de archivos** multimedia con validación avanzada
- **Sistema de amistades** y notificaciones en tiempo real
- **Gestión de eventos** con configuración de privacidad avanzada
- **Base de datos MongoDB** con schemas complejos optimizados
- **Seguridad robusta** con validación y sanitización
- **Arquitectura escalable** preparada para múltiples países

---

## 🚀 Configuración e Instalación

### 1. Requisitos Previos

```bash
# Versiones requeridas
Node.js 18+ (recomendado 20+)
MongoDB 6.0+
npm 9+
```

### 2. Instalación

```bash
# 1. Clonar e instalar dependencias
git clone [repository-url]
cd NodeInicios
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 3. Inicializar usuario administrador
npm run init-admin

# 4. Iniciar servidor de desarrollo
npm run dev
```

### 3. Variables de Entorno

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/degader_social

# Seguridad
JWT_SECRET=tu_clave_super_secreta_jwt_aqui
JWT_EXPIRES_IN=24h

# Servidor
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Configuración de uploads
MAX_FILE_SIZE=50MB
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
ALLOWED_VIDEO_TYPES=mp4,avi,mov,wmv,flv

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

---

## 📁 Estructura del Proyecto

```
NodeInicios/
├── src/
│   ├── controllers/           # Controladores de rutas
│   │   ├── usuarios.controllers.js
│   │   ├── eventos.controllers.js
│   │   ├── amistades.controllers.js
│   │   ├── notificaciones.controllers.js
│   │   ├── roles.controllers.js
│   │   └── upload.controllers.js
│   ├── models/               # Modelos de Mongoose
│   │   ├── usuarios.model.js
│   │   ├── eventos.model.js
│   │   ├── notificaciones.model.js
│   │   ├── grupos.model.js
│   │   └── publicaciones.model.js
│   ├── routes/               # Definición de rutas
│   │   ├── index.routes.js
│   │   ├── eventos.routes.js
│   │   ├── roles.routes.js
│   │   └── upload.routes.js
│   ├── services/             # Lógica de negocio
│   │   ├── usuarios.services.js
│   │   ├── amistades.services.js
│   │   ├── eventos.services.js
│   │   └── notificaciones.services.js
│   ├── middlewares/          # Middlewares personalizados
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   ├── utils/                # Utilidades
│   │   ├── fileUtils.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── db/                   # Configuración de base de datos
│   │   └── config.db.js
│   └── index.js              # Punto de entrada
├── uploads/                  # Archivos subidos
├── scripts/                  # Scripts de inicialización
│   └── initAdmin.js
├── test-*.js                 # Scripts de testing
└── package.json
```

---

## 🔐 Sistema de Autenticación

### Características Implementadas

#### 1. Registro y Login

```javascript
// POST /api/usuarios/register
{
  "primernombreUsuario": "Juan",
  "primerapellidoUsuario": "Pérez",
  "correoUsuario": "juan@ejemplo.com",
  "contraseniaUsuario": "password123",
  "celularUsuario": "+5491166582695"
}

// POST /api/usuarios/login
{
  "correoUsuario": "juan@ejemplo.com",
  "contraseniaUsuario": "password123"
}
// Response: { token, usuario }
```

#### 2. Roles y Jerarquías

```javascript
const roles = [
  "Founder",
  "admin",
  "Desarrollador",
  "Director Nacional",
  "Director Regional",
  "Director Municipal",
  "Organizador Barrio",
  "Director",
  "Subdirector",
  "Encargado",
  "Profesional",
  "Miembro",
  "visitante",
];

const jerarquias = ["nacional", "regional", "municipal", "barrio", "local"];
```

#### 3. Estructura Organizacional

```javascript
// Ejemplo de usuario con estructura organizacional completa
{
  estructuraOrganizacional: {
    nivelJerarquico: "regional",
    areaResponsabilidad: {
      pais: "Argentina",
      region: "Buenos Aires",
      municipio: "La Plata"
    },
    rolesMinisteriales: [{
      ministerio: "musica",
      cargo: "coordinador",
      activo: true
    }],
    permisos: {
      crearEventos: true,
      aprobarEventos: true,
      gestionarUsuarios: false
    }
  }
}
```

---

## 👥 Sistema de Usuarios Avanzado

### Funcionalidades del Modelo de Usuario

#### 1. Información Completa

```javascript
// Campos principales del modelo
{
  primernombreUsuario: String,
  segundonombreUsuario: String,
  primerapellidoUsuario: String,
  segundoapellidoUsuario: String,
  correoUsuario: String, // único, índice
  contraseniaUsuario: String, // hash con argon2

  // Información personal
  celularUsuario: String,
  direccionUsuario: String,
  ciudadUsuario: String,
  paisUsuario: String,
  fotoPerfil: String, // URL
  biografia: String, // máx 300 caracteres

  // Sistema social
  amigos: [ObjectId], // referencias a otros usuarios
  solicitudesPendientes: [ObjectId],
  solicitudesEnviadas: [ObjectId],
  grupos: [ObjectId],
  publicaciones: [ObjectId],

  // Notificaciones
  notificaciones: [{
    mensaje: String,
    leido: Boolean,
    fecha: Date,
    tipo: String,
    datos: Object // información adicional según tipo
  }]
}
```

#### 2. Estados de Usuario

- **activo:** Acceso completo según rol
- **inactivo:** Sin acceso al sistema
- **pendiente:** Acceso limitado, esperando aprobación

#### 3. Sistema de Permisos

```javascript
// Verificación de permisos basada en roles y jerarquía
const verificarPermiso = (usuario, accion) => {
  const jerarquiaOrden = [
    "visitante",
    "miembro",
    "profesional",
    "encargado",
    "subdirector",
    "director",
  ];
  const nivelUsuario = jerarquiaOrden.indexOf(usuario.rolUsuario);
  const nivelRequerido = jerarquiaOrden.indexOf(accion.rolMinimo);

  return nivelUsuario >= nivelRequerido;
};
```

---

## 🤝 Sistema de Amistades

### API Completa de Amistades

#### 1. Endpoints Principales

```javascript
// GET /api/amistades - Obtener lista de amigos
// POST /api/amistades - Enviar solicitud de amistad
// PATCH /api/amistades/:id/estado - Aceptar/rechazar solicitud
// DELETE /api/amistades/:id - Eliminar amistad
// GET /api/amistades/solicitudes - Solicitudes pendientes
```

#### 2. Flujo de Solicitudes

```javascript
// 1. Enviar solicitud
POST /api/amistades
{
  "usuarioDestinoId": "64f1234567890abcdef12345"
}

// 2. Responder solicitud
PATCH /api/amistades/64f1234567890abcdef12345/estado
{
  "estado": "aceptada" // o "rechazada"
}

// 3. Resultado automático: actualización en ambos usuarios
```

#### 3. Integración con Notificaciones

- **Solicitud enviada:** Notificación al destinatario
- **Solicitud aceptada:** Notificación al remitente
- **Solicitud rechazada:** Sin notificación (privacidad)

---

## 🎉 Sistema de Eventos Avanzado

### Características del Modelo de Eventos

#### 1. Información Básica

```javascript
{
  organizador: ObjectId, // ref a usuario
  nombre: String, // máx 100 caracteres
  descripcion: String, // máx 2000 caracteres
  fechaInicio: Date,
  horaInicio: String, // formato "HH:MM"
  fechaFin: Date,
  horaFin: String,
  zonaHoraria: String,
  tipoModalidad: ['presencial', 'virtual', 'hibrido'],
  ubicacion: {
    direccion: String,
    ciudad: String,
    provincia: String,
    pais: String,
    coordenadas: { latitud: Number, longitud: Number }
  },
  linkVirtual: String,
  imagenPortada: String,
  imagenes: [String]
}
```

#### 2. Configuración Avanzada de Privacidad

```javascript
{
  configuracionPrivacidad: {
    tipoPrivacidad: ['publico', 'privado', 'solo_invitados', 'ministerial', 'organizacional'],
    visibilidad: ['publico', 'miembros', 'invitados', 'oculto'],

    aprobacion: {
      requerida: Boolean,
      autorPersonaAprueba: ObjectId,
      mensajeAprobacion: String,
      tiempoLimiteAprobacion: Number, // horas
      aprobarAutomaticamente: Boolean
    },

    registros: {
      permitirAutoRegistro: Boolean,
      limiteAsistentes: Number,
      requiereConfirmacion: Boolean,
      corteFechaRegistro: Date,
      camposAdicionales: [{
        nombre: String,
        tipo: String,
        requerido: Boolean,
        opciones: [String]
      }]
    },

    listaEspera: {
      activa: Boolean,
      limite: Number,
      notificarCuandoHayEspacio: Boolean
    }
  }
}
```

#### 3. Control de Acceso Organizacional

```javascript
{
  restriccionesAcceso: {
    nivelJerarquicoMinimo: String,
    limitarPorArea: {
      activo: Boolean,
      pais: [String],
      region: [String],
      municipio: [String],
      barrio: [String]
    },
    rolesPermitidos: [String],
    ministeriosPermitidos: [String]
  }
}
```

#### 4. APIs de Eventos

```javascript
// GET /api/eventos - Listar eventos (filtrado por permisos)
// POST /api/eventos - Crear evento
// GET /api/eventos/:id - Detalle de evento
// PATCH /api/eventos/:id - Actualizar evento
// DELETE /api/eventos/:id - Eliminar evento
// POST /api/eventos/:id/registro - Registrarse en evento
// GET /api/eventos/:id/participantes - Lista de participantes
// PATCH /api/eventos/:id/participantes/:userId/estado - Aprobar/rechazar participante
```

---

## 📤 Sistema de Upload Multimedia

### Configuración de Multer Avanzada

#### 1. Validación de Archivos

```javascript
// Tipos permitidos
const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const videoTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv"];

// Límites de tamaño
const fileSizeLimits = {
  image: 5 * 1024 * 1024, // 5MB
  video: 50 * 1024 * 1024, // 50MB
};
```

#### 2. Estructura de Almacenamiento

```
uploads/
├── avatars/           # Fotos de perfil
│   ├── 2025/
│   │   ├── 09/        # Año/Mes
│   │   │   ├── user1_avatar.jpg
│   │   │   └── user2_avatar.webp
├── events/            # Imágenes de eventos
│   ├── 2025/09/
├── multimedia/        # Archivos generales
│   ├── images/
│   └── videos/
└── temp/             # Archivos temporales
```

#### 3. Procesamiento de Imágenes con Sharp

```javascript
// Redimensionamiento automático para avatares
const processAvatar = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .resize(300, 300, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
};
```

#### 4. APIs de Upload

```javascript
// POST /api/upload/avatar - Upload de avatar (multipart/form-data)
// POST /api/upload/multimedia - Upload general (multipart/form-data)
// POST /api/upload/evento/:id/imagen - Upload imagen de evento
// DELETE /api/upload/:tipo/:filename - Eliminar archivo
```

---

## 🔔 Sistema de Notificaciones

### Tipos de Notificaciones Implementadas

#### 1. Estructura de Notificación

```javascript
{
  _id: ObjectId,
  usuario: ObjectId, // destinatario
  tipo: String, // tipo de notificación
  mensaje: String, // mensaje legible
  datos: Object, // datos específicos del tipo
  leido: Boolean,
  fecha: Date,
  accionRequerida: Boolean, // si requiere acción del usuario
  urlAccion: String // URL para realizar acción
}
```

#### 2. Tipos Implementados

```javascript
const tiposNotificacion = {
  SOLICITUD_AMISTAD: "solicitud_amistad",
  AMISTAD_ACEPTADA: "amistad_aceptada",
  EVENTO_INVITACION: "evento_invitacion",
  EVENTO_APROBACION_PENDIENTE: "evento_aprobacion_pendiente",
  EVENTO_APROBADO: "evento_aprobado",
  EVENTO_RECHAZADO: "evento_rechazado",
  PUBLICACION_LIKE: "publicacion_like",
  PUBLICACION_COMENTARIO: "publicacion_comentario",
  GRUPO_INVITACION: "grupo_invitacion",
  SISTEMA_ANUNCIO: "sistema_anuncio",
};
```

#### 3. APIs de Notificaciones

```javascript
// GET /api/notificaciones - Obtener notificaciones del usuario
// GET /api/notificaciones/count - Contar no leídas
// PATCH /api/notificaciones/:id/leida - Marcar como leída
// PATCH /api/notificaciones/marcar-todas-leidas - Marcar todas como leídas
// DELETE /api/notificaciones/:id - Eliminar notificación
```

---

## 🏢 Sistema de Roles Organizacionales

### Gestión Avanzada de Roles

#### 1. Estructura Jerárquica

```javascript
const estructuraJerarquica = {
  nacional: {
    nombre: "Dirección Nacional",
    areas: [
      "planeacion",
      "asuntos_etnicos",
      "infraestructura",
      "sostenibilidad",
      "rrhh_seguridad",
      "juridica",
      "salud",
      "psicosocial",
      "proteccion_animal",
      "educacion",
      "financiera",
      "comunicacion",
      "seguridad",
    ],
    permisos: [
      "crear_eventos_nacionales",
      "gestionar_usuarios_todos",
      "acceder_reportes_completos",
    ],
  },
  regional: {
    nombre: "Dirección Regional",
    areas: ["mismas_areas_nacional"],
    permisos: [
      "crear_eventos_regionales",
      "gestionar_usuarios_region",
      "acceder_reportes_regionales",
    ],
  },
  // ... más niveles
};
```

#### 2. Asignación de Roles

```javascript
// POST /api/roles/asignar - Asignar rol organizacional
{
  "usuarioId": "64f1234567890abcdef12345",
  "rolOrganizacional": {
    "nivel": "regional",
    "area": "salud",
    "cargo": "Director Regional de Salud",
    "pais": "Argentina",
    "region": "Buenos Aires"
  },
  "permisos": {
    "crearEventos": true,
    "aprobarEventos": true,
    "gestionarUsuarios": true,
    "accederReportes": true
  }
}
```

#### 3. Validación de Permisos

```javascript
// Middleware de verificación de permisos
const verificarPermisoAccion = (accionRequerida) => {
  return async (req, res, next) => {
    const usuario = req.usuario;
    const tienePermiso = await verificarPermiso(usuario, accionRequerida);

    if (!tienePermiso) {
      return res.status(403).json({
        error: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
};
```

---

## 🛠️ Scripts de Desarrollo y Testing

### Scripts Disponibles

#### 1. Scripts npm

```json
{
  "scripts": {
    "dev": "node --watch --env-file .env src/index.js",
    "start": "node --env-file .env src/index.js",
    "init-admin": "node --env-file .env scripts/initAdmin.js",
    "test": "node --env-file .env test-api.js"
  }
}
```

#### 2. Scripts de Testing

```bash
# Testing de APIs específicas
node test-api.js                    # Test general de APIs
node test-login-simple.js           # Test de autenticación
node test-servicio-amistad.js       # Test sistema de amistades
node test-subida-archivos.js        # Test upload multimedia
node verificar-usuarios.js          # Verificar estado de usuarios
node debug-solicitudes.js           # Debug solicitudes de amistad
```

#### 3. Utilidades de Desarrollo

```bash
# Limpiar estados de amistad
node limpiar-estados.js

# Verificar credenciales de usuario específico
node verificar-credenciales.js

# Búsqueda simple de usuarios
node test-busqueda-simple.js
```

---

## 🔒 Seguridad y Validación

### Medidas de Seguridad Implementadas

#### 1. Autenticación JWT

```javascript
// Configuración de JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: "24h",
  issuer: "degader-social-api",
  audience: "degader-social-app",
};

// Middleware de verificación
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
```

#### 2. Validación de Datos

```javascript
// Ejemplo de validación con express-validator
const validarRegistroUsuario = [
  body("correoUsuario").isEmail().normalizeEmail(),
  body("contraseniaUsuario").isLength({ min: 6 }),
  body("primernombreUsuario").trim().isLength({ min: 2 }),
  body("celularUsuario").isMobilePhone("es-AR"),
];
```

#### 3. Sanitización de Inputs

```javascript
// Sanitización automática en todos los endpoints
app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
  // Sanitizar datos de entrada
  if (req.body) {
    sanitizeObject(req.body);
  }
  next();
});
```

#### 4. CORS y Headers de Seguridad

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
```

---

## 📊 Base de Datos y Optimización

### Configuración de MongoDB

#### 1. Índices Optimizados

```javascript
// Índices principales para performance
usuarioSchema.index({ correoUsuario: 1 }, { unique: true });
usuarioSchema.index({ primernombreUsuario: 1, primerapellidoUsuario: 1 });
usuarioSchema.index({ ciudadUsuario: 1, paisUsuario: 1 });
usuarioSchema.index({ rolUsuario: 1, estadoUsuario: 1 });

eventoSchema.index({ organizador: 1 });
eventoSchema.index({ fechaInicio: 1, estado: 1 });
eventoSchema.index({ "configuracionPrivacidad.tipoPrivacidad": 1 });
```

#### 2. Agregaciones Complejas

```javascript
// Ejemplo de agregación para obtener amigos con información completa
const obtenerAmigosConInfo = async (usuarioId) => {
  return await UsuariosModel.aggregate([
    { $match: { _id: new ObjectId(usuarioId) } },
    {
      $lookup: {
        from: "usuarios",
        localField: "amigos",
        foreignField: "_id",
        as: "amigosInfo",
        pipeline: [
          {
            $project: {
              primernombreUsuario: 1,
              primerapellidoUsuario: 1,
              fotoPerfil: 1,
              ciudadUsuario: 1,
              rolUsuario: 1,
              ultimaConexion: 1,
            },
          },
        ],
      },
    },
  ]);
};
```

#### 3. Validaciones de Schema

```javascript
// Validaciones personalizadas en schemas
usuarioSchema.pre('save', function(next) {
  // Validación de email único
  if (this.isModified('correoUsuario')) {
    // Lógica de validación
  }

  // Hash de contraseña si fue modificada
  if (this.isModified('contraseniaUsuario')) {
    this.contraseniaUsuario = await argon2.hash(this.contraseniaUsuario);
  }

  next();
});
```

---

## 🚀 Deployment y Producción

### Configuración para Producción

#### 1. Variables de Entorno Producción

```env
# Producción
NODE_ENV=production
PORT=3001

# Base de datos (MongoDB Atlas recomendado)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/degader_social

# Seguridad
JWT_SECRET=clave_super_segura_de_256_bits_minimo
SESSION_SECRET=otra_clave_segura_para_sesiones

# CORS (dominio de producción)
CORS_ORIGIN=https://degader-social.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/degader-social/app.log
```

#### 2. Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY scripts/ ./scripts/

EXPOSE 3001

CMD ["node", "src/index.js"]
```

#### 3. Docker Compose

```yaml
version: "3.8"
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/degader_social
    depends_on:
      - mongo
    volumes:
      - uploads:/app/uploads

  mongo:
    image: mongo:6.0
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=degader_social

volumes:
  mongo_data:
  uploads:
```

---

## 📈 Monitoreo y Logs

### Sistema de Logging

#### 1. Configuración de Logs

```javascript
// Configuración de Morgan para logging HTTP
app.use(
  morgan("combined", {
    stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
      flags: "a",
    }),
  })
);

// Logging personalizado
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || "");
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || "");
  },
};
```

#### 2. Health Checks

```javascript
// Endpoint de salud del sistema
app.get("/api/health", async (req, res) => {
  try {
    // Verificar conexión a base de datos
    await mongoose.connection.db.admin().ping();

    // Verificar espacio en disco para uploads
    const stats = await fs.promises.stat("./uploads");

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: "connected",
      uploads: "accessible",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});
```

#### 3. Métricas de Performance

```javascript
// Middleware para medir tiempo de respuesta
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});
```

---

## 🔧 Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Errores de Conexión a MongoDB

```bash
# Error: MongooseError: Can't call `openUri()` on an active connection
# Solución: Verificar que no hay múltiples conexiones
# Revisar config.db.js

# Error: Authentication failed
# Solución: Verificar credenciales en MONGODB_URI
# Formato: mongodb://usuario:contraseña@host:puerto/database
```

#### 2. Problemas de Upload

```bash
# Error: MulterError: File too large
# Solución: Aumentar límite en middleware de multer

# Error: ENOENT: no such file or directory
# Solución: Verificar que directorio uploads existe
mkdir -p uploads/avatars uploads/multimedia uploads/events
```

#### 3. Errores de JWT

```bash
# Error: JsonWebTokenError: invalid signature
# Solución: Verificar JWT_SECRET en .env

# Error: TokenExpiredError: jwt expired
# Solución: Implementar refresh token o aumentar expiración
```

#### 4. Performance Issues

```javascript
// Problema: Consultas lentas
// Solución: Agregar índices apropiados
db.usuarios.createIndex({ correoUsuario: 1 });
db.eventos.createIndex({ fechaInicio: 1, estado: 1 });

// Problema: Muchas consultas N+1
// Solución: Usar populate con select específico
Usuario.find().populate("amigos", "primernombreUsuario fotoPerfil");
```

---

## 📞 Soporte y Mantenimiento

### Información de Contacto

- **Desarrollador:** Nahuel Jiménez
- **Email:** naedjima93@gmail.com
- **WhatsApp:** [+54 9 11 6658-2695](https://wa.me/5491166582695?text=Hola%20Nahuel%2C%20consulta%20sobre%20Backend%20Degader%20Social)

### Comandos de Mantenimiento

```bash
# Backup de base de datos
mongodump --uri="mongodb://localhost:27017/degader_social" --out=./backup/

# Restaurar base de datos
mongorestore --uri="mongodb://localhost:27017/degader_social" ./backup/degader_social

# Limpiar logs antiguos
find ./logs -name "*.log" -mtime +30 -delete

# Verificar integridad de uploads
node scripts/verificar-uploads.js
```

---

## 📋 Checklist de Producción

### ✅ Antes del Deploy

- [ ] Variables de entorno configuradas
- [ ] Base de datos optimizada con índices
- [ ] Logs configurados correctamente
- [ ] Certificados SSL instalados
- [ ] Firewall configurado (solo puertos necesarios)
- [ ] Backup automático configurado
- [ ] Monitoreo de salud implementado
- [ ] Rate limiting configurado
- [ ] Compresión gzip habilitada

### ✅ Post-Deploy

- [ ] Health checks funcionando
- [ ] Logs generándose correctamente
- [ ] Todas las APIs respondiendo
- [ ] Upload de archivos operativo
- [ ] Notificaciones funcionando
- [ ] Performance aceptable
- [ ] Backup automático ejecutándose

---

> **Estado del Backend:** ✅ **COMPLETAMENTE FUNCIONAL**  
> **Versión:** v1.0 - Septiembre 2025  
> **Listo para:** Producción y escalabilidad  
> **Compatibilidad:** Frontend Degader Social v0.7+

---

_Documentación generada para el backend completo de Degader Social - Sistema de gestión social y administrativa._
