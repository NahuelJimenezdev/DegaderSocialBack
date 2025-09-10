/**
 * Middleware de autorización por rol/jerarquía/permisos para FHS&L
 *
 * ✅ Soporta:
 *  - roles permitidos (array o dentro de options)
 *  - mínimo rango jerárquico (minRole)
 *  - permisos booleanos del usuario (anyPerms / allPerms) en estructuraOrganizacional.permisos
 *  - permitir si es pastor verificado (orPastorVerificado)
 *  - requerir usuario activo (requireActive=true por defecto)
 *  - restricción opcional por misma iglesia (sameIglesiaParam / sameIglesiaBody)
 *  - función custom para chequeos adicionales (custom(req, user) => boolean|Promise<boolean>)
 *
 * 🔧 Ejemplos:
 *  router.post('/iglesias/crear',
 *    auth,
 *    verificarPermiso({ minRole:'Director Municipal', orPastorVerificado:true }),
 *    crearIglesiaController
 *  );
 *
 *  router.patch('/pastores/solicitudes/:id',
 *    auth,
 *    verificarPermiso({ roles:['Founder','admin','Director Nacional','RRHH','Control Interno'] }),
 *    resolverSolicitudPastorCtrl
 *  );
 *
 *  router.get('/admin/reports',
 *    auth,
 *    verificarPermiso({ anyPerms:['accederReportes'] }),
 *    reportsController
 *  );
 */

function stripAccents(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function norm(s = '') {
  return stripAccents(String(s).toLowerCase().trim().replace(/\s+/g, ' '));
}

// 🎭 Mapeo de alias/sinónimos a la forma canónica
const ROLE_ALIASES = new Map([
  // Altos
  [norm('founder'), 'Founder'],
  [norm('admin'), 'admin'],
  [norm('desarrollador'), 'Desarrollador'],

  // Direcciones genéricas
  [norm('director'), 'Director'],
  [norm('subdirector'), 'Subdirector'],
  [norm('encargado'), 'Encargado'],
  [norm('profesional'), 'Profesional'],
  [norm('miembro'), 'Miembro'],
  [norm('visitante'), 'visitante'],

  // Jerárquicos por nivel
  [norm('director nacional'), 'Director Nacional'],
  [norm('director regional'), 'Director Regional'],
  [norm('director municipal'), 'Director Municipal'],
  [norm('organizador barrio'), 'Organizador Barrio'],

  // Órganos de control / RRHH (aunque no estén en el enum, los admitimos como etiquetas lógicas)
  [norm('control interno'), 'Control Interno'],
  [norm('rrhh'), 'RRHH'],
  [norm('recursos humanos'), 'RRHH'],
]);

// 🧭 Ranking jerárquico (mayor número = mayor poder)
const ROLE_RANK = new Map([
  ['visitante', 0],
  ['Miembro', 1],
  ['Profesional', 2],
  ['Encargado', 3],
  ['Subdirector', 4],
  ['Director', 5],
  ['Organizador Barrio', 6],
  ['Director Municipal', 7],
  ['Director Regional', 8],
  ['Director Nacional', 9],
  ['Desarrollador', 10],
  ['admin', 11],
  ['Founder', 12],
  // Roles "técnicos" especiales (no jerárquicos directos, asignamos alto para autorización específica)
  ['RRHH', 9],            // similar a Dir. Nacional para aprobar
  ['Control Interno', 9], // similar a Dir. Nacional para auditar
]);

function canonicalRole(inputRole = '') {
  const n = norm(inputRole);
  // buscar directo en aliases
  if (ROLE_ALIASES.has(n)) return ROLE_ALIASES.get(n);
  // si no está, intentamos capitalizar según conocemos (fallback conservador)
  const guess = inputRole && inputRole.trim();
  return guess || 'visitante';
}

function getRank(role = '') {
  const can = canonicalRole(role);
  if (ROLE_RANK.has(can)) return ROLE_RANK.get(can);
  // Si no está mapeado, lo tratamos como 1 (Miembro) para no abrir puertas de más
  return 1;
}

function hasAllowedRole(userRole, allowedRoles = []) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return false;
  const userCan = canonicalRole(userRole);
  const allowedCans = allowedRoles.map(canonicalRole);
  return allowedCans.includes(userCan);
}

function hasMinRank(userRole, minRole) {
  if (!minRole) return false;
  return getRank(userRole) >= getRank(minRole);
}

function readPerms(user) {
  return (user?.estructuraOrganizacional?.permisos) || {};
}

function hasAnyPerm(user, keys = []) {
  if (!Array.isArray(keys) || keys.length === 0) return false;
  const perms = readPerms(user);
  return keys.some(k => !!perms[k]);
}

function hasAllPerm(user, keys = []) {
  if (!Array.isArray(keys) || keys.length === 0) return false;
  const perms = readPerms(user);
  return keys.every(k => !!perms[k]);
}

/**
 * @param {Array<string>|Object} allowedOrOptions - Array de roles permitidos o un objeto de opciones
 * @param {Object} [maybeOptions] - Opciones si el primer parámetro fue array
 * Options:
 *  - roles: string[]
 *  - minRole: string
 *  - anyPerms: string[]
 *  - allPerms: string[]
 *  - orPastorVerificado: boolean (si true, deja pasar si user.pastorVerificado)
 *  - requireActive: boolean (default true)
 *  - sameIglesiaParam: string (ej. 'iglesiaId' en req.params o req.query)
 *  - sameIglesiaBody: string  (ej. 'iglesia' en req.body)
 *  - custom: (req, user) => boolean | Promise<boolean>
 */
