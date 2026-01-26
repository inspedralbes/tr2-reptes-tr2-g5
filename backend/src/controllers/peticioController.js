const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { transporter } = require('./userController');


const usePeticions = () => {

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
            const pipeline = [];
            if (req.query.estats) {
                const estatsArray = req.query.estats.split(',');
                pipeline.push({
                    $match: { estat: { $in: estatsArray } }
                });
            }

            pipeline.push(
                {
                    $lookup: {
                        from: 'usuaris',
                        localField: 'nom_centre',
                        foreignField: 'nom',
                        as: 'dadesCentre'
                    }
                },
                { $unwind: { path: "$dadesCentre", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        "coordinador.nom": { $ifNull: ["$coordinador.nom", "$dadesCentre.coordinador.nom", "No indicat"] },
                        "coordinador.email": { $ifNull: ["$coordinador.email", "$dadesCentre.coordinador.email", "No indicat"] },

                        taller_busqueda: {
                            $cond: {
                                if: { $gt: ["$tallerId", null] },
                                then: "$tallerId",
                                else: { $toObjectId: "$seleccio_tallers.taller_id" }
                            }
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
                { $unwind: { path: '$tallerInfo', preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        taller_titol: { $ifNull: ["$tallerInfo.titol", "Taller no trobat"] }
                    }
                },
                { $sort: { data_creacio: 1 } }
            );

            const peticions = await db.collection('peticions').aggregate(pipeline).toArray();
            res.status(200).json(peticions);
        } catch (error) {
            res.status(500).json({ error: "Error obtenint peticions" });
        }
    };

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
                nom_centre,
                coordinador: { nom: nom_coordinador, email: correu_coordinador },
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

            if (result.acknowledged && referent_contacte && referent_contacte.correu) {
                transporter.sendMail({
                    from: '"Projecte ENGINY" <martamartahf@gmail.com>',
                    to: referent_contacte.correu,
                    subject: `ADMIN CREAR CREDENCIALES PROFESSOR REFERENT ${referent_contacte.nom.toUpperCase()}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                            <h2 style="color: #333;">Hola ${referent_contacte.nom},</h2>
                            <p>El centre <strong>${nom_centre}</strong> t'ha seleccionat com a <strong>Professor Referent</strong> per a una sol·licitud de taller.</p>
                            <p>Aquest correu és una notificació perquè l'administrador et creï les credencials d'accés.</p>
                            <hr>
                            <p style="font-size: 11px; color: #999;">Projecte ENGINY - Notificació automàtica</p>
                        </div>`
                }).catch(err => console.error("Error enviant mail en segon pla:", err)); // Capturamos error para que no pete el server
            }

            res.status(201).json(result);
        } catch (error) {
            console.error("Error creant petició:", error);
            res.status(500).json({ error: "Error al crear la petició" });
        }
    };

    const updateEstat = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            const { estat, tallerIdDefinitiu, num_alumnes_final } = req.body;

            const updateData = { estat };

            if (estat === 'ASSIGNAT') {
                const tId = new ObjectId(tallerIdDefinitiu);
                const numAlumnes = parseInt(num_alumnes_final);
                const resultUpdate = await db.collection('tallers').updateOne(
                    {
                        _id: tId,
                        $or: [
                            { places_disponibles: { $gte: numAlumnes } },
                            { places_disponibles: null } 
                        ]
                    },
                    {
                        $inc: { places_disponibles: -numAlumnes }
                    }
                );

                if (resultUpdate.matchedCount === 0) {
                    const tallerCheck = await db.collection('tallers').findOne({ _id: tId });
                    if (!tallerCheck) {
                        return res.status(404).json({ error: "Taller no trobat" });
                    } else {
                        return res.status(400).json({
                            error: `No hi ha prou places (Race Condition Avoided). Disponibles: ${tallerCheck.places_disponibles}`
                        });
                    }
                }

                updateData.tallerId = tId;
                updateData["seleccio_tallers.num_alumnes"] = numAlumnes;
                updateData.data_assignacio = new Date();
            }

            await db.collection('peticions').updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: updateData,
                    $push: {
                        historial_estats: {
                            antic: "",
                            nou: estat,
                            data: new Date()
                        }
                    }
                }
            );

            res.status(200).json({ missatge: "Estat actualitzat i places reservades correctament" });
        } catch (error) {
            console.error("Error updateEstat:", error);
            res.status(500).json({ error: "Error en el servidor" });
        }
    };

    const getPeticionsPerCentre = async (req, res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions')
                .find({ nom_centre: req.params.centreNom })
                .toArray();

            for (let peticio of peticions) {
                const tallerId = peticio.tallerId || peticio.seleccio_tallers?.taller_id;

                if (tallerId) {
                    const taller = await db.collection('tallers').findOne({
                        _id: new ObjectId(tallerId)
                    });

                    if (taller) {
                        peticio.taller_titol = taller.titol;
                        peticio.tallerId = taller;
                    }
                }
            }
            res.status(200).json(peticions);
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Error centre" });
        }
    };


    const getPeticionsProfessor = async (req, res) => {
        try {
            const db = getDB();
            const peticions = await db.collection('peticions').aggregate([
                {
                    $match: {
                        $and: [
                            { "referent_contacte.correu": req.params.emailProfessor },
                            { estat: 'ASSIGNAT' }
                        ]
                    }
                },
                { $lookup: { from: 'tallers', localField: 'tallerId', foreignField: '_id', as: 'tallerInfo' } },
                { $unwind: '$tallerInfo' }
            ]).toArray();
            res.status(200).json(peticions);
        } catch (error) { res.status(500).json({ error: "Error professor" }); }
    };

    const getVoluntarisPerTaller = async (req, res) => {
        try {
            const db = getDB();
            const voluntaris = await db.collection('peticions').aggregate([
                { $sort: { data_creacio: 1 } }, 
                {
                    $group: {
                        _id: "$seleccio_tallers.taller_id",
                        candidats: {
                            $push: {
                                nom: "$referent_contacte.nom",
                                correu: "$referent_contacte.correu",
                                centre: "$nom_centre",
                                peticioId: "$_id",
                                createdAt: "$data_creacio" 
                            }
                        }
                    }
                },
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

            res.status(200).json({ missatge: "Petició finalitzada amb èxit" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error en finalitzar la petició" });
        }
    };

    const getEstadistiques = async (req, res) => {
        try {
            const db = getDB();
            const stats = await db.collection('peticions').aggregate([{ $group: { _id: "$estat", total: { $sum: 1 } } }]).toArray();
            res.status(200).json(stats);
        } catch (error) { res.status(500).json({ error: "Error stats" }); }
    };

    const getTallersRepresentantOficial = async (req, res) => {
        try {
            const db = getDB();
            const { emailProfessor } = req.params;
            const tallers = await db.collection('tallers').find({
                "representant_oficial.correu": emailProfessor
            }).toArray();

            res.status(200).json(tallers);
        } catch (error) {
            res.status(500).json({ error: "Error al buscar tallers oficials" });
        }
    };

    const assignarRepresentantOficial = async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params; 
            const { representant_oficial, peticioId } = req.body; 

            await db.collection('tallers').updateOne(
                { _id: new ObjectId(id) },
                { $set: { representant_oficial } }
            );

            await db.collection('peticions').updateMany(
                { "seleccio_tallers.taller_id": id },
                { $set: { es_representant_triat: false } }
            );

            await db.collection('peticions').updateOne(
                { _id: new ObjectId(peticioId) },
                { $set: { es_representant_triat: true } }
            );

            res.status(200).json({ missatge: "Representant assignat correctament" });
        } catch (error) {
            res.status(500).json({ error: "Error en l'assignació" });
        }
    };

    const getSearchByChecklist = async (req, res) => {
        try {
            const db = getDB();
            const { item } = req.params;
            const peticions = await db.collection('peticions').find({
                checklist_detalls: {
                    $elemMatch: {
                        item: { $regex: item, $options: 'i' },
                        fet: true
                    }
                }
            }).toArray();

            res.status(200).json(peticions);
        } catch (error) {
            console.error("Error cerca checklist:", error);
            res.status(500).json({ error: "Error cercant per checklist" });
        }
    };

    return {
        getPeticions, getPeticionsAdmin, getPeticionsPerCentre, getPeticionsProfessor,
        createPeticio, updateEstat, finalitzarPeticio, getEstadistiques,
        getVoluntarisPerTaller, assignarRepresentantOficial, getTallersRepresentantOficial,
        getSearchByChecklist
    };
};

module.exports = { usePeticions };