const ProductosModel = require("../model/productos.model")

const obtenerTodosLosProductosArray = async () => {
  try {
    const productos = await ProductosModel.find()
    return {
      productos,
      statusCode : 200
    }
    
  } catch (error) {
    return {
      error,
      statusCode: 500
    }
  }
}
const obtenerUnProductoPorIdArray = (productoId) => {
  const producto = productos.find((prod) => prod.id === Number(productoId))
  
  if (!producto) {
    return {
      msg: "ERROR. Producto no existe",
      statusCode: 404
    }
  }
  
  return {
    producto,
    statusCode: 200
  }
}
const crearNuevoProductoArray = async (body) => {
  try {
    const nuevoProducto = new ProductosModel(body)
    if (!nuevoProducto) {
      return {
        msg: "No existe producto, por favor ingresa los datos validos",
        statusCode: 400
      }
    }
    await nuevoProducto.save()
    return {
      msg: "Producto creado exitosamente",
      // producto: nuevoProducto,
      statusCode: 201
    }
  } catch (error) {
    return {
      error: error.message,
      statusCode: 500
    }
  }
}

const actualizarUnProductoArray = (idProducto, body) => {
  const productoIndex = productos.findIndex((prod) => prod.id === Number(idProducto))
  
  if (productoIndex === -1) {
    return {
      msg: 'ERROR. Produto no existe',
      statusCode: 404
    }
  }
  
  productos[productoIndex] = { id: Number(idProducto), ...body }

  return {
    msg: 'Produto actualizado',
    statusCode: 200
  }
}
const eliminarUnProductoArray = (idProducto) => {
  const productoIndex = productos.findIndex((prod) => prod.id === Number(idProducto))
  
  if(productoIndex === -1){
    return {
      msg: 'ERROR. Producto no existe',
      statusCode: 404
    }
  }

  productos.splice(productoIndex, 1)

  return {
    msg: 'Producto eliminado correctamente',
    statusCode: 200
  }
}


module.exports = {
  obtenerTodosLosProductosArray,
  obtenerUnProductoPorIdArray,
  crearNuevoProductoArray,
  actualizarUnProductoArray,
  eliminarUnProductoArray
}