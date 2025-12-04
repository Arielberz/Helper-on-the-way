// Migration script to normalize all phone numbers in the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./api/models/userModel');

function normalizePhone(phone) {
    let s = String(phone || '').trim();
    // Remove all non-digit characters except +
    s = s.replace(/[^\d+]/g, '');
    
    // If starts with 05, convert to +9725
    if (s.startsWith('05')) {
        s = '+972' + s.substring(1);
    }
    // If starts with 9725, add +
    else if (s.startsWith('9725')) {
        s = '+' + s;
    }
    
    return s;
}

async function migratePhoneNumbers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all users
        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        let updated = 0;
        let skipped = 0;

        for (const user of users) {
            const oldPhone = user.phone;
            const newPhone = normalizePhone(oldPhone);

            if (oldPhone !== newPhone) {
                console.log(`Updating user ${user.username}: ${oldPhone} -> ${newPhone}`);
                user.phone = newPhone;
                await user.save();
                updated++;
            } else {
                console.log(`Skipping user ${user.username}: phone already normalized (${oldPhone})`);
                skipped++;
            }
        }

        console.log('\n=== Migration Complete ===');
        console.log(`Total users: ${users.length}`);
        console.log(`Updated: ${updated}`);
        console.log(`Skipped: ${skipped}`);

        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migratePhoneNumbers();
