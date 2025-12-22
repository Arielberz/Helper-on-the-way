const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
const User = require('./api/models/userModel');

async function setAdminRole() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.log('❌ MONGO_URI not found in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB || undefined,
    });
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'info.helperontheway@gmail.com';
    console.log(`\n🔍 Looking for user with email: ${adminEmail}`);

    // Find user by email
    const user = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!user) {
      console.log(`\n❌ User not found with email: ${adminEmail}`);
      console.log('Please make sure you have registered with this email first.');
      process.exit(1);
    }

    console.log(`\n✅ User found:`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role || 'undefined'}`);

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log(`\n✅ Successfully updated role to: admin`);
    console.log(`\n🎉 ${user.username} is now an administrator!`);
    console.log('\nNext steps:');
    console.log('1. Logout from your current session');
    console.log('2. Login again with info.helperontheway@gmail.com');
    console.log('3. Navigate to /admin');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
setAdminRole();
