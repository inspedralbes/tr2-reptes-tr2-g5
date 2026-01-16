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
                // Pas 1: Convertim el String taller_id a ObjectId real
                $addFields: {
                    taller_id_obj: { $toObjectId: "$seleccio_tallers.taller_id" }
                }
            },
            {
                // Pas 2: Ara fem la unió usant l'objecte convertit
                $lookup: {
                    from: 'tallers',
                    localField: 'taller_id_obj',
                    foreignField: '_id',
                    as: 'tallerInfo'
                }
            },
            { $unwind: { path: '$tallerInfo', preserveNullAndEmptyArrays: true } },
            {
                // Pas 3: Passem el títol a la variable que espera el frontend
                $addFields: {
                    taller_titol: '$tallerInfo.titol'
                }
            }
        ]).toArray();
        res.status(200).json(peticions);
    } catch (error) {
        console.error("Error a getPeticionsAdmin:", error);
        res.status(500).json({ error: "Error admin" });
    }
};

    // 3. OBTENIR PETICIONS PER CENTRE (Versió optimitzada)
const getPeticionsPerCentre = async (req, res) => {
    try {
        const db = getDB();
        let { centreNom } = req.params;
        
        // 1. Decodifiquem i netegem espais en blanc extrems
        const nomNetejat = decodeURIComponent(centreNom).trim();

        // 2. Busquem a la base de dades
        const peticions = await db.collection('peticions')
            .find({ nom_centre: { $regex: `^${nomNetejat}$`, $options: 'i' } })
            .toArray();

        if (peticions.length === 0) {
            return res.status(200).json([]); // Tornem array buit si no n'hi ha cap
        }

        // 3. Afegim el títol del taller a cada petició
        const resultat = await Promise.all(peticions.map(async (p) => {
            try {
                const taller = await db.collection('tallers').findOne({ 
                    _id: new ObjectId(p.seleccio_tallers.taller_id) 
                });
                return { 
                    ...p, 
                    taller_titol: taller ? taller.titol : 'Taller no trobat' 
                };
            } catch (e) {
                return { ...p, taller_titol: 'Error en ID de taller' };
            }
        }));

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
   // 5. CREAR PETICIÓ (Amb gestió de places compartides)
const createPeticio = async (req, res) => {
    try {
        const db = getDB();
        const { seleccio_tallers } = req.body; 
        
        // A. Busquem el taller a la base de dades per saber quantes places totals té
        const tallerInfo = await db.collection('tallers').findOne({ 
            _id: new ObjectId(seleccio_tallers.taller_id) 
        });

        if (!tallerInfo) {
            return res.status(404).json({ error: "Taller no trobat." });
        }

        // B. Sumem els alumnes de les peticions que ja estan PENDENTS o ASSIGNADES
        const peticionsExistents = await db.collection('peticions').find({
            "seleccio_tallers.taller_id": seleccio_tallers.taller_id,
            estat: { $in: ['PENDENT', 'ASSIGNAT'] }
        }).toArray();

        const alumnesOcupats = peticionsExistents.reduce((total, p) => {
            return total + (p.seleccio_tallers.num_alumnes || 0);
        }, 0);

        // C. Calculem si hi ha espai suficient
        const placesLliures = tallerInfo.places - alumnesOcupats;

        if (seleccio_tallers.num_alumnes > placesLliures) {
            return res.status(400).json({ 
                error: `Ho sentim, només queden ${placesLliures} places lliures en aquest taller.` 
            });
        }

        // D. Si hi ha lloc, creem la petició
        const novaPeticio = { 
            ...req.body, 
            data_creacio: new Date(), 
            estat: 'PENDENT' 
        };
        const result = await db.collection('peticions').insertOne(novaPeticio);
        
        res.status(201).json({ id: result.insertedId });
    } catch (error) {
        console.error("Error createPeticio:", error);
        res.status(500).json({ error: "Error al crear la petició" });
    }
};

    // 6. ACTUALITZAR ESTAT
    const updateEstat = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { estat, professorId, tallerIdDefinitiu } = req.body;

        // Preparem l'objecte d'actualització
        let updateData = { estat: estat };

        // Si l'admin aprova (ASSIGNAT), guardem el professor i confirmem el taller
        if (estat === 'ASSIGNAT') {
            updateData.professorId = professorId;
            if (tallerIdDefinitiu) {
                updateData["seleccio_tallers.taller_id"] = tallerIdDefinitiu;
            }
        }

        await db.collection('peticions').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.status(200).json({ missatge: "Estat actualitzat correctament" });
    } catch (error) {
        res.status(500).json({ error: "Error en l'actualització" });
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