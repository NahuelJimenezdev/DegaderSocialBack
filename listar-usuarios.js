require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./src/models/usuarios.model');

const listarUsuarios = async () => {
  try {
    const mongoUri = process.env.MONGO_ACCESS || 'mongodb://localhost:27017/degader_social';
    await mongoose.connect(mongoUri);
    console.log('🔗 Conectado a la base de datos');

    const usuarios = await UserModel.find().select('_id primernombreUsuario primerapellidoUsuario correoUsuario estadoUsuario createdAt');

    console.log(`\n📋 Total de usuarios encontrados: ${usuarios.length}`);
    console.log('='.repeat(80));

    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.primernombreUsuario} ${usuario.primerapellidoUsuario}`);
      console.log(`   🆔 ID: ${usuario._id}`);
      console.log(`   📧 Email: ${usuario.correoUsuario}`);
      console.log(`   🔐 Estado: ${usuario.estadoUsuario}`);
      console.log(`   📅 Creado: ${usuario.createdAt || 'No disponible'}`);
      console.log('   ' + '-'.repeat(40));
    });

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

listarUsuarios();
