const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// A src/controllers/assignacioController.js
exports.crearAssignacio = async (req, res) => {
    try {
        const db = getDB();
        const { peticioId, tallerId } = req.body; // Ja no demanem professorId

        const result = await db.collection('peticions').updateOne(
            { _id: new ObjectId(peticioId) },
            { 
                $set: { 
                    estat: 'ASSIGNAT',
                    "seleccio_tallers.taller_id": tallerId, // Confirmem/Actualitzem el taller
                    data_assignacio: new Date()
                    // professorId s'ha eliminat d'aquí
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "No s'ha trobat la petició" });
        }

        res.status(201).json({ missatge: "Taller assignat correctament" });
    } catch (error) {
        res.status(500).json({ error: "Error intern" });
    }
};