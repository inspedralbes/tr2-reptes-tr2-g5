const express = require('express');
const router = express.Router();
const { useInformes } = require('../controllers/informeController');

const { getEstadistiquesReals } = useInformes();

// Ara només necessitem una ruta que ens doni tot el "pack" de dades
router.get('/dashboard', getEstadistiquesReals);

module.exports = router;