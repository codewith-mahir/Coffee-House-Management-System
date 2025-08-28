const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v) { return Number.isInteger(v); },
      message: 'Price must be an integer value'
    }
  },
  sizePrices: {
    large: { 
      type: Number, 
      min: 0,
      validate: {
        validator: function(v) { return v == null || Number.isInteger(v); },
        message: 'Large price must be an integer'
      }
    },
    medium: { 
      type: Number, 
      min: 0,
      validate: {
        validator: function(v) { return v == null || Number.isInteger(v); },
        message: 'Medium price must be an integer'
      }
    },
    small: { 
      type: Number, 
      min: 0,
      validate: {
        validator: function(v) { return v == null || Number.isInteger(v); },
        message: 'Small price must be an integer'
      }
    }
  },
  image: {
    type: String,
    required: true, // URL to the image
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'coffee'
  },
  // Inventory stock count
  stock: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(v){ return Number.isInteger(v) && v >= 0; },
      message: 'Stock must be a non-negative integer'
    }
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure sizePrices are set relative to base price (large) if not provided
menuSchema.pre('save', function(next) {
  try {
    // Treat base price as large by default
    if (!this.sizePrices) this.sizePrices = {};
    if (this.price != null) {
      if (this.sizePrices.large == null) this.sizePrices.large = this.price;
    }
    // Compute integer defaults for medium/small if missing
    const roundInt = (n) => Math.round(n);
    if (this.sizePrices.medium == null && this.sizePrices.large != null) {
      this.sizePrices.medium = roundInt(this.sizePrices.large * 2 / 3);
    }
    if (this.sizePrices.small == null && this.sizePrices.large != null) {
      this.sizePrices.small = roundInt(this.sizePrices.large / 2);
    }
    // Keep price in sync with large
    if (this.sizePrices.large != null && this.price !== this.sizePrices.large) {
      this.price = this.sizePrices.large;
    }
    next();
  } catch (e) {
    next(e);
  }
});

module.exports = mongoose.model('Menu', menuSchema);
