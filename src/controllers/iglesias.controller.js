// src/controllers/iglesias.controller.js
const { validationResult } = require('express-validator');
const {
  crearIglesiaService,
  unirseIglesiaPorCodigoService,
  resolverSolicitudUnionService
} = require('../services/iglesias.service');

async function crearIglesiaController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { nombreIglesia, ubicacion, ministroResponsable } = req.body;
    const iglesia = await crearIglesiaService({
      nombreIglesia,
      ubicacion,
      ministroResponsable,
      creadorId: req.user.id
    });

    return res.status(201).json({ success: true, data: iglesia, codigoAcceso: iglesia.codigoUnion });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

async function unirseIglesiaPorCodigoController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { codigoAcceso } = req.body;
    const result = await unirseIglesiaPorCodigoService({ userId: req.user.id, codigoAcceso });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

async function resolverSolicitudUnionController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { idSolicitud } = req.params;
    const { accion, comentario, iglesiaId } = req.body;

    const result = await resolverSolicitudUnionService({
      iglesiaId,
      idSolicitud,
      accion,
      comentario,
      aprobadorId: req.user.id
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

module.exports = {
  crearIglesiaController,
  unirseIglesiaPorCodigoController,
  resolverSolicitudUnionController
};
