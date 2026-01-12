const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

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
        res.status(500).json({ error: "Error al carregar professors" });
    }
};

// EXPORTACIÓN ÚNICA (Correcta)
module.exports = { 
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    getProfessors 
};