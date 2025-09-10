// src/routes/feed.routes.js
const { Router } = require('express');
const { query } = require('express-validator');
const auth = require('../middlewares/auth');
const { feedIglesiaController } = require('../controllers/feed.controller');

const router = Router();

/**
 * GET /api/feed/iglesia
 * Query: iglesiaId (opcional), ministerio (opcional), rolFundacion (opcional), limit, offset
 */
router.get(
  '/iglesia',
  auth,
  query('iglesiaId').optional().isMongoId(),
  query('ministerio').optional().isString(),
  query('rolFundacion').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  feedIglesiaController
);

module.exports = router;
