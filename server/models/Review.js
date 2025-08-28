const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true, index: true },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  comment: { type: String, trim: true, maxlength: 1000 },
  replies: [{
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reply: { type: String, trim: true, maxlength: 500, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// One review per user per menu item
reviewSchema.index({ user: 1, menuItem: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
