const express = require('express');
const router = express.Router();
const assignacioController = require('../controllers/assignacioController');

router.post('/', assignacioController.crearAssignacio);
module.exports = router;