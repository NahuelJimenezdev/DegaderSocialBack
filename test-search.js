// test-search.js - Script para probar la búsqueda
// require('dotenv').config(); // Comentado porque no hay .env
require('./src/db/config.db');

const UserModel = require('./src/model/usuarios.model');

async function testSearch() {
  try {
    console.log('🔍 Probando búsqueda...');

    // 1. Ver usuarios existentes
    const allUsers = await UserModel.find({}).select('primernombreUsuario primerapellidoUsuario rolUsuario estadoUsuario').limit(5);
    console.log('👥 Usuarios en BD:', allUsers.length);
    allUsers.forEach(u => {
      console.log(`  - ${u.primernombreUsuario} ${u.primerapellidoUsuario} (${u.rolUsuario}) - Estado: ${u.estadoUsuario}`);
    });

    // 2. Buscar por "admin"
    console.log('\n🔍 Buscando por "admin"...');
    const adminUsers = await UserModel.find({
      $and: [
        { estadoUsuario: 'activo' },
        {
          $or: [
            { primernombreUsuario: { $regex: 'admin', $options: 'i' } },
            { primerapellidoUsuario: { $regex: 'admin', $options: 'i' } },
            { rolUsuario: { $regex: 'admin', $options: 'i' } }
          ]
        }
      ]
    }).select('primernombreUsuario primerapellidoUsuario rolUsuario estadoUsuario');

    console.log('✅ Usuarios admin encontrados:', adminUsers.length);
    adminUsers.forEach(u => {
      console.log(`  - ${u.primernombreUsuario} ${u.primerapellidoUsuario} (${u.rolUsuario})`);
    });

    // 3. Buscar por "administrador"
    console.log('\n🔍 Buscando por "administrador"...');
    const adminUsers2 = await UserModel.find({
      $and: [
        { estadoUsuario: 'activo' },
        {
          $or: [
            { primernombreUsuario: { $regex: 'administrador', $options: 'i' } },
            { primerapellidoUsuario: { $regex: 'administrador', $options: 'i' } },
            { rolUsuario: { $regex: 'administrador', $options: 'i' } }
          ]
        }
      ]
    }).select('primernombreUsuario primerapellidoUsuario rolUsuario estadoUsuario');

    console.log('✅ Usuarios "administrador" encontrados:', adminUsers2.length);
    adminUsers2.forEach(u => {
      console.log(`  - ${u.primernombreUsuario} ${u.primerapellidoUsuario} (${u.rolUsuario})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testSearch();
