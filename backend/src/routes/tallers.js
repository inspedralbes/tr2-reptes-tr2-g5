const express = require('express');
const router = express.Router();
const { useTallers } = require('../controllers/tallerController');
const { usePeticions } = require('../controllers/peticioController');

router.get('/', async (req, res) => {
    const { getCatàleg } = useTallers(); 
    await getCatàleg(res);
});

router.post('/', async (req, res) => {
    const { createTaller } = useTallers();
    await createTaller(req, res);
});

router.put('/:id', async (req, res) => {
    const { updateTaller } = useTallers();
    await updateTaller(req, res);
});

router.delete('/:id', async (req, res) => {
    const { deleteTaller } = useTallers();
    await deleteTaller(req, res);
});

router.put('/:id/representant', async (req, res) => {
    const { assignarRepresentantOficial } = usePeticions(); 
    await assignarRepresentantOficial(req, res);
});

router.get('/voluntaris-representants', async (req, res) => {
    const { getVoluntarisPerTaller } = usePeticions();
    await getVoluntarisPerTaller(req, res);
});

router.put('/:id/representant', async (req, res) => {
    const { assignarRepresentantOficial } = usePeticions();
    await assignarRepresentantOficial(req, res);
});

router.get('/representant/:emailProfessor', async (req, res) => {
    const { getTallersRepresentantOficial } = usePeticions();
    await getTallersRepresentantOficial(req, res);
});
module.exports = router;