const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto'); // MOGUT AQUÍ DALT (MOLT IMPORTANT)
const nodemailer = require('nodemailer'); // 1. AFEGIR AIXÒ

// CONFIGURACIÓN DE CORREO (Asegúrate de poner tu clave de 16 letras)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'martamartahf@gmail.com', // PONER EMAIL REAL
        pass: 'zvol wsbs kljw zvqs ' // // SE TIENE Q VERIFICAR LA CUENTA DE GMAIL Y GENERAR CONTRASEÑA
    }
});
// LLISTAR USUARIS
const getUsers = async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection('usuaris').find({}, { projection: { password: 0 } }).toArray();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtenir usuaris" });
    }
};

// CREAR USUARI (ADMIN)
const createUser = async (req, res) => {
    try {
        const db = getDB();
        const { nom, email, password, rol } = req.body;

        if (!nom || !email || !password || !rol) {
            return res.status(400).json({ error: "Falten camps obligatoris" });
        }

        const existeix = await db.collection('usuaris').findOne({ email });
        if (existeix) {
            return res.status(409).json({ error: "L'email ja existeix" });
        }

        const nouUsuari = {
            nom,
            email,
            password,
            rol,
            data_registre: new Date()
        };

        const result = await db.collection('usuaris').insertOne(nouUsuari);
        res.status(201).json({ missatge: "Usuari creat", id: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear usuari" });
    }
};

// ACTUALITZAR USUARI
const updateUser = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { nom, email, rol, password } = req.body;

        const updates = { nom, email, rol };
        if (password && password.trim() !== "") {
            updates.password = password;
        }

        await db.collection('usuaris').updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        res.status(200).json({ missatge: "Usuari actualitzat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualitzar usuari" });
    }
};

// ELIMINAR USUARI
const deleteUser = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        // Comprobar si l'usuari és admin abans d'esborrar
        const userToDelete = await db.collection('usuaris').findOne({ _id: new ObjectId(id) });

        if (!userToDelete) {
            return res.status(404).json({ error: "Usuari no trobat" });
        }

        // --- SEGURETAT FETA SIMPLE ---
        // Recuperem qui està fent la petició des del Header que hem enviat al Frontend
        const requesterEmail = req.headers['x-user-email'];

        // 1. NINGÚ pot esborrar al 'admin@admin.com'
        if (userToDelete.email === 'admin@admin.com') {
            return res.status(403).json({ error: "No es pot eliminar el Admin Principal" });
        }

        // 2. Si l'usuari a esborrar és ADMIN
        if (userToDelete.rol === 'admin') {
            // Nomes el 'admin@admin.com' pot esborrar altres admins
            if (requesterEmail !== 'admin@admin.com') {
                return res.status(403).json({ error: "No tens permisos per eliminar un administrador" });
            }
        }

        // Si passa els filtres, esborrem

        await db.collection('usuaris').deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ missatge: "Usuari eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar usuari" });
    }
};

// OBTENIR PROFESSORS
const getProfessors = async (req, res) => {
    try {
        const db = getDB();
        const professors = await db.collection('usuaris')
            .find({ rol: 'professor' })
            .toArray();

        res.status(200).json(professors.map(p => p.nom));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al carregar professors" });
    }
};

// OBTENIR USUARI PER ID
const getUserById = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID no vàlid" });
        }

        const user = await db.collection('usuaris').findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ error: "Usuari no trobat" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtenir l'usuari" });
    }
};


