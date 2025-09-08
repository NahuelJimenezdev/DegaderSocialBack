const { Schema, model } = require('mongoose');

const FavoritosSchema = new Schema({
  idUsuario: {
    type: String,
    trim: true,
  },
  productos: [],
});

const FavoritosModel = model('favoritos', FavoritosSchema);
module.exports = FavoritosModel;