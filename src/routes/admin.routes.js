// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const initAdmin = require('../../scripts/initAdmin');

// Endpoint seguro para crear admin (solo accesible con clave secreta)
router.post('/init-admin', async (req, res) => {
  try {
    const { secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_CREATION_KEY) {
      return res.status(403).json({ error: 'Clave secreta inválida' });
    }

    await initAdmin();
    res.json({ message: 'Administrador inicializado exitosamente' });

  } catch (error) {
    console.error('Error inicializando admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;