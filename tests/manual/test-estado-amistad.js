// test-estado-amistad.js - Script para probar el endpoint de estado de amistad
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// IDs que sabemos están como amigos en la base de datos
const nahuel = '68bda6ad979d65fec4a9dfac';  // Nahuel
const joselin = '68bda6ca979d65fec4a9dfb7';       // Joselin

async function testEstadoAmistad() {
  try {
    console.log('🧪 Probando endpoint de estado de amistad...\n');

    // Necesitamos un token válido - vamos a hacer login primero
    console.log('1. Haciendo login como Nahuel...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'nahuel@gmail.com',
      password: '123456'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login exitoso');

      const token = loginResponse.data.token;

      // Ahora probamos el endpoint de estado
      console.log('\n2. Consultando estado de amistad con Joselin...');

      const estadoResponse = await axios.get(`${API_BASE_URL}/amigos/estado/${joselin}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del endpoint:');
      console.log(JSON.stringify(estadoResponse.data, null, 2));

      if (estadoResponse.data.success) {
        console.log(`\n✅ Estado obtenido: ${estadoResponse.data.estado}`);

        if (estadoResponse.data.estado === 'amigos') {
          console.log('🎉 El backend confirma que son amigos');
        } else {
          console.log('⚠️ El backend dice que NO son amigos');
          console.log('🔍 Necesitamos investigar por qué...');
        }
      } else {
        console.log('❌ Error en la respuesta:', estadoResponse.data);
      }

    } else {
      console.log('❌ Error en login:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Error en test:', error.response?.data || error.message);
  }
}

testEstadoAmistad();
