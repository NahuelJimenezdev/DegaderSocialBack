const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const MensajeModel = require('../models/mensajes.model');
const UsuariosModel = require('../models/usuarios.model');

// Obtener conversaciones del usuario
router.get('/conversaciones', auth(), async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar conversaciones del usuario
    const conversaciones = await UsuariosModel.findById(userId)
      .populate({
        path: 'conversaciones.usuario',
        select: 'primernombreUsuario primerapellidoUsuario fotoPerfil estadoUsuario'
      })
      .populate({
        path: 'conversaciones.ultimoMensaje',
        populate: {
          path: 'remitente',
          select: 'primernombreUsuario primerapellidoUsuario'
        }
      })
      .select('conversaciones')
      .lean();

    res.json({
      success: true,
      conversaciones: conversaciones?.conversaciones || []
    });

  } catch (error) {
    console.error('Error obteniendo conversaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener conversaciones'
    });
  }
});

// Obtener mensajes entre dos usuarios
router.get('/:usuarioId', auth(), async (req, res) => {
  try {
    const userId = req.userId;
    const otroUsuarioId = req.params.usuarioId;

    // Verificar que el otro usuario existe
    const otroUsuario = await UsuariosModel.findById(otroUsuarioId);
    if (!otroUsuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener mensajes entre los dos usuarios
    const mensajes = await MensajeModel.find({
      $or: [
        { remitente: userId, destinatario: otroUsuarioId },
        { remitente: otroUsuarioId, destinatario: userId }
      ],
      eliminado: false
    })
      .populate('remitente', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .populate('destinatario', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .populate('mensajeRespondido')
      .sort({ fechaEnvio: 1 })
      .lean();

    // Marcar mensajes como leídos
    await MensajeModel.updateMany(
      {
        remitente: otroUsuarioId,
        destinatario: userId,
        estado: { $ne: 'leido' }
      },
      {
        estado: 'leido',
        fechaLectura: new Date()
      }
    );

    // Actualizar contador de mensajes no leídos en la conversación
    await UsuariosModel.updateOne(
      { _id: userId, 'conversaciones.usuario': otroUsuarioId },
      { $set: { 'conversaciones.$.mensajesNoLeidos': 0 } }
    );

    res.json({
      success: true,
      mensajes,
      usuario: {
        _id: otroUsuario._id,
        nombre: `${otroUsuario.primernombreUsuario} ${otroUsuario.primerapellidoUsuario}`,
        fotoPerfil: otroUsuario.fotoPerfil,
        estadoUsuario: otroUsuario.estadoUsuario
      }
    });

  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
});

// Enviar mensaje
router.post('/:usuarioId', auth(), async (req, res) => {
  try {
    const userId = req.userId;
    const destinatarioId = req.params.usuarioId;
    const { contenido, tipo = 'texto', archivoAdjunto, mensajeRespondido } = req.body;

    // Validar que el destinatario existe
    const destinatario = await UsuariosModel.findById(destinatarioId);
    if (!destinatario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario destinatario no encontrado'
      });
    }

    // Crear el mensaje
    const nuevoMensaje = new MensajeModel({
      remitente: userId,
      destinatario: destinatarioId,
      contenido,
      tipo,
      archivoAdjunto,
      mensajeRespondido
    });

    await nuevoMensaje.save();

    // Actualizar conversación del remitente
    await UsuariosModel.updateOne(
      { _id: userId },
      {
        $pull: { conversaciones: { usuario: destinatarioId } }
      }
    );

    await UsuariosModel.updateOne(
      { _id: userId },
      {
        $push: {
          conversaciones: {
            usuario: destinatarioId,
            ultimoMensaje: nuevoMensaje._id,
            mensajesNoLeidos: 0,
            fechaUltimoMensaje: new Date()
          }
        }
      }
    );

    // Actualizar conversación del destinatario
    await UsuariosModel.updateOne(
      { _id: destinatarioId },
      {
        $pull: { conversaciones: { usuario: userId } }
      }
    );

    const mensajesNoLeidos = await MensajeModel.countDocuments({
      remitente: userId,
      destinatario: destinatarioId,
      estado: { $ne: 'leido' }
    });

    await UsuariosModel.updateOne(
      { _id: destinatarioId },
      {
        $push: {
          conversaciones: {
            usuario: userId,
            ultimoMensaje: nuevoMensaje._id,
            mensajesNoLeidos: mensajesNoLeidos + 1,
            fechaUltimoMensaje: new Date()
          }
        }
      }
    );

    // Agregar mensaje a ambos usuarios
    await UsuariosModel.updateOne(
      { _id: userId },
      { $push: { mensajes: nuevoMensaje._id } }
    );

    await UsuariosModel.updateOne(
      { _id: destinatarioId },
      { $push: { mensajes: nuevoMensaje._id } }
    );

    // Poblar el mensaje para la respuesta
    await nuevoMensaje.populate('remitente', 'primernombreUsuario primerapellidoUsuario fotoPerfil');

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      mensaje: nuevoMensaje
    });

  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje'
    });
  }
});

// Marcar mensajes como leídos
router.put('/:usuarioId/leido', auth(), async (req, res) => {
  try {
    const userId = req.userId;
    const otroUsuarioId = req.params.usuarioId;

    await MensajeModel.updateMany(
      {
        remitente: otroUsuarioId,
        destinatario: userId,
        estado: { $ne: 'leido' }
      },
      {
        estado: 'leido',
        fechaLectura: new Date()
      }
    );

    // Actualizar contador de mensajes no leídos
    await UsuariosModel.updateOne(
      { _id: userId, 'conversaciones.usuario': otroUsuarioId },
      { $set: { 'conversaciones.$.mensajesNoLeidos': 0 } }
    );

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos'
    });

  } catch (error) {
    console.error('Error marcando mensajes como leídos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar mensajes como leídos'
    });
  }
});

// Eliminar mensaje (marcar como eliminado)
router.delete('/:mensajeId', auth(), async (req, res) => {
  try {
    const userId = req.userId;
    const mensajeId = req.params.mensajeId;

    const mensaje = await MensajeModel.findById(mensajeId);

    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Solo el remitente puede eliminar el mensaje
    if (mensaje.remitente.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este mensaje'
      });
    }

    await MensajeModel.updateOne(
      { _id: mensajeId },
      {
        eliminado: true,
        fechaEliminacion: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar mensaje'
    });
  }
});

module.exports = router;
