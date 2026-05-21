const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.post('/', expenseController.addExpense);
router.get('/log', expenseController.getActivityLog);
router.get('/:id', expenseController.getExpenseDetail);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;