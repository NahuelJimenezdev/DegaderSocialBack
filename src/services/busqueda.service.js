// src/services/buscar.service.js
const UserModel = require('../models/usuarios.model');

const buscarEnBaseDeDatos = async (termino, usuarioId, soloAmigos = false) => {
  const q = (termino || '').trim();
  if (q.length < 2) {
    return { exito: true, resultados: { usuarios: [], grupos: [], iglesias: [] }, total: 0 };
  }

  // Query “OR” por campos simples
  const orCampos = [
    { primernombreUsuario: { $regex: q, $options: 'i' } },
    { primerapellidoUsuario: { $regex: q, $options: 'i' } },
    { correoUsuario: { $regex: q, $options: 'i' } },
    { ciudadUsuario: { $regex: q, $options: 'i' } },
    { paisUsuario: { $regex: q, $options: 'i' } },
  ];

  // Coincidencia por nombre completo: “Nombre Apellido”
  const nombreCompletoExpr = {
    $expr: {
      $regexMatch: {
        input: { $concat: ['$primernombreUsuario', ' ', '$primerapellidoUsuario'] },
        regex: q,
        options: 'i',
      },
    },
  };

  let query = {
    $and: [
      { estadoUsuario: 'activo' },
      { $or: [...orCampos, nombreCompletoExpr] },
    ],
  };

  // Si soloAmigos es true, filtrar por amigos del usuario
  if (soloAmigos && usuarioId) {
    try {
      const usuario = await UserModel.findById(usuarioId).select('amigos').lean();
      if (usuario && usuario.amigos && usuario.amigos.length > 0) {
        query.$and.push({ _id: { $in: usuario.amigos } });
      } else {
        // Si no tiene amigos, devolver array vacío
        return { exito: true, resultados: { usuarios: [], grupos: [], iglesias: [] }, total: 0 };
      }
    } catch (error) {
      console.error('Error obteniendo amigos del usuario:', error);
      // En caso de error, no filtrar por amigos
    }
  }

  const usuarios = await UserModel.find(query)
    .select('primernombreUsuario primerapellidoUsuario fotoPerfil ciudadUsuario paisUsuario rolUsuario _id')
    .limit(10);

  // Si más adelante agregás modelos:
  const grupos = [];   // TODO
  const iglesias = []; // TODO

  return {
    exito: true,
    resultados: { usuarios, grupos, iglesias },
    total: usuarios.length + grupos.length + iglesias.length,
  };
};

module.exports = { buscarEnBaseDeDatos };
