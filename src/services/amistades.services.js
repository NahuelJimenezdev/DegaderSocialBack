// src/services/amistades.services.js
const UserModel = require('../model/usuarios.model');
const mongoose = require('mongoose');

// Enviar solicitud de amistad
const enviarSolicitudAmistad = async (solicitanteId, receptorId) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Verificar que no sean el mismo usuario
    if (solicitanteId.toString() === receptorId.toString()) {
      await session.abortTransaction();
      return {
        error: 'No puedes enviarte solicitud a ti mismo',
        statusCode: 400
      };
    }

    // Verificar que ambos usuarios existen
    const [solicitante, receptor] = await Promise.all([
      UserModel.findById(solicitanteId).session(session),
      UserModel.findById(receptorId).session(session)
    ]);

    if (!receptor || receptor.estadoUsuario !== 'activo') {
      await session.abortTransaction();
      return {
        error: 'Usuario receptor no encontrado o inactivo',
        statusCode: 404
      };
    }

    if (!solicitante || solicitante.estadoUsuario !== 'activo') {
      await session.abortTransaction();
      return {
        error: 'Usuario solicitante no encontrado o inactivo',
        statusCode: 404
      };
    }

    // Verificar que no sean ya amigos
    const yaSonAmigos = solicitante.amigos?.includes(receptorId) ||
      receptor.amigos?.includes(solicitanteId);

    if (yaSonAmigos) {
      await session.abortTransaction();
      return {
        error: 'Ya son amigos',
        statusCode: 400
      };
    }

    // Verificar si ya hay una solicitud pendiente (en cualquier dirección)
    const tieneSolicitudPendiente = receptor.solicitudesPendientes?.includes(solicitanteId) ||
      solicitante.solicitudesEnviadas?.includes(receptorId) ||
      solicitante.solicitudesPendientes?.includes(receptorId) ||
      receptor.solicitudesEnviadas?.includes(solicitanteId);

    if (tieneSolicitudPendiente) {
      await session.abortTransaction();
      return {
        error: 'Ya existe una solicitud pendiente entre estos usuarios',
        statusCode: 400
      };
    }

    // Actualizar ambos usuarios
    await UserModel.findByIdAndUpdate(
      receptorId,
      { $addToSet: { solicitudesPendientes: solicitanteId } },
      { session }
    );

    await UserModel.findByIdAndUpdate(
      solicitanteId,
      { $addToSet: { solicitudesEnviadas: receptorId } },
      { session }
    );

    await session.commitTransaction();

    return {
      msg: 'Solicitud de amistad enviada exitosamente',
      statusCode: 201,
      receptor: {
        id: receptor._id,
        nombre: `${receptor.primernombreUsuario} ${receptor.primerapellidoUsuario}`,
        fotoPerfil: receptor.fotoPerfil
      }
    };

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error en enviarSolicitudAmistad:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// Aceptar solicitud de amistad
const aceptarSolicitudAmistad = async (solicitanteId, receptorId) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const [solicitante, receptor] = await Promise.all([
      UserModel.findById(solicitanteId).session(session),
      UserModel.findById(receptorId).session(session)
    ]);

    if (!receptor || !solicitante) {
      await session.abortTransaction();
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    // Verificar que existe la solicitud
    if (!receptor.solicitudesPendientes?.includes(solicitanteId) ||
      !solicitante.solicitudesEnviadas?.includes(receptorId)) {
      await session.abortTransaction();
      return {
        error: 'Solicitud de amistad no encontrada',
        statusCode: 404
      };
    }

    // Actualizar ambos usuarios: remover de solicitudes y agregar a amigos
    await UserModel.findByIdAndUpdate(
      receptorId,
      {
        $pull: { solicitudesPendientes: solicitanteId },
        $addToSet: { amigos: solicitanteId }
      },
      { session }
    );

    await UserModel.findByIdAndUpdate(
      solicitanteId,
      {
        $pull: { solicitudesEnviadas: receptorId },
        $addToSet: { amigos: receptorId }
      },
      { session }
    );

    await session.commitTransaction();

    return {
      msg: 'Solicitud de amistad aceptada',
      statusCode: 200
    };

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error en aceptarSolicitudAmistad:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// Rechazar solicitud de amistad
const rechazarSolicitudAmistad = async (solicitanteId, receptorId) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const [solicitante, receptor] = await Promise.all([
      UserModel.findById(solicitanteId).session(session),
      UserModel.findById(receptorId).session(session)
    ]);

    if (!receptor || !solicitante) {
      await session.abortTransaction();
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    // Verificar que existe la solicitud
    if (!receptor.solicitudesPendientes?.includes(solicitanteId) ||
      !solicitante.solicitudesEnviadas?.includes(receptorId)) {
      await session.abortTransaction();
      return {
        error: 'Solicitud de amistad no encontrada',
        statusCode: 404
      };
    }

    // Remover solicitud de ambos usuarios
    await UserModel.findByIdAndUpdate(
      receptorId,
      { $pull: { solicitudesPendientes: solicitanteId } },
      { session }
    );

    await UserModel.findByIdAndUpdate(
      solicitanteId,
      { $pull: { solicitudesEnviadas: receptorId } },
      { session }
    );

    await session.commitTransaction();

    return {
      msg: 'Solicitud de amistad rechazada',
      statusCode: 200
    };

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error en rechazarSolicitudAmistad:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// Cancelar solicitud enviada
const cancelarSolicitudAmistad = async (solicitanteId, receptorId) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const [solicitante, receptor] = await Promise.all([
      UserModel.findById(solicitanteId).session(session),
      UserModel.findById(receptorId).session(session)
    ]);

    if (!receptor || !solicitante) {
      await session.abortTransaction();
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    // Verificar que existe la solicitud enviada
    if (!solicitante.solicitudesEnviadas?.includes(receptorId) ||
      !receptor.solicitudesPendientes?.includes(solicitanteId)) {
      await session.abortTransaction();
      return {
        error: 'Solicitud enviada no encontrada',
        statusCode: 404
      };
    }

    // Remover solicitud de ambos usuarios
    await UserModel.findByIdAndUpdate(
      solicitanteId,
      { $pull: { solicitudesEnviadas: receptorId } },
      { session }
    );

    await UserModel.findByIdAndUpdate(
      receptorId,
      { $pull: { solicitudesPendientes: solicitanteId } },
      { session }
    );

    await session.commitTransaction();

    return {
      msg: 'Solicitud cancelada exitosamente',
      statusCode: 200
    };

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error en cancelarSolicitudAmistad:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// Obtener estado de amistad entre dos usuarios
const obtenerEstadoAmistad = async (usuarioActualId, otroUsuarioId) => {
  try {
    if (usuarioActualId.toString() === otroUsuarioId.toString()) {
      return {
        estado: 'self',
        statusCode: 200
      };
    }

    const usuarioActual = await UserModel.findById(usuarioActualId)
      .select('amigos solicitudesPendientes solicitudesEnviadas');

    if (!usuarioActual) {
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    // Verificar si son amigos
    if (usuarioActual.amigos?.includes(otroUsuarioId)) {
      return {
        estado: 'amigos',
        statusCode: 200
      };
    }

    // Verificar si hay solicitud pendiente recibida
    if (usuarioActual.solicitudesPendientes?.includes(otroUsuarioId)) {
      return {
        estado: 'solicitud_recibida',
        statusCode: 200
      };
    }

    // Verificar si hay solicitud pendiente enviada
    if (usuarioActual.solicitudesEnviadas?.includes(otroUsuarioId)) {
      return {
        estado: 'solicitud_enviada',
        statusCode: 200
      };
    }

    // No hay relación
    return {
      estado: 'ninguna',
      statusCode: 200
    };

  } catch (error) {
    console.error('Error en obtenerEstadoAmistad:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  }
};

// Obtener lista de amigos con paginación
const obtenerAmigos = async (usuarioId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const usuario = await UserModel.findById(usuarioId)
      .populate({
        path: 'amigos',
        select: 'primernombreUsuario primerapellidoUsuario fotoPerfil ciudadUsuario paisUsuario ultimaConexion estadoUsuario',
        match: { estadoUsuario: 'activo' },
        options: {
          skip,
          limit,
          sort: { ultimaConexion: -1 }
        }
      });

    if (!usuario) {
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    const totalAmigos = await UserModel.findById(usuarioId)
      .populate({
        path: 'amigos',
        match: { estadoUsuario: 'activo' }
      })
      .then(u => u.amigos?.length || 0);

    return {
      amigos: usuario.amigos || [],
      pagination: {
        page,
        limit,
        total: totalAmigos,
        pages: Math.ceil(totalAmigos / limit)
      },
      statusCode: 200
    };

  } catch (error) {
    console.error('Error en obtenerAmigos:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  }
};

// Obtener solicitudes pendientes recibidas
const obtenerSolicitudesPendientes = async (usuarioId) => {
  try {
    const usuario = await UserModel.findById(usuarioId)
      .populate({
        path: 'solicitudesPendientes',
        select: 'primernombreUsuario primerapellidoUsuario fotoPerfil ciudadUsuario paisUsuario',
        match: { estadoUsuario: 'activo' }
      });

    if (!usuario) {
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    return {
      solicitudes: usuario.solicitudesPendientes || [],
      count: usuario.solicitudesPendientes?.length || 0,
      statusCode: 200
    };

  } catch (error) {
    console.error('Error en obtenerSolicitudesPendientes:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  }
};

// Obtener solicitudes enviadas
const obtenerSolicitudesEnviadas = async (usuarioId) => {
  try {
    const usuario = await UserModel.findById(usuarioId)
      .populate({
        path: 'solicitudesEnviadas',
        select: 'primernombreUsuario primerapellidoUsuario fotoPerfil ciudadUsuario paisUsuario',
        match: { estadoUsuario: 'activo' }
      });

    if (!usuario) {
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    return {
      solicitudes: usuario.solicitudesEnviadas || [],
      count: usuario.solicitudesEnviadas?.length || 0,
      statusCode: 200
    };

  } catch (error) {
    console.error('Error en obtenerSolicitudesEnviadas:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  }
};

// Eliminar amistad
const eliminarAmistad = async (usuarioId, amigoId) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const [usuario, amigo] = await Promise.all([
      UserModel.findById(usuarioId).session(session),
      UserModel.findById(amigoId).session(session)
    ]);

    if (!usuario || !amigo) {
      await session.abortTransaction();
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    // Verificar que son amigos
    if (!usuario.amigos?.includes(amigoId) || !amigo.amigos?.includes(usuarioId)) {
      await session.abortTransaction();
      return {
        error: 'No son amigos',
        statusCode: 400
      };
    }

    // Remover de ambos usuarios
    await UserModel.findByIdAndUpdate(
      usuarioId,
      { $pull: { amigos: amigoId } },
      { session }
    );

    await UserModel.findByIdAndUpdate(
      amigoId,
      { $pull: { amigos: usuarioId } },
      { session }
    );

    await session.commitTransaction();

    return {
      msg: 'Amistad eliminada exitosamente',
      statusCode: 200
    };

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error en eliminarAmistad:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

module.exports = {
  enviarSolicitudAmistad,
  aceptarSolicitudAmistad,
  rechazarSolicitudAmistad,
  cancelarSolicitudAmistad,
  obtenerEstadoAmistad,
  obtenerAmigos,
  obtenerSolicitudesPendientes,
  obtenerSolicitudesEnviadas,
  eliminarAmistad
};