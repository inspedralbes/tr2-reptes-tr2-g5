require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let database = null;

async function connectDB() {
    try {
        await client.connect();
        console.log(' Connectat a MongoDB Atlas');


        database = client.db('enginy');
        return database;
    } catch (error) {

        console.error(' Error connectant a MongoDB:', error);
        throw error;
    }
}

function getDB() {
    if (!database) {
        throw new Error(' Base de dades no connectada! Crida connectDB() primer.');
    }
    return database;
}

async function closeDB() {
    try {
        await client.close();
        console.log(' Connexió tancada');
    } catch (error) {
        console.error(' Error tancant la connexió:', error);
        throw error;
    }
}
module.exports = {
    connectDB,
    getDB,
    closeDB
};
