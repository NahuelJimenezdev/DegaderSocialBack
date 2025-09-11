// test-imports.js - Script para probar imports después del cambio de model a models
console.log('🔍 Probando imports después del cambio model -> models...\n');

try {
  console.log('1. Probando dotenv...');
  require('dotenv').config();
  console.log('✅ dotenv OK\n');

  console.log('2. Probando conexión DB...');
  require('./src/db/config.db');
  console.log('✅ DB config OK\n');

  console.log('3. Probando modelos individuales...');

  const Usuario = require('./src/models/usuarios.model');
  console.log('✅ usuarios.model OK');

  const Eventos = require('./src/models/eventos.model');
  console.log('✅ eventos.model OK');

  const Carritos = require('./src/models/carritos.model');
  console.log('✅ carritos.model OK');

  console.log('\n4. Probando controladores...');
  const meController = require('./src/controllers/me.controller');
  console.log('✅ me.controller OK');

  console.log('\n5. Probando rutas...');
  const meRoutes = require('./src/routes/me.routes');
  console.log('✅ me.routes OK');

  const indexRoutes = require('./src/routes/index.routes');
  console.log('✅ index.routes OK');

  console.log('\n🎉 TODOS LOS IMPORTS FUNCIONAN CORRECTAMENTE!');

} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('Stack:', error.stack);
}

setTimeout(() => process.exit(0), 2000);
