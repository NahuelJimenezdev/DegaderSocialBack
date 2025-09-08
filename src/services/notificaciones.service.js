// src/services/notificaciones.service.js
const NotificacionModel = require('../models/notificaciones.model');
const UsuarioModel = require('../models/usuarios.model');

class NotificacionesService {

  /**
   * Crear notificación de comentario en perfil
   */
  static async crearNotificacionComentarioPerfil(autorId, perfilUsuarioId, comentario, tipoComentario = 'perfil') {
    try {
      // No notificar si el usuario comenta en su propio perfil
      if (autorId.toString() === perfilUsuarioId.toString()) {
        return null;
      }

      // Obtener datos del autor
      const autor = await UsuarioModel.findById(autorId).select(
        'primernombreUsuario primerapellidoUsuario fotoPerfil'
      );

      if (!autor) {
        throw new Error('Autor no encontrado');
      }

      // Crear título según el tipo
      const nombreCompleto = `${autor.primernombreUsuario} ${autor.primerapellidoUsuario}`;
      let titulo;

      switch (tipoComentario) {
        case 'perfil':
          titulo = `${nombreCompleto} comentó en tu perfil`;
          break;
        case 'publicacion':
          titulo = `${nombreCompleto} comentó en tu publicación`;
          break;
        case 'respuesta':
          titulo = `${nombreCompleto} respondió tu comentario`;
          break;
        default:
          titulo = `${nombreCompleto} interactuó contigo`;
      }

      // Crear preview del mensaje (máximo 60 caracteres)
      const preview = this.crearPreviewMensaje(comentario.contenido, 60);

      // Crear la notificación
      const notificacion = new NotificacionModel({
        usuarioDestinoId: perfilUsuarioId,
        usuarioOrigenId: autorId,
        tipo: 'comentario_perfil',
        titulo: titulo,
        mensaje: preview,
        metadata: {
          comentarioId: comentario._id,
          tipoComentario: tipoComentario,
          contenidoCompleto: comentario.contenido,
          fotoPerfil: autor.fotoPerfil || null
        },
        estado: 'no_leida'
      });

      await notificacion.save();
      return notificacion;

    } catch (error) {
      console.error('Error creando notificación de comentario:', error);
      throw error;
    }
  }

  /**
   * Crear preview del mensaje
   */
  static crearPreviewMensaje(contenido, maxLength = 60) {
    if (!contenido) return '';

    const textoLimpio = contenido.trim();

    if (textoLimpio.length <= maxLength) {
      return textoLimpio;
    }

    // Buscar el último espacio antes del límite para no cortar palabras
    let corte = textoLimpio.substring(0, maxLength);
    const ultimoEspacio = corte.lastIndexOf(' ');

    if (ultimoEspacio > maxLength * 0.7) { // Si el espacio está cerca del límite
      corte = corte.substring(0, ultimoEspacio);
    }

    return corte + '...';
  }

  /**
   * Obtener notificaciones de un usuario con paginación
   */
  static async obtenerNotificacionesUsuario(usuarioId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const notificaciones = await NotificacionModel
        .find({ usuarioDestinoId: usuarioId })
        .populate({
          path: 'usuarioOrigenId',
          select: 'primernombreUsuario primerapellidoUsuario fotoPerfil'
        })
        .sort({ fechaCreacion: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await NotificacionModel.countDocuments({ usuarioDestinoId: usuarioId });
      const noLeidas = await NotificacionModel.countDocuments({
        usuarioDestinoId: usuarioId,
        estado: 'no_leida'
      });

      return {
        notificaciones,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        contadores: {
          total,
          noLeidas
        }
      };

    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  static async marcarComoLeida(notificacionId, usuarioId) {
    try {
      const notificacion = await NotificacionModel.findOneAndUpdate(
        { _id: notificacionId, usuarioDestinoId: usuarioId },
        {
          estado: 'leida',
          fechaLectura: new Date()
        },
        { new: true }
      );

      return notificacion;
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async marcarTodasComoLeidas(usuarioId) {
    try {
      const resultado = await NotificacionModel.updateMany(
        { usuarioDestinoId: usuarioId, estado: 'no_leida' },
        {
          estado: 'leida',
          fechaLectura: new Date()
        }
      );

      return resultado;
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  static async contarNoLeidas(usuarioId) {
    try {
      const count = await NotificacionModel.countDocuments({
        usuarioDestinoId: usuarioId,
        estado: 'no_leida'
      });

      return count;
    } catch (error) {
      console.error('Error contando notificaciones no leídas:', error);
      throw error;
    }
  }
}

module.exports = NotificacionesService;
