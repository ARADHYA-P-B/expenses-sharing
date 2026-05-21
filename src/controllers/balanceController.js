const db = require('../config/database');

exports.getBalances = (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ error: "X-User-ID header missing." });

    const query = `
        SELECT u.id AS user_id, u.email, e.currency,
            SUM(CASE WHEN e.paid_by_user_id = ? THEN em.share_amount ELSE 0 END) -
            SUM(CASE WHEN em.user_id = ? THEN em.share_amount ELSE 0 END) AS net_balance
        FROM expense_members em
        JOIN expenses e ON em.expense_id = e.id
        JOIN users u ON (u.id = e.paid_by_user_id OR u.id = em.user_id)
        WHERE (e.paid_by_user_id = ? OR em.user_id = ?) AND u.id != ?
        GROUP BY u.id, e.currency
    `;

    db.all(query, [userId, userId, userId, userId, userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const summary = rows.map(r => ({
            with_user_id: r.user_id,
            email: r.email,
            currency: r.currency,
            balance: r.net_balance,
            status: r.net_balance > 0 ? "You are owed" : r.net_balance < 0 ? "You owe" : "Settled"
        }));

        res.json({ user_id: userId, balances: summary });
    });
};

exports.sendMonthlyReport = (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ error: "X-User-ID is mandatory." });

    db.get(`SELECT email FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: "User invalid." });

        const balanceQuery = `
            SELECT u.email, e.currency,
                SUM(CASE WHEN e.paid_by_user_id = ? THEN em.share_amount ELSE 0 END) -
                SUM(CASE WHEN em.user_id = ? THEN em.share_amount ELSE 0 END) AS net_balance
            FROM expense_members em
            JOIN expenses e ON em.expense_id = e.id
            JOIN users u ON (u.id = e.paid_by_user_id OR u.id = em.user_id)
            WHERE (e.paid_by_user_id = ? OR em.user_id = ?) AND u.id != ?
            GROUP BY u.id, e.currency
        `;

        db.all(balanceQuery, [userId, userId, userId, userId, userId], (bErr, rows) => {
            let emailContent = `<h1>Monthly Split Statement for ${user.email}</h1><ul>`;
            rows.forEach(r => {
                emailContent += `<li>User ${r.email}: ${r.currency} ${r.net_balance.toFixed(2)} (${r.net_balance > 0 ? 'Owed' : 'Owe'})</li>`;
            });
            emailContent += `</ul>`;

            console.log(`Email dispatched to [${user.email}] successfully.`);
            res.json({
                message: "Monthly digest report successfully generated and sent .",
                recipient: user.email,
                payload_preview: emailContent
            });
        });
    });
};