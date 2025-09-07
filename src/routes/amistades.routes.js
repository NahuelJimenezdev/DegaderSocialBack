// src/routes/amistades.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  enviarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  obtenerEstado,
  listarAmigos,
  obtenerSolicitudesRecibidas,
  obtenerSolicitudesEnviadasController,
  eliminarAmigo,
  obtenerSugerencias
} = require('../controllers/amistades.controller');

// Middleware de autenticación para todas las rutas
router.use(auth);

// === GESTIÓN DE SOLICITUDES ===
// POST /api/amigos/solicitar - Enviar solicitud de amistad
router.post('/solicitar', enviarSolicitud);

// POST /api/amigos/aceptar - Aceptar solicitud de amistad
router.post('/aceptar', aceptarSolicitud);

// POST /api/amigos/rechazar - Rechazar solicitud de amistad
router.post('/rechazar', rechazarSolicitud);

// POST /api/amigos/cancelar - Cancelar solicitud enviada
router.post('/cancelar', cancelarSolicitud);

// DELETE /api/amigos/eliminar - Eliminar amistad existente
router.delete('/eliminar', eliminarAmigo);

// === CONSULTAS DE ESTADO ===
// GET /api/amigos/estado/:userId - Obtener estado de amistad con un usuario específico
router.get('/estado/:userId', obtenerEstado);

// === LISTAS Y CONSULTAS ===
// GET /api/amigos - Obtener lista de amigos (con paginación)
router.get('/', listarAmigos);

// GET /api/amigos/solicitudes/recibidas - Obtener solicitudes pendientes recibidas
router.get('/solicitudes/recibidas', obtenerSolicitudesRecibidas);

// GET /api/amigos/solicitudes/enviadas - Obtener solicitudes enviadas
router.get('/solicitudes/enviadas', obtenerSolicitudesEnviadasController);

// GET /api/amigos/sugerencias - Obtener sugerencias de amistad
router.get('/sugerencias', obtenerSugerencias);

// === RUTA DE DEBUG (opcional, para desarrollo) ===
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Rutas de amistades funcionando correctamente',
    userId: req.userId,
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /solicitar': 'Enviar solicitud de amistad',
      'POST /aceptar': 'Aceptar solicitud recibida',
      'POST /rechazar': 'Rechazar solicitud recibida',
      'POST /cancelar': 'Cancelar solicitud enviada',
      'DELETE /eliminar': 'Eliminar amistad existente',
      'GET /estado/:userId': 'Obtener estado de relación con usuario',
      'GET /': 'Listar amigos actuales',
      'GET /solicitudes/recibidas': 'Solicitudes pendientes por aceptar',
      'GET /solicitudes/enviadas': 'Solicitudes enviadas pendientes'
    }
  });
});

module.exports = router;