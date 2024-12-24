const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../Models/user');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

router.get('/status', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate JWT token if the user is a pro user
        let token = null;
        if (user.plan === 'pro') {
            token = jwt.sign(
                { email: user.email, plan: user.plan }, // Payload
                JWT_SECRET, // Secret key
                { expiresIn: '1h' } // Token expiration time
            );
        }

        res.status(200).json({
            usageCount: user.usageCount,
            isPaidUser: user.plan === 'pro',
            token: token // Include token if the user is a pro user
        });
    } catch (error) {
        console.error('Error fetching user status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;