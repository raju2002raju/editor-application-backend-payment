const User = require('../Models/user');

async function updateUserTokenUsage(email, chatResponse) {
    try {
        if (!email) {
            console.error('No email provided');
            return {
                success: false,
                error: 'Email is required'
            };
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.error('User not found');
            return {
                success: false,
                error: 'User not found'
            };
        }

        const totalTokensUsed = chatResponse?.tokenUsage?.totalTokens || 0 ;
        const newUsageCount = Math.max(0, user.usageCount - totalTokensUsed);
        
        // Update user's usageCount
        user.usageCount = newUsageCount;
        await user.save();

        return {
            success: true,
            remainingUsageCount: newUsageCount
        };
    } catch (error) {
        console.error('Error updating user token usage:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    updateUserTokenUsage
};
