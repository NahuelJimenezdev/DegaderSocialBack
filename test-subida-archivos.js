// test-subida-archivos.js - Test para verificar subida de archivos
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3001/api';

async function testSubidaArchivos() {
  try {
    console.log('🧪 Test de subida de archivos...\n');

    // 1. Login para obtener token
    console.log('1. Haciendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'nahuel@gmail.com',
      password: '123456789'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Error en login:', loginResponse.data);
      return;
    }

    console.log('✅ Login exitoso');
    const token = loginResponse.data.token;

    // 2. Crear una imagen de prueba simple (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, 'test-image.png');
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 image
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
    ]);

    fs.writeFileSync(testImagePath, pngBuffer);
    console.log('📷 Imagen de prueba creada');

    // 3. Crear FormData con la publicación
    const formData = new FormData();
    formData.append('contenido', 'Test de subida de archivos');
    formData.append('tipo', 'publicacion');
    formData.append('imagenes', fs.createReadStream(testImagePath), 'test-image.png');

    console.log('\n2. Enviando publicación con imagen...');

    const publicacionResponse = await axios.post(`${API_BASE_URL}/publicaciones`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Publicación creada exitosamente:');
    console.log('📊 Respuesta:', JSON.stringify(publicacionResponse.data, null, 2));

    // 4. Limpiar archivo de prueba
    fs.unlinkSync(testImagePath);
    console.log('🧹 Archivo de prueba eliminado');

  } catch (error) {
    console.error('❌ Error en test:', error.response?.data || error.message);

    // Limpiar archivo de prueba en caso de error
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

testSubidaArchivos();
