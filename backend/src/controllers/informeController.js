const { getDB } = require('../config/db');

const useInformes = () => {
    const getEstadistiquesReals = async (req, res) => {
        try {
            const db = getDB();
            const { ObjectId } = require('mongodb');

            // REQUISIT: Agregació amb Pipeline ($group, $project, $sort). ESPECÍFIC: Ocupació per zones
            const statsOcupacio = await db.collection('tallers').aggregate([
                {
                    $group: {
                        _id: "$zona",
                        totalPlaces: { $sum: "$capacitat_maxima" },
                        totalDisponibles: { $sum: "$places_disponibles" }
                    }
                },
                {
                    $project: {
                        zona: { $ifNull: ["$_id", "Sense Zona"] },
                        places_totals: "$totalPlaces",
                        places_ocupades: { $subtract: ["$totalPlaces", "$totalDisponibles"] },
                        percentatge_ocupacio: {
                            $cond: [
                                { $eq: ["$totalPlaces", 0] },
                                0,
                                { $multiply: [{ $divide: [{ $subtract: ["$totalPlaces", "$totalDisponibles"] }, "$totalPlaces"] }, 100] }
                            ]
                        }
                    }
                },
                { $sort: { percentatge_ocupacio: -1 } }
            ]).toArray();

            const globalPlaces = statsOcupacio.reduce((acc, z) => acc + z.places_totals, 0);
            const globalOcupades = statsOcupacio.reduce((acc, z) => acc + z.places_ocupades, 0);
            const ocupacio_global = globalPlaces > 0 ? Math.round((globalOcupades / globalPlaces) * 100) : 0;
            // REQUISIT: Agregació amb Pipeline ($match, $group, $project, $sort). ESPECÍFIC: Tallers més demandats per categoria
            const statsModalitats = await db.collection('peticions').aggregate([
                { $match: { estat: { $in: ['PENDENT', 'ASSIGNAT', 'FINALITZAT'] } } },
                { $addFields: { tallerObjId: { $toObjectId: "$seleccio_tallers.taller_id" } } },
                {
                    $lookup: {
                        from: 'tallers',
                        localField: 'tallerObjId',
                        foreignField: '_id',
                        as: 'tallerInfo'
                    }
                },
                { $unwind: "$tallerInfo" },
                {
                    $group: {
                        _id: "$tallerInfo.modalitat",
                        totalAlumnes: { $sum: "$seleccio_tallers.num_alumnes" },
                        totalPeticions: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        nom: { $ifNull: ["$_id", "Altres"] },
                        val: "$totalAlumnes",
                        peticions: "$totalPeticions",
                        _id: 0
                    }
                },
                { $sort: { val: -1 } }
            ]).toArray();

            const top_tallers = await db.collection('peticions').aggregate([
                { $match: { estat: { $ne: 'REBUTJAT' } } },
                { $addFields: { tallerObjId: { $toObjectId: "$seleccio_tallers.taller_id" } } },
                {
                    $lookup: {
                        from: 'tallers',
                        localField: 'tallerObjId',
                        foreignField: '_id',
                        as: 'tallerInfo'
                    }
                },
                { $unwind: "$tallerInfo" },
                {
                    $group: {
                        _id: "$tallerInfo.titol",
                        inscrits: { $sum: "$seleccio_tallers.num_alumnes" }
                    }
                },
                { $sort: { inscrits: -1 } },
                { $limit: 5 },
                { $project: { titol: "$_id", inscrits: 1, _id: 0 } }
            ]).toArray();

            const total_peticions = await db.collection('peticions').countDocuments();

            res.status(200).json({
                fecha: new Date(),
                ocupacio_global,
                ocupacio_per_zona: statsOcupacio,
                detall_modalitats: statsModalitats,
                top_tallers,
                total_peticions
            });

        } catch (error) {
            console.error("Error estadístiques:", error);
            res.status(500).json({ error: "Error al calcular estadístiques" });
        }
    };

    return { getEstadistiquesReals };
};

module.exports = { useInformes };