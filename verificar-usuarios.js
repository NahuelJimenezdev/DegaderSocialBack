// verificar-usuarios.js - Script para ver qué usuarios existen
require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./src/models/usuarios.model');

const verificarUsuarios = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_ACCESS);
    console.log('✅ Conectado a la base de datos');

    // Buscar todos los usuarios con información básica
    const usuarios = await UserModel.find({})
      .select('primernombreUsuario primerapellidoUsuario correoUsuario telefonoUsuario')
      .limit(10);

    console.log('\n👥 USUARIOS EN LA BASE DE DATOS:');
    usuarios.forEach((user, index) => {
      console.log(`${index + 1}. ${user.primernombreUsuario} ${user.primerapellidoUsuario}`);
      console.log(`   Email: ${user.correoUsuario}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de la base de datos');
  }
};

verificarUsuarios();
