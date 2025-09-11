// test-eventos-usuario.js - Test específico para endpoint de eventos de usuario
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testEventosUsuario() {
  try {
    console.log('🔐 Probando login...');

    // Primer login para obtener token
    const loginResponse = await axios.post(`${API_BASE_URL}/usuarios/login`, {
      correoUsuario: 'nahuel@gmail.com',
      contraseniaUsuario: '123456789'
    });

    if (loginResponse.data.statusCode !== 200) {
      console.log('❌ Error en login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // Ahora probamos el endpoint de eventos
    console.log('\n📅 Probando endpoint de eventos de usuario...');

    const eventosResponse = await axios.get(`${API_BASE_URL}/eventos/usuario/mis-eventos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Eventos obtenidos exitosamente:');
    console.log('📊 Status:', eventosResponse.status);
    console.log('📊 Cantidad de eventos:', eventosResponse.data.eventos?.length || 0);
    console.log('📊 Datos completos:', JSON.stringify(eventosResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error en test:');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.message);
    console.error('Response data:', error.response?.data);

    if (error.response?.status === 500) {
      console.error('🔥 Error 500 - Problema en el servidor');
    }
  }
}

// Ejecutar el test
testEventosUsuario();
