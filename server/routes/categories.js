const { Router } = require('express');
const Category = require('../models/Category');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = Router();

// Public: list categories
router.get('/', async (req, res) => {
  try {
    const list = await Category.find({}).sort({ name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Admin: create category
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required' });
    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) return res.status(409).json({ error: 'Category with same name or slug exists' });
    const cat = await Category.create({ name, slug, description });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Admin: update category
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const update = {};
    if (name) update.name = name;
    if (slug) update.slug = slug;
    if (description !== undefined) update.description = description;
    const cat = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Admin: delete category
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
