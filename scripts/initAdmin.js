// scripts/initAdmin.js
const mongoose = require('mongoose');
const argon = require('argon2');
const UserModel = require('../src/model/usuarios.model');

const initAdmin = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_ACCESS || 'mongodb://localhost:27017/tudatabase');
    console.log('Conectado a la base de datos');

    // Verificar si ya existe un admin
    const existingAdmin = await UserModel.findOne({
      correoUsuario: process.env.ADMIN_EMAIL
    });

    if (existingAdmin) {
      console.log('✅ El administrador ya existe en la base de datos');
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await argon.hash(process.env.ADMIN_PASSWORD);

    // Crear el usuario admin
    const adminUser = new UserModel({
      primernombreUsuario: 'Administrador',
      primerapellidoUsuario: 'Sistema',
      correoUsuario: process.env.ADMIN_EMAIL,
      contraseniaUsuario: hashedPassword,
      rolUsuario: 'admin',
      jerarquiaUsuario: 'nacional',
      estadoUsuario: 'activo',
      telefonoUsuario: '+0000000000',
      direccionUsuario: 'Dirección administrativa',
      ciudadUsuario: 'Ciudad administrativa',
      paisUsuario: 'País',
      fechaNacimientoUsuario: new Date('1993-06-09'),
      generoUsuario: 'masculino',
      fechaCreacionUsuario: new Date(),
      ultimaConexionUsuario: new Date(),
      esAdministrador: true,
      permisos: ['admin', 'superuser', 'manage_users', 'manage_content']
    });

    await adminUser.save();
    console.log('✅ Administrador creado exitosamente');
    console.log('📧 Email:', process.env.ADMIN_EMAIL);

  } catch (error) {
    console.error('❌ Error creando administrador:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de la base de datos');
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  // Verificar que existan las variables de entorno
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('❌ Faltan variables de entorno ADMIN_EMAIL o ADMIN_PASSWORD');
    process.exit(1);
  }

  initAdmin();
}

module.exports = initAdmin;