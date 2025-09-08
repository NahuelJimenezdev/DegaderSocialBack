const UsuariosModel = require('../models/usuarios.model.js');

// Asignar rol organizacional a un usuario
const asignarRolOrganizacional = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const {
      rolUsuario,
      nivelJerarquico,
      areaResponsabilidad,
      rolesMinisteriales,
      permisos
    } = req.body;

    // Verificar que el usuario que asigna tenga permisos
    const usuarioAsignador = await UsuariosModel.findById(req.userId);
    if (!usuarioAsignador.estructuraOrganizacional?.permisos?.gestionarUsuarios) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para asignar roles'
      });
    }

    const usuario = await UsuariosModel.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar la estructura organizacional
    usuario.rolUsuario = rolUsuario || usuario.rolUsuario;
    usuario.estructuraOrganizacional = {
      ...usuario.estructuraOrganizacional,
      nivelJerarquico: nivelJerarquico || usuario.estructuraOrganizacional?.nivelJerarquico,
      areaResponsabilidad: {
        ...usuario.estructuraOrganizacional?.areaResponsabilidad,
        ...areaResponsabilidad
      },
      rolesMinisteriales: rolesMinisteriales || usuario.estructuraOrganizacional?.rolesMinisteriales || [],
      permisos: {
        ...usuario.estructuraOrganizacional?.permisos,
        ...permisos
      }
    };

    await usuario.save();

    res.status(200).json({
      success: true,
      message: 'Rol asignado exitosamente',
      usuario: {
        id: usuario._id,
        nombre: `${usuario.primernombreUsuario} ${usuario.primerapellidoUsuario}`,
        rolUsuario: usuario.rolUsuario,
        estructuraOrganizacional: usuario.estructuraOrganizacional
      }
    });

  } catch (error) {
    console.error('❌ Error al asignar rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener usuarios por ministerio
const obtenerUsuariosPorMinisterio = async (req, res) => {
  try {
    const { ministerio } = req.params;

    const usuarios = await UsuariosModel.find({
      'estructuraOrganizacional.rolesMinisteriales.ministerio': ministerio,
      'estructuraOrganizacional.rolesMinisteriales.activo': true
    }).select('primernombreUsuario primerapellidoUsuario fotoPerfil estructuraOrganizacional.rolesMinisteriales');

    res.status(200).json({
      success: true,
      ministerio,
      usuarios
    });

  } catch (error) {
    console.error('❌ Error al obtener usuarios del ministerio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener usuarios por nivel jerárquico
const obtenerUsuariosPorNivel = async (req, res) => {
  try {
    const { nivel } = req.params;

    const usuarios = await UsuariosModel.find({
      'estructuraOrganizacional.nivelJerarquico': nivel
    }).select('primernombreUsuario primerapellidoUsuario fotoPerfil estructuraOrganizacional');

    res.status(200).json({
      success: true,
      nivel,
      usuarios
    });

  } catch (error) {
    console.error('❌ Error al obtener usuarios por nivel:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar permisos de usuario para una acción específica
const verificarPermisos = async (req, res) => {
  try {
    const { accion } = req.params;

    const usuario = await UsuariosModel.findById(req.userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const permisos = usuario.estructuraOrganizacional?.permisos || {};
    const tienePermiso = permisos[accion] || false;

    res.status(200).json({
      success: true,
      accion,
      tienePermiso,
      usuario: {
        id: usuario._id,
        rol: usuario.rolUsuario,
        nivel: usuario.estructuraOrganizacional?.nivelJerarquico
      }
    });

  } catch (error) {
    console.error('❌ Error al verificar permisos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  asignarRolOrganizacional,
  obtenerUsuariosPorMinisterio,
  obtenerUsuariosPorNivel,
  verificarPermisos
};