// --- PASO 1: EL ADMIN ENVÍA LA INVITACIÓN ---
// Esta función se activa cuando tú desde el panel de Admin le das a "Invitar"
const inviteCentre = async (req, res) => {
    try {
        const db = getDB();
        const { email, nom } = req.body;

        if (!email || !nom) return res.status(400).json({ error: "Faltan datos del centro" });

        const token = crypto.randomBytes(20).toString('hex');
        
        const nouCentrePendent = {
            nom,
            email,
            rol: 'centre',
            estat: 'invitat', // El centro está en espera
            token_invitacio: token,
            data_invitacio: new Date()
        };

        await db.collection('usuaris').insertOne(nouCentrePendent);

        // En userController.js -> inviteCentre
// Este enlace debe coincidir con la URL de tu frontend
const linkAceptar = `http://localhost:3000/confirmar-participacion?token=${token}`; 

await transporter.sendMail({
    from: '"Proyecto ENGINY" <martamartahf@gmail.com>', // Cambia el from para que coincida con tu auth
    to: email, 
    subject: `Invitación Proyecto ENGINY - Centro ${nom}`,
    html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
            <h2>Hola ${nom},</h2>
            <p>El equipo de <strong>ENGINY</strong> le invita a participar en los talleres de este año.</p>
            <p>¿Desean participar con sus alumnos?</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${linkAceptar}" 
                   style="background-color: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   SÍ, QUEREMOS PARTICIPAR
                </a>
            </div>
            <p style="color: #666; font-size: 12px;">Al hacer clic, se le redirigirá a la página de confirmación.</p>
        </div>`
});

        res.status(201).json({ missatge: "Invitación enviada al centro", token });
    } catch (error) {
        console.error("ERROR INVITACIÓN:", error);
        res.status(500).json({ error: "Error al enviar la invitación" });
    }
};
// --- PASO 2: EL CENTRO CONFIRMA EN LA WEB Y RECIBE EL SEGUNDO EMAIL ---
const confirmParticipation = async (req, res) => {
    try {
        const db = getDB();
        const { token } = req.body;

        if (!token) return res.status(400).json({ error: "Token obligatorio" });

        // 1. Generem la contrasenya aleatòria (8 caràcters)
        const passwordAuto = crypto.randomBytes(4).toString('hex'); 

        // 2. Busquem el centre pel token i l'activem a la base de dades
        const result = await db.collection('usuaris').findOneAndUpdate(
            { token_invitacio: token, estat: 'invitat' },
            { 
                $set: { 
                    password: passwordAuto, 
                    estat: 'actiu', 
                    token_invitacio: null, // El token ja no es podra tornar a fer servir
                    data_confirmacio: new Date()
                } 
            },
            { returnDocument: 'after' }
        );

        const usuari = result.value || result;
        if (!usuari) return res.status(400).json({ error: "Token no válido o ya usado" });

        // 3. SEGON CORREU: Enviem les credencials generades
        await transporter.sendMail({
            from: '"Proyecto ENGINY" <martamartahf@gmail.com>',
            to: usuari.email,
            subject: '¡Cuenta Activada! - Credenciales de acceso ENGINY',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px;">
                    <h2 style="color: #2c3e50;">¡Bienvenidos al Proyecto ENGINY!</h2>
                    <p>La vuestra participación ha sido confirmada correctamente.</p>
                    <p>Podéis acceder a vuestro panel de gestión con los siguientes datos:</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ddd;">
                        <p style="margin: 5px 0;"><strong>Usuario:</strong> ${usuari.email}</p>
                        <p style="margin: 5px 0;"><strong>Contraseña:</strong> <span style="font-family: monospace; font-size: 1.2em; color: #d63384; font-weight: bold;">${passwordAuto}</span></p>
                    </div>
                    <div style="text-align: center; margin-top: 25px;">
                        <a href="http://localhost:3000/login" 
                           style="background-color: #1a73e8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           Ir a Iniciar Sesión
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">Por seguridad, os recomendamos cambiar la contraseña una vez hayáis entrado.</p>
                </div>`
        });

        // 4. RESPOSTA AL FRONTEND: Enviem les dades perquè el centre les vegi a la pantalla de confirmar.vue
        res.status(200).json({ 
            missatge: "Participació confirmada",
            email: usuari.email,
            password: passwordAuto 
        });

    } catch (error) {
        console.error("ERROR EN ACTIVACIÓN:", error);
        res.status(500).json({ error: "Error al activar el centro" });
    }
};
    
module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getProfessors,
    getUserById,
    inviteCentre,
    confirmParticipation
};