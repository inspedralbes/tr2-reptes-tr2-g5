const express = require('express');
const app = express();

app.use(express.json());

// CONFIGURACIÓ MANUAL DE CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// --- IMPORTACIÓ DE RUTES ---
const tallerRoutes = require('./src/routes/tallers');
const peticioRoutes = require('./src/routes/peticions');
const assignacioRoutes = require('./src/routes/assignacions');
const authRoutes = require('./src/routes/auth'); // <--- AÑADIDO
const userRoutes = require('./src/routes/userRoutes'); // <--- AÑADIR ESTA LÍNEA

// --- REGISTRE DE RUTES (/api/...) ---
app.use('/api/tallers', tallerRoutes);
app.use('/api/peticions', peticioRoutes);
app.use('/api/assignacions', assignacioRoutes);
app.use('/api/auth', authRoutes); // <--- AÑADIDO (Esto arregla el 404)
app.use('/api/users', userRoutes); // <--- AÑADIR ESTA LÍNEA (Arregla el 404/500 de invitaciones)

module.exports = app;