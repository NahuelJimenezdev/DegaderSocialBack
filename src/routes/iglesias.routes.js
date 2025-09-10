// src/routes/iglesias.routes.js
const { Router } = require('express');
const { body, param } = require('express-validator');
const {
  crearIglesiaController,
  unirseIglesiaPorCodigoController,
  resolverSolicitudUnionController
} = require('../controllers/iglesias.controller');
const auth = require('../middlewares/auth'); // asume existente: setea req.user
const verificarPermiso = require('../middlewares/verificarPermiso'); // asume existente

const router = Router();

/**
 * POST /api/iglesias/crear
 * Solo 'director' o superior (ajusta a tus roles reales)
 */
router.post(
  '/crear',
  auth,
  verificarPermiso([
    'Founder', 'admin', 'Desarrollador',
    'Director', 'Director Nacional', 'Director Regional', 'Director Municipal'
  ]),
  body('nombreIglesia').isString().trim().notEmpty(),
  body('ubicacion').isObject(),
  body('ubicacion.pais').isString().trim().notEmpty(),
  body('ubicacion.ciudad').optional().isString().trim(),
  body('ministroResponsable').isMongoId(),
  crearIglesiaController
);

/**
 * POST /api/iglesias/unirse
 */
router.post(
  '/unirse',
  auth,
  body('codigoAcceso').isString().trim().notEmpty(),
  unirseIglesiaPorCodigoController
);

/**
 * PATCH /api/iglesias/solicitudes/:idSolicitud
 * Solo pastorPrincipal de la iglesia
 */
router.patch(
  '/solicitudes/:idSolicitud',
  auth,
  param('idSolicitud').isMongoId(),
  body('iglesiaId').isMongoId(),
  body('accion').isIn(['aprobar', 'rechazar']),
  body('comentario').optional().isString().isLength({ max: 300 }),
  resolverSolicitudUnionController
);

module.exports = router;
