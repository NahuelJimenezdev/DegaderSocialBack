const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  // Información básica del evento
  organizador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usuariosInicios',
    required: true
  },

  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  descripcion: {
    type: String,
    required: true,
    maxlength: 2000
  },

  // Fecha y hora
  fechaInicio: {
    type: Date,
    required: true
  },

  horaInicio: {
    type: String, // Formato "HH:MM"
    required: true
  },

  fechaFin: {
    type: Date
  },

  horaFin: {
    type: String // Formato "HH:MM"
  },

  zonaHoraria: {
    type: String,
    default: 'America/Argentina/Buenos_Aires'
  },

  // Modalidad del evento
  tipoModalidad: {
    type: String,
    enum: ['presencial', 'virtual', 'hibrido'],
    required: true
  },

  // Ubicación (para eventos presenciales)
  ubicacion: {
    direccion: String,
    ciudad: String,
    provincia: String,
    pais: String,
    coordenadas: {
      latitud: Number,
      longitud: Number
    }
  },

  // Link para eventos virtuales
  linkVirtual: {
    type: String
  },

  // Imágenes del evento
  imagenPortada: {
    type: String // URL de la imagen de portada
  },

  imagenes: [{
    type: String // URLs adicionales de imágenes
  }],

  // Configuración de portada
  tienePortada: {
    type: Boolean,
    default: true
  },

  // Categoría del evento
  categoria: {
    type: String,
    enum: [
      'conferencia', 'taller', 'seminario', 'webinar',
      'networking', 'social', 'deportivo', 'cultural',
      'educativo', 'corporativo', 'tecnologia', 'arte',
      'musica', 'negocios', 'salud', 'otro'
    ],
    default: 'otro'
  },

  // Capacidad y asistencia
  capacidadMaxima: {
    type: Number,
    min: 1
  },

  // Estado del evento
  estado: {
    type: String,
    enum: ['borrador', 'publicado', 'cancelado', 'finalizado'],
    default: 'borrador'
  },

  // Configuración de privacidad y acceso
  esPrivado: {
    type: Boolean,
    default: false
  },

  requiereAprobacion: {
    type: Boolean,
    default: false
  },

  // Configuración detallada de privacidad
  configuracionPrivacidad: {
    // Tipo de privacidad del evento
    tipoPrivacidad: {
      type: String,
      enum: ['publico', 'privado', 'solo_invitados', 'ministerial', 'organizacional'],
      default: 'publico'
    },

    // Visibilidad del evento
    visibilidad: {
      type: String,
      enum: ['publico', 'miembros', 'invitados', 'oculto'],
      default: 'publico'
    },

    // Configuración de aprobación
    aprobacion: {
      requerida: { type: Boolean, default: false },
      autorPersonaAprueba: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuariosInicios'
      },
      mensajeAprobacion: { type: String, maxlength: 500 },
      tiempoLimiteAprobacion: { type: Number, default: 24 }, // horas
      aprobarAutomaticamente: { type: Boolean, default: false }
    },

    // Configuración de registros
    registros: {
      permitirAutoRegistro: { type: Boolean, default: true },
      limiteAsistentes: { type: Number },
      requiereConfirmacion: { type: Boolean, default: false },
      corteFechaRegistro: { type: Date },
      camposAdicionales: [{
        nombre: String,
        tipo: { type: String, enum: ['texto', 'numero', 'email', 'telefono', 'seleccion'] },
        requerido: { type: Boolean, default: false },
        opciones: [String] // para campos de selección
      }]
    },

    // Lista de espera
    listaEspera: {
      activa: { type: Boolean, default: false },
      limite: { type: Number },
      notificarCuandoHayEspacio: { type: Boolean, default: true }
    }
  },

  // Control de acceso organizacional
  restriccionesAcceso: {
    // Nivel jerárquico requerido para ver el evento
    nivelJerarquicoMinimo: {
      type: String,
      enum: ["nacional", "regional", "municipal", "barrio", "local"],
      default: "local"
    },

    // Área geográfica específica
    limitarPorArea: {
      activo: { type: Boolean, default: false },
      pais: [String],
      region: [String],
      municipio: [String],
      barrio: [String]
    },

    // Roles específicos que pueden acceder
    rolesPermitidos: [{
      type: String,
      enum: [
        "Founder", "admin", "Desarrollador",
        "Director Nacional", "Director Regional", "Director Municipal", "Organizador Barrio",
        "Director", "Subdirector", "Encargado", "Profesional", "Miembro", "visitante"
      ]
    }],

    // Ministerios específicos (para eventos ministeriales)
    ministeriosPermitidos: [{
      type: String,
      enum: [
        "musica", "caballeros", "damas", "escuela_dominical",
        "evangelismo", "limpieza", "cocina", "medios", "juventud",
        "intercesion", "consejeria", "visitacion", "seguridad"
      ]
    }],

    // Lista de usuarios específicos invitados (para eventos privados)
    usuariosInvitados: [{
      usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuariosInicios' },
      fechaInvitacion: { type: Date, default: Date.now },
      estadoInvitacion: {
        type: String,
        enum: ['enviada', 'aceptada', 'rechazada', 'pendiente'],
        default: 'pendiente'
      }
    }]
  },

  // Configuración de repetición
  esRecurrente: {
    type: Boolean,
    default: false
  },

  configuracionRecurrencia: {
    tipo: {
      type: String,
      enum: ['diario', 'semanal', 'mensual', 'anual']
    },
    intervalo: Number, // cada X días/semanas/meses/años
    diasSemana: [Number], // 0=domingo, 1=lunes, etc.
    fechaFin: Date
  },

  // Organizadores adicionales
  coOrganizadores: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'usuariosInicios'
    },
    rol: {
      type: String,
      enum: ['organizador', 'moderador', 'colaborador'],
      default: 'colaborador'
    },
    permisos: {
      editarEvento: { type: Boolean, default: false },
      gestionarAsistentes: { type: Boolean, default: false },
      enviarMensajes: { type: Boolean, default: false }
    }
  }],

  // Sistema de boletos/entradas
  configuracionBoletos: {
    esGratuito: {
      type: Boolean,
      default: true
    },
    boletos: [{
      nombre: String, // "Entrada general", "VIP", etc.
      descripcion: String,
      precio: Number,
      cantidad: Number,
      cantidadVendida: { type: Number, default: 0 },
      fechaVentaInicio: Date,
      fechaVentaFin: Date,
      esVisible: { type: Boolean, default: true }
    }]
  },

  // Asistentes y registros
  asistentes: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'usuariosInicios'
    },
    estadoAsistencia: {
      type: String,
      enum: ['pendiente', 'confirmado', 'rechazado', 'en_lista_espera'],
      default: 'pendiente'
    },
    fechaRegistro: {
      type: Date,
      default: Date.now
    },
    tipoRegistro: {
      type: String,
      enum: ['gratuito', 'pagado', 'invitacion'],
      default: 'gratuito'
    },
    boleto: {
      tipo: String,
      codigoQR: String,
      precio: Number
    }
  }],

  // Promoción y marketing
  configuracionPromocion: {
    esPromovido: { type: Boolean, default: false },
    presupuestoPromocion: Number,
    audienciaObjetivo: {
      edadMin: Number,
      edadMax: Number,
      ubicaciones: [String],
      intereses: [String]
    },
    fechaInicioPromocion: Date,
    fechaFinPromocion: Date
  },

  // Agenda del evento
  agenda: [{
    hora: String,
    titulo: String,
    descripcion: String,
    ponente: String,
    duracion: Number // en minutos
  }],

  // Recursos y documentos
  recursos: [{
    nombre: String,
    tipo: {
      type: String,
      enum: ['documento', 'imagen', 'video', 'link']
    },
    url: String,
    esPublico: { type: Boolean, default: false }
  }],

  // Configuración de notificaciones
  notificaciones: {
    recordatorios: {
      unDiaAntes: { type: Boolean, default: true },
      unaHoraAntes: { type: Boolean, default: true },
      alIniciar: { type: Boolean, default: true }
    },
    actualizaciones: {
      cambiosEvento: { type: Boolean, default: true },
      nuevosAsistentes: { type: Boolean, default: false }
    }
  },

  // Métricas y análisis
  metricas: {
    vistas: { type: Number, default: 0 },
    compartidos: { type: Number, default: 0 },
    tasaConversion: Number,
    fuenteTrafico: [{
      fuente: String,
      cantidad: Number
    }]
  },

  // Comentarios y retroalimentación
  comentarios: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'usuariosInicios'
    },
    comentario: String,
    fechaCreacion: {
      type: Date,
      default: Date.now
    },
    esAprobado: {
      type: Boolean,
      default: true
    }
  }],

  // Valoraciones post-evento
  valoraciones: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'usuariosInicios'
    },
    puntuacion: {
      type: Number,
      min: 1,
      max: 5
    },
    comentario: String,
    fechaValoracion: {
      type: Date,
      default: Date.now
    }
  }],

  // Configuración de streaming
  streaming: {
    plataforma: {
      type: String,
      enum: ['youtube', 'twitch', 'facebook', 'zoom', 'meet', 'teams', 'otro']
    },
    urlStreaming: String,
    claveStreaming: String,
    configuracionPrivacidad: String
  },

  // Tags y etiquetas
  tags: [String],

  // Campos de auditoría
  fechaCreacion: {
    type: Date,
    default: Date.now
  },

  fechaActualizacion: {
    type: Date,
    default: Date.now
  },

  historialCambios: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'usuariosInicios'
    },
    accion: String,
    detalles: String,
    fecha: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
eventoSchema.index({ organizador: 1 });
eventoSchema.index({ fechaInicio: 1 });
eventoSchema.index({ estado: 1 });
eventoSchema.index({ categoria: 1 });
eventoSchema.index({ esPrivado: 1 });
eventoSchema.index({ 'ubicacion.ciudad': 1 });
eventoSchema.index({ tags: 1 });

// Virtual para calcular duración del evento
eventoSchema.virtual('duracion').get(function () {
  if (this.fechaFin && this.fechaInicio) {
    return Math.ceil((this.fechaFin - this.fechaInicio) / (1000 * 60 * 60 * 24)); // días
  }
  return null;
});

// Virtual para verificar si el evento ya pasó
eventoSchema.virtual('yaFinalizo').get(function () {
  return new Date() > this.fechaInicio;
});

// Virtual para contar asistentes confirmados
eventoSchema.virtual('asistentesConfirmados').get(function () {
  return this.asistentes.filter(a => a.estadoAsistencia === 'confirmado').length;
});

// Middleware para actualizar fechaActualizacion
eventoSchema.pre('save', function (next) {
  this.fechaActualizacion = new Date();
  next();
});

module.exports = mongoose.model('Evento', eventoSchema);
