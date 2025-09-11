// test-servicio-amistad.js - Test directo del servicio
require('dotenv').config();
const mongoose = require('mongoose');
const { obtenerEstadoAmistad } = require('./src/services/amistades.services');

const testServicioAmistad = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_ACCESS);
    console.log('✅ Conectado a la base de datos\n');

    // IDs confirmados de la base de datos
    const joselinId = '68bda6ca979d65fec4a9dfb7';
    const nahuId = '68bda6ad979d65fec4a9dfac';

    console.log('🧪 Test 1: Joselin consultando estado con Nahuel');
    console.log('='.repeat(50));
    const resultado1 = await obtenerEstadoAmistad(joselinId, nahuId);
    console.log('📊 Resultado:', resultado1);

    console.log('\n🧪 Test 2: Nahuel consultando estado con Joselin');
    console.log('='.repeat(50));
    const resultado2 = await obtenerEstadoAmistad(nahuId, joselinId);
    console.log('📊 Resultado:', resultado2);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de la base de datos');
  }
};

testServicioAmistad();
