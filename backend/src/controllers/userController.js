const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'martamartahf@gmail.com',
        pass: 'zvol wsbs kljw zvqs '
    }
});

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

const deleteUser = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        const userToDelete = await db.collection('usuaris').findOne({ _id: new ObjectId(id) });

        if (!userToDelete) {
            return res.status(404).json({ error: "Usuari no trobat" });
        }

        const requesterEmail = req.headers['x-user-email'];

        if (userToDelete.email === 'admin@admin.com') {
            return res.status(403).json({ error: "No es pot eliminar el Admin Principal" });
        }

        if (userToDelete.rol === 'admin') {
            if (requesterEmail !== 'admin@admin.com') {
                return res.status(403).json({ error: "No tens permisos per eliminar un administrador" });
            }
        }

        await db.collection('usuaris').deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ missatge: "Usuari eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar usuari" });
    }
};

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

const inviteCentre = async (req, res) => {
    try {
        const db = getDB();
        const { email, nom } = req.body;

        if (!email || !nom) {
            return res.status(400).json({ error: "Falten dades del centre" });
        }

        const token = crypto.randomBytes(20).toString('hex');

        const nouCentrePendent = {
            nom,
            email,
            rol: 'centre',
            estat: 'invitat',
            token_invitacio: token,
            data_invitacio: new Date()
        };

        await db.collection('usuaris').insertOne(nouCentrePendent);

        const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const linkAceptar = `${BASE_URL}/confirmar-participacion?token=${token}`;

        transporter.sendMail({
            from: '"Projecte ENGINY" <martamartahf@gmail.com>',
            to: email,
            subject: `Invitació Projecte ENGINY - Centre ${nom}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #333;">Hola ${nom},</h2>
                    <p>L'equip de <strong>ENGINY</strong> us convida a participar en els tallers d'aquest curs.</p>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${linkAceptar}" 
                           style="background-color: #3465a4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           SÍ, VOLEM PARTICIPAR
                        </a>
                    </div>
                    <p style="color: #666; font-size: 13px;">Aquest és un correu automàtic enviat per ENGINY.</p>
                </div>`
        }).catch(err => {
            console.error("LOG: Error enviant mail (però l'usuari s'ha creat):", err.message);
        });

        res.status(201).json({ missatge: "Invitació processada correctament", token });

    } catch (error) {
        console.error("ERROR CRÍTIC:", error);
        res.status(500).json({ error: "Error intern del servidor" });
    }
};
const confirmParticipation = async (req, res) => {
    try {
        const db = getDB();
        const { token, nomCoordinador, emailCoordinador, esPrimeraVegada } = req.body;

        if (!token) return res.status(400).json({ error: "Token obligatorio" });

        const usuariPendent = await db.collection('usuaris').findOne({ token_invitacio: token });

        if (!usuariPendent) {
            return res.status(404).json({ error: "No s'ha trobat la invitació o ja ha caducat" });
        }

        const passwordAuto = crypto.randomBytes(4).toString('hex');

        await db.collection('usuaris').updateOne(
            { _id: usuariPendent._id },
            {
                $set: {
                    password: passwordAuto,
                    estat: 'actiu',
                    rol: 'centre',
                    coordinador: {
                        nom: nomCoordinador,
                        email: emailCoordinador
                    },
                    primera_vegada: esPrimeraVegada,
                    token_invitacio: null,
                    data_confirmacio: new Date()
                }
            }
        );
        const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const loginLink = `${BASE_URL}/login`;

        await transporter.sendMail({
            from: '"Projecte ENGINY" <martamartahf@gmail.com>',
            to: usuariPendent.email,
            subject: 'Compte Activat! - Credencials ENGINY',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #333;">Hola ${usuariPendent.nom},</h2>
                    <p>El vostre compte de <strong>Centre</strong> ha estat activat correctament.</p>
                    <p>Aquestes són les vostres credencials d'accés:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Usuari:</strong> ${usuariPendent.email}</p>
                        <p style="margin: 5px 0;"><strong>Contrasenya:</strong> <span style="color: #e91e63; font-weight: bold;">${passwordAuto}</span></p>
                    </div>
                    <p>Podeu accedir a la plataforma fent clic al següent enllaç:</p>
                    <br>
                    <a href="http://localhost:5173/login" 
                       style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       Iniciar sessió ara
                    </a>
                    <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                        Si teniu qualsevol dubte, contacteu amb l'administrador del projecte.
                    </p>
                </div>`
        }).catch(err => console.error("Error enviant credencials per mail:", err.message));

        res.status(200).json({
            missatge: "Participació confirmada",
            email: usuariPendent.email,
            password: passwordAuto
        });

    } catch (error) {
        console.error("ERROR EN ACTIVACIÓN:", error);
        res.status(500).json({ error: "Error intern al activar el centre" });
    }
};

const inviteMultiple = async (req, res) => {
    try {
        const db = getDB();
        const { centres } = req.body;

        if (!centres || !Array.isArray(centres)) {
            return res.status(400).json({ error: "El format de les dades no és correcte" });
        }

        const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

        const validCentres = centres.filter(c => c.nom && c.email);

        if (validCentres.length === 0) {
            return res.status(400).json({ error: "Cap centre vàlid per processar" });
        }

        const documents = validCentres.map(centro => {
            return {
                nom: centro.nom,
                email: centro.email,
                rol: 'centre',
                estat: 'invitat',
                token_invitacio: crypto.randomBytes(20).toString('hex'),
                data_invitacio: new Date()
            };
        });

        db.collection('usuaris').insertMany(documents).catch(err => console.error("Error crítico insertando usuarios en background:", err));
        documents.forEach(doc => {
            const linkAceptar = `${BASE_URL}/confirmar-participacion?token=${doc.token_invitacio}`;

            transporter.sendMail({
                from: '"Projecte ENGINY" <martamartahf@gmail.com>',
                to: doc.email,
                subject: `Invitació Projecte ENGINY - Centre ${doc.nom}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #333;">Hola ${doc.nom},</h2>
                        <p>L'equip de <strong>ENGINY</strong> us convida a participar en els tallers.</p>
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${linkAceptar}" 
                               style="background-color: #3465a4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                               SÍ, VOLEM PARTICIPAR
                            </a>
                        </div>
                    </div>`
            }).catch(err => console.error(`Error enviando mail a ${doc.email}:`, err.message));
        });

        const enviados = documents.map(d => d.email);
        res.status(201).json({
            missatge: `${enviados.length} invitacions processades correctament`,
            count: enviados.length
        });

    } catch (error) {
        console.error("ERROR INVITACIÓ MÚLTIPLE:", error);
        res.status(500).json({ error: "Error al processar les invitacions" });
    }
};

const notifyProfessorReferent = async (req, res) => {
    try {
        res.status(200).json({ missatge: "Lògica de correu al professor eliminada. Només es processa internament." });
    } catch (error) {
        res.status(500).json({ error: "Error en la petició" });
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
    confirmParticipation,
    inviteMultiple,
    notifyProfessorReferent,
    transporter
};