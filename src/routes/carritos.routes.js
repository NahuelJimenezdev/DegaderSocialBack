const { Router } = require('express');
const { agregarProductoCarrito, eliminarProductoCarrito } = require('../controllers/carritos.controllers');
const auth = require('../middlewares/auth');
const router = Router();


router.put('/agregarProducto/:idProducto', auth('miembro') , agregarProductoCarrito)
router.put('/eliminarProducto/:idProducto', auth('miembro') , eliminarProductoCarrito)

module.exports = router