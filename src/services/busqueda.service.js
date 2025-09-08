// src/services/buscar.service.js
const UserModel = require('../models/usuarios.model');

const buscarEnBaseDeDatos = async (termino, usuarioId) => {
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

  const usuarios = await UserModel.find({
    $and: [
      { estadoUsuario: 'activo' },
      { $or: [...orCampos, nombreCompletoExpr] },
    ],
  })
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
