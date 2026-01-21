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

    // 2. OBTENIR PETICIONS (Admin)
    const getPeticionsAdmin = async (req, res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions').aggregate([
                { $addFields: { taller_busqueda: { $ifNull: ["$tallerId", { $toObjectId: "$seleccio_tallers.taller_id" }] } } },
                { $lookup: { from: 'tallers', localField: 'taller_busqueda', foreignField: '_id', as: 'tallerInfo' } },
                { $unwind: { path: '$tallerInfo', preserveNullAndEmptyArrays: true } },
                { $addFields: { taller_titol: '$tallerInfo.titol' } }
            ]).toArray();
            res.status(200).json(peticions);
        } catch (error) {
            res.status(500).json({ error: "Error admin" });
        }
    };

    // 3. CREAR PETICIÓ
    const createPeticio = async (req, res) => {
    try {
        const db = getDB();
        const { 
            nom_centre, 
            nom_coordinador, 
            correu_coordinador,
            seleccio_tallers, 
            nivell_interes, 
            referent_contacte, 
            comentaris 
        } = req.body;

        const novaPeticio = {
            nom_centre: nom_centre,
            // Guardamos el coordinador como un objeto para que coincida con tu esquema de usuarios
            coordinador: {
                nom: nom_coordinador,
                email: correu_coordinador,
            },
            seleccio_tallers: {
                taller_id: seleccio_tallers.taller_id,
                num_alumnes: parseInt(seleccio_tallers.num_alumnes)
            },
            nivell_interes,
            referent_contacte,
            comentaris,
            estat: 'PENDENT',
            data_creacio: new Date(),
            finalitzat: false
        };

        const result = await db.collection('peticions').insertOne(novaPeticio);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creant petició:", error);
        res.status(500).json({ error: "Error al crear la petició" });
    }
};

    // 4. ACTUALITZAR ESTAT
    const updateEstat = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            const { estat, tallerId } = req.body;
            const updateData = { estat };
            if (tallerId) updateData.tallerId = new ObjectId(tallerId);
            await db.collection('peticions').updateOne({ _id: new ObjectId(id) }, { $set: updateData });
            res.status(200).json({ missatge: "Estat actualitzat" });
        } catch (error) {
            res.status(500).json({ error: "Error update" });
        }
    };

    // 5. PETICIONS PER CENTRE / PROFESSOR
    const getPeticionsPerCentre = async (req, res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions').find({ nom_centre: req.params.centreNom }).toArray();
            res.status(200).json(peticions);
        } catch (error) { res.status(500).json({ error: "Error centre" }); }
    };

    const getPeticionsProfessor = async (req, res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions').aggregate([
                { $match: { "referent_contacte.correu": req.params.emailProfessor, estat: 'ASSIGNAT' } },
                { $lookup: { from: 'tallers', localField: 'tallerId', foreignField: '_id', as: 'tallerInfo' } },
                { $unwind: '$tallerInfo' }
            ]).toArray();
            res.status(200).json(peticions);
        } catch (error) { res.status(500).json({ error: "Error professor" }); }
    };

    // 6. VOLUNTARIS PER TALLER (La que et fallava)
    const getVoluntarisPerTaller = async (req, res) => {
        try {
            const db = getDB();
            const voluntaris = await db.collection('peticions').aggregate([
                { $group: { _id: "$seleccio_tallers.taller_id", candidats: { $push: { nom: "$referent_contacte.nom", correu: "$referent_contacte.correu", centre: "$nom_centre", peticioId: "$_id" } } } },
                { $addFields: { taller_obj_id: { $toObjectId: "$_id" } } },
                { $lookup: { from: 'tallers', localField: 'taller_obj_id', foreignField: '_id', as: 'infoTaller' } },
                { $unwind: "$infoTaller" },
                { $project: { taller_titol: "$infoTaller.titol", representant_actual: "$infoTaller.representant_oficial", candidats: 1 } }
            ]).toArray();
            res.status(200).json(voluntaris);
        } catch (error) {
            res.status(500).json({ error: "Error voluntaris" });
        }
    };

    // 7. FINALITZAR TALLER
    const finalitzarPeticio = async (req, res) => {
        try {
            const db = getDB();
            await db.collection('peticions').updateOne({ _id: new ObjectId(req.params.id) }, { $set: { finalitzat: true, checklist_detalls: req.body.checklist, data_finalitzacio: new Date() } });
            res.status(200).json({ missatge: "Taller finalitzat" });
        } catch (error) { res.status(500).json({ error: "Error finalitzar" }); }
    };

    // 8. ESTADÍSTIQUES
    const getEstadistiques = async (req, res) => {
        try {
            const db = getDB();
            const stats = await db.collection('peticions').aggregate([{ $group: { _id: "$estat", total: { $sum: 1 } } }]).toArray();
            res.status(200).json(stats);
        } catch (error) { res.status(500).json({ error: "Error stats" }); }
    };

    // 9. TALLERS REPRESENTANT
   // Afegeix/Verifica aquesta funció dins de usePeticions
const getTallersRepresentantOficial = async (req, res) => {
    try {
        const db = getDB();
        const { emailProfessor } = req.params;
        
        // Busquem a la col·lecció 'tallers' on el representant oficial sigui ell
        const tallers = await db.collection('tallers').find({
            "representant_oficial.correu": emailProfessor
        }).toArray();
        
        res.status(200).json(tallers);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar tallers oficials" });
    }
};

    // 10. ASSIGNAR REPRESENTANT
    const assignarRepresentantOficial = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params; // ID del Taller
        const { representant_oficial, peticioId } = req.body; // Rebem també l'ID de la petició

        // 1. Marquem el representant al Taller (General)
        await db.collection('tallers').updateOne(
            { _id: new ObjectId(id) },
            { $set: { representant_oficial } }
        );

        // 2. Opcional: Si vols marcar la petició concreta com a "guanyadora"
        // Primer desmarquem qualsevol altre representant d'aquest taller a les peticions
        await db.collection('peticions').updateMany(
            { "seleccio_tallers.taller_id": id },
            { $set: { es_representant_triat: false } }
        );

        // Ara marquem la petició seleccionada
        await db.collection('peticions').updateOne(
            { _id: new ObjectId(peticioId) },
            { $set: { es_representant_triat: true } }
        );

        res.status(200).json({ missatge: "Representant assignat correctament" });
    } catch (error) {
        res.status(500).json({ error: "Error en l'assignació" });
    }
};

    return { 
        getPeticions, getPeticionsAdmin, getPeticionsPerCentre, getPeticionsProfessor,
        createPeticio, updateEstat, finalitzarPeticio, getEstadistiques,
        getVoluntarisPerTaller, assignarRepresentantOficial, getTallersRepresentantOficial
    };
};

module.exports = { usePeticions };