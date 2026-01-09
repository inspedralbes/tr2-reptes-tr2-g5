const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

exports.crearAssignacio = async (req, res) => {
    try {
        const db = getDB();
        const { peticioId, professorId } = req.body;

        // Actualitzem la petició a la col·lecció 'peticions'
        const result = await db.collection('peticions').updateOne(
            { _id: new ObjectId(peticioId) },
            { 
                $set: { 
                    estat: 'ASSIGNAT', // Majúscules exactes per al chip
                    professorId: professorId,
                    data_assignacio: new Date()
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "No s'ha trobat la petició per actualitzar" });
        }

        console.log(`✅ Petició ${peticioId} actualizada a ASSIGNAT`);
        res.status(201).json({ missatge: "Assignació guardada correctament" });
    } catch (error) {
        console.error("❌ Error en crearAssignacio:", error);
        res.status(500).json({ error: "Error intern del servidor" });
    }
};