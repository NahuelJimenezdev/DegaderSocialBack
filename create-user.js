// create-user.js - Script para crear el usuario Director Nacional
const userData = {
  "primernombreUsuario": "Joselin",
  "segundonombreUsuario": "",
  "primerapellidoUsuario": "Jimenez",
  "segundoapellidoUsuario": "Moreno",
  "correoUsuario": "joselin.jimenez@fhsyl.org",
  "contraseniaUsuario": "123456789",
  "rolUsuario": "Director",
  "estadoUsuario": "activo",
  "pais": "Argentina",
  "cargoFundacion": "Director Nacional",
  "esAdminSupremo": false,
  "fotoPerfil": "",
  "amigos": [],
  "grupos": [],
  "publicaciones": [],
  "gruposIglesia": [],
  "fechaRegistro": "2025-09-05T17:00:00.000Z",
  "ultimaConexion": "2025-09-05T17:00:00.000Z",
  "notificaciones": []
};

async function createUser() {
  try {
    console.log('📤 Enviando petición para crear usuario...');
    console.log('📄 Datos:', JSON.stringify(userData, null, 2));

    const response = await fetch('http://localhost:3001/api/usuariosInicios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);

    const responseData = await response.text();
    console.log('📋 Response:', responseData);

    if (response.ok) {
      console.log('✅ Usuario creado exitosamente!');
    } else {
      console.log('❌ Error al crear usuario');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createUser();
