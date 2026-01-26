const express = require('express');
const router = express.Router();
const { usePeticions } = require('../controllers/peticioController');

router.get('/voluntaris-representants', async (req, res) => {
    const { getVoluntarisPerTaller } = usePeticions();
    await getVoluntarisPerTaller(req, res);
});

router.get('/estadistiques', async (req, res) => {
    const { getEstadistiques } = usePeticions();
    await getEstadistiques(req, res);
});

router.get('/admin', async (req, res) => {
    const { getPeticionsAdmin } = usePeticions();
    await getPeticionsAdmin(req, res);
});

router.get('/checklist/search/:item', async (req, res) => {
    const { getSearchByChecklist } = usePeticions();
    await getSearchByChecklist(req, res);
});

router.get('/centre/:centreNom', async (req, res) => {
    const { getPeticionsPerCentre } = usePeticions();
    await getPeticionsPerCentre(req, res);
});

router.get('/professor/:emailProfessor', async (req, res) => {
    const { getPeticionsProfessor } = usePeticions();
    await getPeticionsProfessor(req, res);
});

router.get('/', async (req, res) => {
    const { getPeticions } = usePeticions();
    await getPeticions(req, res);
});

router.get('/representant/:emailProfessor', async (req, res) => {
    const { getTallersRepresentantOficial } = usePeticions();
    await getTallersRepresentantOficial(req, res);
});

router.patch('/:id/estat', async (req, res) => {
    const { updateEstat } = usePeticions();
    await updateEstat(req, res);
});

router.put('/:id/finalitzar', async (req, res) => {
    const { finalitzarPeticio } = usePeticions();
    await finalitzarPeticio(req, res);
});

router.post('/', async (req, res) => {
    const { createPeticio } = usePeticions();
    await createPeticio(req, res);
});

module.exports = router;