// src/services/amistades.services.js
const UserModel = require('../model/usuarios.model');
const mongoose = require('mongoose');

// Función auxiliar para retry automático en caso de conflictos
const retryOperation = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      // Si es un WriteConflict o TransientTransactionError y no es el último intento, reintenta
      if ((error.code === 112 || error.code === 251) && attempt < maxRetries) {
        console.log(`${error.code === 112 ? 'Write conflict' : 'Transient transaction error'} detectado, reintentando (${attempt}/${maxRetries})`);
        // Esperar un tiempo aleatorio antes de reintentar (jitter)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        continue;
      }
      throw error;
    }
  }
};

// Enviar solicitud de amistad
const enviarSolicitudAmistad = async (solicitanteId, receptorId) => {
  return await retryOperation(async () => {
    let session = null;
    try {
      // Usar session con retry writes habilitado
      session = await mongoose.startSession();
      session.startTransaction({
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' }
      });

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

      // Actualizar ambos usuarios usando operaciones atómicas
      await Promise.all([
        UserModel.updateOne(
          { _id: receptorId },
          { $addToSet: { solicitudesPendientes: solicitanteId } },
          { session }
        ),
        UserModel.updateOne(
          { _id: solicitanteId },
          { $addToSet: { solicitudesEnviadas: receptorId } },
          { session }
        )
      ]);

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
      // Solo intentar abortar si la sesión existe y no es un error de transacción ya abortada
      if (session && error.code !== 251) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.log('Error al abortar transacción (posiblemente ya abortada):', abortError.message);
        }
      }
      console.error('Error en enviarSolicitudAmistad:', error);
      throw error; // Re-lanza el error para que el retry lo maneje
    } finally {
      if (session) {
        session.endSession();
      }
    }
  });
};

// Aceptar solicitud de amistad
const aceptarSolicitudAmistad = async (solicitanteId, receptorId) => {
  return await retryOperation(async () => {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction({
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' }
      });

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

      // Actualizar ambos usuarios usando operaciones atómicas
      await Promise.all([
        UserModel.updateOne(
          { _id: receptorId },
          {
            $pull: { solicitudesPendientes: solicitanteId },
            $addToSet: { amigos: solicitanteId }
          },
          { session }
        ),
        UserModel.updateOne(
          { _id: solicitanteId },
          {
            $pull: { solicitudesEnviadas: receptorId },
            $addToSet: { amigos: receptorId }
          },
          { session }
        )
      ]);

      await session.commitTransaction();

      return {
        msg: 'Solicitud de amistad aceptada',
        statusCode: 200
      };

    } catch (error) {
      // Solo intentar abortar si la sesión existe y no es un error de transacción ya abortada
      if (session && error.code !== 251) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.log('Error al abortar transacción (posiblemente ya abortada):', abortError.message);
        }
      }
      console.error('Error en aceptarSolicitudAmistad:', error);
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  });
};

// Rechazar solicitud de amistad
const rechazarSolicitudAmistad = async (solicitanteId, receptorId) => {
  return await retryOperation(async () => {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction({
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' }
      });

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

      // Remover solicitud de ambos usuarios usando operaciones atómicas
      await Promise.all([
        UserModel.updateOne(
          { _id: receptorId },
          { $pull: { solicitudesPendientes: solicitanteId } },
          { session }
        ),
        UserModel.updateOne(
          { _id: solicitanteId },
          { $pull: { solicitudesEnviadas: receptorId } },
          { session }
        )
      ]);

      await session.commitTransaction();

      return {
        msg: 'Solicitud de amistad rechazada',
        statusCode: 200
      };

    } catch (error) {
      // Solo intentar abortar si la sesión existe y no es un error de transacción ya abortada
      if (session && error.code !== 251) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.log('Error al abortar transacción (posiblemente ya abortada):', abortError.message);
        }
      }
      console.error('Error en rechazarSolicitudAmistad:', error);
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  });
};

// Cancelar solicitud enviada
const cancelarSolicitudAmistad = async (solicitanteId, receptorId) => {
  return await retryOperation(async () => {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction({
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' }
      });

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

      // Remover solicitud de ambos usuarios usando operaciones atómicas
      await Promise.all([
        UserModel.updateOne(
          { _id: solicitanteId },
          { $pull: { solicitudesEnviadas: receptorId } },
          { session }
        ),
        UserModel.updateOne(
          { _id: receptorId },
          { $pull: { solicitudesPendientes: solicitanteId } },
          { session }
        )
      ]);

      await session.commitTransaction();

      return {
        msg: 'Solicitud cancelada exitosamente',
        statusCode: 200
      };

    } catch (error) {
      // Solo intentar abortar si la sesión existe y no es un error de transacción ya abortada
      if (session && error.code !== 251) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.log('Error al abortar transacción (posiblemente ya abortada):', abortError.message);
        }
      }
      console.error('Error en cancelarSolicitudAmistad:', error);
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  });
};

