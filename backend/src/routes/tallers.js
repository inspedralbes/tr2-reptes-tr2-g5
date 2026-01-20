const express = require('express');
const router = express.Router();
const { useTallers } = require('../controllers/tallerController');

// Ruta per llistar: GET /api/tallers
router.get('/', async (req, res) => {
    const { getCatàleg } = useTallers(); // Crida lazy (tardana)
    await getCatàleg(res);
});

// Ruta per crear: POST /api/tallers
router.post('/', async (req, res) => {
    const { createTaller } = useTallers();
    await createTaller(req, res);
});

// Ruta per editar: PUT /api/tallers/:id
router.put('/:id', async (req, res) => {
    const { updateTaller } = useTallers();
    await updateTaller(req, res);
});

// Ruta per esborrar: DELETE /api/tallers/:id
router.delete('/:id', async (req, res) => {
    const { deleteTaller } = useTallers();
    await deleteTaller(req, res);
});

router.get('/voluntaris-representants', async (req, res) => {
    const { getVoluntarisPerTaller } = usePeticions();
    await getVoluntarisPerTaller(req, res);
});

// Ruta per assignar representant: PUT /api/tallers/:id/representant
router.put('/:id/representant', async (req, res) => {
    const { assignarRepresentantOficial } = usePeticions(); // Importem del controlador de peticions
    await assignarRepresentantOficial(req, res);
});
module.exports = router;