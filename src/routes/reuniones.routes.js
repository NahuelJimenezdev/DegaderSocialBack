// src/routes/reuniones.routes.js
const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middlewares/auth');
const { crearReunionController } = require('../controllers/reuniones.controller');

const router = Router();

/**
 * POST /api/reuniones/crear
 * Solo miembros de la iglesia pueden crear (se valida en service)
 */
router.post(
  '/crear',
  auth,
  body('titulo').isString().trim().notEmpty(),
  body('descripcion').optional().isString().isLength({ max: 1000 }),
  body('fecha').isISO8601().toDate(),
  body('visibilidad').optional().isArray(),
  body('iglesia').isMongoId(),
  crearReunionController
);

module.exports = router;
