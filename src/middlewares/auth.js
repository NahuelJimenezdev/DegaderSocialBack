const jwt = require('jsonwebtoken');

// ======== MIDDLEWARE CON ROLES ========
const authRole = (rolRuta) => (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  try {
    // 1) Obtener token desde "auth" o "Authorization: Bearer <token>"
    let token = req.header("auth");
    if (!token) {
      const hdr = req.headers.authorization || '';
      const parts = hdr.split(' ');
      if (parts[0]?.toLowerCase() === 'bearer' && parts[1]) token = parts[1];
      else if (parts[0] && !parts[1]) token = parts[0];
    }
    if (!token) return res.status(401).json("Token de autenticación requerido");

    // 2) Verificar JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Normalizar rol e id
    const rolUsuarioToken = (payload.rolUsuario || payload.role || 'visitante').toString().toLowerCase();
    const normId = payload.idUsuario || payload.id || payload._id || payload.userId || null;
    if (!normId) return res.status(401).json("Token inválido (sin id de usuario)");

    // 4) Setear info útil en req
    req.user = payload;                 // payload completo
    req.userId = normId;                // 🔴 NECESARIO para tus controladores
    req.user.id = req.user.id || normId;
    req.user.rol = rolUsuarioToken;
    req.user.email = payload.email || payload.correoUsuario || '';
    req.userNorm = { id: normId, rol: rolUsuarioToken, email: req.user.email };

    // 5) Autorización por rol (si se pasó alguno)
    const rolesPermitidos = Array.isArray(rolRuta) ? rolRuta : (rolRuta ? [rolRuta] : []);
    const rolesPermitidosLower = rolesPermitidos.map(r => (r ?? '').toString().toLowerCase());
    if (rolesPermitidosLower.length > 0 && !rolesPermitidosLower.includes(rolUsuarioToken)) {
      return res
        .status(403)
        .json("No tienes autorización para acceder a esta información. Tu rol actual es: " + (payload.rolUsuario || ''));
    }

    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(401).json("Token inválido");
    if (error.name === 'TokenExpiredError') return res.status(401).json("Token expirado");
    return res.status(500).json("Error en la autenticación");
  }
};

// ======== MIDDLEWARE SIN ROLES ========
function auth(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  try {
    let token = req.header("auth");
    if (!token) {
      const hdr = req.headers.authorization || '';
      const parts = hdr.split(' ');
      if (parts[0]?.toLowerCase() === 'bearer' && parts[1]) token = parts[1];
      else if (parts[0] && !parts[1]) token = parts[0];
    }
    if (!token) return res.status(401).json({ msg: 'Token requerido' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const rolUsuarioToken = (payload.rolUsuario || payload.role || 'visitante').toString().toLowerCase();
    const normId = payload.idUsuario || payload.id || payload._id || payload.userId || null;
    if (!normId) return res.status(401).json({ msg: 'Token inválido (sin id)' });

    req.user = payload;
    req.userId = normId;                // 🔴 NECESARIO
    req.user.id = req.user.id || normId;
    req.user.rol = rolUsuarioToken;
    req.user.email = payload.email || payload.correoUsuario || '';
    req.userNorm = { id: normId, rol: rolUsuarioToken, email: req.user.email };

    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ msg: 'Token inválido' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ msg: 'Token expirado' });
    return res.status(500).json({ msg: 'Error en la autenticación' });
  }
}

module.exports = authRole;
module.exports.auth = auth;
module.exports.verificarToken = auth;
