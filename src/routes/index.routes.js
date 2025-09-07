const { Router } = require('express');
const router = Router();

const CarritoRoutes = require('./carritos.routes')
const ProductosRoutes = require('./productos.routes')
const UsuariosRoutes = require('./usuarios.routes')
const AdminRoutes = require('./admin.routes')
const MeRoutes = require('./me.routes')
const BusquedasRoutes = require('./busqueda.routes')
const AmistadesRoutes = require('./amistades.routes')
const NotificacionesRoutes = require('./notificaciones.routes') // ← NUEVA RUTA

router.use('/carrito', CarritoRoutes)
router.use('/productos', ProductosRoutes)
router.use('/usuariosInicios', UsuariosRoutes)
router.use('/admin', AdminRoutes); // ← Nueva ruta
router.use('/me', MeRoutes);
router.use('/buscar', BusquedasRoutes); // ← Cambia a algo único
router.use('/amigos', AmistadesRoutes) // ← AGREGAR ESTA LÍNEA
router.use('/notificaciones', NotificacionesRoutes) // ← AGREGAR ESTA LÍNEA



module.exports = router;

