// src/controllers/buscar.controller.js
const { buscarEnBaseDeDatos } = require('../services/busqueda.service');

const buscar = async (req, res) => {
  try {
    const { q, soloAmigos = false } = req.query;
    const data = await buscarEnBaseDeDatos(q, req.user?.id, soloAmigos === 'true');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error en controlador de búsqueda:', err);
    return res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = { buscar };
