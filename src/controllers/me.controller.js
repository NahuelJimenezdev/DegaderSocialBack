// src/controllers/me.controller.js
const Usuario = require('../model/usuarios.model');
const { pick } = require('../utils/pick');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const mongoose = require('mongoose');

// ------- helpers -------
function getReqUserId(req) {
  return (
    req.user?.id ||
    req.userNorm?.id ||
    req.idUsuarios ||
    req.user?._id ||
    req.user?.idUsuario ||
    null
  );
}
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

// ------- Schemas -------
const patchMeSchema = z.object({
  primernombreUsuario: z.string().min(2).max(50).optional(),
  primerapellidoUsuario: z.string().min(2).max(50).optional(),
  biografia: z.string().max(1000).optional().or(z.literal('')),
  ciudadUsuario: z.string().max(60).optional().or(z.literal('')),
  paisUsuario: z.string().max(60).optional().or(z.literal('')),
  direccionUsuario: z.string().min(5).max(120).optional().or(z.literal('')),
  preferencias: z.object({
    showEmail: z.boolean().optional(),
    showLocation: z.boolean().optional(),
  }).partial().optional(),
  version: z.number().int().nonnegative().optional()
});

exports.getMe = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    if (!userId) return res.status(401).json({ msg: 'Token inválido (sin id)' });
    if (!isValidObjectId(userId)) return res.status(400).json({ msg: 'ID inválido' });

    const user = await Usuario.findById(userId).lean();
    if (!user) return res.status(404).json({ msg: 'No encontrado' });

    const etag = `"${user.version || 0}"`;
    res.set('ETag', etag);
    return res.json({ usuario: user, etag });
  } catch (e) {
    console.error('getMe error:', e);
    return res.status(500).json({ msg: 'Error', detail: e.message });
  }
};

exports.patchMe = async (req, res) => {
  try {
    const parsed = patchMeSchema.parse(req.body || {});

    // Campos permitidos
    const allowed = [
      'primernombreUsuario', 'primerapellidoUsuario', 'biografia',
      'ciudadUsuario', 'paisUsuario', 'direccionUsuario', 'preferencias'
    ];
    const toUpdate = pick(parsed, allowed);

    // trim strings
    for (const k of Object.keys(toUpdate)) {
      if (typeof toUpdate[k] === 'string') toUpdate[k] = toUpdate[k].trim();
    }

    const userId = getReqUserId(req);
    if (!userId) return res.status(401).json({ msg: 'Token inválido (sin id)' });
    if (!isValidObjectId(userId)) return res.status(400).json({ msg: 'ID inválido' });

    const current = await Usuario.findById(userId);
    if (!current) return res.status(404).json({ msg: 'No encontrado' });

    // Concurrencia
    if (parsed.version != null && (current.version || 0) !== parsed.version) {
      return res.status(409).json({ msg: 'Conflicto: el perfil cambió, recarga' });
    }

    // Merge fino de preferencias
    if (toUpdate.preferencias) {
      current.preferencias = { ...(current.preferencias || {}), ...toUpdate.preferencias };
      delete toUpdate.preferencias;
    }

    Object.assign(current, toUpdate);
    current.version = (current.version || 0) + 1;
    await current.save();

    const etag = `"${current.version}"`;
    res.set('ETag', etag);
    return res.json({ usuario: current, etag });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ msg: 'Validación', errors: e.issues });
    }
    console.error('patchMe error:', e);
    return res.status(500).json({ msg: 'Error', detail: e.message });
  }
};

// CORREGIR la función uploadAvatar - DEBE ser así:
// Elimina el procesamiento con Sharp temporalmente y usa solo Multer
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'Archivo requerido' });

    const userId = getReqUserId(req);
    if (!userId) return res.status(401).json({ msg: 'Token inválido' });

    // ✅ NOMBRE CONSISTENTE (sin timestamp)
    const ext = path.extname(req.file.filename);
    const newFileName = `avatar_${userId}${ext}`;
    const newFilePath = path.join(req.file.destination, newFileName);

    fs.renameSync(req.file.path, newFilePath);
    fs.chmodSync(newFilePath, 0o644);
    // ✅ VERIFICA que el archivo esté completamente escrito
    const fileStats = fs.statSync(newFilePath);
    console.log('✅ Archivo guardado:', {
      size: fileStats.size,
      permissions: fileStats.mode.toString(8),
      path: newFilePath
    });
    // Actualizar BD
    const user = await Usuario.findById(userId);
    if (user.fotoPerfil) {
      // Eliminar avatar anterior SOLO si es diferente
      const oldPath = path.join(process.cwd(), user.fotoPerfil);
      if (fs.existsSync(oldPath) && oldPath !== newFilePath) {
        fs.unlinkSync(oldPath);
      }
    }

    user.fotoPerfil = `/uploads/avatars/${newFileName}`;
    await user.save();

    return res.json({ usuario: user, msg: 'Avatar actualizado' });
  } catch (e) {
    console.error('Error uploadAvatar:', e);
    return res.status(500).json({ msg: 'Error subiendo avatar' });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    if (!userId) return res.status(401).json({ msg: 'Token inválido (sin id)' });
    if (!isValidObjectId(userId)) return res.status(400).json({ msg: 'ID inválido' });

    const user = await Usuario.findById(userId);
    if (!user) return res.status(404).json({ msg: 'No encontrado' });

    if (user.fotoPerfil && user.fotoPerfil.startsWith('/uploads/avatars/')) {
      const prevPath = path.join(process.cwd(), user.fotoPerfil);
      try {
        if (fs.existsSync(prevPath)) {
          fs.unlinkSync(prevPath);
          console.log('✅ Avatar eliminado del sistema de archivos');
        }
      } catch (err) {
        console.log('⚠️ No se pudo eliminar archivo físico:', err.message);
      }
    }
    user.fotoPerfil = '';
    user.version = (user.version || 0) + 1;
    await user.save();

    return res.json({ usuario: user, msg: 'Avatar eliminado' });
  } catch (e) {
    console.error('deleteAvatar error:', e);
    return res.status(500).json({ msg: 'Error eliminando avatar', detail: e.message });
  }
};

exports.changeEmailInit = (req, res) => res.status(501).json({ msg: 'changeEmailInit no implementado aún' });
exports.changePassword = (req, res) => res.status(501).json({ msg: 'changePassword no implementado aún' }); 
exports.avatarUploadMiddleware = require('../middlewares/upload').avatarUpload;// Al final de me.controller.js
