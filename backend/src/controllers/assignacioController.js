const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

exports.crearAssignacio = async (req, res) => {
    try {
        const db = getDB();
        // Recojo los datos que me envían desde el frontend
        const { peticioId, tallerId } = req.body; 

        // 1. Actualizo la petición para cambiar el estado a ASSIGNAT
        const result = await db.collection('peticions').updateOne(
            { _id: new ObjectId(peticioId) },
            { 
                $set: { 
                    estat: 'ASSIGNAT',
                    "seleccio_tallers.taller_id": tallerId, // Guardo qué taller se le ha dado
                    data_assignacio: new Date()
                } 
            }
        );

        // Si no encuentro la petición, aviso del error
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "No s'ha trobat la petició" });
        }

        // 2. AQUI ESTÁ EL TRUCO PARA EL REPTE: $inc
        // Si la petición se ha actualizado bien, voy al taller y le resto 1 plaza
        await db.collection('tallers').updateOne(
            { _id: new ObjectId(tallerId) },
            { $inc: { places: -1 } } // El -1 resta, si pusiera 1 sumaría
        );

        console.log("✅ Assignació feta y plaza restada");
        res.status(201).json({ missatge: "Taller assignat correctament i places actualitzades" });

    } catch (error) {
        console.error("Error al asignar:", error);
        res.status(500).json({ error: "Error intern" });
    }
};