require('./db/config.db');
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// 1. MIDDLEWARES BÁSICOS
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. SERVIR ARCHIVOS ESTÁTICOS
const uploadsPath = 'C:/Users/Nahuel Jiménez/Documents/00_ProyectosWeb/BackEnd/NodeInicios/uploads';
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('📁 Directorio uploads creado:', uploadsPath);
}
app.use('/uploads', express.static(uploadsPath));

// 3. RUTAS DE LA API
const indexRoutes = require('./routes/index.routes');
const publicacionesRoutes = require('./routes/publicaciones.routes');

app.use('/api', indexRoutes);
app.use('/api/publicaciones', publicacionesRoutes);

// 4. HEALTH CHECKS
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando' });
});

// 5. MANEJO DE ERRORES
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('🚀 Servidor corriendo en puerto:', PORT);
});