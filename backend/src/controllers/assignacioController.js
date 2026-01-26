const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

exports.crearAssignacio = async (req, res) => {
    try {
        const db = getDB();
        const { peticioId, tallerId } = req.body; 

        const result = await db.collection('peticions').updateOne(
            { _id: new ObjectId(peticioId) },
            { 
                $set: { 
                    estat: 'ASSIGNAT',
                    "seleccio_tallers.taller_id": tallerId, 
                    data_assignacio: new Date()
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "No s'ha trobat la petició" });
        }

        await db.collection('tallers').updateOne(
            { _id: new ObjectId(tallerId) },
            { $inc: { places: -1 } }
        );

        console.log("✅ Assignació feta y plaza restada");
        res.status(201).json({ missatge: "Taller assignat correctament i places actualitzades" });

    } catch (error) {
        console.error("Error al asignar:", error);
        res.status(500).json({ error: "Error intern" });
    }
};