function verificarPermiso(allowedOrOptions = [], maybeOptions = {}) {
  const isArrayInput = Array.isArray(allowedOrOptions);
  const options = isArrayInput
    ? { roles: allowedOrOptions, ...maybeOptions }
    : { ...allowedOrOptions };

  const {
    roles = [],
    minRole,
    anyPerms = [],
    allPerms = [],
    orPastorVerificado = false,
    requireActive = true,
    sameIglesiaParam,      // nombre del campo a leer de params/query para comparar con user.iglesia
    sameIglesiaBody,       // nombre del campo a leer de body para comparar con user.iglesia
    custom,                // función extra de validación
  } = options;

  // Normalizamos arrays a copias
  const ALLOWED_ROLES = Array.isArray(roles) ? roles.slice() : [];

  return async function verificarPermisoMiddleware(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
      }

      if (requireActive && user.estadoUsuario && user.estadoUsuario !== 'activo') {
        return res.status(403).json({ success: false, message: 'Usuario inactivo' });
      }

      // 1) Si se permite por verificación pastoral
      if (orPastorVerificado && user.pastorVerificado) {
        return next();
      }

      // 2) Roles explícitos
      if (ALLOWED_ROLES.length > 0 && hasAllowedRole(user.rolUsuario, ALLOWED_ROLES)) {
        // opcional chequeo de misma iglesia
        if (!checkSameIglesia(req, user, sameIglesiaParam, sameIglesiaBody)) {
          return res.status(403).json({ success: false, message: 'Acción restringida a la misma iglesia' });
        }
        // custom
        if (custom) {
          const ok = await Promise.resolve(custom(req, user));
          if (!ok) {
            return res.status(403).json({ success: false, message: 'No autorizado (custom rule)' });
          }
        }
        return next();
      }

      // 3) Mínimo rango jerárquico
      if (minRole && hasMinRank(user.rolUsuario, minRole)) {
        if (!checkSameIglesia(req, user, sameIglesiaParam, sameIglesiaBody)) {
          return res.status(403).json({ success: false, message: 'Acción restringida a la misma iglesia' });
        }
        if (custom) {
          const ok = await Promise.resolve(custom(req, user));
          if (!ok) {
            return res.status(403).json({ success: false, message: 'No autorizado (custom rule)' });
          }
        }
        return next();
      }

      // 4) Permisos booleanos (any / all)
      if (anyPerms.length > 0 && hasAnyPerm(user, anyPerms)) {
        if (!checkSameIglesia(req, user, sameIglesiaParam, sameIglesiaBody)) {
          return res.status(403).json({ success: false, message: 'Acción restringida a la misma iglesia' });
        }
        if (custom) {
          const ok = await Promise.resolve(custom(req, user));
          if (!ok) {
            return res.status(403).json({ success: false, message: 'No autorizado (custom rule)' });
          }
        }
        return next();
      }

      if (allPerms.length > 0 && hasAllPerm(user, allPerms)) {
        if (!checkSameIglesia(req, user, sameIglesiaParam, sameIglesiaBody)) {
          return res.status(403).json({ success: false, message: 'Acción restringida a la misma iglesia' });
        }
        if (custom) {
          const ok = await Promise.resolve(custom(req, user));
          if (!ok) {
            return res.status(403).json({ success: false, message: 'No autorizado (custom rule)' });
          }
        }
        return next();
      }

      // 5) Si no se configuró nada o no pasó ningún check => denegar
      return res.status(403).json({
        success: false,
        message: 'No autorizado',
        needed: {
          roles: ALLOWED_ROLES,
          minRole: minRole || null,
          anyPerms,
          allPerms,
          orPastorVerificado
        },
        currentUser: {
          rolUsuario: user.rolUsuario,
          pastorVerificado: !!user.pastorVerificado,
          estadoUsuario: user.estadoUsuario
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || 'Error en verificación de permisos' });
    }
  };
}

function checkSameIglesia(req, user, sameIglesiaParam, sameIglesiaBody) {
  // Si no se pide restringir por iglesia, pasa
  if (!sameIglesiaParam && !sameIglesiaBody) return true;

  const userIglesia = String(user.iglesia || '');
  if (!userIglesia) return false;

  // Buscar en params y query
  if (sameIglesiaParam) {
    const paramVal = req.params?.[sameIglesiaParam] || req.query?.[sameIglesiaParam];
    if (paramVal && String(paramVal) !== userIglesia) return false;
  }

  // Buscar en body
  if (sameIglesiaBody) {
    const bodyVal = req.body?.[sameIglesiaBody];
    if (bodyVal && String(bodyVal) !== userIglesia) return false;
  }

  return true;
}

module.exports = verificarPermiso;

// (Opcional) Exponer helpers si te resultan útiles en otros archivos
module.exports._helpers = {
  canonicalRole,
  getRank,
  hasAllowedRole,
  hasMinRank,
  hasAnyPerm,
  hasAllPerm,
  ROLE_ALIASES,
  ROLE_RANK
};
