const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const useTallers = () => {
    
    // 1. Obtenir el catàleg de tallers
    const getCatàleg = async (res) => {
        try {
            const db = getDB();
            const tallers = await db.collection('tallers').find().toArray();
            res.status(200).json(tallers);
        } catch (error) {
            res.status(500).json({ error: "Error en obtenir el catàleg" });
        }
    };

    // 2. Crear un taller amb LOG formatejat
    const createTaller = async (req, res) => {
        try {
            const db = getDB();
            const result = await db.collection('tallers').insertOne(req.body);
            
            // --- LOG FORMATEJAT PER VS CODE ---
            console.log("🆕 Taller creat correctament:", {
                tallerId: result.insertedId,
                titol: req.body.titol,
                modalitat: req.body.modalitat,
                places: req.body.places
            });
            // -----------------------------------

            res.status(201).json({ ...req.body, _id: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: "Error al crear taller" });
        }
    };

    // 3. Actualitzar un taller amb LOG opcional
    const updateTaller = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            const dades = { ...req.body };
            delete dades._id; // Protecció de clau primària
            
            await db.collection('tallers').updateOne(
                { _id: new ObjectId(id) },
                { $set: dades }
            );

            console.log("✏️ Taller modificat:", { tallerId: id, titol: dades.titol });

            res.status(200).json({ _id: id, ...dades });
        } catch (error) {
            res.status(500).json({ error: "Error al modificar" });
        }
    };

    // 4. Eliminar un taller amb LOG formatejat
    const deleteTaller = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            await db.collection('tallers').deleteOne({ _id: new ObjectId(id) });
            
            // --- LOG FORMATEJAT PER VS CODE ---
            console.log("🗑️ Taller eliminat del sistema:", {
                tallerId: id,
                data_eliminacio: new Date().toISOString()
            });
            // -----------------------------------

            res.status(200).json({ missatge: "Taller eliminat" });
        } catch (error) {
            res.status(500).json({ error: "Error al esborrar" });
        }
    };

    return { getCatàleg, createTaller, updateTaller, deleteTaller };
};

module.exports = { useTallers };