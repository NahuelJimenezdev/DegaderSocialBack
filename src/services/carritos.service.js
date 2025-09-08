const CarritosModel = require("../models/carritos.model");
const ProductosModel = require("../models/productos.model");


const agregarProductoCarritoService = async (idCarrito, idProducto) => {
  try {
    const carrito = await CarritosModel.findOne({ _id: idCarrito })
    const productos = await ProductosModel.findOne({ _id: idProducto })

    const productoExisteCarrito = carrito.productos.find((prod) => prod._id.toString() === idProducto.toString())
    if (productoExisteCarrito) {
      return {
        msg: "El producto ya existe en el carrito",
        statusCode: 400
      }
    }

    carrito.productos.push(productos)
    await carrito.save()

    return {
      msg: "Producto agregado exitosamente",
      statusCode: 200,
    }
  } catch (error) {
    return {
      error,
      statusCode: 500
    }
  }
}

const eliminarProductoCarritoService = async (idCarrito, idProducto) => {
  try {
    const carrito = await CarritosModel.findOne({ _id: idCarrito });
    const productoIndex = carrito.productos.findIndex((prod) => prod._id.toString() === idProducto.toString());

    if (productoIndex < 0) {
      return {
        msg: 'ERROR: EL PRODUCTO NO EXISTE',
        statusCode: 404
      }
    }

    carrito.productos.splice(productoIndex, 1);

    await carrito.save();

    return {
      msg: 'Producto Eliminado Exitosamente',
      statusCode: 200
    }
  } catch (error) {
    return {
      error,
      statusCode: 500
    }
  }
}

module.exports = {
  agregarProductoCarritoService,
  eliminarProductoCarritoService,
}