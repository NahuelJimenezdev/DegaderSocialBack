require('dotenv').config();
const mongoose = require('mongoose');
const argon = require('argon2');
const UserModel = require('./src/models/usuarios.model');

const testLogin = async () => {
  try {
    const mongoUri = process.env.MONGO_ACCESS || 'mongodb://localhost:27017/degader_social';
    await mongoose.connect(mongoUri);
    console.log('🔗 Conectado a la base de datos');

    // Test con admin
    console.log('\n=== TESTING ADMIN ===');
    const admin = await UserModel.findOne({
      correoUsuario: 'administrador@degadersocial.com'
    });

    if (admin) {
      console.log('✅ Admin encontrado');
      console.log('📧 Email:', admin.correoUsuario);
      console.log('🔐 Estado:', admin.estadoUsuario);

      const adminPasswordTest = await argon.verify(admin.contraseniaUsuario, '*Desarrolloweb_DegaderSocial_2025*');
      console.log('🔑 Test contraseña admin:', adminPasswordTest ? '✅ VÁLIDA' : '❌ INVÁLIDA');
    } else {
      console.log('❌ Admin no encontrado');
    }

    // Test con Maria
    console.log('\n=== TESTING MARIA ===');
    const maria = await UserModel.findOne({
      correoUsuario: 'maria.test@gmail.com'
    });

    if (maria) {
      console.log('✅ Maria encontrada');
      console.log('📧 Email:', maria.correoUsuario);
      console.log('🔐 Estado:', maria.estadoUsuario);
      console.log('🏷️ Rol:', maria.rolUsuario);

      const mariaPasswordTest = await argon.verify(maria.contraseniaUsuario, 'test123456');
      console.log('🔑 Test contraseña Maria:', mariaPasswordTest ? '✅ VÁLIDA' : '❌ INVÁLIDA');

      // Mostrar hash para debug
      console.log('🔒 Hash almacenado:', maria.contraseniaUsuario.substring(0, 20) + '...');
    } else {
      console.log('❌ Maria no encontrada');
    }

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testLogin();
