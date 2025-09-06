  const { obtenerTodosLosProductosArray, obtenerUnProductoPorIdArray, crearNuevoProductoArray, actualizarUnProductoArray, eliminarUnProductoArray } = require("../services/productos.services")

const obtenerTodosLosProductos = async (req, res) => {
  try {
    const { productos, statusCode, error } = await obtenerTodosLosProductosArray()

    if (error) return res.status(statusCode).json({ error })

    // Si querés avisar cuando no hay productos:
    if (!productos || productos.length === 0) {
      return res.status(200).json({ productos: [], msg: 'No existen productos' })
    }

    return res.status(200).json({ productos })
  } catch (err) {
    return res.status(500).json({ error: 'Error inesperado' })
  }
}

const obtenerUnProducto = (req, res) => {
  const { producto, msg, statusCode } = obtenerUnProductoPorIdArray(req.params.id)
  res.status(statusCode).json( producto ? { producto } : { msg } )
}

const CrearUnProducto = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Debes enviar datos del producto' })
  }
  const { msg, statusCode, error } = await crearNuevoProductoArray(req.body)
  try {
    res.status(statusCode).json({ msg })
    
  } catch {
    res.status(statusCode).json({ error })
  }
}

const ActualizarUnProducto = (req, res) => {
  const { msg, statusCode } = actualizarUnProductoArray(req.params.id, req.body)
  res.status(statusCode).json({ msg })
}

const EliminarUnProducto = (req, res) => {
  const { msg, statusCode } = eliminarUnProductoArray(req.params.id)
  res.status(statusCode).json({ msg })
}


module.exports = {
  obtenerTodosLosProductos,
  obtenerUnProducto,
  CrearUnProducto,
  ActualizarUnProducto,
  EliminarUnProducto
}