const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get('/professors', userController.getProfessors);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

router.post('/invite', userController.inviteCentre); 
router.post('/confirmar-participacion', userController.confirmParticipation);
router.post('/invite-multiple', userController.inviteMultiple);
router.post('/notify-referent', userController.notifyProfessorReferent);
module.exports = router;