// test-endpoint-directo.js - Test directo del endpoint con token real
require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testEndpointEstado() {
  try {
    console.log('🔍 Testing endpoint /amigos/estado/...\n');

    // 1. Login como Joselin (para obtener token)
    console.log('1. Login como Joselin...');
    const loginJoselin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'joselin.jimenez@fhsyl.org',
      password: '123456'
    });

    if (loginJoselin.data.success) {
      console.log('✅ Login Joselin exitoso');
      const tokenJoselin = loginJoselin.data.token;

      // 2. Consultar estado de amistad con Nahuel
      console.log('\n2. Consultando estado con Nahuel desde Joselin...');
      const estadoResponse = await axios.get(`${API_BASE_URL}/amigos/estado/68bda6ad979d65fec4a9dfac`, {
        headers: {
          'Authorization': `Bearer ${tokenJoselin}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del backend:');
      console.log(JSON.stringify(estadoResponse.data, null, 2));

    } else {
      console.log('❌ Error en login Joselin:', loginJoselin.data);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 3. Login como Nahuel (para obtener token)
    console.log('3. Login como Nahuel...');
    const loginNahuel = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'nahuel@gmail.com',
      password: '123456'
    });

    if (loginNahuel.data.success) {
      console.log('✅ Login Nahuel exitoso');
      const tokenNahuel = loginNahuel.data.token;

      // 4. Consultar estado de amistad con Joselin
      console.log('\n4. Consultando estado con Joselin desde Nahuel...');
      const estadoResponse2 = await axios.get(`${API_BASE_URL}/amigos/estado/68bda6ca979d65fec4a9dfb7`, {
        headers: {
          'Authorization': `Bearer ${tokenNahuel}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del backend:');
      console.log(JSON.stringify(estadoResponse2.data, null, 2));

    } else {
      console.log('❌ Error en login Nahuel:', loginNahuel.data);
    }

  } catch (error) {
    console.error('❌ Error en test:', error.response?.data || error.message);
  }
}

testEndpointEstado();
