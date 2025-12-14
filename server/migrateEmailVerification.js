/**
 * Migration script to mark all existing users as email verified
 * Run this once to fix users created before email verification was added
 * 
 * Usage: node migrateEmailVerification.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./api/models/userModel');

async function migrateEmailVerification() {
    try {
        console.info('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.info('Connected to MongoDB');

        // Find all users where emailVerified is not explicitly set to true
        const usersToUpdate = await User.find({
            $or: [
                { emailVerified: { $exists: false } },
                { emailVerified: false }
            ]
        });

        console.info(`Found ${usersToUpdate.length} users to update`);

        if (usersToUpdate.length === 0) {
            console.info('No users need updating. All users are already verified.');
            process.exit(0);
        }

        // Update all these users to be verified
        const result = await User.updateMany(
            {
                $or: [
                    { emailVerified: { $exists: false } },
                    { emailVerified: false }
                ]
            },
            {
                $set: { emailVerified: true }
            }
        );

        console.info(`✓ Successfully updated ${result.modifiedCount} users`);
        console.info('All existing users are now marked as email verified');
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateEmailVerification();
