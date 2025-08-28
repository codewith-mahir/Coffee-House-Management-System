const { Router } = require('express');
const Menu = require('../models/Menu');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = Router();

// Get all menu items (public route)
router.get('/', async (req, res, next) => {
  try {
    const { category, available } = req.query;
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    // Handle availability filter
    if (available === 'all') {
      // Don't filter by availability - show all items (for admin)
    } else if (available !== undefined) {
      filter.available = available === 'true';
    } else {
      // By default, only show available items to customers
      filter.available = true;
    }

    const menuItems = await Menu.find(filter).sort({ category: 1, name: 1 });
    // Ensure sizePrices are present for clients even for legacy docs
    const roundInt = (n) => Math.round(n);
    const withSizes = menuItems.map(doc => {
      const item = doc.toObject();
      const large = item.sizePrices?.large ?? item.price;
      const medium = item.sizePrices?.medium ?? roundInt(large * 2 / 3);
      const small = item.sizePrices?.small ?? roundInt(large / 2);
      item.sizePrices = { large, medium, small };
      item.stock = item.stock ?? 0;
      return item;
    });
    res.json(withSizes);
  } catch (error) {
    next(error);
  }
});

// Get single menu item (public route)
router.get('/:id', async (req, res, next) => {
  try {
  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
  const roundInt = (n) => Math.round(n);
  const obj = menuItem.toObject();
  const large = obj.sizePrices?.large ?? obj.price;
  const medium = obj.sizePrices?.medium ?? roundInt(large * 2 / 3);
  const small = obj.sizePrices?.small ?? roundInt(large / 2);
  obj.sizePrices = { large, medium, small };
  res.json(obj);
  } catch (error) {
    next(error);
  }
});

// Create menu item (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
  const { name, description, price, image, category, available, sizePrices, stock } = req.body;

    // Validation
    if (!name || !description || price == null || !image) {
      return res.status(400).json({ 
        error: 'Name, description, price, and image are required' 
      });
    }
    if (!Number.isInteger(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ error: 'Price must be an integer greater than 0' });
    }

    const roundInt = (n) => Math.round(n);
    const sizes = {
      large: sizePrices?.large != null ? roundInt(Number(sizePrices.large)) : roundInt(Number(price)),
      medium: sizePrices?.medium != null ? roundInt(Number(sizePrices.medium)) : roundInt(Number(price) * 2 / 3),
      small: sizePrices?.small != null ? roundInt(Number(sizePrices.small)) : roundInt(Number(price) / 2)
    };

    const menuItem = new Menu({
      name,
      description,
      price: sizes.large,
      sizePrices: sizes,
      image,
      category: category || 'coffee',
      available: available !== undefined ? available : true,
      stock: Number.isInteger(Number(stock)) && Number(stock) >= 0 ? Number(stock) : 0
    });

    await menuItem.save();

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem: menuItem.toObject()
    });
  } catch (error) {
    next(error);
  }
});

// Update menu item (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
  const { name, description, price, image, category, available, sizePrices, stock } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    const roundInt = (n) => Math.round(n);
    // Handle base price and/or sizePrices updates
    if (price !== undefined && (!Number.isInteger(Number(price)) || Number(price) <= 0)) {
      return res.status(400).json({ error: 'Price must be an integer greater than 0' });
    }
    // Determine existing item to merge sizes
    const existing = await Menu.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    const currentLarge = existing.sizePrices?.large ?? existing.price;
    let newLarge = price !== undefined ? roundInt(Number(price)) : (sizePrices?.large != null ? roundInt(Number(sizePrices.large)) : currentLarge);
    let newMedium = sizePrices?.medium != null ? roundInt(Number(sizePrices.medium)) : (existing.sizePrices?.medium ?? roundInt(newLarge * 2 / 3));
    let newSmall = sizePrices?.small != null ? roundInt(Number(sizePrices.small)) : (existing.sizePrices?.small ?? roundInt(newLarge / 2));
    // Sync base price to large
    updateData.price = newLarge;
    updateData.sizePrices = { large: newLarge, medium: newMedium, small: newSmall };
    if (image) updateData.image = image;
    if (category) updateData.category = category;
    if (available !== undefined) updateData.available = available;
    if (stock !== undefined) {
      const stockNum = Number(stock);
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative integer' });
      }
      updateData.stock = stockNum;
    }

    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({
      message: 'Menu item updated successfully',
      menuItem: menuItem.toObject()
    });
  } catch (error) {
    next(error);
  }
});

// Delete menu item (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
