// src/services/iglesias.service.js
const crypto = require('crypto');
const IglesiasModel = require('../models/iglesias.model'); // tu modelo existente
const UsuariosModel = require('../models/usuarios.model'); // '../models/usuarios.model.js'

/**
 * Genera un código de acceso único (8-10 chars alfanuméricos).
 */
function generarCodigoAcceso() {
  return crypto.randomBytes(6).toString('base64url').slice(0, 10);
}

/**
 * Crea una iglesia (solo roles director o superior).
 * - Genera codigoUnion único (alias codigoAcceso)
 * - Setea pastorPrincipal = ministroResponsable
 */
async function crearIglesiaService({ nombreIglesia, ubicacion, ministroResponsable, creadorId }) {
  // validar que el ministro exista
  const ministro = await UsuariosModel.findById(ministroResponsable);
  if (!ministro) {
    const err = new Error('Ministro responsable no encontrado');
    err.statusCode = 400;
    throw err;
  }

  // generar código único y validar unicidad
  let codigoUnion;
  let intentos = 0;
  do {
    if (intentos++ > 5) {
      const e = new Error('No se pudo generar un código único, reintente');
      e.statusCode = 500;
      throw e;
    }
    codigoUnion = generarCodigoAcceso();
  } while (await IglesiasModel.exists({ codigoUnion }));

  const iglesia = await IglesiasModel.create({
    nombreIglesia,
    ubicacion,
    pastorPrincipal: ministroResponsable,
    codigoUnion,
    permiteUnirsePorCodigo: true,
    requiereAprobacion: true,
    creadoPor: creadorId
  });

  return iglesia;
}

/**
 * Unirse a una iglesia por código.
 * - Valida usuario activo
 * - Si requiere aprobación: crea solicitudPendiente
 * - Notifica al ministro (pastorPrincipal)
 */
async function unirseIglesiaPorCodigoService({ userId, codigoAcceso }) {
  const usuario = await UsuariosModel.findById(userId);
  if (!usuario) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }
  if (usuario.estadoUsuario !== 'activo') {
    const err = new Error('Usuario inactivo. No puede unirse.');
    err.statusCode = 403;
    throw err;
  }

  const iglesia = await IglesiasModel.findOne({ codigoUnion: codigoAcceso });
  if (!iglesia) {
    const err = new Error('Código de acceso inválido');
    err.statusCode = 400;
    throw err;
  }

  // Si ya pertenece
  if (String(usuario.iglesia || '') === String(iglesia._id)) {
    return { iglesia, estado: 'ya_miembro' };
  }

  // Requiere aprobación => push a solicitudes
  if (iglesia.requiereAprobacion) {
    // evitar duplicar solicitud
    const yaSolicitada = (iglesia.solicitudesPendientes || [])
      .some(s => String(s.usuario) === String(userId));
    if (!yaSolicitada) {
      iglesia.solicitudesPendientes.push({
        usuario: userId,
        mensaje: 'Solicitud de unión por código'
      });
    }

    // notificar a pastorPrincipal
    iglesia.notificaciones.push({
      mensaje: `Nueva solicitud de unión de ${usuario.primernombreUsuario || 'usuario'}`
    });

    await iglesia.save();

    // notificación simple al usuario
    usuario.notificaciones.push({
      mensaje: `Tu solicitud para unirte a ${iglesia.nombreIglesia} fue enviada.`
    });
    await usuario.save();

    return { iglesia, estado: 'solicitud_enviada' };
  }

  // Si NO requiere aprobación: unir directamente
  iglesia.miembros = iglesia.miembros || [];
  if (!iglesia.miembros.some(id => String(id) === String(userId))) {
    iglesia.miembros.push(userId);
  }
  await iglesia.save();

  usuario.iglesia = iglesia._id;
  await usuario.save();

  return { iglesia, estado: 'unido' };
}

/**
 * Aprobar/Rechazar una solicitud.
 * - Solo el pastorPrincipal (ministro) puede aprobar/rechazar.
 */
async function resolverSolicitudUnionService({ iglesiaId, idSolicitud, accion, comentario, aprobadorId }) {
  const iglesia = await IglesiasModel.findById(iglesiaId);
  if (!iglesia) {
    const err = new Error('Iglesia no encontrada');
    err.statusCode = 404;
    throw err;
  }

  // verificar que aprobador es pastorPrincipal
  if (String(iglesia.pastorPrincipal) !== String(aprobadorId)) {
    const err = new Error('No autorizado para aprobar/rechazar solicitudes');
    err.statusCode = 403;
    throw err;
  }

  const solicitud = (iglesia.solicitudesPendientes || []).id(idSolicitud);
  if (!solicitud) {
    const err = new Error('Solicitud no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const usuario = await UsuariosModel.findById(solicitud.usuario);
  if (!usuario) {
    const err = new Error('Usuario de la solicitud no existe');
    err.statusCode = 404;
    throw err;
  }

  if (accion === 'aprobar') {
    // añadir a miembros y setear iglesia en usuario
    iglesia.miembros = iglesia.miembros || [];
    if (!iglesia.miembros.some(id => String(id) === String(usuario._id))) {
      iglesia.miembros.push(usuario._id);
    }
    usuario.iglesia = iglesia._id;

    // notificación
    usuario.notificaciones.push({
      mensaje: `Tu solicitud para unirte a ${iglesia.nombreIglesia} fue aprobada. ${comentario ? 'Comentario: ' + comentario : ''}`
    });
  } else if (accion === 'rechazar') {
    usuario.notificaciones.push({
      mensaje: `Tu solicitud para unirte a ${iglesia.nombreIglesia} fue rechazada. ${comentario ? 'Comentario: ' + comentario : ''}`
    });
  } else {
    const err = new Error('Acción inválida (use "aprobar" o "rechazar")');
    err.statusCode = 400;
    throw err;
  }

  // remover solicitud
  solicitud.deleteOne();
  await iglesia.save();
  await usuario.save();

  return { iglesia, usuario, accion };
}

module.exports = {
  crearIglesiaService,
  unirseIglesiaPorCodigoService,
  resolverSolicitudUnionService
};
