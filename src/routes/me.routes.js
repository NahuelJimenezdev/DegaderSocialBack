// src/routes/me.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { uploadAvatar, deleteAvatar, getMe, patchMe, avatarUploadMiddleware } = require('../controllers/me.controller');

router.use(auth);
router.get('/', getMe);
router.patch('/', patchMe);
// Ruta CORREGIDA - usa el middleware de upload
router.post('/avatar', avatarUploadMiddleware, uploadAvatar);  // ← ¡Así sí!
router.delete('/avatar', deleteAvatar);

module.exports = router;
