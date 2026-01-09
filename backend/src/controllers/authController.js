const { getDB } = require('../config/db');

// 1. INICIAR SESSIÓ (LOGIN)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDB();

        // Buscar usuario por email
        const user = await db.collection('usuaris').findOne({ email: email });

        // Verificación simple (Para producción usar bcrypt)
        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Credencials incorrectes" });
        }

        // Devolver datos del usuario y su ROL
        res.status(200).json({
            missatge: "Login correcte",
            usuari: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                rol: user.rol // 'admin', 'centre', 'professor'
            }
        });

    } catch (error) {
        console.error("Error al login:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// 2. REGISTRAR USUARI (REGISTER)
exports.register = async (req, res) => {
    try {
        const db = getDB();
        const { nom, email, password, rol } = req.body;

        // Validaciones básicas
        if (!nom || !email || !password || !rol) {
            return res.status(400).json({ error: "Tots els camps són obligatoris" });
        }

        // Comprobar si el usuario ya existe
        const existeix = await db.collection('usuaris').findOne({ email: email });
        if (existeix) {
            return res.status(409).json({ error: "Aquest email ja està registrat" });
        }

        // Crear objeto usuario
        const nouUsuari = {
            nom,
            email,
            password, 
            rol,     
            data_registre: new Date()
        };

        // Guardar en MongoDB
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