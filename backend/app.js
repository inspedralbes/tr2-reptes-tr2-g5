const express = require('express');
const app = express();

app.use(express.json());

// CONFIGURACIÓ MANUAL DE CORS (Substituint el paquet cors)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    // Resposta per a la verificació preflight del navegador
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Importació de rutes (assegura't que les rutes apunten a ./src/routes/...)
const tallerRoutes = require('./src/routes/tallers');
const peticioRoutes = require('./src/routes/peticions');
const assignacioRoutes = require('./src/routes/assignacions'); // Nova ruta afegida

// Registrar rutes amb el prefix /api
app.use('/api/tallers', tallerRoutes);
app.use('/api/peticions', peticioRoutes);
app.use('/api/assignacions', assignacioRoutes); // Registrar la nova ruta d'assignacions

module.exports = app;