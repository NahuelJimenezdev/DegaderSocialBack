const { agregarProductoCarritoService, eliminarProductoCarritoService } = require("../services/carritos.service");
const { eliminarUnProductoArray } = require("../services/productos.services");

const agregarProductoCarrito = async (req, res) => {
  const { msg, statusCode, error } = await agregarProductoCarritoService(
    req.idCarrito,
    req.params.idProducto
  );
  try {
    res.status(statusCode).json({ msg })
  } catch {
    res.status(statusCode).json({ error })
  }
}

const eliminarProductoCarrito = async (req, res) => {
  const { msg, statusCode, error } = await eliminarProductoCarritoService(
    req.idCarrito,
    req.params.idProducto
  );
  try {
    res.status(statusCode).json({ msg })
  } catch {
    res.status(statusCode).json({ error })
  }
}

module.exports = {
  agregarProductoCarrito,
  eliminarProductoCarrito
}