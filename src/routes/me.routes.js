// src/routes/me.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { uploadAvatar, deleteAvatar, getMe, patchMe, avatarUploadMiddleware, uploadBanner, deleteBanner, bannerUploadMiddleware } = require('../controllers/me.controller');

// Ruta de prueba sin autenticación - ANTES del middleware auth
router.get('/test', (req, res) => {
  res.json({ message: 'Ruta /me funcionando SIN auth', timestamp: new Date() });
});

// Middleware de autenticación para todas las rutas siguientes
router.use(auth);

// Rutas que requieren autenticación
router.get('/', getMe);
router.patch('/', patchMe);
router.post('/avatar', avatarUploadMiddleware, uploadAvatar);
router.delete('/avatar', deleteAvatar);
router.post('/banner', bannerUploadMiddleware, uploadBanner);
router.delete('/banner', deleteBanner);

module.exports = router;
