const express = require('express');
const cors = require('cors'); // Importar cors
const app = express();

// Habilitar CORS para todas las rutas
app.use(cors()); 

app.use(express.json());

// Importación de rutas
const tallerRoutes = require('./routes/tallers');
const peticioRoutes = require('./routes/peticions');

// Registrar rutas con el prefijo /api
app.use('/api/tallers', tallerRoutes);
app.use('/api/peticions', peticioRoutes);

module.exports = app;