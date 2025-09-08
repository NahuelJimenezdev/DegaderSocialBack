// src/models/comentariosPerfil.model.js
const mongoose = require('mongoose');

const comentarioPerfilSchema = new mongoose.Schema({
  // Usuario que escribe el comentario
  autorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  // Usuario que recibe el comentario (dueño del perfil)
  perfilUsuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  // Contenido del comentario
  contenido: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },

  // Comentario padre (para respuestas)
  comentarioPadreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComentarioPerfil',
    default: null
  },

  // Estado del comentario
  estado: {
    type: String,
    enum: ['activo', 'eliminado', 'reportado'],
    default: 'activo'
  },

  // Fechas
  fechaCreacion: {
    type: Date,
    default: Date.now
  },

  fechaEdicion: {
    type: Date,
    default: null
  },

  // Likes/reacciones (opcional para futuro)
  likes: [{
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  }],

  // Metadata
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para optimizar consultas
comentarioPerfilSchema.index({ perfilUsuarioId: 1, fechaCreacion: -1 });
comentarioPerfilSchema.index({ autorId: 1, fechaCreacion: -1 });
comentarioPerfilSchema.index({ comentarioPadreId: 1 });
comentarioPerfilSchema.index({ estado: 1 });

// Middleware para poblar información del autor automáticamente
comentarioPerfilSchema.pre(['find', 'findOne'], function () {
  this.populate({
    path: 'autorId',
    select: 'primernombreUsuario primerapellidoUsuario fotoPerfil rolUsuario'
  });
});

// Método para obtener preview del contenido
comentarioPerfilSchema.methods.getPreview = function (maxLength = 50) {
  if (this.contenido.length <= maxLength) {
    return this.contenido;
  }
  return this.contenido.substring(0, maxLength).trim() + '...';
};

// Método para contar respuestas
comentarioPerfilSchema.methods.contarRespuestas = async function () {
  return await this.constructor.countDocuments({
    comentarioPadreId: this._id,
    estado: 'activo'
  });
};

module.exports = mongoose.model('ComentarioPerfil', comentarioPerfilSchema);
