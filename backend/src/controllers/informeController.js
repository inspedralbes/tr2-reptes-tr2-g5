const { getDB } = require('../config/db');

const useInformes = () => {
    const generarInforme = async (req, res) => {
        try {
            const db = getDB();
            const tallers = await db.collection('tallers').find().toArray();
            const peticions = await db.collection('peticions').find().toArray();

            // Funció per sumar alumnes d'un taller segons les peticions
            const getAlumnesTaller = (tallerId) => {
                return peticions
                    .filter(p => String(p.seleccio_tallers?.taller_id) === String(tallerId))
                    .reduce((acc, p) => acc + (Number(p.seleccio_tallers?.num_alumnes) || 0), 0);
            };

            // Calculem totals per l'ocupació global
            const totalInscrits = tallers.reduce((acc, t) => acc + getAlumnesTaller(t._id), 0);
            const totalPlacesDisponibles = tallers.reduce((acc, t) => acc + (Number(t.places) || 0), 0);

            // 1. Top 5 tallers (Amb límit 100% visual)
            const top_tallers = tallers.map(t => {
            // 1. Busquem els alumnes (comptant el camp num_alumnes de peticions)
            const alumnes = peticions
                .filter(p => String(p.seleccio_tallers?.taller_id) === String(t._id))
                .reduce((acc, p) => acc + (Number(p.seleccio_tallers?.num_alumnes) || 0), 0);

            // 2. Convertim les places de String a Number
            const capMax = Number(t.places) || 0; 

            // 3. Calculem el percentatge real
            let pRaw = 0;
            if (capMax > 0) {
                pRaw = Math.round((alumnes / capMax) * 100);
            }

            return {
                titol: t.titol,
                alumnes: alumnes,
                places: capMax, // Ara ja no estarà buit al front
                // EL TOPALL: Si pRaw és 313, retornarà 100
                percentatge: Math.min(pRaw, 100) 
            };
        }).sort((a, b) => b.alumnes - a.alumnes).slice(0, 5);

            // 2. Detall per Modalitats (A, B, C)
            const detall_modalitats = ['Modalitat A', 'Modalitat B', 'Modalitat C'].map(nomMod => {
                const tallersDeLaMod = tallers.filter(t => t.modalitat === nomMod);
                const idsTallers = tallersDeLaMod.map(t => String(t._id));
                
                const alumnesDeLaMod = peticions
                    .filter(p => idsTallers.includes(String(p.seleccio_tallers?.taller_id)))
                    .reduce((acc, p) => acc + (Number(p.seleccio_tallers?.num_alumnes) || 0), 0);
                
                const percentatgeMod = totalInscrits > 0 ? Math.round((alumnesDeLaMod / totalInscrits) * 100) : 0;

                return {
                    nom: nomMod,
                    val: alumnesDeLaMod,
                    percent: Math.min(percentatgeMod, 100)
                };
            });

            const nouInforme = {
                fecha: new Date(),
                ocupacion_global: totalPlacesDisponibles > 0 ? Math.min(Math.round((totalInscrits / totalPlacesDisponibles) * 100), 100) : 0,
                detall_modalitats,
                top_tallers
            };

            await db.collection('informes').insertOne(nouInforme);
            res.status(201).json(nouInforme);
        } catch (error) {
            console.error("Error generant informe:", error);
            res.status(500).json({ error: "Error en processar les dades de peticions i tallers" });
        }
    };

    const getUltimInforme = async (req, res) => {
        try {
            const db = getDB();
            const ultim = await db.collection('informes').find().sort({ fecha: -1 }).limit(1).toArray();
            res.status(200).json(ultim[0] || null);
        } catch (error) {
            res.status(500).json({ error: "Error en obtenir l'informe" });
        }
    };

    return { generarInforme, getUltimInforme };
};

module.exports = { useInformes };