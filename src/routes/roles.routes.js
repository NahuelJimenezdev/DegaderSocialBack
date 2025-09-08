const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  asignarRolOrganizacional,
  obtenerUsuariosPorMinisterio,
  obtenerUsuariosPorNivel,
  verificarPermisos
} = require('../controllers/roles.controller.js');

// Asignar rol organizacional a un usuario
router.put('/asignar/:usuarioId', auth(["admin", "Director Nacional"]), asignarRolOrganizacional);

// Obtener usuarios por ministerio
router.get('/ministerio/:ministerio', auth(["admin", "Director Nacional", "Director Regional"]), obtenerUsuariosPorMinisterio);

// Obtener usuarios por nivel jerárquico
router.get('/nivel/:nivel', auth(["admin", "Director Nacional", "Director Regional"]), obtenerUsuariosPorNivel);

// Verificar permisos específicos
router.get('/permisos/:accion', auth(["miembro"]), verificarPermisos);

module.exports = router;
