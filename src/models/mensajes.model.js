const { Schema, model } = require('mongoose');

const mensajeSchema = new Schema({
  // Participantes del mensaje
  remitente: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
    required: true
  },
  destinatario: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
    required: true
  },

  // Contenido del mensaje
  contenido: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Tipo de mensaje
  tipo: {
    type: String,
    enum: ['texto', 'imagen', 'archivo', 'audio', 'video'],
    default: 'texto'
  },

  // Archivo adjunto (si es imagen, video, etc.)
  archivoAdjunto: {
    nombre: String,
    url: String,
    tipo: String,
    tamano: Number
  },

  // Estado del mensaje
  estado: {
    type: String,
    enum: ['enviado', 'entregado', 'leido'],
    default: 'enviado'
  },

  // Fecha de envío y lectura
  fechaEnvio: {
    type: Date,
    default: Date.now
  },
  fechaLectura: {
    type: Date
  },

  // Para mensajes de grupo (si se implementa después)
  grupo: {
    type: Schema.Types.ObjectId,
    ref: 'grupos'
  },

  // Reacciones al mensaje
  reacciones: [{
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'usuarios'
    },
    emoji: String,
    fecha: {
      type: Date,
      default: Date.now
    }
  }],

  // Mensaje respondido (para hilos de conversación)
  mensajeRespondido: {
    type: Schema.Types.ObjectId,
    ref: 'mensajes'
  },

  // Si el mensaje fue editado
  editado: {
    type: Boolean,
    default: false
  },
  fechaEdicion: Date,

  // Si el mensaje fue eliminado
  eliminado: {
    type: Boolean,
    default: false
  },
  fechaEliminacion: Date
}, {
  timestamps: true
});

// Índices para optimizar consultas
mensajeSchema.index({ remitente: 1, destinatario: 1, fechaEnvio: -1 });
mensajeSchema.index({ destinatario: 1, estado: 1 });
mensajeSchema.index({ grupo: 1, fechaEnvio: -1 });

// Método para marcar como leído
mensajeSchema.methods.marcarComoLeido = function () {
  this.estado = 'leido';
  this.fechaLectura = new Date();
  return this.save();
};

// Método para agregar reacción
mensajeSchema.methods.agregarReaccion = function (usuarioId, emoji) {
  // Remover reacción existente del mismo usuario
  this.reacciones = this.reacciones.filter(r => r.usuario.toString() !== usuarioId.toString());

  // Agregar nueva reacción
  this.reacciones.push({
    usuario: usuarioId,
    emoji: emoji,
    fecha: new Date()
  });

  return this.save();
};

const MensajeModel = model('mensajes', mensajeSchema);
module.exports = MensajeModel;
