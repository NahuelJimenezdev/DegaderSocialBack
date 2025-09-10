const { validationResult } = require("express-validator")
const { getAllUsersService, createUserService, loginUserServices, getUserByIdService, updateUserService, activateUserByIdService, deactivateUserByIdService, deleteUserByIdService } = require("../services/usuarios.services")

// =======================================================
// ===== GET ===== GET ===== GET ===== GET ===== GET =====
const getAllUsers = async (req, res) => {
  try {
    const { usuarios, statusCode, error } = await getAllUsersService()

    if (error) {
      return res.status(statusCode || 500).json({ error: error.message || error })
    }

    res.status(statusCode || 200).json({ usuarios })
  } catch (error) {
    console.error('Error en getAllUsers:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
const getUserById = async (req, res) => {
  // 1) Validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ msg: errors.array() });
  }

  try {
    // 2) Traer usuario por id
    const { id } = req.params;
    const { usuario, statusCode, error } = await getUserByIdService(id);

    if (error) {
      return res.status(500).json({ error });
    }

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // 3) Responder SIEMPRE
    return res.status(statusCode || 200).json({ usuario });
  } catch (e) {
    return res.status(500).json({ msg: "Error interno", error: e.message });
  }
};
// =======================================================
// === UPDATE == UPDATE == UPDATE == UPDATE == UPDATE ====
const updateUser = async (req, res) => {
  const { msg, statusCode, error } = await updateUserService(req.params.id, req.body)
  try {
    res.status(statusCode).json({ msg })
  } catch {
    res.status(statusCode).json({ error })
  }
}
const activateUserById = async (req, res) => {
  const { msg, statusCode, error } = await activateUserByIdService(req.params.id)
  try {
    res.status(statusCode).json({ msg })
  } catch {
    res.status(statusCode).json({ error })
  }
}
const deactivateUserById = async (req, res) => {
  const { msg, statusCode, error } = await deactivateUserByIdService(req.params.id)
  try {
    res.status(statusCode).json({ msg })
  } catch {
    res.status(statusCode).json({ error })
  }
}
// =======================================================
// ==== POST ==== POST ==== POST ==== POST ==== POST =====
const createUser = async (req, res) => {
  try {
    console.log('🎯 [createUser] Iniciando con datos:', req.body);

    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [createUser] Errores de validación:', errors.array());
      return res.status(422).json({
        error: 'Datos de entrada inválidos',
        detalles: errors.array()
      });
    }

    console.log('✅ [createUser] Validaciones pasadas, llamando al servicio...');
    const result = await createUserService(req.body);
    console.log('📄 [createUser] Resultado del servicio:', result);

    if (result.error) {
      // Si hay un error en el servicio
      console.log('❌ [createUser] Error del servicio:', result.error);
      return res.status(result.statusCode || 500).json({
        error: result.error.message || result.error || 'Error interno del servidor'
      });
    }

    // Si fue exitoso
    console.log('✅ [createUser] Usuario creado exitosamente');
    return res.status(result.statusCode).json({ msg: result.msg });

  } catch (error) {
    // Error inesperado
    console.error('❌ [createUser] Error inesperado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
// controllers/usuarios.controllers.js
// controllers/usuarios.controllers.js
const loginUsers = async (req, res) => {
  try {
    console.log('📨 Login attempt:', req.body.correoUsuario);
    const result = await loginUserServices(req.body.correoUsuario, req.body.contraseniaUsuario);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('💥 ERROR en login:', error); // ← Este log es clave
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
// =======================================================
// === DELETE == DELETE == DELETE == DELETE == DELETE ====
const deleteUserById = async (req, res) => {
  const { msg, statusCode, error } = await deleteUserByIdService(req.params.id);
  try {
    res.status(statusCode).json({ msg })
  } catch {
    res.status(statusCode).json({ error })
  }
}

const uploadAvatar = async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const avatar = req.files.avatar;

    // Validar tipo de archivo
    if (!avatar.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'El archivo debe ser una imagen' });
    }

    // Validar tamaño
    if (avatar.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'La imagen debe ser menor a 5MB' });
    }

    // Generar nombre único para el archivo
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(avatar.name)}`;
    const uploadPath = path.join(process.cwd(), 'uploads', 'avatars', uniqueName); // Usar process.cwd() para la raíz del proyecto

    // Crear directorio si no existe
    const uploadDir = path.dirname(uploadPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Mover el archivo
    await avatar.mv(uploadPath);

    // Actualizar la foto de perfil del usuario en la base de datos
    const userId = req.user.idUsuario; // Asumiendo que tienes el ID del usuario en el token
    const avatarUrl = `/uploads/avatars/${uniqueName}`;

    await UserModel.findByIdAndUpdate(userId, { fotoPerfil: avatarUrl });

    res.json({
      success: true,
      avatarUrl: avatarUrl,
      message: 'Avatar actualizado correctamente'
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  activateUserById,
  deactivateUserById,
  deleteUserById,
  createUser,
  loginUsers,

  uploadAvatar
}