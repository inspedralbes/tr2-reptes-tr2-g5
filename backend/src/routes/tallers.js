const express = require('express');
const router = express.Router();
const { useTallers } = require('../controllers/tallerController');

// Definim el punt d'accés per llistar tallers (GET /api/tallers)
router.get('/', async (req, res) => {
    const { getCatàleg } = useTallers(); 
    await getCatàleg(res);
});

// Aquesta ruta respondrà a: http://localhost:3000/api/tallers/test
router.get('/test', (req, res) => {
    res.json({ missatge: "L'API de tallers funciona correctament!" });
});

module.exports = router;