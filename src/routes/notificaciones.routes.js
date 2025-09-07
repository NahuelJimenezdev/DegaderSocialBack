// src/routes/notificaciones.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  obtenerNotificaciones,
  obtenerContadorNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  crearNotificacion,
  eliminarNotificacion
} = require('../controllers/notificaciones.controller');

// Middleware de autenticación para todas las rutas
router.use(auth);

// === CONSULTAS DE NOTIFICACIONES ===
// GET /api/notificaciones - Obtener todas las notificaciones del usuario
router.get('/', obtenerNotificaciones);

// GET /api/notificaciones/contador - Obtener contador de notificaciones no leídas
router.get('/contador', obtenerContadorNoLeidas);

// === GESTIÓN DE ESTADO ===
// PATCH /api/notificaciones/:id/leer - Marcar notificación específica como leída
router.patch('/:id/leer', marcarComoLeida);

// PATCH /api/notificaciones/leer-todas - Marcar todas las notificaciones como leídas
router.patch('/leer-todas', marcarTodasComoLeidas);

// === ADMINISTRACIÓN ===
// POST /api/notificaciones - Crear nueva notificación (para uso interno)
router.post('/', crearNotificacion);

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete('/:id', eliminarNotificacion);

// === RUTA DE DEBUG ===
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Rutas de notificaciones funcionando correctamente',
    userId: req.userId,
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /': 'Obtener todas las notificaciones',
      'GET /contador': 'Contador de no leídas',
      'PATCH /:id/leer': 'Marcar como leída',
      'PATCH /leer-todas': 'Marcar todas como leídas',
      'POST /': 'Crear notificación',
      'DELETE /:id': 'Eliminar notificación'
    }
  });
});

module.exports = router;
