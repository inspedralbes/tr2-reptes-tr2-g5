const express = require('express');
const router = express.Router();
const { usePeticions } = require('../controllers/peticioController');

// GET /api/peticions/admin -> Per a la taula i la campaneta
router.get('/admin', async (req, res) => {
    const { getPeticionsAdmin } = usePeticions(); 
    await getPeticionsAdmin(res);
});

// POST /api/peticions -> Per crear noves peticions des de centres
router.post('/', async (req, res) => {
    const { createPeticio } = usePeticions(); 
    await createPeticio(req, res);
});

// PATCH /api/peticions/:id/estat -> Per acceptar/rebutjar
router.patch('/:id/estat', async (req, res) => {
    const { updateEstat } = usePeticions();
    await updateEstat(req, res);
});

module.exports = router;