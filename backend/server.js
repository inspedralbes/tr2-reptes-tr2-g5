require('dotenv').config();
const express = require('express');
const { connectDB } = require('./src/config/db');

const app = express();
app.use(express.json());

async function startServer() {
    try {
        await connectDB();
        console.log("✅ MongoDB Connectat");

        // 1. IMPORTAR LAS RUTAS
        const tallersRoutes = require('./src/routes/tallers');
        const peticionsRoutes = require('./src/routes/peticions');
        const assignacionsRoutes = require('./src/routes/assignacions');
        const authRoutes = require('./src/routes/auth'); // <--- AÑADIDO
        const usersRoutes = require('./src/routes/users'); // <--- AÑADIDO USERS

        // 2. USAR LAS RUTAS
        app.use('/api/tallers', tallersRoutes);
        app.use('/api/peticions', peticionsRoutes);
        app.use('/api/assignacions', assignacionsRoutes);
        app.use('/api/auth', authRoutes); // <--- AÑADIDO (Esto soluciona el error 404)
        app.use('/api/users', usersRoutes); // <--- AÑADIDO USERS

        const PORT = 3001; 
        app.listen(PORT, () => {
            console.log(`🚀 Servidor ENGINY a http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error en iniciar:", error);
    }
}
startServer();