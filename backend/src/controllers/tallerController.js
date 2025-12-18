const { getDB } = require('../config/db'); //utilitzem la base de dades de config

const useTallers = () => { // declarem aquesta funció que connecta amb la bd 
    const db = getDB();

    const getCatàleg = async (res) => {
        try { //aquí busquem el cataleg de tallers a la bd
            const tallers = await db.collection('tallers').find().toArray();
            res.status(200).json(tallers);
        } catch (error) {
            res.status(500).json({ error: "Error en obtenir el catàleg de tallers" });
        }
    };

    return { getCatàleg };
};

module.exports = { useTallers };