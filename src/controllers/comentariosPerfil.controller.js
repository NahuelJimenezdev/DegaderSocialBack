// src/controllers/comentariosPerfil.controller.js
const ComentarioPerfilModel = require('../models/comentariosPerfil.model');
const UsuarioModel = require('../models/usuarios.model');
const NotificacionesService = require('../services/notificaciones.service');
const { z } = require('zod');

// Schemas de validación
const crearComentarioSchema = z.object({
  perfilUsuarioId: z.string().min(1, 'ID del perfil requerido'),
  contenido: z.string()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .trim(),
  comentarioPadreId: z.string().optional()
});

const editarComentarioSchema = z.object({
  contenido: z.string()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .trim()
});

/**
 * Crear comentario en perfil
 */
exports.crearComentario = async (req, res) => {
  try {
    console.log('🎯 Creando comentario en perfil...');

    // Validar datos
    const datosValidados = crearComentarioSchema.parse(req.body);
    const autorId = req.user.id || req.userId;

    if (!autorId) {
      return res.status(401).json({ msg: 'Usuario no autenticado' });
    }

    // Verificar que el perfil de destino existe
    const perfilUsuario = await UsuarioModel.findById(datosValidados.perfilUsuarioId);
    if (!perfilUsuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Si es una respuesta, verificar que el comentario padre existe
    if (datosValidados.comentarioPadreId) {
      const comentarioPadre = await ComentarioPerfilModel.findById(datosValidados.comentarioPadreId);
      if (!comentarioPadre) {
        return res.status(404).json({ msg: 'Comentario padre no encontrado' });
      }
    }

    // Crear el comentario
    const nuevoComentario = new ComentarioPerfilModel({
      autorId,
      perfilUsuarioId: datosValidados.perfilUsuarioId,
      contenido: datosValidados.contenido,
      comentarioPadreId: datosValidados.comentarioPadreId || null
    });

    await nuevoComentario.save();

    // Poblar información del autor
    await nuevoComentario.populate({
      path: 'autorId',
      select: 'primernombreUsuario primerapellidoUsuario fotoPerfil rolUsuario'
    });

    // Crear notificación si no es el mismo usuario
    try {
      const tipoComentario = datosValidados.comentarioPadreId ? 'respuesta' : 'perfil';
      await NotificacionesService.crearNotificacionComentarioPerfil(
        autorId,
        datosValidados.perfilUsuarioId,
        nuevoComentario,
        tipoComentario
      );
    } catch (notifError) {
      console.error('Error creando notificación:', notifError);
      // No fallar la operación principal por error en notificación
    }

    console.log('✅ Comentario creado exitosamente');
    res.status(201).json({
      msg: 'Comentario creado exitosamente',
      comentario: nuevoComentario
    });

  } catch (error) {
    console.error('❌ Error creando comentario:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: 'Datos inválidos',
        errores: error.errors
      });
    }

    res.status(500).json({
      msg: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener comentarios de un perfil
 */
exports.obtenerComentariosPerfil = async (req, res) => {
  try {
    const { perfilUsuarioId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verificar que el perfil existe
    const perfilUsuario = await UsuarioModel.findById(perfilUsuarioId);
    if (!perfilUsuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Obtener comentarios principales (no respuestas)
    const comentarios = await ComentarioPerfilModel
      .find({
        perfilUsuarioId,
        comentarioPadreId: null,
        estado: 'activo'
      })
      .sort({ fechaCreacion: -1 })
      .skip(skip)
      .limit(limit);

    // Para cada comentario, obtener sus respuestas
    const comentariosConRespuestas = await Promise.all(
      comentarios.map(async (comentario) => {
        const respuestas = await ComentarioPerfilModel
          .find({
            comentarioPadreId: comentario._id,
            estado: 'activo'
          })
          .sort({ fechaCreacion: 1 })
          .limit(5); // Limitar respuestas mostradas

        const totalRespuestas = await ComentarioPerfilModel.countDocuments({
          comentarioPadreId: comentario._id,
          estado: 'activo'
        });

        return {
          ...comentario.toObject(),
          respuestas,
          totalRespuestas,
          preview: comentario.getPreview()
        };
      })
    );

    const total = await ComentarioPerfilModel.countDocuments({
      perfilUsuarioId,
      comentarioPadreId: null,
      estado: 'activo'
    });

    res.json({
      comentarios: comentariosConRespuestas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo comentarios:', error);
    res.status(500).json({
      msg: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Editar comentario
 */
exports.editarComentario = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const datosValidados = editarComentarioSchema.parse(req.body);
    const usuarioId = req.user.id || req.userId;

    // Buscar el comentario
    const comentario = await ComentarioPerfilModel.findById(comentarioId);
    if (!comentario) {
      return res.status(404).json({ msg: 'Comentario no encontrado' });
    }

    // Verificar que el usuario es el autor
    if (comentario.autorId.toString() !== usuarioId.toString()) {
      return res.status(403).json({ msg: 'No tienes permiso para editar este comentario' });
    }

    // Actualizar comentario
    comentario.contenido = datosValidados.contenido;
    comentario.fechaEdicion = new Date();
    comentario.version += 1;

    await comentario.save();

    res.json({
      msg: 'Comentario actualizado exitosamente',
      comentario
    });

  } catch (error) {
    console.error('❌ Error editando comentario:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: 'Datos inválidos',
        errores: error.errors
      });
    }

    res.status(500).json({
      msg: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Eliminar comentario
 */
exports.eliminarComentario = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.user.id || req.userId;

    const comentario = await ComentarioPerfilModel.findById(comentarioId);
    if (!comentario) {
      return res.status(404).json({ msg: 'Comentario no encontrado' });
    }

    // Verificar permisos (autor o dueño del perfil)
    const esAutor = comentario.autorId.toString() === usuarioId.toString();
    const esDuenoPerfil = comentario.perfilUsuarioId.toString() === usuarioId.toString();

    if (!esAutor && !esDuenoPerfil) {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar este comentario' });
    }

    // Marcar como eliminado en lugar de borrar
    comentario.estado = 'eliminado';
    await comentario.save();

    res.json({ msg: 'Comentario eliminado exitosamente' });

  } catch (error) {
    console.error('❌ Error eliminando comentario:', error);
    res.status(500).json({
      msg: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener respuestas de un comentario
 */
exports.obtenerRespuestas = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Verificar que el comentario padre existe
    const comentarioPadre = await ComentarioPerfilModel.findById(comentarioId);
    if (!comentarioPadre) {
      return res.status(404).json({ msg: 'Comentario no encontrado' });
    }

    const respuestas = await ComentarioPerfilModel
      .find({
        comentarioPadreId: comentarioId,
        estado: 'activo'
      })
      .sort({ fechaCreacion: 1 })
      .skip(skip)
      .limit(limit);

    const total = await ComentarioPerfilModel.countDocuments({
      comentarioPadreId: comentarioId,
      estado: 'activo'
    });

    res.json({
      respuestas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo respuestas:', error);
    res.status(500).json({
      msg: 'Error interno del servidor',
      error: error.message
    });
  }
};
