const express = require('express');
const router = express.Router();
const { usePeticions } = require('../controllers/peticioController');

// 1. Rutes FIXES (Sempre primer)
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

// 2. Rutes amb PARÀMETRES ESPECÍFICS
router.get('/centre/:centreNom', async (req, res) => {
    const { getPeticionsPerCentre } = usePeticions();
    await getPeticionsPerCentre(req, res);
});

router.get('/professor/:emailProfessor', async (req, res) => {
    const { getPeticionsProfessor } = usePeticions();
    await getPeticionsProfessor(req, res);
});

// 3. Rutes amb ID o ARREL (Sempre al final)
router.get('/', async (req, res) => {
    const { getPeticions } = usePeticions();
    await getPeticions(req, res);
});

// Afegeix això abans de la línia router.get('/:id', ...)
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