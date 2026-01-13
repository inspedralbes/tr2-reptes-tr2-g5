const express = require('express');
const router = express.Router();
const { usePeticions } = require('../controllers/peticioController');

// GET /api/peticions/admin
router.get('/admin', async (req, res) => {
    const { getPeticionsAdmin } = usePeticions(); 
    await getPeticionsAdmin(req, res); // Passat req i res
});

// POST /api/peticions
router.post('/', async (req, res) => {
    const { createPeticio } = usePeticions(); 
    await createPeticio(req, res);
});

// PATCH /api/peticions/:id/estat
router.patch('/:id/estat', async (req, res) => {
    const { updateEstat } = usePeticions();
    await updateEstat(req, res);
});

// GET /api/peticions/professor/:nomProfessor
router.get('/professor/:nomProfessor', async (req, res) => {
    const { getPeticionsProfessor } = usePeticions();
    await getPeticionsProfessor(req, res);
});

// PATCH /api/peticions/:id/finalitzar
router.patch('/:id/finalitzar', async (req, res) => {
    const { finalitzarPeticio } = usePeticions();
    await finalitzarPeticio(req, res);
});

// Afegeix aquesta ruta al principi, abans de la de /admin
router.get('/', async (req, res) => {
    const { getPeticions } = usePeticions(); 
    await getPeticions(req, res);
});

// Afegeix això per enllaçar amb la funció getPeticions del controlador
router.get('/', async (req, res) => {
    const { getPeticions } = usePeticions(); 
    await getPeticions(req, res);
});
module.exports = router;