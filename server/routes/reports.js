const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const Order = require('../models/Order');
const Menu = require('../models/Menu');

// Overview analytics
router.get('/overview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({});
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Best selling items
    const itemCounts = {};
    for (const o of orders) {
      for (const it of o.items) {
        const key = it.name || String(it.menuItem);
        itemCounts[key] = (itemCounts[key] || 0) + (it.quantity || 1);
      }
    }
    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Revenue by category
    const categoryRevenue = {};
    const menuItems = await Menu.find({});
    const menuMap = {};
    menuItems.forEach(item => {
      menuMap[item._id.toString()] = item;
    });

    for (const o of orders) {
      for (const it of o.items) {
        const menuItem = menuMap[it.menuItem?.toString()];
        if (menuItem) {
          const category = menuItem.category || 'other';
          categoryRevenue[category] = (categoryRevenue[category] || 0) + (it.price * it.quantity);
        }
      }
    }

    const revenueByCategory = Object.entries(categoryRevenue)
      .sort((a, b) => b[1] - a[1])
      .map(([category, revenue]) => ({ category, revenue }));

    res.json({
      totalOrders,
      totalRevenue,
      byStatus,
      topItems,
      revenueByCategory
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: 'Failed to load reports' });
  }
});

// Time series analytics
router.get('/timeseries', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { range = 'daily', days = 30 } = req.query; // daily | weekly | monthly
    const orders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).select('createdAt total status');

    const buckets = {};
    const keyFor = (d) => {
      const date = new Date(d);
      if (range === 'monthly') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (range === 'weekly') {
        const onejan = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
      }
      return date.toISOString().slice(0, 10);
    };

    for (const o of orders) {
      const k = keyFor(o.createdAt);
      if (!buckets[k]) buckets[k] = { date: k, revenue: 0, orders: 0, completed: 0, pending: 0 };
      buckets[k].revenue += (o.total || 0);
      buckets[k].orders += 1;
      if (o.status === 'completed') buckets[k].completed += 1;
      if (o.status === 'pending') buckets[k].pending += 1;
    }

    const series = Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));
    res.json(series);
  } catch (err) {
    console.error('Timeseries error:', err);
    res.status(500).json({ error: 'Failed to load timeseries' });
  }
});

// Best selling items with more details
router.get('/top-items', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query;
    let dateFilter = {};

    if (period !== 'all') {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      dateFilter = { createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } };
    }

    const orders = await Order.find(dateFilter);
    const itemStats = {};

    for (const o of orders) {
      for (const it of o.items) {
        const key = it.name || String(it.menuItem);
        if (!itemStats[key]) {
          itemStats[key] = {
            name: key,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        itemStats[key].totalQuantity += (it.quantity || 1);
        itemStats[key].totalRevenue += (it.price * it.quantity);
        itemStats[key].orderCount += 1;
      }
    }

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, parseInt(limit));

    res.json(topItems);
  } catch (err) {
    console.error('Top items error:', err);
    res.status(500).json({ error: 'Failed to load top items' });
  }
});

// Revenue trends comparison
router.get('/revenue-trends', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { periods = 12 } = req.query; // last N months
    const trends = [];

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const orders = await Order.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const orderCount = orders.length;

      trends.push({
        month: startOfMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue,
        orders: orderCount,
        avgOrderValue: orderCount > 0 ? Math.round(revenue / orderCount) : 0
      });
    }

    res.json(trends);
  } catch (err) {
    console.error('Revenue trends error:', err);
    res.status(500).json({ error: 'Failed to load revenue trends' });
  }
});

// Hourly sales pattern
router.get('/hourly-pattern', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({}).select('createdAt total');
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: 0,
      revenue: 0
    }));

    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += (order.total || 0);
    });

    res.json(hourlyData);
  } catch (err) {
    console.error('Hourly pattern error:', err);
    res.status(500).json({ error: 'Failed to load hourly pattern' });
  }
});

module.exports = router;
