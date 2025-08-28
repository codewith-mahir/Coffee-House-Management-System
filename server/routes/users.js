const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Admin: get all users
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('Users list route called');
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    console.log('Found users:', users.length);
    res.json(users);
  } catch (err) {
    console.error('Error in users list route:', err);
    res.status(500).json({ error: 'Failed to load users.' });
  }
});

// Admin: get user profile and orders
router.get('/:id', async (req, res) => {
  try {
    console.log('User details route called with ID:', req.params.id);
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      console.log('User not found:', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    console.log('Found user and orders:', user._id, orders.length);
    res.json({ user, orders });
  } catch (err) {
    console.error('Error in user details route:', err);
    res.status(500).json({ error: 'Failed to load user details.' });
  }
});

// DELETE route removed (deletion disabled)

module.exports = router;
