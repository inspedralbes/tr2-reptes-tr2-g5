const { getDB } = require('../config/db');
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDB();

        console.log("--- INTENT DE LOGIN ---");
        console.log(`Email rebut: [${email}]`);
        console.log(`Password rebut: [${password}]`);

        const user = await db.collection('usuaris').findOne({ email: email });

        if (!user) {
            console.log("❌ ERROR: L'email no existeix a la base de dades");
            return res.status(401).json({ error: "Credencials incorrectes" });
        }

        console.log(`Password a la DB: [${user.password}]`);

        if (user.password !== password) {
            console.log(" ERROR: Les contrasenyes no coincideixen exactament");
            return res.status(401).json({ error: "Credencials incorrectes" });
        }

        console.log(" LOGIN CORRECTE");
        res.status(200).json({
            missatge: "Login correcte",
            usuari: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                rol: user.rol,
                coordinador: user.coordinador
            }
        });

    } catch (error) {
        console.error("Error al login:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

exports.register = async (req, res) => {
    try {
        const db = getDB();
        const { nom, email, password, rol } = req.body;

        if (!nom || !email || !password || !rol) {
            return res.status(400).json({ error: "Tots els camps són obligatoris" });
        }

        const existeix = await db.collection('usuaris').findOne({ email: email });
        if (existeix) {
            return res.status(409).json({ error: "Aquest email ja està registrat" });
        }

        const nouUsuari = {
            nom,
            email,
            password, 
            rol,     
            data_registre: new Date()
        };

        const result = await db.collection('usuaris').insertOne(nouUsuari);
        
        console.log("👤 Nou usuari creat:", { email, rol });

        res.status(201).json({ 
            missatge: "Usuari creat correctament",
            userId: result.insertedId 
        });

    } catch (error) {
        console.error("Error al registrar:", error);
        res.status(500).json({ error: "Error intern al crear usuari" });
    }
};