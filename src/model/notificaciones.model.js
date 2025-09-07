// src/model/notificaciones.model.js
const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  // Usuario que recibe la notificación
  destinatarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usuariosInicios',
    required: true,
    index: true
  },

  // Usuario que genera la notificación (opcional para notificaciones del sistema)
  remitenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usuariosInicios',
    required: false
  },

  // Tipo de notificación
  tipo: {
    type: String,
    required: true,
    enum: [
      'solicitud_amistad',
      'amistad_aceptada',
      'amistad_rechazada',
      'comentario',
      'like',
      'mensaje',
      'reunion',
      'publicacion',
      'grupo',
      'iglesia',
      'sistema'
    ]
  },

  // Mensaje de la notificación
  mensaje: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Estado de lectura
  leida: {
    type: Boolean,
    default: false,
    index: true
  },

  // Fecha de lectura
  fechaLectura: {
    type: Date,
    default: null
  },

  // Datos adicionales específicos por tipo
  datos: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // URL o acción a realizar al hacer clic
  enlace: {
    type: String,
    required: false
  },

  // Prioridad de la notificación
  prioridad: {
    type: String,
    enum: ['baja', 'normal', 'alta', 'urgente'],
    default: 'normal'
  },

  // Fecha de expiración (opcional)
  fechaExpiracion: {
    type: Date,
    required: false
  },

  // Metadatos adicionales
  metadata: {
    plataforma: {
      type: String,
      default: 'web'
    },
    version: {
      type: String,
      default: '1.0'
    }
  }
}, {
  timestamps: true,
  collection: 'notificaciones'
});

// === ÍNDICES ===
notificacionSchema.index({ destinatarioId: 1, createdAt: -1 });
notificacionSchema.index({ destinatarioId: 1, leida: 1 });
notificacionSchema.index({ tipo: 1, createdAt: -1 });
notificacionSchema.index({ fechaExpiracion: 1 }, { expireAfterSeconds: 0 });

// === MÉTODOS ESTÁTICOS ===

// Crear notificación de solicitud de amistad
notificacionSchema.statics.crearNotificacionSolicitudAmistad = async function (remitenteId, destinatarioId, remitente) {
  const mensaje = `${remitente.primernombreUsuario} ${remitente.primerapellidoUsuario} te envió una solicitud de amistad`;

  return await this.create({
    destinatarioId,
    remitenteId,
    tipo: 'solicitud_amistad',
    mensaje,
    datos: {
      remitenteInfo: {
        primernombreUsuario: remitente.primernombreUsuario,
        primerapellidoUsuario: remitente.primerapellidoUsuario,
        fotoPerfil: remitente.fotoPerfil,
        cargoFundacion: remitente.cargoFundacion,
        pais: remitente.pais
      }
    },
    enlace: `/perfil/${remitenteId}`,
    prioridad: 'alta'
  });
};

// Crear notificación de amistad aceptada
notificacionSchema.statics.crearNotificacionAmistadAceptada = async function (remitenteId, destinatarioId, remitente) {
  const mensaje = `${remitente.primernombreUsuario} ${remitente.primerapellidoUsuario} aceptó tu solicitud de amistad`;

  return await this.create({
    destinatarioId,
    remitenteId,
    tipo: 'amistad_aceptada',
    mensaje,
    datos: {
      remitenteInfo: {
        primernombreUsuario: remitente.primernombreUsuario,
        primerapellidoUsuario: remitente.primerapellidoUsuario,
        fotoPerfil: remitente.fotoPerfil,
        cargoFundacion: remitente.cargoFundacion
      }
    },
    enlace: `/perfil/${remitenteId}`,
    prioridad: 'normal'
  });
};

// Obtener notificaciones por usuario con paginación
notificacionSchema.statics.obtenerPorUsuario = async function (userId, opciones = {}) {
  const {
    page = 1,
    limit = 20,
    tipo = null,
    leidas = null,
    soloNoLeidas = false
  } = opciones;

  const skip = (page - 1) * limit;
  const filtros = { destinatarioId: userId };

  if (tipo) filtros.tipo = tipo;
  if (leidas !== null) filtros.leida = leidas;
  if (soloNoLeidas) filtros.leida = false;

  const notificaciones = await this.find(filtros)
    .populate('remitenteId', 'primernombreUsuario primerapellidoUsuario fotoPerfil cargoFundacion pais')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(filtros);

  return {
    notificaciones,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

// Contar notificaciones no leídas
notificacionSchema.statics.contarNoLeidas = async function (userId) {
  return await this.countDocuments({
    destinatarioId: userId,
    leida: false
  });
};

// Marcar como leída
notificacionSchema.methods.marcarComoLeida = async function () {
  if (!this.leida) {
    this.leida = true;
    this.fechaLectura = new Date();
    await this.save();
  }
  return this;
};

// === MIDDLEWARES ===

// Limpiar notificaciones expiradas antes de guardar
notificacionSchema.pre('save', function (next) {
  if (this.fechaExpiracion && this.fechaExpiracion < new Date()) {
    return next(new Error('No se puede guardar una notificación expirada'));
  }
  next();
});

// Populate automático del remitente en find
notificacionSchema.pre(/^find/, function (next) {
  this.populate('remitenteId', 'primernombreUsuario primerapellidoUsuario fotoPerfil cargoFundacion pais');
  next();
});

const Notificacion = mongoose.model('Notificacion', notificacionSchema);

module.exports = Notificacion;
