const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const usePeticions = () => {
    
    // 1. OBTENIR PETICIONS (General)
    const getPeticions = async (req, res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions').find().toArray();
            res.status(200).json(peticions);
        } catch (error) {
            res.status(500).json({ error: "Error" });
        }
    };

    // OBTENIR PETICIONS (Admin)
const getPeticionsAdmin = async (req, res) => {
    try {
        const db = getDB();
        const peticions = await db.collection('peticions').aggregate([
            {
                $addFields: {
                    // Si ja està assignat usa tallerId, si no usa el del formulari
                    taller_busqueda: { $ifNull: ["$tallerId", { $toObjectId: "$seleccio_tallers.taller_id" }] }
                }
            },
            {
                $lookup: {
                    from: 'tallers',
                    localField: 'taller_busqueda',
                    foreignField: '_id',
                    as: 'tallerInfo'
                }
            },
            { $unwind: { path: '$tallerInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    taller_titol: '$tallerInfo.titol' // Això garanteix que el nom surti sempre
                }
            }
        ]).toArray();
        res.status(200).json(peticions);
    } catch (error) {
        res.status(500).json({ error: "Error admin" });
    }
};

    // 3. OBTENIR PETICIONS PER CENTRE
   const getPeticionsPerCentre = async (req, res) => {
    try {
        const { centreNom } = req.params;
        const db = getDB();
        
        // Fem servir aggregate per poder fer el JOIN amb la col·lecció de tallers
        const peticions = await db.collection('peticions').aggregate([
            { 
                $match: { nom_centre: centreNom } 
            },
            {
                $addFields: {
                    // Busquem l'ID del taller ja sigui a la selecció inicial o a l'assignació definitiva
                    taller_busqueda: { 
                        $ifNull: [
                            "$tallerId", 
                            { $toObjectId: "$seleccio_tallers.taller_id" }
                        ] 
                    }
                }
            },
            {
                $lookup: {
                    from: 'tallers',
                    localField: 'taller_busqueda',
                    foreignField: '_id',
                    as: 'tallerInfo'
                }
            },
            { 
                $unwind: { path: '$tallerInfo', preserveNullAndEmptyArrays: true } 
            },
            {
                $addFields: {
                    // Creem el camp taller_titol que el frontend ja està buscant
                    taller_titol: '$tallerInfo.titol'
                }
            }
        ]).toArray();

        res.status(200).json(peticions);
    } catch (error) {
        console.error("Error centres:", error);
        res.status(500).json({ error: "Error al carregar peticions del centre" });
    }
};

    // 4. CREAR PETICIÓ
    const createPeticio = async (req, res) => {
        try {
            const db = getDB();
            const novaPeticio = {
                ...req.body,
                estat: 'PENDENT',
                data_creacio: new Date(),
                finalitzat: false
            };
            const result = await db.collection('peticions').insertOne(novaPeticio);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: "Error creant" });
        }
    };

    // 5. ACTUALITZAR ESTAT (Assignar taller/professor)
    const updateEstat = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            const { estat, professorId, tallerId, data_assignada } = req.body;
            
            const updateData = { estat };
            if (professorId) updateData.professorId = professorId;
            if (tallerId) updateData.tallerId = new ObjectId(tallerId);
            if (data_assignada) updateData.data_assignada = data_assignada;

            await db.collection('peticions').updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            res.status(200).json({ missatge: "Actualitzat" });
        } catch (error) {
            res.status(500).json({ error: "Error update" });
        }
    };

    // 6. OBTENIR PETICIONS PER PROFESSOR (La que fallava)
   const getPeticionsProfessor = async (req, res) => {
    try {
        const { identifier } = req.params; // Rebem el correu
        const db = getDB();
        const peticions = await db.collection('peticions').aggregate([
            { $match: { professorId: identifier } }, // Filtra per email
            {
                $addFields: {
                    taller_busqueda: { $ifNull: ["$tallerId", { $toObjectId: "$seleccio_tallers.taller_id" }] }
                }
            },
            {
                $lookup: {
                    from: 'tallers',
                    localField: 'taller_busqueda',
                    foreignField: '_id',
                    as: 'tallerInfo'
                }
            },
            { $unwind: { path: '$tallerInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    taller_titol: '$tallerInfo.titol'
                }
            }
        ]).toArray();
        res.status(200).json(peticions);
    } catch (error) {
        res.status(500).json({ error: "Error professor" });
    }
};

// NOU: Assignar el representant triat per l'admin al document del Taller
const assignarRepresentantOficial = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params; // ID del taller
        const { representant_oficial } = req.body; // { nom, correu }

        await db.collection('tallers').updateOne(
            { _id: new ObjectId(id) },
            { $set: { representant_oficial: representant_oficial } }
        );
        res.status(200).json({ missatge: "Representant assignat correctament al taller" });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar el representant oficial" });
    }
};

// OBTENIR VOLUNTARIS PER TALLER
// OBTENIR VOLUNTARIS PER TALLER (Dins de usePeticions)
const getVoluntarisPerTaller = async (req, res) => {
    try {
        const db = getDB();
        const voluntaris = await db.collection('peticions').aggregate([
            {
                $group: {
                    // Agrupem pel camp que arriba del formulari
                    _id: "$seleccio_tallers.taller_id", 
                    candidats: {
                        $push: {
                            nom: "$referent_contacte.nom",
                            correu: "$referent_contacte.correu",
                            centre: "$nom_centre",
                            peticioId: "$_id"
                        }
                    }
                }
            },
            {
                // PAS CLAU: Convertim l'ID de text a ObjectId per poder trobar el taller
                $addFields: {
                    taller_obj_id: { $toObjectId: "$_id" }
                }
            },
            {
                $lookup: {
                    from: 'tallers',
                    localField: 'taller_obj_id',
                    foreignField: '_id',
                    as: 'infoTaller'
                }
            },
            { $unwind: "$infoTaller" },
            {
                $project: {
                    taller_titol: "$infoTaller.titol",
                    candidats: 1
                }
            }
        ]).toArray();
        res.status(200).json(voluntaris);
    } catch (error) {
        console.error("Error al llistar voluntaris:", error);
        res.status(500).json({ error: "Error al llistar voluntaris" });
    }
};

    // 7. FINALITZAR TALLER
    const finalitzarPeticio = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            const { checklist } = req.body;
            await db.collection('peticions').updateOne(
                { _id: new ObjectId(id) },
                { $set: { finalitzat: true, checklist_detalls: checklist, data_finalitzacio: new Date() } }
            );
            res.status(200).json({ missatge: "Taller finalitzat" });
        } catch (error) {
            res.status(500).json({ error: "Error al finalitzar" });
        }
    };

    // 8. ESTADÍSTIQUES
    const getEstadistiques = async (req, res) => {
        try {
            const db = getDB();
            const stats = await db.collection('peticions').aggregate([
                { $group: { _id: "$estat", total: { $sum: 1 } } }
            ]).toArray();
            res.status(200).json(stats);
        } catch (error) {
            res.status(500).json({ error: "Error stats" });
        }
    };

    return { 
        getPeticions, 
        getPeticionsAdmin, 
        getPeticionsPerCentre,
        getPeticionsProfessor,
        createPeticio, 
        updateEstat,
        finalitzarPeticio,
        getEstadistiques,
        getVoluntarisPerTaller
        
    };
};

module.exports = { usePeticions };