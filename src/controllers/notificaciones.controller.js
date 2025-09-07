// src/controllers/notificaciones.controller.js
const Notificacion = require('../model/notificaciones.model');
const Usuario = require('../model/usuarios.model');

// === CONSULTAS ===

// Obtener todas las notificaciones del usuario
const obtenerNotificaciones = async (req, res) => {
  try {
    const { page = 1, limit = 20, tipo, leidas, soloNoLeidas } = req.query;
    const userId = req.userId;

    const opciones = {
      page: parseInt(page),
      limit: parseInt(limit),
      tipo: tipo || null,
      leidas: leidas !== undefined ? leidas === 'true' : null,
      soloNoLeidas: soloNoLeidas === 'true'
    };

    const resultado = await Notificacion.obtenerPorUsuario(userId, opciones);

    res.json({
      success: true,
      data: resultado.notificaciones,
      pagination: resultado.pagination
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener contador de notificaciones no leídas
const obtenerContadorNoLeidas = async (req, res) => {
  try {
    const userId = req.userId;
    const count = await Notificacion.contarNoLeidas(userId);

    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error('Error obteniendo contador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// === GESTIÓN DE ESTADO ===

// Marcar notificación específica como leída
const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notificacion = await Notificacion.findOne({
      _id: id,
      destinatarioId: userId
    });

    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    await notificacion.marcarComoLeida();

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notificacion
    });

  } catch (error) {
    console.error('Error marcando como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Marcar todas las notificaciones como leídas
const marcarTodasComoLeidas = async (req, res) => {
  try {
    const userId = req.userId;

    const resultado = await Notificacion.updateMany(
      {
        destinatarioId: userId,
        leida: false
      },
      {
        leida: true,
        fechaLectura: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      modificadas: resultado.modifiedCount
    });

  } catch (error) {
    console.error('Error marcando todas como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// === ADMINISTRACIÓN ===

// Crear nueva notificación
const crearNotificacion = async (req, res) => {
  try {
    const {
      destinatarioId,
      remitenteId,
      tipo,
      mensaje,
      datos,
      enlace,
      prioridad
    } = req.body;

    // Validar que el destinatario existe
    const destinatario = await Usuario.findById(destinatarioId);
    if (!destinatario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario destinatario no encontrado'
      });
    }

    // Validar remitente si se proporciona
    let remitente = null;
    if (remitenteId) {
      remitente = await Usuario.findById(remitenteId);
      if (!remitente) {
        return res.status(404).json({
          success: false,
          message: 'Usuario remitente no encontrado'
        });
      }
    }

    const notificacion = await Notificacion.create({
      destinatarioId,
      remitenteId,
      tipo,
      mensaje,
      datos: datos || {},
      enlace,
      prioridad: prioridad || 'normal'
    });

    res.status(201).json({
      success: true,
      message: 'Notificación creada exitosamente',
      data: notificacion
    });

  } catch (error) {
    console.error('Error creando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar notificación
const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notificacion = await Notificacion.findOneAndDelete({
      _id: id,
      destinatarioId: userId
    });

    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// === FUNCIONES AUXILIARES ===

// Crear notificación de solicitud de amistad
const crearNotificacionSolicitudAmistad = async (remitenteId, destinatarioId) => {
  try {
    const remitente = await Usuario.findById(remitenteId).select(
      'primernombreUsuario primerapellidoUsuario fotoPerfil cargoFundacion pais'
    );

    if (!remitente) {
      throw new Error('Remitente no encontrado');
    }

    return await Notificacion.crearNotificacionSolicitudAmistad(
      remitenteId,
      destinatarioId,
      remitente
    );
  } catch (error) {
    console.error('Error creando notificación de solicitud:', error);
    throw error;
  }
};

// Crear notificación de amistad aceptada
const crearNotificacionAmistadAceptada = async (remitenteId, destinatarioId) => {
  try {
    const remitente = await Usuario.findById(remitenteId).select(
      'primernombreUsuario primerapellidoUsuario fotoPerfil cargoFundacion'
    );

    if (!remitente) {
      throw new Error('Remitente no encontrado');
    }

    return await Notificacion.crearNotificacionAmistadAceptada(
      remitenteId,
      destinatarioId,
      remitente
    );
  } catch (error) {
    console.error('Error creando notificación de aceptación:', error);
    throw error;
  }
};

module.exports = {
  obtenerNotificaciones,
  obtenerContadorNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  crearNotificacion,
  eliminarNotificacion,
  crearNotificacionSolicitudAmistad,
  crearNotificacionAmistadAceptada
};
