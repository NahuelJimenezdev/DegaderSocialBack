const crearNuevoProductoArray = async (body) => {
    try {
        const nuevoProducto = new ProductosModel(body);
        await nuevoProducto.save()
        return {
            msg: "Usuario creado exitosamente",
            statusCode: 201
        }
    } catch (error) {
        return {
            error,
            statusCode: 500
        }
    }
}