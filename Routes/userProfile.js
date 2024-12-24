const express = require('express');
const User = require('../Models/user'); // Assuming you have a User model
const router = express.Router();

// Route to fetch user data by email
router.get('/user', async (req, res) => {
    try {
        // Get email from request headers
        const userEmail = req.headers['user-email'];

        // Validate email
        if (!userEmail) {
            return res.status(400).json({ 
                message: 'User email is required' 
            });
        }

        // Find user in database
        const user = await User.find({ email: userEmail }).select({
            name: 1,
            email: 1,
            profileImage: 1,
            _id: 0  // Exclude _id if not needed
        });

        // Check if user exists
        if (user.length === 0) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Send user data
        res.status(200).json(user);

    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
});

module.exports = router;