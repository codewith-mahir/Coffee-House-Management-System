const Menu = require('./models/Menu');

// Sample menu data for seeding
const sampleMenuItems = [
  {
    name: 'Espresso',
    description: 'Rich and bold single shot of coffee, perfect for a quick energy boost',
    price: 2.50,
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400',
    category: 'coffee',
    available: true
  },
  {
    name: 'Cappuccino',
    description: 'Classic Italian coffee with steamed milk and a layer of frothed milk on top',
    price: 4.25,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
    category: 'coffee',
    available: true
  },
  {
    name: 'Latte',
    description: 'Smooth espresso mixed with steamed milk and topped with light foam',
    price: 4.75,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    category: 'coffee',
    available: true
  },
  {
    name: 'Americano',
    description: 'Espresso shots topped with hot water, creating a rich black coffee',
    price: 3.25,
    image: 'https://images.unsplash.com/photo-1494314671902-399b18174975?w=400',
    category: 'coffee',
    available: true
  },
  {
    name: 'Mocha',
    description: 'Decadent blend of espresso, chocolate syrup, and steamed milk',
    price: 5.25,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    category: 'coffee',
    available: true
  },
  {
    name: 'Green Tea Latte',
    description: 'Creamy matcha green tea blended with steamed milk',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400',
    category: 'tea',
    available: true
  },
  {
    name: 'Croissant',
    description: 'Buttery, flaky French pastry perfect for breakfast or a light snack',
    price: 3.75,
    image: 'https://images.unsplash.com/photo-1555507036-ab794f1aa8bc?w=400',
    category: 'pastry',
    available: true
  },
  {
    name: 'Blueberry Muffin',
    description: 'Fresh baked muffin packed with juicy blueberries',
    price: 3.25,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
    category: 'pastry',
    available: true
  },
  {
    name: 'Turkey Club Sandwich',
    description: 'Triple-decker sandwich with turkey, bacon, lettuce, tomato, and mayo',
    price: 8.95,
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400',
    category: 'sandwich',
    available: true
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich, moist chocolate cake with creamy chocolate frosting',
    price: 5.95,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    category: 'dessert',
    available: true
  }
];

async function seedMenu() {
  try {
    // Connect to database
    require('dotenv/config');
    const { connectDB } = require('./lib/db');
    await connectDB();

    // Clear existing menu items
    await Menu.deleteMany({});
    console.log('Cleared existing menu items');

    // Insert sample menu items
    const createdItems = await Menu.insertMany(sampleMenuItems);
    console.log(`Created ${createdItems.length} menu items`);

    console.log('Menu seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding menu:', error);
    process.exit(1);
  }
}

seedMenu();
