const express = require('express');
const router = express.Router();
const User = require('../Models/user')

// Middleware to check usage limit
const usageLimitMiddleware = async (req, res, next) => {
    try {
        const userId = req.headers['user-id']; // User ID passed in headers
        console.log('User ID:', userId);

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch user from database
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.usageCount <= 0) {
            return res.status(402).json({ message: "Free limit reached. Please subscribe to continue." });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

// Service route
router.post('/use-service', usageLimitMiddleware, async (req, res) => {
    try {
        const user = req.user;

        // Increment usageCount in the database
        user.usageCount += 1;
        await user.save();

        res.json({ message: `You have used the service ${user.usageCount} times.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

module.exports = router;