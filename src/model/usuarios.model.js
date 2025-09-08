const { Schema, model } = require('mongoose');

const usuarioSchema = new Schema({
  primernombreUsuario: { type: String, required: true, trim: true },
  segundonombreUsuario: { type: String, trim: true },
  primerapellidoUsuario: { type: String, required: true, trim: true },
  segundoapellidoUsuario: { type: String, trim: true },
  correoUsuario: { type: String, required: true, unique: true, lowercase: true, trim: true },
  contraseniaUsuario: { type: String, required: true }, // luego la encriptas con bcrypt
  // Jerarquía dentro de la fundación/iglesia
  rolUsuario: {
    type: String,
    enum: [
      "Founder", "admin", "Desarrollador",
      "Director Nacional", "Director Regional", "Director Municipal", "Organizador Barrio",
      "Director", "Subdirector", "Encargado", "Profesional", "Miembro", "visitante"
    ],
    default: "Miembro"
  },

  // Estructura organizacional específica
  estructuraOrganizacional: {
    // Nivel jerárquico geográfico
    nivelJerarquico: {
      type: String,
      enum: ["nacional", "regional", "municipal", "barrio", "local"],
      default: "local"
    },

    // Área de responsabilidad geográfica
    areaResponsabilidad: {
      pais: { type: String, trim: true },
      region: { type: String, trim: true },
      municipio: { type: String, trim: true },
      barrio: { type: String, trim: true }
    },

    // Roles ministeriales (para iglesias)
    rolesMinisteriales: [{
      ministerio: {
        type: String,
        enum: [
          "musica", "caballeros", "damas", "escuela_dominical",
          "evangelismo", "limpieza", "cocina", "medios", "juventud",
          "intercesion", "consejeria", "visitacion", "seguridad"
        ]
      },
      cargo: {
        type: String,
        enum: [
          "coordinador", "asistente", "miembro", "lider", "director",
          "maestro", "predicador", "tecnico", "operador"
        ]
      },
      fechaAsignacion: { type: Date, default: Date.now },
      activo: { type: Boolean, default: true }
    }],

    // Permisos específicos del usuario
    permisos: {
      crearEventos: { type: Boolean, default: false },
      aprobarEventos: { type: Boolean, default: false },
      gestionarUsuarios: { type: Boolean, default: false },
      gestionarMinisterios: { type: Boolean, default: false },
      accederReportes: { type: Boolean, default: false },
      moderarContenido: { type: Boolean, default: false }
    }
  },

  estadoUsuario: { type: String, enum: ["activo", "inactivo", "pendiente"], default: "pendiente" },

  // seccion del rollingCode
  idCarrito: { type: String, trim: true, },
  idFavoritos: { type: String, trim: true, },

  // Info personal
  celularUsuario: { type: String, trim: true },
  direccionUsuario: { type: String, trim: true },
  ciudadUsuario: { type: String, trim: true },
  paisUsuario: { type: String, trim: true },


  // Social / perfil
  fotoPerfil: { type: String, default: "" }, // url de imagen
  biografia: { type: String, maxlength: 300 },
  amigos: [{ type: Schema.Types.ObjectId, ref: "usuariosInicios" }],
  solicitudesPendientes: [{ type: Schema.Types.ObjectId, ref: "usuariosInicios" }],
  solicitudesEnviadas: [{ type: Schema.Types.ObjectId, ref: "usuariosInicios" }],
  grupos: [{ type: Schema.Types.ObjectId, ref: "grupos" }], // a qué grupos pertenece
  publicaciones: [{ type: Schema.Types.ObjectId, ref: "publicaciones" }],

  // Seguridad y actividad
  jerarquiaUsuario: { type: String, enum: ["nacional", "regional", "departamental", "municipal", "barrio"], default: "barrio" },
  fechaRegistro: { type: Date, default: Date.now },
  ultimaConexion: { type: Date, default: Date.now },
  version: { type: Number, default: 0 },
  notificaciones: [{
    mensaje: String,
    leido: { type: Boolean, default: false },
    fecha: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true // agrega createdAt y updatedAt automáticamente
});
// En usuarios.model.js, después del Schema:
// usuarioSchema.index({ primernombreUsuario: 1 });
// usuarioSchema.index({ primerapellidoUsuario: 1 });
// usuarioSchema.index({ ciudadUsuario: 1 });
// usuarioSchema.index({ paisUsuario: 1 });

usuarioSchema.methods.toJSON = function () {
  const { contraseniaUsuario, ...usuario } = this.toObject();
  return usuario;
}

const UsuariosModel = model("usuariosInicios", usuarioSchema);
module.exports = UsuariosModel;
