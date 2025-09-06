const { Schema, model } = require('mongoose');

const CarritosSchema = new Schema({
  idUsuario: {
    type: String,
    trim: true,
  },
  productos: [],
});

const CarritosModel = model('carritos', CarritosSchema);
module.exports = CarritosModel;
