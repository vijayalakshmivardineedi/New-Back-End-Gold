const mongoose = require('mongoose');

// Define the category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  categoryImage: {
    type: String,
    required: true
  },
  categoryVideo: {
    type: String
  }
}, { 
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Create the category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
