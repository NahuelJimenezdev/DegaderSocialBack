// test-busqueda-simple.js - Script simple para probar la API
const http = require('http');

function testAPI() {
  console.log('🔍 Probando API de búsqueda...');

  // Opciones para la petición
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/busqueda/buscar?q=juan',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_token'
    }
  };

  // Hacer la petición
  const req = http.request(options, (res) => {
    console.log('📊 Status:', res.statusCode);
    console.log('📊 Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Respuesta:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Datos parseados:', jsonData);
      } catch (e) {
        console.log('❌ Error parseando JSON:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error en petición:', e.message);
  });

  req.end();
}

// Verificar si el servidor está corriendo
function checkServer() {
  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET'
  }, (res) => {
    console.log('✅ Servidor respondiendo en puerto 3001');
    console.log('📊 Status raíz:', res.statusCode);
    testAPI();
  });

  req.on('error', (e) => {
    console.log('❌ Servidor no responde en puerto 3001');
    console.log('💡 Asegúrate de que el servidor esté corriendo con: npm run dev');
  });

  req.end();
}

checkServer();
