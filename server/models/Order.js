const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true,
    default: 'medium'
  },
  extras: [{ type: String }], // e.g., 'extra sugar', 'almond milk'
  instructions: { type: String, trim: true }
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  customization: { type: customizationSchema, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true, min: 0 },
  customerName: { type: String, trim: true },
  // Delivery details
  deliveryType: { type: String, enum: ['Pickup', 'Home Delivery'], required: true, default: 'Pickup' },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  deliveryNote: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
