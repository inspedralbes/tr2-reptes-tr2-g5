
require('dotenv').config();
const express = require('express');
// 1. Importem les teves funcions de db.js
const { connectDB } = require('./src/config/db'); 

const app = express();
app.use(express.json());

// 2. Cridem a la teva funció asíncrona per connectar
async function startServer() {
    try {
        await connectDB(); // Esperem a que MongoDB estigui llest
        
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Servidor ENGINY escoltant al port ${process.env.PORT || 3000}`);
        });
    } catch (error) {
        console.error("No s'ha pogut iniciar el servidor per error a la DB");
    }
}

startServer();

const tallersRoutes = require('./src/routes/tallers');
const peticionsRoutes = require('./src/routes/peticions');

// Això diu: "Totes les rutes de tallers comencen per /api/tallers"
app.use('/api/tallers', tallersRoutes);
app.use('/api/peticions', peticionsRoutes);