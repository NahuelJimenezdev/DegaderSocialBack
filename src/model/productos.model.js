const { Schema, model } = require('mongoose')

const ProductosSchema = new Schema({
  nombre: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    minlength: [5, 'El nombre debe tener al menos 5 caracteres'],
    required: [true, 'El nombre es obligatorio'],
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0.01, 'El precio debe ser mayor a 0'],
  },
  imagen: { type: String, trim: true },
  descripcion: { type: String, trim: true },
  estado: {
    type: String,
    trim: true,
    enum: ['habilitado', 'deshabilitado'],
    default: 'deshabilitado',
  },
}, { timestamps: true })

module.exports = model('productos', ProductosSchema)
