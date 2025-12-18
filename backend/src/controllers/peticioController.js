const { getDB } = require('../config/db'); //utilitzem la base de dades de config

const usePeticions = () => { // declarem aquesta funció que connecta amb la bd 
    const db = getDB();

    const getPeticions = async (res) => {
        try { //aquí busquem les peticions de tallers a la bd
            const peticions = await db.collection('peticions').find().toArray();
            res.status(200).json(peticions);
        } catch (error) {
            res.status(500).json({ error: "Error en obtenir el llistat de peticions" });
        }
    };

    return { getPeticions };
};

module.exports = { usePeticions };