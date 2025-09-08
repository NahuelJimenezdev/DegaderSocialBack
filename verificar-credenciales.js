// verificar-credenciales.js - Verificar contraseñas de usuarios
require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./src/models/usuarios.model');
const argon = require('argon2');

const verificarCredenciales = async () => {
  try {
    await mongoose.connect(process.env.MONGO_ACCESS);
    console.log('✅ Conectado a la base de datos\n');

    // Buscar usuarios
    const nahuel = await UserModel.findOne({
      correoUsuario: 'nahuel@gmail.com'
    }).select('primernombreUsuario primerapellidoUsuario correoUsuario contraseniaUsuario');

    const joselin = await UserModel.findOne({
      correoUsuario: 'joselin.jimenez@fhsyl.org'
    }).select('primernombreUsuario primerapellidoUsuario correoUsuario contraseniaUsuario');

    console.log('👤 NAHUEL:');
    if (nahuel) {
      console.log(`   Email: ${nahuel.correoUsuario}`);
      console.log(`   Contraseña (hash): ${nahuel.contraseniaUsuario.substring(0, 20)}...`);

      // Verificar contraseñas comunes
      const passwordsToTest = ['123456', '123456789', 'nahuel123', 'password'];
      for (const pwd of passwordsToTest) {
        const isValid = await argon.verify(nahuel.contraseniaUsuario, pwd);
        console.log(`   ¿${pwd}? ${isValid ? '✅' : '❌'}`);
      }
    } else {
      console.log('   ❌ No encontrado');
    }

    console.log('\n👤 JOSELIN:');
    if (joselin) {
      console.log(`   Email: ${joselin.correoUsuario}`);
      console.log(`   Contraseña (hash): ${joselin.contraseniaUsuario.substring(0, 20)}...`);

      // Verificar contraseñas comunes
      const passwordsToTest = ['123456', '123456789', 'joselin123', 'password'];
      for (const pwd of passwordsToTest) {
        const isValid = await argon.verify(joselin.contraseniaUsuario, pwd);
        console.log(`   ¿${pwd}? ${isValid ? '✅' : '❌'}`);
      }
    } else {
      console.log('   ❌ No encontrado');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de la base de datos');
  }
};

verificarCredenciales();
