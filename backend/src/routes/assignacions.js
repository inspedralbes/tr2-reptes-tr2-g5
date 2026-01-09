const express = require('express');
const router = express.Router();
const assignacioController = require('../controllers/assignacioController');

// Ruta POST per gestionar les assignacions
router.post('/', assignacioController.crearAssignacio);

module.exports = router;