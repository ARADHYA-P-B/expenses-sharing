const db = require('../config/database');

exports.Create = (req, res) => {
    const { email, password, default_currency } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    db.run(
        `INSERT INTO users (email, password, default_currency) VALUES (?, ?, ?)`,
        [email, password, default_currency || 'INR'],
        function (err) {
            if (err) {
                db.get(`SELECT id, email, default_currency FROM users WHERE email = ?`, [email], (getErr, row) => {
                    if (getErr || !row) return res.status(400).json({ error: "Authentication failed." });
                    return res.status(200).json({ message: "Login successful", user: row });
                });
            } else {
                res.status(201).json({ message: "Account created successfully", userId: this.lastID, email });
            }
        }
    );
};

exports.getProfile = (req, res) => {
    const userId = req.headers['x-user-id'];
    db.get(`SELECT id, email, default_currency, created_at FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "User profile not found." });
        res.json(row);
    });
};


exports.updateProfile = (req, res) => {
    const userId = req.headers['x-user-id'];
    const { email, default_currency } = req.body;

    if (!email && !default_currency) return res.status(400).json({ error: "Nothing to update." });

    db.run(
        `UPDATE users SET email = COALESCE(?, email), default_currency = COALESCE(?, default_currency) WHERE id = ?`,
        [email, default_currency, userId],
        function (err) {
            if (err) return res.status(400).json({ error: "Email may already be in use." });
            res.json({ message: "Profile updated successfully." });
        }
    );
};

exports.deleteAccount = (req, res) => {
    const userId = req.headers['x-user-id'];
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Account and associated data deleted successfully." });
    });
};