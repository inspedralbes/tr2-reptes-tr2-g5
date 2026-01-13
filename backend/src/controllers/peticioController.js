const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const usePeticions = () => {
    // A peticioController.js
const getPeticionsProfessor = async (req, res) => {
    try {
        const db = getDB();
        const { nomProfessor } = req.params; 

        // BUSQUEDA AVANÇADA: Busquem dins de l'array 'referents' el camp 'nom'
        // Això compleix el requisit de "Consultes sobre camps imbricats" (dot notation) 
        const peticions = await db.collection('peticions').find({ 
            "referents.nom": nomProfessor,
            estat: 'ASSIGNAT' 
        }).toArray();

        // Utilitzem promeses per sincronitzar la cerca dels títols dels tallers [cite: 124]
        const promeses = peticions.map(async (p) => {
            const taller = await db.collection('tallers').findOne({ 
                _id: new ObjectId(p.seleccio_tallers.taller_id) 
            });
            return {
                ...p,
                taller_titol: taller ? taller.titol : 'Taller no trobat'
            };
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
            
            const promeses = peticions.map(async (p) => {
                const taller = await db.collection('tallers').findOne({ 
                    _id: new ObjectId(p.seleccio_tallers.taller_id) 
                });
                return {
                    ...p,
                    taller_titol: taller ? taller.titol : 'Taller no trobat'
                };
            });

            const resultat = await Promise.all(promeses);
            res.status(200).json(resultat);
        } catch (error) {
            console.error("Error backend:", error);
            res.status(500).json({ error: "Error en carregar peticions" });
        }
    };

    // CORREGIT: Afegit req per evitar error 500
    const getPeticionsAdmin = async (req, res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions').find().toArray();
            
            const promeses = peticions.map(async (p) => {
                const taller = await db.collection('tallers').findOne({ 
                    _id: new ObjectId(p.seleccio_tallers.taller_id) 
                });
                return {
                    ...p,
                    centreId: { nom: p.nom_centre || 'Centre' },
                    tallerId: { titol: taller ? taller.titol : 'Pendent' },
                    detalls: {
                        coordinador: p.nom_coordinador,
                        alumnes: p.seleccio_tallers?.num_alumnes,
                        referent: p.referent_contacte?.nom,
                        email: p.referent_contacte?.correu,
                        comentari: p.comentari || 'Sense comentaris'
                    }
                };
            });

            const resultat = await Promise.all(promeses);
            res.status(200).json(resultat);
        } catch (error) {
            console.error("Error en getPeticionsAdmin:", error);
            res.status(500).json({ error: "Error admin" });
        }
    };

    // --- FUNCIÓ MODIFICADA AMB VALIDACIÓ D'ALUMNES ---
    const createPeticio = async (req, res) => {
        try {
            const db = getDB();
            const { taller_id, num_alumnes } = req.body.seleccio_tallers;

            // 1. Busquem el taller per comprovar el seu límit
            const taller = await db.collection('tallers').findOne({ 
                _id: new ObjectId(taller_id) 
            });

            // 2. Validació de seguretat al servidor
            if (taller && num_alumnes > taller.max_alumnes) {
                console.log(`⚠️ Intent de petició bloquejat: ${num_alumnes} alumnes superen el límit de ${taller.max_alumnes}`);
                return res.status(400).json({ 
                    error: `El nombre d'alumnes (${num_alumnes}) supera el màxim permès (${taller.max_alumnes}).` 
                });
            }

            // 3. Si tot és correcte, guardem
            const nova = { ...req.body, estat: "PENDENT", data_creacio: new Date() };
            const result = await db.collection('peticions').insertOne(nova);
            
            console.log("📩 Nova petició guardada amb èxit:", result.insertedId);
            res.status(201).json({ id: result.insertedId });
        } catch (error) {
            console.error("Error al crear petició:", error);
            res.status(500).json({ error: "Error al crear la petició" });
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
                { 
                    $set: { 
                        finalitzat: true, 
                        checklist_detalls: checklist,
                        data_finalitzacio: new Date()
                    } 
                }
            );

            res.status(200).json({ missatge: "Taller finalitzat amb èxit" });
        } catch (error) {
            res.status(500).json({ error: "Error al finalitzar el taller" });
        }
    };

    return { 
        getPeticions, 
        getPeticionsAdmin, 
        createPeticio, 
        updateEstat, 
        getPeticionsProfessor,
        finalitzarPeticio 
    };
};

module.exports = { usePeticions };