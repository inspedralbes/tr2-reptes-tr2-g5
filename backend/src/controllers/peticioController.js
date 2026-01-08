
const usePeticions = () => {
    const db = getDB();

    const getPeticions = async (res) => {
        try {
            const peticions = await db.collection('peticions').find().toArray();
            res.status(200).json(peticions);
        } catch (error) {
            res.status(500).json({ error: "Error en obtenir el llistat de peticions" });
        }
    };

    // NOVA FUNCIÓ PER GUARDAR
    const createPeticio = async (req, res) => {
        try {
            const novaPeticio = req.body;
            // Afegim l'estat inicial segons el teu esquema
            novaPeticio.estat = {
                data_creacio: new Date(),
                estat_boolean: false
            };
            const result = await db.collection('peticions').insertOne(novaPeticio);
            res.status(201).json({ missatge: "Petició enviada!", id: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: "Error al desar la petició" });
        }
    };

    return { getPeticions, createPeticio };
};