const { Router } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log('Attempting registration for:', email);

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate phone number if provided
    if (phone && !/^(\+88)?[0-9]{11}$/.test(phone.replace(/\s+/g, ''))) {
      return res.status(400).json({ error: 'Invalid phone number format. Use Bangladeshi format: +880 1XX XXX XXXX' });
    }

    const emailLower = email.toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = new User({
      name,
      email: emailLower,
      password,
      phone: phone || ''
    });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user (convert email to lowercase for case-insensitive matching)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
// Admin: list all users (basic fields)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try{
    const users = await User.find({}, 'name email role createdAt');
    res.json(users);
  }catch(err){
    res.status(500).json({ error: 'Failed to load users' });
  }
});
