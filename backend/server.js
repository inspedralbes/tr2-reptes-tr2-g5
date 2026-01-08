require('dotenv').config();
const express = require('express');
const { connectDB } = require('./src/config/db'); 

const app = express();
app.use(express.json());

// CONFIGURACIÓ MANUAL DE CORS (Sense paquet cors)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Permet el teu frontend a localhost:3001
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

async function startServer() {
    try {
        await connectDB(); // Esperem la connexió real
        console.log("✅ MongoDB Connectat");

        // Importem les rutes aquí per evitar que useTallers() es cridi abans d'hora
        const tallersRoutes = require('./src/routes/tallers');
        const peticionsRoutes = require('./src/routes/peticions');

        app.use('/api/tallers', tallersRoutes);
        app.use('/api/peticions', peticionsRoutes);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor ENGINY escoltant a http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error crític en iniciar el servidor:", error);
    }
}

startServer();