const express = require('express');
const router = express.Router();
const { useInformes } = require('../controllers/informeController');

const controller = useInformes();

router.post('/generar', controller.generarInforme);
router.get('/latest', controller.getUltimInforme);

module.exports = router;