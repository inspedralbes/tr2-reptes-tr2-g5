const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const usePeticions = () => {
    const getPeticionsAdmin = async (res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions').aggregate([
                {
                    $lookup: {
                        from: 'tallers',
                        localField: 'taller_id',
                        foreignField: '_id',
                        as: 'taller_info'
                    }
                },
                { $unwind: { path: "$taller_info", preserveNullAndEmptyArrays: true } }
            ]).toArray();

            const formatades = peticions.map(p => ({
                ...p,
                centreId: { nom: p.nom_centre || 'Centre' },
                tallerId: { titol: p.taller_info?.titol || 'Taller pendent' }
            }));

            res.status(200).json(formatades);
        } catch (error) {
            res.status(500).json({ error: "Error al carregar peticions" });
        }
    };

    const createPeticio = async (req, res) => {
        try {
            const db = getDB();
            const nova = { ...req.body, estat: "PENDENT", data_creacio: new Date() };
            const result = await db.collection('peticions').insertOne(nova);
            res.status(201).json({ id: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: "Error al crear petició" });
        }
    };

    const updateEstat = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            await db.collection('peticions').updateOne(
                { _id: new ObjectId(id) },
                { $set: { estat: req.body.estat } }
            );
            res.status(200).json({ missatge: "Estat actualitzat" });
        } catch (error) {
            res.status(500).json({ error: "Error en l'estat" });
        }
    };

    return { getPeticionsAdmin, createPeticio, updateEstat };
};

module.exports = { usePeticions };