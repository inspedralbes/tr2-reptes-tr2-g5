require('dotenv').config(); // [REQ] Credencials NO estan al codi (ficher .env)
console.log("DEBUG: La URI de Mongo es ->", process.env.MONGODB_URI);
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://enginycat.dam.inspedralbes.cat'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
async function startServer() {
    try {
        await connectDB();
        console.log("✅ MongoDB Connectat");

        const tallersRoutes = require('./src/routes/tallers');
        const peticionsRoutes = require('./src/routes/peticions');
        const assignacionsRoutes = require('./src/routes/assignacions');
        const fasesRoutes = require('./src/routes/fases');
        const authRoutes = require('./src/routes/auth');
        const usersRoutes = require('./src/routes/users');
        const informesRoutes = require('./src/routes/informes');

        app.use('/api/tallers', tallersRoutes);
        app.use('/api/config', fasesRoutes);
        app.use('/api/peticions', peticionsRoutes);
        app.use('/api/assignacions', assignacionsRoutes);
        app.use('/api/auth', authRoutes);
        app.use('/api/users', usersRoutes);
        app.use('/api/informes', informesRoutes);

        app.post('/api/login', async (req, res) => {
            try {
                const { getDB } = require('./src/config/db');
                const db = getDB();
                const { email, password } = req.body;
                const user = await db.collection('usuaris').findOne({ email: email });

                if (!user || user.password !== password) {
                    return res.status(401).json({ message: 'Credencials incorrectes' });
                }

                res.json({
                    message: 'Inici de sessió correcte',
                    email: user.email,
                    nombre: user.nom,
                    rol: user.rol
                });
            } catch (error) {
                res.status(500).json({ message: 'Error en el servidor' });
            }
        });

        const path = require('path');
        app.use('/download', express.static(path.join(__dirname, 'public')));

        const PORT = process.env.PORT || 8088;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor ENGINY a http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error en iniciar:", error); // [REQ] Errors de connexió gestionats al inici
    }
}
startServer();