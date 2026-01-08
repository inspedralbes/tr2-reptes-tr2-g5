const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const useTallers = () => {
    const getCatàleg = async (res) => {
        try {
            const db = getDB();
            const tallers = await db.collection('tallers').find().toArray();
            res.status(200).json(tallers);
        } catch (error) {
            res.status(500).json({ error: "Error en obtenir el catàleg" });
        }
    };

    const createTaller = async (req, res) => {
        try {
            const db = getDB();
            const result = await db.collection('tallers').insertOne(req.body);
            res.status(201).json({ ...req.body, _id: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: "Error al crear taller" });
        }
    };

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
            res.status(200).json({ _id: id, ...dades });
        } catch (error) {
            res.status(500).json({ error: "Error al modificar" });
        }
    };

    const deleteTaller = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            await db.collection('tallers').deleteOne({ _id: new ObjectId(id) });
            res.status(200).json({ missatge: "Taller eliminat" });
        } catch (error) {
            res.status(500).json({ error: "Error al esborrar" });
        }
    };

    return { getCatàleg, createTaller, updateTaller, deleteTaller };
};

module.exports = { useTallers };