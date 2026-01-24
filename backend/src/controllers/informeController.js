const { getDB } = require('../config/db');

const useInformes = () => {
    const getEstadistiquesReals = async (req, res) => {
        try {
            const db = getDB();
            const tallers = await db.collection('tallers').find().toArray();
            const peticions = await db.collection('peticions').find({ estat: 'ASSIGNAT' }).toArray();

            // 1. Càlcul d'ocupació global
            const totalPlacesInicials = tallers.reduce((acc, t) => acc + (Number(t.places_totals) || 20), 0);
            const alumnesInscrits = peticions.reduce((acc, p) => acc + (Number(p.seleccio_tallers?.num_alumnes) || 0), 0);
            
            const ocupacio_global = totalPlacesInicials > 0 
                ? Math.round((alumnesInscrits / totalPlacesInicials) * 100) 
                : 0;

            // 2. Detall per Modalitats (Xerrada, Taller, Visita...)
            const modalitats = [...new Set(tallers.map(t => t.modalitat))];
            const detall_modalitats = modalitats.map(mod => {
                const tallersMod = tallers.filter(t => t.modalitat === mod);
                const idsMod = tallersMod.map(t => String(t._id));
                
                const inscritsMod = peticions
                    .filter(p => idsMod.includes(String(p.seleccio_tallers?.taller_id)))
                    .reduce((acc, p) => acc + (Number(p.seleccio_tallers?.num_alumnes) || 0), 0);

                return {
                    nom: mod || 'Altres',
                    val: inscritsMod
                };
            });

            // 3. Top 5 Tallers amb més èxit
            const top_tallers = tallers.map(t => {
                const inscrits = peticions
                    .filter(p => String(p.seleccio_tallers?.taller_id) === String(t._id))
                    .reduce((acc, p) => acc + (Number(p.seleccio_tallers?.num_alumnes) || 0), 0);
                return {
                    titol: t.titol,
                    inscrits: inscrits
                };
            })
            .sort((a, b) => b.inscrits - a.inscrits)
            .slice(0, 5);

            res.status(200).json({
                fecha: new Date(),
                ocupacio_global,
                detall_modalitats,
                top_tallers,
                total_peticions: peticions.length
            });
        } catch (error) {
            console.error("Error estadístiques:", error);
            res.status(500).json({ error: "Error al calcular estadístiques" });
        }
    };

    return { getEstadistiquesReals };
};

module.exports = { useInformes };