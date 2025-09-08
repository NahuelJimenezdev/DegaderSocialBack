const EventosModel = require('../models/eventos.model.js');
const UsuariosModel = require('../models/usuarios.model.js');

// Crear un nuevo evento
const crearEvento = async (req, res) => {
  try {
    console.log('🎉 Llegó solicitud para crear evento');
    console.log('📦 Body:', req.body);
    console.log('📁 Files:', req.files);
    console.log('👤 User ID:', req.userId);

    const {
      nombre,
      descripcion,
      fechaInicio,
      horaInicio,
      fechaFin,
      horaFin,
      zonaHoraria,
      tipoModalidad,
      ubicacion,
      linkVirtual,
      categoria,
      capacidadMaxima,
      esPrivado,
      requiereAprobacion,
      tienePortada,
      configuracionPrivacidad
    } = req.body;

    const organizador = req.userId;
    let imagenPortada = null;
    const imagenes = [];

    // Procesar imagen de portada si se subió
    if (req.files && req.files.imagenPortada) {
      const file = Array.isArray(req.files.imagenPortada)
        ? req.files.imagenPortada[0]
        : req.files.imagenPortada;

      imagenPortada = `/uploads/${file.filename}`;
      console.log('🖼️ [Backend] Imagen portada guardada:', imagenPortada);
    }

    // Procesar imágenes adicionales si se subieron
    if (req.files && req.files.imagenes) {
      const imagenesFiles = Array.isArray(req.files.imagenes)
        ? req.files.imagenes
        : [req.files.imagenes];

      for (const file of imagenesFiles) {
        const imageUrl = `/uploads/${file.filename}`;
        imagenes.push(imageUrl);
        console.log('📷 [Backend] Imagen adicional guardada:', imageUrl);
      }
    }

    // Crear el evento
    const nuevoEvento = new EventosModel({
      organizador,
      nombre,
      descripcion,
      fechaInicio: new Date(fechaInicio),
      horaInicio,
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      horaFin,
      zonaHoraria: zonaHoraria || 'America/Argentina/Buenos_Aires',
      tipoModalidad,
      ubicacion: ubicacion ? JSON.parse(ubicacion) : undefined,
      linkVirtual,
      imagenPortada,
      imagenes,
      tienePortada: tienePortada === 'true',
      categoria: categoria || 'otro',
      capacidadMaxima: capacidadMaxima ? parseInt(capacidadMaxima) : undefined,
      esPrivado: esPrivado === 'true',
      requiereAprobacion: requiereAprobacion === 'true',
      configuracionPrivacidad: configuracionPrivacidad ? JSON.parse(configuracionPrivacidad) : {
        tipoPrivacidad: 'publico',
        visibilidad: 'publico',
        aprobacion: { requerida: false },
        registros: { permitirAutoRegistro: true },
        listaEspera: { activa: false }
      },
      estado: 'publicado'
    });

    const eventoGuardado = await nuevoEvento.save();

    console.log('✅ Evento creado exitosamente:', eventoGuardado._id);

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      evento: eventoGuardado
    });

  } catch (error) {
    console.error('❌ Error al crear evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener eventos del usuario
const obtenerEventosUsuario = async (req, res) => {
  try {
    console.log('🔍 [obtenerEventosUsuario] Iniciando...');
    console.log('👤 User ID:', req.userId);
    console.log('📝 User:', req.user);

    const userId = req.userId;

    if (!userId) {
      console.log('❌ No se encontró userId en la request');
      return res.status(400).json({
        success: false,
        message: 'ID de usuario no válido'
      });
    }

    console.log('🔍 Buscando eventos para el usuario:', userId);

    const eventos = await EventosModel.find({
      $or: [
        { organizador: userId },
        { 'coOrganizadores.usuario': userId },
        { 'asistentes.usuario': userId }
      ]
    })
      .populate('organizador', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .sort({ fechaCreacion: -1 });

    console.log('✅ Eventos encontrados:', eventos.length);

    res.status(200).json({
      success: true,
      eventos
    });

  } catch (error) {
    console.error('❌ Error al obtener eventos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los eventos públicos
const obtenerEventosPublicos = async (req, res) => {
  try {
    const { categoria, fechaDesde, fechaHasta, ubicacion, limite = 20, pagina = 1 } = req.query;

    let filtros = {
      esPrivado: false,
      estado: 'publicado',
      fechaInicio: { $gte: new Date() } // Solo eventos futuros
    };

    // Filtros opcionales
    if (categoria && categoria !== 'todos') {
      filtros.categoria = categoria;
    }

    if (fechaDesde) {
      filtros.fechaInicio = { ...filtros.fechaInicio, $gte: new Date(fechaDesde) };
    }

    if (fechaHasta) {
      filtros.fechaInicio = { ...filtros.fechaInicio, $lte: new Date(fechaHasta) };
    }

    if (ubicacion) {
      filtros['ubicacion.ciudad'] = new RegExp(ubicacion, 'i');
    }

    const eventos = await EventosModel.find(filtros)
      .populate('organizador', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .sort({ fechaInicio: 1 })
      .limit(parseInt(limite))
      .skip((parseInt(pagina) - 1) * parseInt(limite));

    const total = await EventosModel.countDocuments(filtros);

    res.status(200).json({
      success: true,
      eventos,
      paginacion: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / parseInt(limite))
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener eventos públicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener detalles de un evento específico
const obtenerEventoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await EventosModel.findById(id)
      .populate('organizador', 'primernombreUsuario primerapellidoUsuario fotoPerfil correoUsuario')
      .populate('coOrganizadores.usuario', 'primernombreUsuario primerapellidoUsuario fotoPerfil')
      .populate('asistentes.usuario', 'primernombreUsuario primerapellidoUsuario fotoPerfil');

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Incrementar contador de vistas
    evento.metricas.vistas += 1;
    await evento.save();

    res.status(200).json({
      success: true,
      evento
    });

  } catch (error) {
    console.error('❌ Error al obtener evento por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Registrarse para un evento
const registrarseEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const evento = await EventosModel.findById(id);

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Verificar si ya está registrado
    const yaRegistrado = evento.asistentes.some(
      asistente => asistente.usuario.toString() === userId
    );

    if (yaRegistrado) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás registrado en este evento'
      });
    }

    // Verificar capacidad
    if (evento.capacidadMaxima && evento.asistentesConfirmados >= evento.capacidadMaxima) {
      // Agregar a lista de espera
      evento.asistentes.push({
        usuario: userId,
        estadoAsistencia: 'en_lista_espera'
      });
    } else {
      // Registro directo
      const estadoInicial = evento.requiereAprobacion ? 'pendiente' : 'confirmado';
      evento.asistentes.push({
        usuario: userId,
        estadoAsistencia: estadoInicial
      });
    }

    await evento.save();

    res.status(200).json({
      success: true,
      message: 'Registro exitoso',
      evento
    });

  } catch (error) {
    console.error('❌ Error al registrarse en evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cancelar registro en evento
const cancelarRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const evento = await EventosModel.findById(id);

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Remover de asistentes
    evento.asistentes = evento.asistentes.filter(
      asistente => asistente.usuario.toString() !== userId
    );

    await evento.save();

    res.status(200).json({
      success: true,
      message: 'Registro cancelado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al cancelar registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearEvento,
  obtenerEventosUsuario,
  obtenerEventosPublicos,
  obtenerEventoPorId,
  registrarseEvento,
  cancelarRegistro
};
