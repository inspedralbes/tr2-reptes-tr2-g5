const express = require('express');
const router = express.Router();
const { usePeticions } = require('../controllers/peticioController');

// Definim el punt d'accés per llistar tallers (GET /api/tallers)
router.get('/', async (req, res) => {
    const { getPeticions } = usePeticions(); 
    await getPeticions(res);
});

module.exports = router;
