const express = require('express');

const router = express.Router();
const balanceController = require('../controllers/balanceController');

router.get('/', balanceController.getBalances);
router.post('/report', balanceController.sendMonthlyReport);

module.exports = router;