const mongoose = require('mongoose');

// URL por defecto si no hay variable de entorno
const mongoUrl = process.env.MONGO_ACCESS || 'mongodb://localhost:27017/nodeinicios';

// Configuración de conexión con soporte para transacciones
const options = {
  // Configuración para transacciones
  readPreference: 'primary',
  // Configuración adicional para Atlas
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  // Habilitar retry writes
  retryWrites: true,
  retryReads: true
};

// console.log('🔗 Intentando conectar a MongoDB:', mongoUrl);

mongoose.connect(mongoUrl, options)
  .then(() => {
    console.log('✅ Base de datos conectada exitosamente');
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.log('💡 Asegúrate de que MongoDB esté corriendo en localhost:27017');
    console.log('💡 O configura la variable MONGO_ACCESS con tu URL de MongoDB');
  });