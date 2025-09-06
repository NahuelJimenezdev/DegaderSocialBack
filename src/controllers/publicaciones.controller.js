// controllers/publicaciones.controller.js
const PublicacionesModel = require('../model/publicaciones.model');
const UsuariosModel = require('../model/usuarios.model');
const fs = require('fs');
const path = require('path');

// Crear una nueva publicación (ya lo tienes)
// En controllers/publicaciones.controller.js - modifica crearPublicacion
crearPublicacion = async (req, res) => {
  try {
    console.log('🔔 Llegó solicitud a crearPublicacion');
    console.log('📦 Body:', req.body);
    console.log('📁 Files:', req.files);
    console.log('👤 User ID:', req.userId);

    const { contenido, titulo, tipo = 'publicacion' } = req.body;
    const autor = req.userId;
    const imagenes = [];
    const videos = [];

    // Procesar imágenes
    if (req.files && req.files.imagenes) {
      console.log('🖼️ Procesando imágenes...');
      const imagenFiles = Array.isArray(req.files.imagenes) ? req.files.imagenes : [req.files.imagenes];

      for (const file of imagenFiles) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.name)}`;
        const filePath = path.join(__dirname, '../uploads', uniqueName);

        await fs.promises.rename(file.path, filePath);
        imagenes.push(`/uploads/${uniqueName}`);
      }
    }

    // Procesar videos
    if (req.files && req.files.videos) {
      console.log('🎥 Procesando videos...');
      const videoFiles = Array.isArray(req.files.videos) ? req.files.videos : [req.files.videos];

      for (const file of videoFiles) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.name)}`;
        const filePath = path.join(__dirname, '../uploads', uniqueName);

        await fs.promises.rename(file.path, filePath);
        videos.push(`/uploads/${uniqueName}`);
      }
    }

    console.log('💾 Creando publicación en BD...');
    const nuevaPublicacion = new PublicacionesModel({
      autor,
      titulo: tipo === 'evento' ? titulo : undefined,
      contenido,
      imagenes,
      videos
    });

    const publicacionGuardada = await nuevaPublicacion.save();
    console.log('✅ Publicación guardada:', publicacionGuardada._id);

    // Actualizar el usuario
    await UsuariosModel.findByIdAndUpdate(
      autor,
      { $push: { publicaciones: publicacionGuardada._id } }
    );

    await publicacionGuardada.populate('autor', 'primernombreUsuario primerapellidoUsuario fotoPerfil');

    console.log('📤 Enviando respuesta...');
    res.status(201).json({
      success: true,
      message: 'Publicación creada con éxito',
      publicacion: publicacionGuardada
    });

  } catch (error) {
    console.error('❌ Error en crearPublicacion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la publicación',
      error: error.message
    });
  }
},

// Obtener publicaciones del usuario actual
obtenerPublicacionesUsuario = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const publicaciones = await PublicacionesModel.find({ autor: usuarioId })
      .populate('autor', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .populate('comentarios.autor', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .populate('likes', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .sort({ fechaPublicacion: -1 });

    res.json({
      success: true,
      publicaciones: publicaciones
    });
  } catch (error) {
    console.error('Error obteniendo publicaciones del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener publicaciones',
      error: error.message
    });
  }
},

// Obtener todas las publicaciones

