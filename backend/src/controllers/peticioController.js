const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const usePeticions = () => {
    
    // ... (MANTÉN AQUÍ TUS FUNCIONES ANTIGUAS: getPeticionsPerCentre, getPeticionsProfessor, etc.) ...
    // Copia y pega tus funciones anteriores aquí, no las borres.
    // Solo te pongo las nuevas o modificadas abajo.

    // --- MANTENER TUS FUNCIONES EXISTENTES ---
    const getPeticionsPerCentre = async (req, res) => { /* ... tu código ... */ };
    const getPeticionsProfessor = async (req, res) => { /* ... tu código ... */ };
    const getPeticions = async (req, res) => { /* ... tu código ... */ };
    const getPeticionsAdmin = async (req, res) => { /* ... tu código ... */ };
    const createPeticio = async (req, res) => { /* ... tu código ... */ };
    const updateEstat = async (req, res) => { /* ... tu código ... */ };
    const finalitzarPeticio = async (req, res) => { /* ... tu código ... */ };

    // --- NOVA FUNCIÓ PER A ESTADÍSTIQUES (REPTE AGREGACIONS) ---
    const getEstadistiques = async (req, res) => {
        try {
            const db = getDB();
            
            // Hago una agregación para contar cuantos hay de cada estado
            const stats = await db.collection('peticions').aggregate([
                {
                    $group: {
                        _id: "$estat",      // Agrupo por la columna 'estat' (PENDENT, ASSIGNAT...)
                        total: { $sum: 1 }  // Sumo 1 por cada uno que encuentro
                    }
                }
            ]).toArray();

            // Esto me devolverá algo tipo: [{ _id: "PENDENT", total: 5 }, { _id: "ASSIGNAT", total: 3 }]
            res.status(200).json(stats);
        } catch (error) {
            console.error("Error a estadistiques:", error);
            res.status(500).json({ error: "Error calculant estadístiques" });
        }
    };

    // --- IMPORTANT: AFEGIR-HO AL RETURN ---
    return { 
        getPeticions, 
        getPeticionsAdmin, 
        getPeticionsPerCentre,
        createPeticio, 
        updateEstat,
        getPeticionsProfessor,
        finalitzarPeticio,
        getEstadistiques // <--- AÑADE ESTA LÍNEA AL FINAL
    };
};

module.exports = { usePeticions };