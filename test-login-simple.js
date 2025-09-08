// test-login-simple.js - Test simple de login
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testLogin() {
  try {
    console.log('🔐 Probando login...');

    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'nahuel@gmail.com',
      password: '123456789'
    });

    console.log('✅ Login exitoso:');
    console.log('📊 Status:', response.status);
    console.log('📊 Data:', JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.token) {
      console.log('🎫 Token obtenido:', response.data.token.substring(0, 20) + '...');
      return response.data.token;
    } else {
      console.log('❌ No se obtuvo token');
      return null;
    }

  } catch (error) {
    console.error('❌ Error en login:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

testLogin();
