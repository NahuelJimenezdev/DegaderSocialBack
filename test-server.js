require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS básico
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor de prueba funcionando' });
});

// Ruta /api/me de prueba (sin auth)
app.get('/api/me', (req, res) => {
  res.json({ message: 'Ruta /api/me funcionando sin auth' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba corriendo en puerto: ${PORT}`);
});
