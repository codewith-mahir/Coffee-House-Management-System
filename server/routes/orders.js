const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
  const { items, deliveryType = 'Pickup', address = '', phone = '', deliveryNote = '', customerName = '' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items required.' });
    }

    // Validate delivery info
    const validDelivery = ['Pickup', 'Home Delivery'];
    if (!validDelivery.includes(deliveryType)) {
      return res.status(400).json({ error: 'Invalid delivery type.' });
    }
    if (deliveryType === 'Home Delivery') {
      if (!address || !phone) {
        return res.status(400).json({ error: 'Address and phone are required for Home Delivery.' });
      }
      // Basic BD phone validation: allows +8801XXXXXXXXX or 01XXXXXXXXX
      const phoneOk = /^(\+?88)?01[3-9]\d{8}$/.test(String(phone).trim());
      if (!phoneOk) {
        return res.status(400).json({ error: 'Invalid Bangladeshi phone number format.' });
      }
    }

    // Validate items and compute total
    let total = 0;
    const orderItems = [];

    // Extra surcharges based on Bangladesh market prices (integer BDT)
    const EXTRA_DEFAULT = 20;
    const EXTRA_RULES = [
      { re: /sugar/i, val: 0 },
      { re: /almond\s*milk/i, val: 180 },
      { re: /oat\s*milk/i, val: 60 },
      { re: /^milk$/i, val: 20 },
      { re: /^lemon$/i, val: 10 },
      { re: /^ginger$/i, val: 10 },
      { re: /^mint$/i, val: 10 },
      { re: /^extra\s*cheese$/i, val: 30 },
      { re: /^extra\s*sauce$/i, val: 15 },
      { re: /^chocolate\s*drizzle$/i, val: 20 },
      { re: /^extra\s*cream$/i, val: 20 },
    ];
    // Allowed extras per category to avoid irrelevant options
    const ALLOWED_EXTRAS = {
      coffee: ['extra sugar','almond milk','oat milk','extra shot'],
      tea: ['extra sugar','milk','lemon','ginger','mint'],
      beverage: ['extra sugar','almond milk','oat milk'],
      sandwich: ['extra cheese','extra sauce'],
      pastry: ['chocolate drizzle','extra cream'],
      dessert: ['chocolate drizzle','extra cream']
    };
  for (const it of items) {
      // Expected shape: { menuItemId, quantity, customization: { size, extras, instructions } }
      const { menuItemId, quantity = 1, customization } = it;
      if (!menuItemId || !customization || !customization.size) {
        return res.status(400).json({ error: 'Invalid item or customization.' });
      }

      const menuItem = await Menu.findById(menuItemId);
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({ error: 'Menu item unavailable.' });
      }
      // Inventory check: prevent ordering if not enough stock (when stock is tracked)
      const trackStock = Number.isInteger(menuItem.stock);
      const qty = Math.max(1, Number(quantity) || 1);
      if (trackStock && (menuItem.stock ?? 0) < qty) {
        return res.status(400).json({ error: `Insufficient stock for ${menuItem.name}. Available: ${menuItem.stock ?? 0}` });
      }

  // Determine unit price by size
  const roundInt = (n) => Math.round(n);
  const large = menuItem.sizePrices?.large != null ? Number(menuItem.sizePrices.large) : Number(menuItem.price);
  const medium = menuItem.sizePrices?.medium != null ? Number(menuItem.sizePrices.medium) : roundInt(large * 2 / 3);
  const small = menuItem.sizePrices?.small != null ? Number(menuItem.sizePrices.small) : roundInt(large / 2);
      let unitPrice = large;
  if (customization.size === 'medium') unitPrice = medium;
  if (customization.size === 'small') unitPrice = small;
  // Extras: filter to allowed for this category, then price them
  const rawExtras = Array.isArray(customization.extras) ? customization.extras : [];
  const allowed = ALLOWED_EXTRAS[menuItem.category] || [];
  const extras = rawExtras.filter(ex => allowed.includes(String(ex || '').toLowerCase()));
  const extrasCost = extras.reduce((sum, ex) => {
        const name = String(ex || '');
        const rule = EXTRA_RULES.find(r => r.re.test(name));
        const add = rule ? rule.val : EXTRA_DEFAULT;
        return sum + add;
      }, 0);
      const itemPrice = Math.round(unitPrice + extrasCost);
      total += itemPrice * qty;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
  price: itemPrice,
        quantity: qty,
        customization: {
          size: customization.size,
          extras,
          instructions: customization.instructions || ''
        }
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      total,
      customerName: customerName || req.user?.name || '',
      deliveryType,
      address: deliveryType === 'Home Delivery' ? address : '',
      phone: deliveryType === 'Home Delivery' ? phone : (req.user?.phone || ''),
      deliveryNote: deliveryNote || ''
    });
    // Decrement stock for each item ordered
    try {
      for (const it of orderItems) {
        if (it.menuItem) {
          const dec = await Menu.findByIdAndUpdate(
            it.menuItem,
            { $inc: { stock: -(it.quantity || 1) } },
            { new: true }
          );
          // If stock drops below 0, clamp to 0 and mark unavailable
          if (dec && dec.stock < 0) {
            dec.stock = 0;
            await dec.save();
          }
          if (dec && dec.stock === 0 && dec.available !== false) {
            dec.available = false;
            await dec.save();
          }
        }
      }
    } catch (invErr) {
      console.error('Stock decrement error:', invErr);
    }

    // Populate the order with menu item details for email sending
    const populatedOrder = await Order.findById(order._id).populate('items.menuItem');
    
    // Transform the order data to include item names and prices for email
    const orderForResponse = {
      ...populatedOrder.toObject(),
      items: populatedOrder.items.map(item => ({
        _id: item.menuItem._id,
        name: item.menuItem.name,
        price: item.price,
        quantity: item.quantity,
        customization: item.customization
      }))
    };

    res.status(201).json(orderForResponse);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// Get my orders
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load orders.' });
  }
});

// Admin: list all orders with optional filters
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, userId } = req.query;
    const q = {};
    if (status) q.status = status;
    if (userId) q.user = userId;
    const orders = await Order.find(q).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load orders.' });
  }
});

// Admin: update order status
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending','confirmed','completed','cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

module.exports = router;