obtenerPublicaciones = async (req, res) => {
  try {
    const { page = 1, limit = 10, usuario } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (usuario) {
      query.autor = usuario;
    }

    const publicaciones = await PublicacionesModel.find(query)
      .populate('autor', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .populate('comentarios.autor', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .populate('likes', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .sort({ fechaPublicacion: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PublicacionesModel.countDocuments(query);

    res.json({
      success: true,
      publicaciones: publicaciones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo publicaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener publicaciones',
      error: error.message
    });
  }
},

// Obtener una publicación específica por ID
obtenerPublicacion = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID tenga formato correcto
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de publicación no válido'
      });
    }

    const publicacion = await PublicacionesModel.findById(id)
      .populate('autor', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .populate('comentarios.autor', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .populate('likes', 'primernombreUsuario primerapellidoUsuario fotoPerfil');

    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    res.json({
      success: true,
      publicacion: publicacion
    });
  } catch (error) {
    console.error('Error obteniendo publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la publicación',
      error: error.message
    });
  }
},

// Eliminar una publicación
eliminarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.userId;

    // Validar que el ID tenga formato correcto
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de publicación no válido'
      });
    }

    const publicacion = await PublicacionesModel.findById(id);

    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    // Verificar que el usuario es el autor o es administrador
    const usuario = await UsuariosModel.findById(usuarioId);
    const esAutor = publicacion.autor.toString() === usuarioId;
    const esAdmin = usuario.rolUsuario === 'admin' || usuario.rolUsuario === 'Founder';

    if (!esAutor && !esAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta publicación'
      });
    }

    // Eliminar archivos asociados (imágenes y videos)
    const eliminarArchivos = async (archivos) => {
      for (const archivo of archivos) {
        try {
          const filePath = path.join(__dirname, '..', archivo);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.warn(`Error eliminando archivo ${archivo}:`, error.message);
        }
      }
    };

    await eliminarArchivos(publicacion.imagenes);
    await eliminarArchivos(publicacion.videos);

    // Eliminar la publicación de la base de datos
    await PublicacionesModel.findByIdAndDelete(id);

    // Eliminar referencia en el usuario autor
    await UsuariosModel.findByIdAndUpdate(
      publicacion.autor,
      { $pull: { publicaciones: id } }
    );

    res.json({
      success: true,
      message: 'Publicación eliminada con éxito'
    });
  } catch (error) {
    console.error('Error eliminando publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la publicación',
      error: error.message
    });
  }
},

// Like/Unlike a una publicación
toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.userId;

    const publicacion = await PublicacionesModel.findById(id);

    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    const yaDioLike = publicacion.likes.includes(usuarioId);

    if (yaDioLike) {
      // Quitar like
      publicacion.likes = publicacion.likes.filter(
        like => like.toString() !== usuarioId
      );
    } else {
      // Agregar like
      publicacion.likes.push(usuarioId);
    }

    await publicacion.save();

    // Popular información actualizada
    await publicacion.populate('likes', 'primernombreUsuario primerapellidoUsuario fotoPerfil');

    res.json({
      success: true,
      message: yaDioLike ? 'Like removido' : 'Like agregado',
      publicacion: publicacion
    });
  } catch (error) {
    console.error('Error en toggleLike:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el like',
      error: error.message
    });
  }
},

// Agregar comentario
agregarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.userId;
    const { texto } = req.body;

    if (!texto || !texto.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El comentario no puede estar vacío'
      });
    }

    const publicacion = await PublicacionesModel.findById(id);

    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    // Agregar comentario
    publicacion.comentarios.push({
      autor: usuarioId,
      texto: texto.trim()
    });

    await publicacion.save();

    // Popular información del comentario
    await publicacion.populate('comentarios.autor', 'primernombreUsuario primerapellidoUsuario fotoPerfil');

    res.json({
      success: true,
      message: 'Comentario agregado',
      publicacion: publicacion
    });
  } catch (error) {
    console.error('Error agregando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar comentario',
      error: error.message
    });
  }
},

// Eliminar comentario
eliminarComentario = async (req, res) => {
  try {
    const { id, comentarioId } = req.params;
    const usuarioId = req.userId;

    const publicacion = await PublicacionesModel.findById(id);

    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    const comentario = publicacion.comentarios.id(comentarioId);

    if (!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    // Verificar permisos (solo el autor del comentario o admin puede eliminarlo)
    const usuario = await UsuariosModel.findById(usuarioId);
    const esAutorComentario = comentario.autor.toString() === usuarioId;
    const esAdmin = usuario.rolUsuario === 'admin' || usuario.rolUsuario === 'Founder';

    if (!esAutorComentario && !esAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este comentario'
      });
    }

    // Eliminar comentario
    publicacion.comentarios.pull(comentarioId);
    await publicacion.save();

    res.json({
      success: true,
      message: 'Comentario eliminado',
      publicacion: publicacion
    });
  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar comentario',
      error: error.message
    });
  }
}

module.exports = {
  crearPublicacion,
  obtenerPublicacionesUsuario,
  obtenerPublicaciones,
  obtenerPublicacion,
  eliminarPublicacion,
  toggleLike,
  agregarComentario,
  eliminarComentario
};