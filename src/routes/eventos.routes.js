const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const {
  crearEvento,
  obtenerEventosUsuario,
  obtenerEventosPublicos,
  obtenerEventoPorId,
  registrarseEvento,
  cancelarRegistro
} = require('../controllers/eventos.controller');

// Configuración de multer para subida de archivos de eventos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Configurar campos de archivos para eventos
const uploadEventos = upload.fields([
  { name: 'imagenPortada', maxCount: 1 },
  { name: 'imagenes', maxCount: 5 }
]);

// Rutas públicas
router.get('/publicos', obtenerEventosPublicos);
router.get('/:id', obtenerEventoPorId);

// Rutas protegidas (requieren autenticación)
router.use(verificarToken);

router.post('/', uploadEventos, crearEvento);
router.get('/usuario/mis-eventos', obtenerEventosUsuario);
router.post('/:id/registrarse', registrarseEvento);
router.delete('/:id/cancelar-registro', cancelarRegistro);

module.exports = router;
