// logout.route.js
const session = require('express-session'); 
const express = require('express');
const router = express.Router();


router.use(
    session({
        secret: 'your_secret_key', 
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } 
    })
);

router.post('/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ status: 'error', message: 'Failed to log out' });
            }
            res.clearCookie('connect.sid'); // Clear session cookie
            res.status(200).json({ status: 'success', message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

module.exports = router;