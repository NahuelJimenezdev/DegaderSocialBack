require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./src/models/usuarios.model');

const debugUsuario = async () => {
  try {
    const mongoUri = process.env.MONGO_ACCESS || 'mongodb://localhost:27017/degader_social';
    await mongoose.connect(mongoUri);
    console.log('🔗 Conectado a la base de datos');

    // Buscar usuario por email
    const usuario = await UserModel.findOne({
      correoUsuario: 'valentina.ruiz@gmail.com'
    });

    if (usuario) {
      console.log('✅ Usuario encontrado:');
      console.log('👤 Nombre:', usuario.primernombreUsuario, usuario.primerapellidoUsuario);
      console.log('📧 Email:', usuario.correoUsuario);
      console.log('🔐 Estado:', usuario.estadoUsuario);
      console.log('🏷️ Rol:', usuario.rolUsuario);
      console.log('🔑 Hash contraseña:', usuario.contraseniaUsuario ? 'Existe' : 'No existe');
      console.log('📅 Fecha creación:', usuario.createdAt);
    } else {
      console.log('❌ Usuario no encontrado');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

debugUsuario();
