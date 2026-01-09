require('dotenv').config();
const express = require('express');
const { connectDB } = require('./src/config/db'); 

const app = express();
app.use(express.json());

// CONFIGURACIÓ MANUAL DE CORS (Sense paquet cors)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200); 
    }
    next();
});

async function startServer() {
    try {
        await connectDB(); 
        console.log("✅ MongoDB Connectat");

        const tallersRoutes = require('./src/routes/tallers');
        const peticionsRoutes = require('./src/routes/peticions');
        const assignacionsRoutes = require('./src/routes/assignacions'); 

        app.use('/api/tallers', tallersRoutes);
        app.use('/api/peticions', peticionsRoutes);
        app.use('/api/assignacions', assignacionsRoutes); 

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor ENGINY a http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error en iniciar:", error);
    }
}
startServer();