// Migration script to add receipt preferences to existing users
// Run with: node migrate-users.js

const mongoose = require('mongoose');
require('dotenv/config');
const User = require('./models/User');
const { connectDB } = require('./lib/db');

async function migrateUsers() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('📊 Checking existing users...');
    const users = await User.find({});

    let updatedCount = 0;
    for (const user of users) {
      let needsUpdate = false;

      // Add default receipt preference if missing
      if (!user.receiptPreference) {
        user.receiptPreference = 'email';
        needsUpdate = true;
      }

      // Add empty phone if missing
      if (user.phone === undefined) {
        user.phone = '';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
        console.log(`✅ Updated user: ${user.email}`);
      }
    }

    console.log(`\n🎉 Migration completed! Updated ${updatedCount} users.`);

    if (updatedCount === 0) {
      console.log('ℹ️  All users already have the required fields.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  migrateUsers();
}

module.exports = { migrateUsers };
