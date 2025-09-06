// src/middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cambiar a diskStorage para guardar archivos físicamente
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar_temp_${uniqueSuffix}${ext}`);
  }
});

const ALLOWED = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/pjpeg'
]);

const fileFilter = (req, file, cb) => {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(new Error('Formato no permitido (jpg, jpeg, png, webp, avif)'));
  }
  cb(null, true);
};

// Sube el límite (10 MB)
const MAX_BYTES = 10 * 1024 * 1024;

exports.avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES }
}).single('avatar');

// Manejo de errores de multer => 413/400 con JSON claro
exports.handleMulterErrors = (err, req, res, next) => {
  if (!err) return next();
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ msg: `Archivo muy grande (máx ${Math.floor(MAX_BYTES / 1024 / 1024)}MB)` });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ msg: 'Error de subida', detail: err.message });
  }
  return res.status(400).json({ msg: 'Error de subida', detail: err.message });
};
