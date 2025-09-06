require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['ETag'],
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(cors(corsOptions));
// NO: app.options('*', cors(corsOptions))

app.use('/api', require('./routes/index.routes'));

// handler de errores de multer (si lo tienes)
app.use(require('./middlewares/upload').handleMulterErrors || ((req, res, next) => next()));

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('Servidor corriendo exitosamente en el puerto:', PORT);
});
