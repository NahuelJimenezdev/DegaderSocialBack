// src/services/feed.service.js
const PublicacionesModel = require('../models/publicaciones.model'); // asume existente
const IglesiasModel = require('../models/iglesias.model');

/**
 * Feed filtrado por iglesia / ministerio / rolFundacion (con paginación)
 */
async function feedIglesiaService({ user, iglesiaId, ministerio, rolFundacion, limit = 10, offset = 0 }) {
  // determinar iglesia relevante
  const iglesiaFiltroId = iglesiaId || user.iglesia;

  // base query
  const query = {};

  if (iglesiaFiltroId) {
    query.iglesia = iglesiaFiltroId; // asume publicaciones tienen campo iglesia: ObjectId
  } else {
    // si no hay iglesia, devolver vacío o global
    query.iglesia = null; // o quitar esta línea si permites publicaciones sin iglesia
  }

  // filtros adicionales
  if (ministerio) {
    // asume publicaciones guardan ministerioDestino: ObjectId (de subdoc)
    query.$or = query.$or || [];
    query.$or.push({ ministerioDestinoSlug: new RegExp(`^${ministerio}$`, 'i') });
  }

  if (rolFundacion) {
    // asume publicaciones guardan rolesFundacionDestino: [string]
    query.$or = query.$or || [];
    query.$or.push({ rolesFundacionDestino: { $in: [rolFundacion] } });
  }

  const cursor = PublicacionesModel
    .find(query)
    .sort({ createdAt: -1 })
    .skip(Number(offset))
    .limit(Math.min(Number(limit), 50));

  const [items, total] = await Promise.all([
    cursor.exec(),
    PublicacionesModel.countDocuments(query)
  ]);

  return { items, total, limit: Number(limit), offset: Number(offset) };
}

module.exports = {
  feedIglesiaService
};
