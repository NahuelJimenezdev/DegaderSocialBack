// test-api.js - Script para probar la API de búsqueda
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🔍 Probando API de búsqueda...');

    // 1. Probar sin token (debería fallar)
    console.log('\n📡 Probando sin token...');
    try {
      const response1 = await fetch('http://localhost:3001/api/busqueda?q=juan');
      const data1 = await response1.json();
      console.log('Status:', response1.status);
      console.log('Response:', data1);
    } catch (error) {
      console.log('❌ Error sin token:', error.message);
    }

    // 2. Probar con token inválido
    console.log('\n📡 Probando con token inválido...');
    try {
      const response2 = await fetch('http://localhost:3001/api/busqueda?q=juan', {
        headers: {
          'Authorization': 'Bearer token_invalido'
        }
      });
      const data2 = await response2.json();
      console.log('Status:', response2.status);
      console.log('Response:', data2);
    } catch (error) {
      console.log('❌ Error con token inválido:', error.message);
    }

    // 3. Probar endpoint de salud
    console.log('\n📡 Probando endpoint de salud...');
    try {
      const response3 = await fetch('http://localhost:3001/api/usuarios');
      console.log('Status usuarios:', response3.status);
    } catch (error) {
      console.log('❌ Error endpoint usuarios:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Verificar si el servidor está corriendo
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001');
    console.log('✅ Servidor respondiendo en puerto 3001');
    return true;
  } catch (error) {
    console.log('❌ Servidor no responde en puerto 3001');
    console.log('💡 Asegúrate de que el servidor esté corriendo con: npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAPI();
  }
}

main();
