// src/controllers/reuniones.controller.js
const { validationResult } = require('express-validator');
const { crearReunionService } = require('../services/reuniones.service');

async function crearReunionController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { titulo, descripcion, fecha, visibilidad, iglesia } = req.body;

    const nueva = await crearReunionService({
      creadorId: req.user.id,
      iglesiaId: iglesia,
      titulo,
      descripcion,
      fecha,
      visibilidad
    });

    return res.status(201).json({ success: true, data: nueva });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

module.exports = { crearReunionController };
