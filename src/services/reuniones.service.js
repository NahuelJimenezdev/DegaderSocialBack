// src/services/reuniones.service.js
const IglesiasModel = require('../models/iglesias.model');
const UsuariosModel = require('../models/usuarios.model');

/**
 * Crea reunión dentro de una iglesia.
 * - Solo miembros de la iglesia pueden crear
 * - Visibilidad recibe array de strings (ministerios o roles de fundación)
 */
async function crearReunionService({ creadorId, iglesiaId, titulo, descripcion, fecha, visibilidad }) {
  const iglesia = await IglesiasModel.findById(iglesiaId);
  if (!iglesia) {
    const err = new Error('Iglesia no encontrada');
    err.statusCode = 404;
    throw err;
  }

  // Validar que el creador sea miembro de la iglesia
  const esMiembro = (iglesia.miembros || []).some(u => String(u) === String(creadorId)) ||
    String(iglesia.pastorPrincipal) === String(creadorId) ||
    (iglesia.equipoAdministrativo || []).some(u => String(u) === String(creadorId));
  if (!esMiembro) {
    const err = new Error('Solo miembros de la iglesia pueden crear reuniones');
    err.statusCode = 403;
    throw err;
  }

  const nueva = {
    titulo,
    descripcion,
    inicio: new Date(fecha),
    visibilidad: {
      alcance: 'iglesia',
      // separa por convención: los que macheen con nombres de ministerios y los que parezcan roles
      ministeriosDestino: [],
      rolesFundacionDestino: []
    }
  };

  // Derivar destino por nombres (opcional): si existen ministerios con slug/nombre
  if (Array.isArray(visibilidad) && visibilidad.length) {
    // mapear a roles o ministerios por nombre o alias
    const ministerios = iglesia.ministerios || [];
    const porNombre = new Map(
      ministerios.map(m => [(m.slug || m.alias || m.nombre || '').toLowerCase(), m._id])
    );

    visibilidad.forEach(v => {
      const key = String(v || '').trim().toLowerCase();
      if (porNombre.has(key)) {
        nueva.visibilidad.ministeriosDestino.push(porNombre.get(key));
      } else {
        // si no coincide con ministerio, lo tratamos como rol de fundación
        nueva.visibilidad.rolesFundacionDestino.push(v);
      }
    });
  }

  iglesia.reuniones = iglesia.reuniones || [];
  iglesia.reuniones.push(nueva);
  await iglesia.save();

  return iglesia.reuniones[iglesia.reuniones.length - 1];
}

module.exports = {
  crearReunionService
};
