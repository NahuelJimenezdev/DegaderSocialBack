// models/publicaciones.model.js
const { Schema, model } = require('mongoose');

const publicacionSchema = new Schema({
  autor: { type: Schema.Types.ObjectId, ref: "usuarios", required: true }, // usuario que publica
  titulo: { type: String, trim: true },
  contenido: { type: String, trim: true },
  imagenes: [{ type: String }], // URLs de imágenes opcionales
  videos: [{ type: String }],   // URLs de videos opcionales

  // 🔽🔽 Campos para el feed jerárquico/iglesia
  iglesia: { type: Schema.Types.ObjectId, ref: "iglesias", index: true },
  ministerioDestinoSlug: { type: String, lowercase: true, index: true },
  rolesFundacionDestino: [{ type: String }],
  visibilidad: { type: String, enum: ['publico', 'iglesia', 'ministerio', 'privado'], default: 'publico', index: true },

  // Interacción social
  likes: [{ type: Schema.Types.ObjectId, ref: "usuarios" }],
  comentarios: [
    {
      autor: { type: Schema.Types.ObjectId, ref: "usuarios" },
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
        like: [{ type: Schema.Types.ObjectId, ref: "usuarios" }],
        love: [{ type: Schema.Types.ObjectId, ref: "usuarios" }],
        seen: [{ type: Schema.Types.ObjectId, ref: "usuarios" }],
        dislike: [{ type: Schema.Types.ObjectId, ref: "usuarios" }]
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
