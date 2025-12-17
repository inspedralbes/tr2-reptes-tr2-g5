const express = require('express');
const path = require('path');
const app = express();

// Importem les teves funcions de la base de dades
const { guardarPeticionFormulario, ejecutarAsignacion } = require('./index'); 

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 2. Rutes de la teva API
app.post('/api/peticions', async (req, res) => {
    try {
        await guardarPeticionFormulario(req.body);
        res.status(201).send({ missatge: 'Petició guardada' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ENGINY corrent al port ${PORT}`));