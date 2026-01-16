const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const usePeticions = () => {
    
    // 1. NOVA FUNCIÓ PER A CENTRES (Dins de usePeticions)
    const getPeticionsPerCentre = async (req, res) => {
        try {
            const db = getDB();
            const { centreNom } = req.params;

            // Busquem peticions que coincideixin amb el nom del centre (ignorant majúscules)
            const peticions = await db.collection('peticions')
                .find({ nom_centre: { $regex: `^${centreNom}$`, $options: 'i' } })
                .toArray();

            // Enllaçar amb els títols dels tallers
            const promeses = peticions.map(async (p) => {
                let tallerId;
                try {
                    tallerId = new ObjectId(p.seleccio_tallers.taller_id);
                } catch (e) {
                    return { ...p, taller_titol: 'ID de taller no vàlid' };
                }

                const taller = await db.collection('tallers').findOne({ _id: tallerId });
                return {
                    ...p,
                    taller_titol: taller ? taller.titol : 'Taller no trobat'
                };
            });

            const resultat = await Promise.all(promeses);
            res.status(200).json(resultat);
        } catch (error) {
            console.error("Error a getPeticionsPerCentre:", error);
            res.status(500).json({ error: "Error al carregar les peticions del centre" });
        }
    };

    const getPeticionsProfessor = async (req, res) => {
        try {
            const db = getDB();
            const { nomProfessor } = req.params; 
            const peticions = await db.collection('peticions').find({ 
                "referents.nom": nomProfessor,
                estat: 'ASSIGNAT' 
            }).toArray();

            const promeses = peticions.map(async (p) => {
                const taller = await db.collection('tallers').findOne({ 
                    _id: new ObjectId(p.seleccio_tallers.taller_id) 
                });
                return { ...p, taller_titol: taller ? taller.titol : 'Taller no trobat' };
            });

            const resultat = await Promise.all(promeses);
            res.status(200).json(resultat);
        } catch (error) {
            res.status(500).json({ error: "Error en carregar tallers del professor" });
        }
    };

    const getPeticions = async (req, res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions').find().toArray();
            res.status(200).json(peticions);
        } catch (error) {
            res.status(500).json({ error: "Error" });
        }
    };

    const getPeticionsAdmin = async (req, res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions').aggregate([
                {
                    $lookup: {
                        from: 'tallers',
                        localField: 'seleccio_tallers.taller_id',
                        foreignField: '_id',
                        as: 'tallerId'
                    }
                },
                { $unwind: { path: '$tallerId', preserveNullAndEmptyArrays: true } }
            ]).toArray();
            res.status(200).json(peticions);
        } catch (error) {
            res.status(500).json({ error: "Error admin" });
        }
    };

    const createPeticio = async (req, res) => {
        try {
            const db = getDB();
            const novaPeticio = { ...req.body, data_creacio: new Date(), estat: 'PENDENT' };
            const result = await db.collection('peticions').insertOne(novaPeticio);
            res.status(201).json({ id: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: "Error al crear" });
        }
    };

    const updateEstat = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            await db.collection('peticions').updateOne(
                { _id: new ObjectId(id) },
                { $set: { estat: req.body.estat, professorId: req.body.professorId } }
            );
            res.status(200).json({ missatge: "Fet" });
        } catch (error) {
            res.status(500).json({ error: "Error" });
        }
    };

    const finalitzarPeticio = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            const { checklist } = req.body;
            await db.collection('peticions').updateOne(
                { _id: new ObjectId(id) },
                { $set: { finalitzat: true, checklist_detalls: checklist, data_finalitzacio: new Date() } }
            );
            res.status(200).json({ missatge: "Taller finalitzat amb èxit" });
        } catch (error) {
            res.status(500).json({ error: "Error al finalitzar" });
        }
    };

    // EXPORTEM TOTES LES FUNCIONS INCLOENT LA NOVA
    return { 
        getPeticions, 
        getPeticionsAdmin, 
        getPeticionsPerCentre,
        createPeticio, 
        updateEstat,
        getPeticionsProfessor,
        finalitzarPeticio
    };
};

module.exports = { usePeticions };