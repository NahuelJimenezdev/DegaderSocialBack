const express = require('express');
const { getAllUsers, createUser, loginUsers, getUserById, updateUser, activateUserById, deactivateUserById, deleteUserById } = require('../controllers/usuarios.controllers');
const auth = require('../middlewares/auth');
const { check } = require('express-validator');
// En tu archivo de rutas
const { body } = require('express-validator');
const router = express.Router();


// ======================================================
// ===== GET ===== GET ===== GET ===== GET ===== GET =====
router.get('/', auth(["subdirector", "director", "miembro"]), getAllUsers);
router.get('/:id', [
  check("id", "ID INCORRECTO. no corresponde a mongoose").isMongoId()
], getUserById);
// ======================================================
// === UPDATE == UPDATE == UPDATE == UPDATE == UPDATE ====
router.put('/:id', updateUser)
router.put('/enabled/:id', activateUserById)
router.put('/desabled/:id', deactivateUserById)
// =======================================================
// ===== PUT ===== PUT ===== PUT ===== PUT ===== PUT =====

router.post('/', [
  body('primernombreUsuario').notEmpty().withMessage('El nombre es requerido'),
  body('primerapellidoUsuario').notEmpty().withMessage('El apellido es requerido'),
  body('contraseniaUsuario').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('correoUsuario').isEmail().withMessage('Debe ser un email válido')
], createUser);
router.post('/login', loginUsers)
// ======================================================
// === DELETE == DELETE == DELETE == DELETE == DELETE ====
router.delete('/:id', deleteUserById)


module.exports = router;
// 1092344826