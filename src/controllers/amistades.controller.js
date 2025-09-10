// src/controllers/amistades.controller.js
const {
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
} = require('../services/amistades.services');

// Importar funciones de notificaciones
const {
  crearNotificacionSolicitudAmistad,
  crearNotificacionAmistadAceptada
} = require('./notificaciones.controller');

// Enviar solicitud de amistad
const enviarSolicitud = async (req, res) => {
  try {
    const solicitanteId = req.userId;
    const { receptorId } = req.body;

    if (!receptorId) {
      return res.status(400).json({
        error: 'ID del receptor es requerido'
      });
    }

    const resultado = await enviarSolicitudAmistad(solicitanteId, receptorId);

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    // Crear notificación de solicitud de amistad
    try {
      await crearNotificacionSolicitudAmistad(solicitanteId, receptorId);
      console.log('✅ Notificación de solicitud de amistad creada');
    } catch (notificationError) {
      console.error('❌ Error creando notificación de solicitud:', notificationError);
      // No fallar la operación principal por error en notificación
    }

    return res.status(resultado.statusCode).json({
      success: true,
      message: resultado.msg,
      receptor: resultado.receptor
    });

  } catch (error) {
    console.error('Error en enviarSolicitud:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Aceptar solicitud de amistad
const aceptarSolicitud = async (req, res) => {
  try {
    const receptorId = req.userId;
    const { solicitanteId } = req.body;

    if (!solicitanteId) {
      return res.status(400).json({
        error: 'ID del solicitante es requerido'
      });
    }

    const resultado = await aceptarSolicitudAmistad(solicitanteId, receptorId);

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    // Crear notificación de amistad aceptada para el solicitante original
    try {
      await crearNotificacionAmistadAceptada(receptorId, solicitanteId);
      console.log('✅ Notificación de amistad aceptada creada');
    } catch (notificationError) {
      console.error('❌ Error creando notificación de aceptación:', notificationError);
      // No fallar la operación principal por error en notificación
    }

    return res.status(resultado.statusCode).json({
      success: true,
      message: resultado.msg
    });

  } catch (error) {
    console.error('Error en aceptarSolicitud:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Rechazar solicitud de amistad
const rechazarSolicitud = async (req, res) => {
  try {
    const receptorId = req.userId;
    const { solicitanteId } = req.body;

    if (!solicitanteId) {
      return res.status(400).json({
        error: 'ID del solicitante es requerido'
      });
    }

    const resultado = await rechazarSolicitudAmistad(solicitanteId, receptorId);

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    return res.status(resultado.statusCode).json({
      success: true,
      message: resultado.msg
    });

  } catch (error) {
    console.error('Error en rechazarSolicitud:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Cancelar solicitud enviada
const cancelarSolicitud = async (req, res) => {
  try {
    const solicitanteId = req.userId;
    const { receptorId } = req.body;

    if (!receptorId) {
      return res.status(400).json({
        error: 'ID del receptor es requerido'
      });
    }

    const resultado = await cancelarSolicitudAmistad(solicitanteId, receptorId);

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    return res.status(resultado.statusCode).json({
      success: true,
      message: resultado.msg
    });

  } catch (error) {
    console.error('Error en cancelarSolicitud:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estado de amistad con un usuario específico
const obtenerEstado = async (req, res) => {
  try {
    const usuarioActualId = req.userId;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'ID del usuario es requerido'
      });
    }

    const resultado = await obtenerEstadoAmistad(usuarioActualId, userId);

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    return res.status(200).json({
      success: true,
      estado: resultado.estado,
      data: resultado.data || {}
    });

  } catch (error) {
    console.error('Error en obtenerEstado:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener lista de amigos
const listarAmigos = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const resultado = await obtenerAmigos(usuarioId, parseInt(page), parseInt(limit));

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    return res.status(200).json({
      success: true,
      amigos: resultado.amigos,
      totalAmigos: resultado.totalAmigos,
      pagination: resultado.pagination
    });

  } catch (error) {
    console.error('Error en listarAmigos:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener solicitudes recibidas pendientes
const obtenerSolicitudesRecibidas = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const resultado = await obtenerSolicitudesPendientes(usuarioId);

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    return res.status(200).json({
      success: true,
      solicitudes: resultado.solicitudes,
      count: resultado.count
    });

  } catch (error) {
    console.error('Error en obtenerSolicitudesRecibidas:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener solicitudes enviadas
const obtenerSolicitudesEnviadasController = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const resultado = await obtenerSolicitudesEnviadas(usuarioId);

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    return res.status(200).json({
      success: true,
      solicitudes: resultado.solicitudes,
      count: resultado.count
    });

  } catch (error) {
    console.error('Error en obtenerSolicitudesEnviadas:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar amistad existente
const eliminarAmigo = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { amigoId } = req.body;

    if (!amigoId) {
      return res.status(400).json({
        error: 'ID del amigo es requerido'
      });
    }

    const resultado = await eliminarAmistad(usuarioId, amigoId);

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    return res.status(200).json({
      success: true,
      message: resultado.msg
    });

  } catch (error) {
    console.error('Error en eliminarAmigo:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener sugerencias de amistad
const obtenerSugerencias = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const resultado = await obtenerSugerenciasAmistad(usuarioId);

    if (resultado.error) {
      return res.status(resultado.statusCode).json({
        error: resultado.error
      });
    }

    return res.status(resultado.statusCode).json({
      sugerencias: resultado.sugerencias
    });

  } catch (error) {
    console.error('Error en obtenerSugerencias:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  enviarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  obtenerEstado,
  listarAmigos,
  obtenerSolicitudesRecibidas,
  obtenerSolicitudesEnviadasController,
  eliminarAmigo,
  obtenerSugerencias
};