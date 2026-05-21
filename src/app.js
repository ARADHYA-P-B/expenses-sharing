require('dotenv').config();
const express = require('express');
const app = express();

const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const balanceRoutes = require('./routes/balanceRoutes');

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/balances', balanceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port : ${PORT}`);
});