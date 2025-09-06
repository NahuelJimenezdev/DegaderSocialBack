const express = require('express')
const { obtenerTodosLosProductos, obtenerUnProducto, CrearUnProducto, ActualizarUnProducto, EliminarUnProducto } = require('../controllers/productos.controllers')
const router = express.Router()

// Obtener todos los productos
router.get("/", obtenerTodosLosProductos)

// Obtener un producto
router.get("/:id", obtenerUnProducto)

// Crear un producto
router.post("/", CrearUnProducto)

// Actualizar un producto
router.put("/:id", ActualizarUnProducto)

// Eliminar un producto
router.delete("/:id", EliminarUnProducto)


module.exports = router