// Las demás funciones sin transacciones no necesitan cambios, pero las incluyo por completitud
const obtenerEstadoAmistad = async (usuarioActualId, otroUsuarioId) => {
  try {
    if (usuarioActualId.toString() === otroUsuarioId.toString()) {
      return {
        estado: 'self',
        statusCode: 200
      };
    }

    const usuarioActual = await UserModel.findById(usuarioActualId)
      .select('amigos solicitudesPendientes solicitudesEnviadas')
      .lean(); // Usar lean() para mejor performance

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
      })
      .lean();

    if (!usuario) {
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    const totalAmigos = await UserModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(usuarioId) } },
      { $project: { amigosCount: { $size: { $ifNull: ['$amigos', []] } } } }
    ]);

    const total = totalAmigos[0]?.amigosCount || 0;

    return {
      amigos: usuario.amigos || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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

const obtenerSolicitudesPendientes = async (usuarioId) => {
  try {
    const usuario = await UserModel.findById(usuarioId)
      .populate({
        path: 'solicitudesPendientes',
        select: 'primernombreUsuario primerapellidoUsuario fotoPerfil ciudadUsuario paisUsuario',
        match: { estadoUsuario: 'activo' }
      })
      .lean();

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

const obtenerSolicitudesEnviadas = async (usuarioId) => {
  try {
    const usuario = await UserModel.findById(usuarioId)
      .populate({
        path: 'solicitudesEnviadas',
        select: 'primernombreUsuario primerapellidoUsuario fotoPerfil ciudadUsuario paisUsuario',
        match: { estadoUsuario: 'activo' }
      })
      .lean();

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

const eliminarAmistad = async (usuarioId, amigoId) => {
  return await retryOperation(async () => {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction({
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' }
      });

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

      // Remover de ambos usuarios usando operaciones atómicas
      await Promise.all([
        UserModel.updateOne(
          { _id: usuarioId },
          { $pull: { amigos: amigoId } },
          { session }
        ),
        UserModel.updateOne(
          { _id: amigoId },
          { $pull: { amigos: usuarioId } },
          { session }
        )
      ]);

      await session.commitTransaction();

      return {
        msg: 'Amistad eliminada exitosamente',
        statusCode: 200
      };

    } catch (error) {
      // Solo intentar abortar si la sesión existe y no es un error de transacción ya abortada
      if (session && error.code !== 251) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.log('Error al abortar transacción (posiblemente ya abortada):', abortError.message);
        }
      }
      console.error('Error en eliminarAmistad:', error);
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  });
};

// Obtener sugerencias de amistad
const obtenerSugerenciasAmistad = async (usuarioId) => {
  try {
    // Obtener el usuario actual con sus amigos y solicitudes
    const usuario = await UserModel.findById(usuarioId)
      .populate('amigos', 'primernombreUsuario primerapellidoUsuario fotoPerfil ciudadUsuario paisUsuario')
      .populate('solicitudesEnviadas', '_id')
      .populate('solicitudesPendientes', '_id');

    if (!usuario) {
      return {
        error: 'Usuario no encontrado',
        statusCode: 404
      };
    }

    // Obtener IDs de usuarios a excluir (amigos, solicitudes enviadas, solicitudes pendientes, y el propio usuario)
    const idsExcluir = [
      usuarioId,
      ...usuario.amigos.map(amigo => amigo._id),
      ...usuario.solicitudesEnviadas.map(sol => sol._id),
      ...usuario.solicitudesPendientes.map(sol => sol._id)
    ];

    // Buscar usuarios que no estén en la lista de exclusión y estén activos
    const sugerencias = await UserModel.find({
      _id: { $nin: idsExcluir },
      estadoUsuario: 'activo'
    })
      .select('primernombreUsuario primerapellidoUsuario fotoPerfil ciudadUsuario paisUsuario')
      .limit(10) // Limitar a 10 sugerencias
      .sort({ createdAt: -1 }); // Ordenar por usuarios más recientes

    return {
      sugerencias,
      statusCode: 200
    };

  } catch (error) {
    console.error('Error en obtenerSugerenciasAmistad:', error);
    return {
      error: 'Error interno del servidor',
      statusCode: 500
    };
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
  eliminarAmistad,
  obtenerSugerenciasAmistad
};