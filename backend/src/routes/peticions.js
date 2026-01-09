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

// GET /api/peticions/professor/:nomProfessor
router.get('/professor/:nomProfessor', async (req, res) => {
    const { getPeticionsProfessor } = usePeticions();
    await getPeticionsProfessor(req, res);
});

// ... (codi que ja tens)

// PATCH /api/peticions/:id/finalitzar -> Per al checklist del professor
router.patch('/:id/finalitzar', async (req, res) => {
    const { finalitzarPeticio } = usePeticions();
    await finalitzarPeticio(req, res);
});

module.exports = router;