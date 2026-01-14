const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get('/professors', userController.getProfessors); // <--- NOVA RUTA
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// 1. Ruta para que el Admin envíe la invitación (Genera el token)
router.post('/invite', userController.inviteCentre); 

// 2. Ruta para que el Centro confirme (La que usa el frontend con el token)
router.post('/confirmar-activacio', userController.confirmParticipation);

module.exports = router;
