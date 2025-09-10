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
// Ruta temporal para testing sin autenticación
router.get('/public', getAllUsers);
router.get('/:id', [
  check("id", "ID INCORRECTO. no corresponde a mongoose").isMongoId()
], getUserById);
// ======================================================
// === UPDATE == UPDATE == UPDATE == UPDATE == UPDATE ====
router.put('/:id', updateUser)
router.put('/enabled/:id', activateUserById)
router.put('/desabled/:id', deactivateUserById)
// =======================================================
// ==== POST ==== POST ==== POST ==== POST ==== POST =====
router.post('/', [
  body('primernombreUsuario').notEmpty().withMessage('El nombre es requerido'),
  body('primerapellidoUsuario').notEmpty().withMessage('El apellido es requerido'),
  body('contraseniaUsuario').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('correoUsuario').isEmail().withMessage('Debe ser un email válido')
], createUser);

// Ruta específica para registro desde el frontend
router.post('/registro', [
  body('primernombreUsuario')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('primerapellidoUsuario')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2 })
    .withMessage('El apellido debe tener al menos 2 caracteres'),
  body('correoUsuario')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('contraseniaUsuario')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('fechaNacimientoUsuario')
    .isDate()
    .withMessage('La fecha de nacimiento debe ser válida'),
  body('paisUsuario')
    .notEmpty()
    .withMessage('El país es requerido'),
  body('ciudadUsuario')
    .notEmpty()
    .withMessage('La ciudad es requerida')
], createUser);

// RUTA DE PRUEBA PARA DEBUGGING
router.post('/test-registro', (req, res) => {
  console.log('🧪 [test-registro] Datos recibidos:', req.body);
  res.json({
    mensaje: 'Ruta funcionando',
    datos_recibidos: req.body,
    timestamp: new Date()
  });
});

router.post('/login', loginUsers)
// ======================================================
// === DELETE == DELETE == DELETE == DELETE == DELETE ====
router.delete('/:id', deleteUserById)


module.exports = router;
// 1092344826