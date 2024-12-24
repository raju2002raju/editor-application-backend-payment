// Models/section.js
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // Corrected reference to match the User model
    required: true  // Added required field
  },
  content: {
    type: String,
    required: true,
    trim: true  // Added trim to remove whitespace
  },
  fileName: {
    type: String,
    required: true,
    trim: true  // Added trim to remove whitespace
  }
}, {
  timestamps: true 
});

// Use a more descriptive model name
const DynamicModel = mongoose.model('StoreDocument', sectionSchema);

module.exports = DynamicModel;