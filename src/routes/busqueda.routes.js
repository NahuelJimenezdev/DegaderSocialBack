// src/routes/buscar.routes.js
const { Router } = require('express');
const { buscar } = require('../controllers/busqueda.controller');
const { auth } = require('../middlewares/auth');
const UserModel = require('../models/usuarios.model')


const router = Router();
router.get('/_ping', (req, res) => res.json({ ok: true })); // <- sin auth, prueba rápida
router.get('/_whoami', auth, (req, res) => {
  res.json({
    ok: true,
    authHeader: req.headers.authorization || null,
    user: req.user || null
  });
});
router.get('/_raw', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const usuarios = await UserModel.find({
      primernombreUsuario: { $regex: q, $options: 'i' }, // prueba directa por nombre
      estadoUsuario: 'activo'
    })
      .select('primernombreUsuario primerapellidoUsuario estadoUsuario')
      .limit(5);

    res.json({ ok: true, count: usuarios.length, usuarios });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});
router.get('/', auth, buscar);
// En tu backend


module.exports = router;
