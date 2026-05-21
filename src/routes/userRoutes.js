const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/account', userController.Create);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.delete('/account', userController.deleteAccount);

module.exports = router;