const express = require('express');
const router = express.Router();
const { useInformes } = require('../controllers/informeController');

const { getEstadistiquesReals } = useInformes();
router.get('/dashboard', getEstadistiquesReals);
module.exports = router;