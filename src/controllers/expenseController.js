const db = require('../config/database');

exports.addExpense = (req, res) => {
    const { name, total_amount, currency, members, date } = req.body; 
    const paid_by_user_id = req.headers['x-user-id'];

    if (!name || !total_amount || !currency || !members || !members.length || !date || !paid_by_user_id) {
        return res.status(400).json({ error: "Missing required fields or X-User-ID header." });
    }

    const share_amount = total_amount / members.length;

    db.serialize(() => {
        db.run(
            `INSERT INTO expenses (name, total_amount, currency, paid_by_user_id, date) VALUES (?, ?, ?, ?, ?)`,
            [name, total_amount, currency, paid_by_user_id, date],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                const expenseId = this.lastID;

                const stmt = db.prepare(`INSERT INTO expense_members (expense_id, user_id, share_amount) VALUES (?, ?, ?)`);
                members.forEach(mId => stmt.run(expenseId, mId, share_amount));
                stmt.finalize();

                res.status(201).json({ message: "Expense added and split recorded.", expenseId });
            }
        );
    });
};

exports.getExpenseDetail = (req, res) => {
    const expenseId = req.params.id;
    db.get(`SELECT * FROM expenses WHERE id = ?`, [expenseId], (err, expense) => {
        if (err || !expense) return res.status(404).json({ error: "Expense not found." });

        db.all(`SELECT user_id, share_amount FROM expense_members WHERE expense_id = ?`, [expenseId], (mErr, members) => {
            res.json({ ...expense, members });
        });
    });
};

exports.updateExpense = (req, res) => {
    const expenseId = req.params.id;
    const { name, total_amount, currency, members, date } = req.body;

    db.get(`SELECT * FROM expenses WHERE id = ?`, [expenseId], (err, expense) => {
        if (err || !expense) return res.status(404).json({ error: "Expense not found." });

        const finalName = name || expense.name;
        const finalAmount = total_amount || expense.total_amount;
        const finalCurrency = currency || expense.currency;
        const finalDate = date || expense.date;

        db.serialize(() => {
            db.run(
                `UPDATE expenses SET name = ?, total_amount = ?, currency = ?, date = ? WHERE id = ?`,
                [finalName, finalAmount, finalCurrency, finalDate, expenseId]
            );

            if (members && members.length) {
                db.run(`DELETE FROM expense_members WHERE expense_id = ?`, [expenseId]);
                const share_amount = finalAmount / members.length;
                const stmt = db.prepare(`INSERT INTO expense_members (expense_id, user_id, share_amount) VALUES (?, ?, ?)`);
                members.forEach(mId => stmt.run(expenseId, mId, share_amount));
                stmt.finalize();
            }
            res.json({ message: "Expense updated successfully." });
        });
    });
};


exports.deleteExpense = (req, res) => {
    const expenseId = req.params.id;
    db.run(`DELETE FROM expenses WHERE id = ?`, [expenseId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Expense wiped completely." });
    });
};

exports.getActivityLog = (req, res) => {
    const userId = req.headers['x-user-id'];
    const { start_date, end_date } = query = req.query; 

    if (!userId) return res.status(400).json({ error: "X-User-ID header is missing." });
    let queryStr = `
        SELECT DISTINCT e.* FROM expenses e
        LEFT JOIN expense_members em ON e.id = em.expense_id
        WHERE (e.paid_by_user_id = ? OR em.user_id = ?)
    `;
    let queryParams = [userId, userId];

    if (start_date && end_date) {
        queryStr += ` AND e.date BETWEEN ? AND ?`;
        queryParams.push(start_date, end_date);
    }
    queryStr += ` ORDER BY e.date DESC`;

    db.all(queryStr, queryParams, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

        const groups = { currentMonth: [], lastMonth: [], customRangeOrOther: [] };

        rows.forEach(row => {
            if (row.date.startsWith(currentMonthStr)) {
                groups.currentMonth.push(row);
            } else if (row.date.startsWith(lastMonthStr)) {
                groups.lastMonth.push(row);
            } else {
                groups.customRangeOrOther.push(row);
            }
        });

        res.json({ user_id: userId, activity_log: groups });
    });
};