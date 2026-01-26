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


            const nouTaller = {
                ...req.body,  // REQUISIT: Configuracions variables per tipologia (Schemaless permet camps arbitraris com 'materials' o 'requisits' sense canviar l'schema)
                data_creacio: new Date(),
                capacitat_maxima: parseInt(req.body.places) || 0,
                places_disponibles: parseInt(req.body.places) || 0
            };

            if (nouTaller.places) delete nouTaller.places;

            const result = await db.collection('tallers').insertOne(nouTaller);

            console.log("Taller creat correctament:", {
                tallerId: result.insertedId,
                titol: nouTaller.titol,
                capacitat_maxima: nouTaller.capacitat_maxima,
                places_disponibles: nouTaller.places_disponibles
            });

            res.status(201).json({ ...nouTaller, _id: result.insertedId });
        } catch (error) {
            console.error("Error al crear taller:", error);
            res.status(500).json({ error: "Error al crear taller" });
        }
    };

    const updateTaller = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;


            const dades = { ...req.body };
            delete dades._id;
            if (dades.places) {
                dades.capacitat_maxima = parseInt(dades.places);

                delete dades.places;
            }

            await db.collection('tallers').updateOne(
                { _id: new ObjectId(id) },
                { $set: dades }
            );

            console.log(" Taller modificat:", { tallerId: id });
            res.status(200).json({ _id: id, ...dades });
        } catch (error) {
            console.error("Error al modificar taller:", error);
            res.status(500).json({ error: "Error al modificar" });
        }
    };

    const deleteTaller = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            await db.collection('tallers').deleteOne({ _id: new ObjectId(id) });
            const resultPeticions = await db.collection('peticions').deleteMany({
                $or: [
                    { tallerId: new ObjectId(id) },
                    { tallerId: id },
                    { "seleccio_tallers.taller_id": id },
                    { "seleccio_tallers.taller_id": new ObjectId(id) }
                ]
            });

            console.log(`Sistema: Taller ${id} eliminado. Peticiones borradas: ${resultPeticions.deletedCount}`);

            res.status(200).json({
                missatge: "Taller i totes les seves peticions s'han esborrat completament"
            });
        } catch (error) {
            console.error("Error al esborrar taller i peticions:", error);
            res.status(500).json({ error: "Error al esborrar el taller del sistema" });
        }
    };
    return { getCatàleg, createTaller, updateTaller, deleteTaller };
};

module.exports = { useTallers };