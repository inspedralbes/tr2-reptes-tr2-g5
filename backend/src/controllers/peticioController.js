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

    // 2. OBTENIR PETICIONS (Admin - Amb JOIN de tallers)
    const getPeticionsAdmin = async (req, res) => {
    try {
        const db = getDB();
        const peticions = await db.collection('peticions').aggregate([
            {
                $lookup: {
                    from: 'tallers',
                    localField: 'seleccio_tallers.taller_id', // El camp on guardes l'ID
                    foreignField: '_id',
                    as: 'tallerInfo' // Ho guardem temporalment aquí
                }
            },
            { $unwind: { path: '$tallerInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    // Creem el camp taller_titol perquè el frontend el trobi
                    taller_titol: '$tallerInfo.titol' 
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
            const db = getDB();
            const { centreNom } = req.params;
            const peticions = await db.collection('peticions')
                .find({ nom_centre: { $regex: `^${centreNom}$`, $options: 'i' } })
                .toArray();

            const promeses = peticions.map(async (p) => {
                let tallerId;
                try {
                    tallerId = new ObjectId(p.seleccio_tallers.taller_id);
                } catch (e) {
                    return { ...p, taller_titol: 'ID de taller no vàlid' };
                }
                const taller = await db.collection('tallers').findOne({ _id: tallerId });
                return { ...p, taller_titol: taller ? taller.titol : 'Taller no trobat' };
            });

            const resultat = await Promise.all(promeses);
            res.status(200).json(resultat);
        } catch (error) {
            console.error("Error a getPeticionsPerCentre:", error);
            res.status(500).json({ error: "Error al carregar les peticions del centre" });
        }
    };

    // 4. OBTENIR PETICIONS PER PROFESSOR
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

    // 5. CREAR PETICIÓ
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

    // 6. ACTUALITZAR ESTAT
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

    // 7. FINALITZAR PETICIÓ
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

    // 8. ESTADÍSTIQUES (NOVA FUNCIÓ PER AL REPTE 2)
    const getEstadistiques = async (req, res) => {
        try {
            const db = getDB();
            
            // Agrupació per estat (Ex: PENDENT: 5, ASSIGNAT: 3)
            const stats = await db.collection('peticions').aggregate([
                {
                    $group: {
                        _id: "$estat",
                        total: { $sum: 1 }
                    }
                }
            ]).toArray();

            res.status(200).json(stats);
        } catch (error) {
            console.error("Error a estadistiques:", error);
            res.status(500).json({ error: "Error calculant estadístiques" });
        }
    };

    // EXPORTEM TOTES LES FUNCIONS (Incloses les estadístiques)
    return { 
        getPeticions, 
        getPeticionsAdmin, 
        getPeticionsPerCentre,
        createPeticio, 
        updateEstat,
        getPeticionsProfessor,
        finalitzarPeticio,
        getEstadistiques 
    };
};

module.exports = { usePeticions };