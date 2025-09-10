// models/iglesias.model.js
const { Schema, model } = require('mongoose');

// ---------- Subesquemas ----------

const ubicacionSchema = new Schema({
  pais: { type: String, required: true, trim: true },
  provinciaEstado: { type: String, trim: true },   // p.ej. "Buenos Aires"
  departamento: { type: String, trim: true },      // opcional según país
  ciudad: { type: String, trim: true },            // p.ej. "CABA"
  municipio: { type: String, trim: true },
  barrio: { type: String, trim: true },
  direccion: { type: String, trim: true },
  geo: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    // ¡OJO!: formato [longitud, latitud] para 2dsphere
    coordinates: { type: [Number], default: undefined }
  }
}, { _id: false });

const ministerioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    // Puedes editar/expandir esta lista según tu realidad
    enum: [
      'Jóvenes', 'Damas', 'Caballeros', 'Niñez', 'Adolescentes', 'Alabanza',
      'Ujieres', 'Escuela Dominical', 'Misiones', 'Evangelismo', 'Medios',
      'Oración', 'Parejas', 'Consolidación', 'Discipulado', 'Intercesión', 'Otro'
    ]
  },
  alias: { type: String, trim: true },
  slug: { type: String, trim: true, lowercase: true },
  descripcion: { type: String, trim: true, maxlength: 500 },
  lider: { type: Schema.Types.ObjectId, ref: 'usuariosInicios' },
  coLideres: [{ type: Schema.Types.ObjectId, ref: 'usuariosInicios' }],
  miembros: [{ type: Schema.Types.ObjectId, ref: 'usuariosInicios' }],
  // Visibilidad interna por roles (si quieres cruzar con la jerarquía de la fundación)
  visiblesParaRolesFundacion: [{ type: String, trim: true }],
  enlaces: {
    whatsapp: { type: String, trim: true },
    telegram: { type: String, trim: true }
  }
}, { _id: true, timestamps: true });

const reunionSchema = new Schema({
  titulo: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true, maxlength: 1000 },
  inicio: { type: Date, required: true },
  fin: { type: Date },
  modalidad: { type: String, enum: ['presencial', 'virtual', 'mixta'], default: 'presencial' },
  enlaceVirtual: { type: String, trim: true },     // Meet/Zoom/etc.
  ubicacionFisica: { type: String, trim: true },
  // Reglas de visibilidad para filtrar quién la ve en el feed
  visibilidad: {
    alcance: { type: String, enum: ['iglesia', 'ministerio', 'fundacion'], default: 'iglesia' },
    ministeriosDestino: [{ type: Schema.Types.ObjectId }],    // IDs de subdocs de ministerios
    rolesFundacionDestino: [{ type: String, trim: true }],    // p.ej. ["director nacional", "director provincial"]
  }
}, { _id: true, timestamps: true });

// ---------- Esquema principal ----------

const iglesiaSchema = new Schema({
  // Identidad
  nombreIglesia: { type: String, required: true, trim: true },
  slugIglesia: { type: String, trim: true, lowercase: true, index: true },
  acronimo: { type: String, trim: true }, // p.ej. "MMM San Martín"
  descripcion: { type: String, trim: true, maxlength: 1000 },
  denominacion: { type: String, trim: true },      // la denominación a la que pertenece
  coberturaMinisterial: { type: String, trim: true }, // red/organización que la cubre (si aplica)

  // Ubicación
  ubicacion: { type: ubicacionSchema, required: true },

  anioFundacion: { type: Number },
  aforoAprox: { type: Number, min: 0 },

  // Liderazgo
  pastorPrincipal: { type: Schema.Types.ObjectId, ref: 'usuariosInicios', required: true },
  pastoresAsistentes: [{ type: Schema.Types.ObjectId, ref: 'usuariosInicios' }],
  equipoAdministrativo: [{ type: Schema.Types.ObjectId, ref: 'usuariosInicios' }],

  // Membresía y acceso
  miembros: [{ type: Schema.Types.ObjectId, ref: 'usuariosInicios' }],
  solicitudesPendientes: [{
    usuario: { type: Schema.Types.ObjectId, ref: 'usuariosInicios' },
    mensaje: { type: String, trim: true, maxlength: 300 },
    fecha: { type: Date, default: Date.now }
  }],
  bloqueados: [{ type: Schema.Types.ObjectId, ref: 'usuariosInicios' }],

  // Ministerios / grupos internos
  ministerios: [ministerioSchema],

  // Branding / media
  logoUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  galeria: [{ type: String }],

  // Contacto / redes
  contacto: {
    email: { type: String, trim: true, lowercase: true },
    telefono: { type: String, trim: true },
    sitioWeb: { type: String, trim: true },
    horarioAtencion: { type: String, trim: true }
  },
  redes: {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    whatsapp: { type: String, trim: true }
  },

  // Privacidad / unión
  privacidad: { type: String, enum: ['publica', 'privada', 'solo_miembros'], default: 'solo_miembros' },
  permiteUnirsePorCodigo: { type: Boolean, default: false },
  codigoUnion: { type: String, trim: true }, // en prod conviene guardar hash
  requiereAprobacion: { type: Boolean, default: true },

  // Contenidos vinculados
  publicaciones: [{ type: Schema.Types.ObjectId, ref: 'publicaciones' }], // si ya tienes ese model
  reuniones: [reunionSchema],
  notificaciones: [{
    mensaje: String,
    leido: { type: Boolean, default: false },
    fecha: { type: Date, default: Date.now }
  }],

  // Multi-sede (opcional)
  esSedePrincipal: { type: Boolean, default: true },
  iglesiaPadre: { type: Schema.Types.ObjectId, ref: 'iglesias' },
  sedesHijas: [{ type: Schema.Types.ObjectId, ref: 'iglesias' }],

  // Estado y auditoría
  estadoIglesia: { type: String, enum: ['activa', 'inactiva', 'pendiente', 'suspendida'], default: 'activa' },
  creadoPor: { type: Schema.Types.ObjectId, ref: 'usuariosInicios' },
  actualizadoPor: { type: Schema.Types.ObjectId, ref: 'usuariosInicios' },
  fechaRegistro: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ---------- Índices útiles ----------
iglesiaSchema.index({ 'ubicacion.geo': '2dsphere' });
// Unicidad opcional por slug + ciudad (evita duplicados en misma ciudad)
iglesiaSchema.index({ slugIglesia: 1, 'ubicacion.ciudad': 1 }, { unique: false, sparse: true });

// ---------- Helpers ----------
function slugify(str = '') {
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

iglesiaSchema.pre('save', function (next) {
  if (!this.slugIglesia && this.nombreIglesia) {
    const base = [this.nombreIglesia, this.ubicacion?.ciudad].filter(Boolean).join(' ');
    this.slugIglesia = slugify(base);
  }
  next();
});

iglesiaSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // Ocultar campos sensibles si quieres:
  if (obj.codigoUnion) obj.codigoUnion = '***'; // o eliminarlo: delete obj.codigoUnion;
  delete obj.__v;
  return obj;
};

// Virtual de conteo de miembros (cómodo en respuestas)
iglesiaSchema.virtual('miembrosCount').get(function () {
  return Array.isArray(this.miembros) ? this.miembros.length : 0;
});

const IglesiasModel = model('iglesias', iglesiaSchema);
module.exports = IglesiasModel;
