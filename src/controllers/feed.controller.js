// src/controllers/feed.controller.js
const { validationResult } = require('express-validator');
const { feedIglesiaService } = require('../services/feed.service');

async function feedIglesiaController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { iglesiaId, ministerio, rolFundacion, limit, offset } = req.query;
    const data = await feedIglesiaService({
      user: req.user,
      iglesiaId,
      ministerio,
      rolFundacion,
      limit,
      offset
    });

    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

module.exports = { feedIglesiaController };
