require('dotenv/config');
const { connectDB } = require('./lib/db');
const User = require('./models/User');

async function seed() {
  try {
    await connectDB();

    const email = (process.env.ADMIN_EMAIL || 'admin@coffee.local').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';

    let admin = await User.findOne({ email });
    if (!admin) {
      admin = new User({ name: 'Super Admin', email, password, role: 'admin' });
      await admin.save();
      console.log('Super admin created:', email);
    } else {
      // Update password if it has changed
      const isPasswordMatch = await admin.comparePassword(password);
      if (!isPasswordMatch) {
        admin.password = password; // This will be hashed by the pre-save hook
        await admin.save();
        console.log('Super admin password updated:', email);
      } else {
        console.log('Super admin already exists with correct password:', email);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

seed();
