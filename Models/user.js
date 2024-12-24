

// Models/user.js
const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters'] 
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(value) {
                return validator.isEmail(value); 
            },
            message: 'Please enter a valid email address'
        }
    },
    profileImage: {
        type: String,
        default: ''
    },
    plan: { type: String, default: '' }, // Add plan field
    usageCount: { type: Number, default: 0 },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);