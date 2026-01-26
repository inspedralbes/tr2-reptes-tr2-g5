const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

const tallerRoutes = require('./src/routes/tallers');
const peticioRoutes = require('./src/routes/peticions');
const assignacioRoutes = require('./src/routes/assignacions');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/userRoutes');

app.use('/api/tallers', tallerRoutes);
app.use('/api/peticions', peticioRoutes);
app.use('/api/assignacions', assignacioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

module.exports = app;