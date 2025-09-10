const { Router } = require('express');

const CarritoRoutes = require('./carritos.routes')
const ProductosRoutes = require('./productos.routes')
const UsuariosRoutes = require('./usuarios.routes')
const AdminRoutes = require('./admin.routes')
const MeRoutes = require('./me.routes')
const BusquedasRoutes = require('./busqueda.routes')
const AmistadesRoutes = require('./amistades.routes')
const NotificacionesRoutes = require('./notificaciones.routes') // ← NUEVA RUTA
const iglesiasRoutes = require('./iglesias.routes');
const reunionesRoutes = require('./reuniones.routes');
const feedRoutes = require('./feed.routes');

const router = Router();

// Ruta de prueba sin autenticación
router.get('/test', (req, res) => {
  res.json({ message: 'Rutas funcionando correctamente', timestamp: new Date() });
});

router.use('/carrito', CarritoRoutes)
router.use('/productos', ProductosRoutes)
router.use('/usuarios', UsuariosRoutes)
router.use('/admin', AdminRoutes); // ← Nueva ruta
router.use('/me', MeRoutes);
router.use('/buscar', BusquedasRoutes); // ← Cambia a algo único
router.use('/amigos', AmistadesRoutes) // ← AGREGAR ESTA LÍNEA
router.use('/notificaciones', NotificacionesRoutes) // ← AGREGAR ESTA LÍNEA
router.use('/iglesias', iglesiasRoutes);
router.use('/reuniones', reunionesRoutes);
router.use('/feed', feedRoutes);


module.exports = router;

