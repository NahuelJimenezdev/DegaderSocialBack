// src/routes/comentariosPerfil.routes.js
const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/comentariosPerfil.controller');
const authenticateToken = require('../middlewares/auth');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * @route POST /api/comentarios-perfil
 * @desc Crear comentario en perfil de usuario
 * @access Privado (usuario autenticado)
 * @body {perfilUsuarioId, contenido, comentarioPadreId?}
 */
router.post('/', comentariosController.crearComentario);

/**
 * @route GET /api/comentarios-perfil/:perfilUsuarioId
 * @desc Obtener comentarios de un perfil específico
 * @access Privado (usuario autenticado)
 * @params perfilUsuarioId - ID del usuario cuyo perfil se consulta
 * @query page, limit - Paginación
 */
router.get('/:perfilUsuarioId', comentariosController.obtenerComentariosPerfil);

/**
 * @route PUT /api/comentarios-perfil/:comentarioId
 * @desc Editar comentario propio
 * @access Privado (solo autor del comentario)
 * @params comentarioId - ID del comentario a editar
 * @body {contenido}
 */
router.put('/:comentarioId', comentariosController.editarComentario);

/**
 * @route DELETE /api/comentarios-perfil/:comentarioId
 * @desc Eliminar comentario (autor o dueño del perfil)
 * @access Privado (autor del comentario o dueño del perfil)
 * @params comentarioId - ID del comentario a eliminar
 */
router.delete('/:comentarioId', comentariosController.eliminarComentario);

/**
 * @route GET /api/comentarios-perfil/:comentarioId/respuestas
 * @desc Obtener respuestas de un comentario específico
 * @access Privado (usuario autenticado)
 * @params comentarioId - ID del comentario padre
 * @query page, limit - Paginación
 */
router.get('/:comentarioId/respuestas', comentariosController.obtenerRespuestas);

module.exports = router;
