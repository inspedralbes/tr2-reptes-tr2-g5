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

    // 2. Crear un taller
    const createTaller = async (req, res) => {
        try {
            const db = getDB();
            
    
            const nouTaller = {
                titol: req.body.titol,
                descripcio: req.body.descripcio,
                durada: req.body.durada,
                modalitat: req.body.modalitat,
                data: req.body.data,
                ubicacio: req.body.ubicacio,
            
                capacitat_maxima: parseInt(req.body.places) || 0,
                places_disponibles: parseInt(req.body.places) || 0
 
            };
            
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

    // 3. Actualitzar un taller
    const updateTaller = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            
           
            const dades = { ...req.body };
            delete dades._id;
            
            // Si estan actualitzant 'places', convertir-lo
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

    // 4. Eliminar un taller
    const deleteTaller = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            await db.collection('tallers').deleteOne({ _id: new ObjectId(id) });
            
            console.log(" Taller eliminat del sistema:", { tallerId: id });
            res.status(200).json({ missatge: "Taller eliminat" });
        } catch (error) {
            console.error("Error al esborrar taller:", error);
            res.status(500).json({ error: "Error al esborrar" });
        }
    };

    return { getCatàleg, createTaller, updateTaller, deleteTaller };
};

module.exports = { useTallers };