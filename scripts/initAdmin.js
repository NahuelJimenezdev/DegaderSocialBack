// scripts/initAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const argon = require('argon2');
const UserModel = require('../src/models/usuarios.model');

const initAdmin = async () => {
  try {
    // Conectar a la base de datos
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_ACCESS || 'mongodb://localhost:27017/degader_social';
    await mongoose.connect(mongoUri);
    console.log('🔗 Conectado a la base de datos:', mongoUri.replace(/\/\/.*@/, '//***:***@'));

    // Verificar si ya existe un admin
    const existingAdmin = await UserModel.findOne({
      $or: [
        { correoUsuario: process.env.ADMIN_EMAIL },
        { rolUsuario: 'Founder' },
        { rolUsuario: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('✅ Ya existe un administrador en la base de datos');
      console.log('👤 Usuario:', existingAdmin.primernombreUsuario, existingAdmin.primerapellidoUsuario);
      console.log('📧 Email:', existingAdmin.correoUsuario);
      console.log('🔐 Rol:', existingAdmin.rolUsuario);
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await argon.hash(process.env.ADMIN_PASSWORD);

    // Crear el usuario admin
    const adminUser = new UserModel({
      primernombreUsuario: 'Administrador',
      segundonombreUsuario: 'Super',
      primerapellidoUsuario: 'Sistema',
      segundoapellidoUsuario: 'Degader',
      correoUsuario: process.env.ADMIN_EMAIL,
      contraseniaUsuario: hashedPassword,
      fechaNacimientoUsuario: new Date('1990-01-01'),
      rolUsuario: 'Founder', // Rol más alto en el sistema

      // Estructura organizacional completa
      estructuraOrganizacional: {
        nivelJerarquico: 'nacional',
        areaResponsabilidad: {
          pais: 'Argentina',
          region: 'Nacional',
          municipio: 'Todos',
          barrio: 'Todos'
        },
        rolesMinisteriales: [{
          ministerio: 'seguridad',
          cargo: 'director',
          fechaAsignacion: new Date(),
          activo: true
        }],
        permisos: {
          crearEventos: true,
          aprobarEventos: true,
          gestionarUsuarios: true,
          gestionarMinisterios: true,
          accederReportes: true,
          moderarContenido: true
        }
      },

      estadoUsuario: 'activo',

      // Información personal
      celularUsuario: '+5491166582695',
      direccionUsuario: 'Dirección Administrativa Central',
      ciudadUsuario: 'Buenos Aires',
      paisUsuario: 'Argentina',

      // Perfil social
      fotoPerfil: '',
      biografia: 'Administrador principal del sistema Degader Social. Acceso completo a todas las funcionalidades.',
      amigos: [],
      solicitudesPendientes: [],
      solicitudesEnviadas: [],
      grupos: [],
      publicaciones: [],

      // Configuración de seguridad
      jerarquiaUsuario: 'nacional',
      fechaRegistro: new Date(),
      ultimaConexion: new Date(),
      version: 1,
      notificaciones: [{
        mensaje: 'Bienvenido al sistema Degader Social. Tu cuenta de administrador ha sido creada exitosamente.',
        leido: false,
        fecha: new Date()
      }]
    });

    await adminUser.save();
    console.log('🎉 ¡Administrador creado exitosamente!');
    console.log('');
    console.log('📋 Detalles del administrador:');
    console.log('👤 Nombre:', adminUser.primernombreUsuario, adminUser.primerapellidoUsuario);
    console.log('📧 Email:', adminUser.correoUsuario);
    console.log('🔐 Rol:', adminUser.rolUsuario);
    console.log('🏢 Nivel:', adminUser.estructuraOrganizacional.nivelJerarquico);
    console.log('🌍 País:', adminUser.paisUsuario);
    console.log('📱 Celular:', adminUser.celularUsuario);
    console.log('');
    console.log('⚠️  IMPORTANTE: Guarda estas credenciales de forma segura');
    console.log('📧 Email:', process.env.ADMIN_EMAIL);
    console.log('🔑 Password: [Configurado en ADMIN_PASSWORD]');
    console.log('');

  } catch (error) {
    console.error('❌ Error creando administrador:', error.message);
    if (error.code === 11000) {
      console.error('💡 Sugerencia: Ya existe un usuario con ese email');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  console.log('🚀 Iniciando script de creación de administrador...');
  console.log('');

  // Verificar que existan las variables de entorno
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('❌ ERROR: Faltan variables de entorno requeridas');
    console.error('');
    console.error('📋 Variables requeridas:');
    console.error('   ADMIN_EMAIL: Email del administrador');
    console.error('   ADMIN_PASSWORD: Contraseña del administrador');
    console.error('');
    console.error('💡 Ejemplo de configuración en .env:');
    console.error('   ADMIN_EMAIL=admin@degader-social.com');
    console.error('   ADMIN_PASSWORD=MiPasswordSeguro123!');
    console.error('');
    process.exit(1);
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(process.env.ADMIN_EMAIL)) {
    console.error('❌ ERROR: Formato de email inválido');
    console.error('📧 Email proporcionado:', process.env.ADMIN_EMAIL);
    process.exit(1);
  }

  // Validar longitud de contraseña
  if (process.env.ADMIN_PASSWORD.length < 6) {
    console.error('❌ ERROR: La contraseña debe tener al menos 6 caracteres');
    process.exit(1);
  }

  console.log('✅ Variables de entorno validadas correctamente');
  console.log('📧 Email admin:', process.env.ADMIN_EMAIL);
  console.log('🔑 Password: ******* (oculta por seguridad)');
  console.log('');

  initAdmin();
}

module.exports = initAdmin;