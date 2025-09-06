const express = require('express');
const router = express.Router();
const {auth} = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const { crearPublicacion, obtenerPublicaciones, obtenerPublicacionesUsuario, obtenerPublicacion, eliminarPublicacion, toggleLike, agregarComentario, eliminarComentario } = require('../controllers/publicaciones.controller');

// Configuración de multer
// En routes/publicaciones.routes.js - AÑADE ESTO AL PRINCIPIO
router.get('/debug', auth, (req, res) => {
  console.log('✅ Ruta /api/publicaciones/debug funciona');
  res.json({
    message: 'Ruta de debug funciona',
    userId: req.userId,
    timestamp: new Date().toISOString()
  });
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes y videos'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: fileFilter
});

// Rutas
router.post('/', auth, upload.fields([
  { name: 'imagenes', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), crearPublicacion);

router.get('/', auth, obtenerPublicaciones);
router.get('/usuario', auth, obtenerPublicacionesUsuario);
router.get('/:id', auth, obtenerPublicacion);
router.delete('/:id', auth, eliminarPublicacion);

// Rutas de interacción
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comentarios', auth, agregarComentario);
router.delete('/:id/comentarios/:comentarioId', auth, eliminarComentario);

module.exports = router;