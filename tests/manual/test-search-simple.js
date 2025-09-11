// test-search-simple.js - Script para probar la lógica de búsqueda
console.log('🔍 Probando lógica de búsqueda...');

// Simular datos de usuarios
const usuariosMock = [
  {
    _id: '1',
    primernombreUsuario: 'Juan',
    primerapellidoUsuario: 'Pérez',
    rolUsuario: 'admin',
    estadoUsuario: 'activo',
    ciudadUsuario: 'Buenos Aires',
    paisUsuario: 'Argentina'
  },
  {
    _id: '2',
    primernombreUsuario: 'María',
    primerapellidoUsuario: 'González',
    rolUsuario: 'Miembro',
    estadoUsuario: 'activo',
    ciudadUsuario: 'Córdoba',
    paisUsuario: 'Argentina'
  },
  {
    _id: '3',
    primernombreUsuario: 'Carlos',
    primerapellidoUsuario: 'Administrador',
    rolUsuario: 'admin',
    estadoUsuario: 'activo',
    ciudadUsuario: 'Rosario',
    paisUsuario: 'Argentina'
  }
];

// Función de búsqueda simulada
function buscarUsuarios(termino) {
  const terminoBusqueda = termino.trim().toLowerCase();

  if (!terminoBusqueda || terminoBusqueda.length < 2) {
    return [];
  }

  return usuariosMock.filter(usuario =>
    usuario.estadoUsuario === 'activo' && (
      usuario.primernombreUsuario.toLowerCase().includes(terminoBusqueda) ||
      usuario.primerapellidoUsuario.toLowerCase().includes(terminoBusqueda) ||
      usuario.rolUsuario.toLowerCase().includes(terminoBusqueda) ||
      usuario.ciudadUsuario.toLowerCase().includes(terminoBusqueda) ||
      usuario.paisUsuario.toLowerCase().includes(terminoBusqueda)
    )
  );
}

// Probar búsquedas
console.log('\n🔍 Probando búsqueda por "admin"...');
const resultadosAdmin = buscarUsuarios('admin');
console.log('✅ Resultados para "admin":', resultadosAdmin.length);
resultadosAdmin.forEach(u => {
  console.log(`  - ${u.primernombreUsuario} ${u.primerapellidoUsuario} (${u.rolUsuario})`);
});

console.log('\n🔍 Probando búsqueda por "administrador"...');
const resultadosAdministrador = buscarUsuarios('administrador');
console.log('✅ Resultados para "administrador":', resultadosAdministrador.length);
resultadosAdministrador.forEach(u => {
  console.log(`  - ${u.primernombreUsuario} ${u.primerapellidoUsuario} (${u.rolUsuario})`);
});

console.log('\n🔍 Probando búsqueda por "juan"...');
const resultadosJuan = buscarUsuarios('juan');
console.log('✅ Resultados para "juan":', resultadosJuan.length);
resultadosJuan.forEach(u => {
  console.log(`  - ${u.primernombreUsuario} ${u.primerapellidoUsuario} (${u.rolUsuario})`);
});

console.log('\n✅ Prueba de lógica completada');
