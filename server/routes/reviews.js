const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/Review');
const Menu = require('../models/Menu');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/reviews/item/:menuItemId - list reviews for a menu item
router.get('/item/:menuItemId', async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const reviews = await Review.find({ menuItem: menuItemId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('replies.admin', 'name email');
    // Aggregate average rating
    const avg = reviews.length ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
    res.json({ reviews, averageRating: avg, count: reviews.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// POST /api/reviews/item/:menuItemId - create or update own review
router.post('/item/:menuItemId', authMiddleware, async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const item = await Menu.findById(menuItemId);
    if (!item || !item.available) {
      return res.status(400).json({ error: 'Menu item not available' });
    }

    const existing = await Review.findOne({ user: userId, menuItem: menuItemId });
    if (existing) {
      existing.rating = rating;
      existing.comment = (comment || '').trim();
      await existing.save();
      return res.json(existing);
    }

    const review = await Review.create({ user: userId, menuItem: menuItemId, rating, comment: (comment || '').trim() });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You already reviewed this item' });
    }
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// DELETE /api/reviews/:id - delete own review; admin can delete any
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not allowed to delete this review' });
    }

    await Review.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// POST /api/reviews/:id/reply - admin reply to a review
router.post('/:id/reply', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ error: 'Reply cannot be empty' });
    }
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    review.replies.push({
      admin: req.user._id,
      reply: reply.trim()
    });
    await review.save();
    
    // Populate admin details in replies before returning
    const populatedReview = await Review.findById(id).populate('replies.admin', 'name email');
    res.json(populatedReview);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

module.exports = router;
