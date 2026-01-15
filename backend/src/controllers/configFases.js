const { getDB } = require('../config/db');

exports.getConfig = async (req, res) => {
    try {
        const db = getDB();
       
        let config = await db.collection('configuracio').findOne({});
        
        if (!config) {
            const nuevaConfig = { faseActual: 1 };
            await db.collection('configuracio').insertOne(nuevaConfig);
            return res.json(nuevaConfig);
        }
        
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la configuración" });
    }
};

// Actualizar la fase (Admin)
exports.updateFase = async (req, res) => {
    try {
        const db = getDB();
        const { nuevaFase } = req.body; 

        const result = await db.collection('configuracio').updateOne(
            {}, 
            { $set: { faseActual: parseInt(nuevaFase) } },
            { upsert: true } // Si no existe, lo crea
        );

        res.json({ missatge: "Fase actualitzada correctament", fase: nuevaFase });
    } catch (error) {
        res.status(500).json({ error: "Error intern al actualitzar la fase" });
    }
};