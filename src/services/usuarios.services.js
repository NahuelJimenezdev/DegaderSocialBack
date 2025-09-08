const UserModel = require("../models/usuarios.model");
const argon = require("argon2");
const jwt = require('jsonwebtoken');
const CarritosModel = require("../models/carritos.model");
const FavoritosModel = require("../models/favoritos.model");
const { registroExitoso } = require("../utils/messages.nodemailer.utils");

// =======================================================
// ===== GET ===== GET ===== GET ===== GET ===== GET =====
const getAllUsersService = async () => {
  try {
    const usuarios = await UserModel.find()
    return {
      usuarios,
      statusCode: 200
    }
  } catch (error) {
    return {
      error,
      statusCode: 500
    }
  }
}
const getUserByIdService = async (idUsuario) => {
  try {
    const usuario = await UserModel.findById(idUsuario) // mejor que findOne({_id:id})
      .select('-contraseniaUsuario') // ← Excluir contraseña
    // .populate('amigos', 'primernombreUsuario primerapellidoUsuario fotoPerfil') // ← Populate amigos
    // .populate('grupos', 'nombre descripcion'); // ← Populate grupos
    return { usuario, statusCode: 200 };
  } catch (error) {
    return { error, statusCode: 500 };
  }
};
// =======================================================
// === UPDATE == UPDATE == UPDATE == UPDATE == UPDATE ====
const updateUserService = async (idUsuario, body) => {
  try {
    await UserModel.findByIdAndUpdate({ _id: idUsuario }, body);
    return {
      msg: "Usuario actulizado exitosamente",
      statusCode: 200
    }
  } catch (error) {
    return {
      error,
      statusCode: 500
    }
  }
}
const activateUserByIdService = async (idUsuario) => {
  const usuario = await UserModel.findOne({ _id: idUsuario })
  try {
    usuario.estadoUsuario = "activo";
    await usuario.save()
    return {
      msg: "Usuario activado existosamente",
      statusCode: 200
    }
  } catch (error) {
    return {
      error,
      statusCode: 500
    }
  }
}
const deactivateUserByIdService = async (idUsuario) => {
  try {
    const usuario = await UserModel.findOne({ _id: idUsuario })
    usuario.estadoUsuario = "inactivo";
    await usuario.save()
    return {
      msg: "El usuario está inactivo",
      statusCode: 200
    }
  } catch (error) {
    return {
      error,
      statusCode: 500
    }
  }
}
// =======================================================
// ==== POST ==== POST ==== POST ==== POST ==== POST =====
const createUserService = async (body) => {
  try {
    // Validar campos requeridos
    if (!body.primernombreUsuario || !body.primerapellidoUsuario || !body.contraseniaUsuario) {
      return {
        msg: 'Faltan campos requeridos',
        statusCode: 400
      };
    }

    // Buscar si ya existe un usuario con el mismo nombre
    const usuarioExistente = await UserModel.findOne({
      primernombreUsuario: body.primernombreUsuario,
      primerapellidoUsuario: body.primerapellidoUsuario
    });

    if (usuarioExistente) {
      return {
        msg: `El usuario: ${usuarioExistente.primernombreUsuario} ${usuarioExistente.primerapellidoUsuario}, ya existe, por favor ingresa nuevos datos, o verifica los mismos.`,
        statusCode: 409
      };
    }

    const nuevoUsuario = new UserModel(body);
    const nuevoCarrito = new CarritosModel({ idUsuario: nuevoUsuario._id });
    const nuevoFavorito = new FavoritosModel({ idUsuario: nuevoUsuario._id });

    nuevoUsuario.contraseniaUsuario = await argon.hash(body.contraseniaUsuario);
    nuevoUsuario.idCarrito = nuevoCarrito._id;
    nuevoUsuario.idFavoritos = nuevoFavorito._id;

    await nuevoCarrito.save();
    await nuevoFavorito.save();
    await nuevoUsuario.save();

    // Email async (pero no bloqueante para la respuesta)
    registroExitoso(nuevoUsuario.correoUsuario, nuevoUsuario.primernombreUsuario)
      .catch(err => console.error("Email async error:", err));

    return {
      msg: `Usuario: ${nuevoUsuario.primernombreUsuario} ${nuevoUsuario.primerapellidoUsuario} creado exitosamente`,
      statusCode: 201,
      usuario: {
        id: nuevoUsuario._id,
        nombre: `${nuevoUsuario.primernombreUsuario} ${nuevoUsuario.primerapellidoUsuario}`
      }
    };

  } catch (error) {
    console.error('Error en createUserService:', error);
    return {
      error: error.message || 'Error interno del servidor',
      statusCode: 500
    };
  }
};
// services/usuarios.services.js
const loginUserServices = async (email, password) => {
  try {
    // Buscar usuario por email
    const usuario = await UserModel.findOne({
      correoUsuario: email.toLowerCase().trim()
    });

    if (!usuario) {
      return {
        msg: 'Credenciales incorrectas',
        statusCode: 401
      };
    }

    // Verificar contraseña
    const contraseniaValida = await argon.verify(usuario.contraseniaUsuario, password);

    if (!contraseniaValida) {
      return {
        msg: 'Credenciales incorrectas',
        statusCode: 401
      };
    }

    // Verificar si el usuario está activo
    if (usuario.estadoUsuario !== 'activo') {
      return {
        msg: 'Usuario inactivo. Contacta al administrador.',
        statusCode: 401
      };
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        idUsuario: usuario._id,
        primernombreUsuario: usuario.primernombreUsuario,
        primerapellidoUsuario: usuario.primerapellidoUsuario,
        correoUsuario: usuario.correoUsuario,
        rolUsuario: usuario.rolUsuario,
        jerarquiaUsuario: usuario.jerarquiaUsuario,
        idCarrito: usuario.idCarrito,
        idFavoritos: usuario.idFavoritos
      },
      process.env.JWT_SECRET, // ← AGREGA ESTO
      { expiresIn: '24h' }    // ← Y ESTO
    );

    return {
      msg: 'Login exitoso',
      statusCode: 200,
      token,
      usuario: {
        id: usuario._id,
        primernombreUsuario: usuario.primernombreUsuario,
        primerapellidoUsuario: usuario.primerapellidoUsuario,
        correoUsuario: usuario.correoUsuario,
        rolUsuario: usuario.rolUsuario,
        jerarquiaUsuario: usuario.jerarquiaUsuario
      }
    };

  } catch (error) {
    console.error('Error en loginUserServices:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  }
};
// =======================================================
// === DELETE == DELETE == DELETE == DELETE == DELETE ====
const deleteUserByIdService = async (idUsuario) => {
  try {
    const usuarioExistente = UserModel.findOne({ _id: idUsuario })
    if (!usuarioExistente) {
      return {
        msg: "el usuario que estas intentando encontrar no existe",
        statusCode: 404
      }
    }
    await UserModel.findByIdAndDelete({ _id: idUsuario })
    return {
      msg: "Usuario eliminado exitosamente",
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
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  activateUserByIdService,
  deactivateUserByIdService,
  deleteUserByIdService,
  createUserService,
  loginUserServices
}