const express = require('express');
const router = express.Router();
const configController = require('../controllers/configFases');

router.get('/', configController.getConfig);
router.put('/update-fase', configController.updateFase);

module.exports = router;