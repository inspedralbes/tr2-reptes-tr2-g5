const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const usePeticions = () => {
    const getPeticionsProfessor = async (req, res) => {
        try {
            const db = getDB();
            const { nomProfessor } = req.params; 

            const peticions = await db.collection('peticions').find({ 
                professorId: nomProfessor,
                estat: 'ASSIGNAT' 
            }).toArray();

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
            console.error("Error en peticions professor:", error);
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

    const createPeticio = async (req, res) => {
        try {
            const db = getDB();
            const nova = { ...req.body, estat: "PENDENT", data_creacio: new Date() };
            const result = await db.collection('peticions').insertOne(nova);
            
            console.log("📩 Nova petició rebuda al servidor:", {
                peticioId: result.insertedId,
                centre: req.body.nom_centre,
                tallerId: req.body.seleccio_tallers?.taller_id,
                alumnes: req.body.seleccio_tallers?.num_alumnes,
                estat: "PENDENT"
            });
            
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
            
            console.log("✅ Estat de petició actualitzat:", {
                peticioId: id,
                nouEstat: req.body.estat,
                professor: req.body.professorId || 'Cap'
            });

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

            console.log("🏁 Taller finalitzat pel professor:", { peticioId: id });
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