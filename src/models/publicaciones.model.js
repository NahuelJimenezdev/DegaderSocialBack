// models/publicaciones.model.js
const { Schema, model } = require('mongoose');

const publicacionSchema = new Schema({
  autor: { type: Schema.Types.ObjectId, ref: "usuariosInicios", required: true }, // usuario que publica
  titulo: { type: String, trim: true },
  contenido: { type: String, trim: true },
  imagenes: [{ type: String }], // URLs de imágenes opcionales
  videos: [{ type: String }],   // URLs de videos opcionales

  // Interacción social
  likes: [{ type: Schema.Types.ObjectId, ref: "usuariosInicios" }],
  comentarios: [
    {
      autor: { type: Schema.Types.ObjectId, ref: "usuariosInicios" },
      texto: { type: String, trim: true },
      imagenes: [
        {
          url: { type: String, required: true },
          nombre: { type: String },
          tamaño: { type: Number }
        }
      ],
      videos: [
        {
          url: { type: String, required: true },
          nombre: { type: String },
          tamaño: { type: Number },
          duracion: { type: Number }
        }
      ],
      // Reacciones a comentarios
      reacciones: {
        like: [{ type: Schema.Types.ObjectId, ref: "usuariosInicios" }],
        love: [{ type: Schema.Types.ObjectId, ref: "usuariosInicios" }],
        seen: [{ type: Schema.Types.ObjectId, ref: "usuariosInicios" }],
        dislike: [{ type: Schema.Types.ObjectId, ref: "usuariosInicios" }]
      },
      fecha: { type: Date, default: Date.now }
    }
  ],

  // Meta info
  fechaPublicacion: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }
}, {
  timestamps: true // agrega createdAt y updatedAt automáticamente
});

const PublicacionesModel = model("publicaciones", publicacionSchema);
module.exports = PublicacionesModel;
