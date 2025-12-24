/**
 * Migration Script: Add Terms Acceptance Fields to Existing Users
 * 
 * This script adds termsAccepted and termsAcceptedAt fields to existing users.
 * Run this once after deploying the terms & privacy feature.
 * 
 * Usage:
 *   node migrateTermsAcceptance.js
 * 
 * Options:
 *   - Set all existing users as having accepted terms (grandfathering)
 *   - Or leave as false and require re-acceptance on next login
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./api/models/userModel');

const MONGO_URI = process.env.MONGO_URI;

// Configuration: Set to true to grandfather existing users
const GRANDFATHER_EXISTING_USERS = true;

async function migrateTermsAcceptance() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Count users without terms fields
        const usersWithoutTerms = await User.countDocuments({
            $or: [
                { termsAccepted: { $exists: false } },
                { termsAcceptedAt: { $exists: false } }
            ]
        });

        console.log(`📊 Found ${usersWithoutTerms} users without terms acceptance fields`);

        if (usersWithoutTerms === 0) {
            console.log('✅ All users already have terms fields. Nothing to migrate.');
            process.exit(0);
        }

        let updateData;
        if (GRANDFATHER_EXISTING_USERS) {
            // Grandfather existing users - mark as accepted with current timestamp
            updateData = {
                $set: {
                    termsAccepted: true,
                    termsAcceptedAt: new Date()
                }
            };
            console.log('🎯 Mode: Grandfathering existing users (setting termsAccepted=true)');
        } else {
            // Require re-acceptance - mark as not accepted
            updateData = {
                $set: {
                    termsAccepted: false,
                    termsAcceptedAt: null
                }
            };
            console.log('🎯 Mode: Requiring re-acceptance (setting termsAccepted=false)');
        }

        // Update all users missing terms fields
        const result = await User.updateMany(
            {
                $or: [
                    { termsAccepted: { $exists: false } },
                    { termsAcceptedAt: { $exists: false } }
                ]
            },
            updateData
        );

        console.log(`✅ Migration complete!`);
        console.log(`   - Matched: ${result.matchedCount}`);
        console.log(`   - Modified: ${result.modifiedCount}`);

        // Verify the migration
        const verifyCount = await User.countDocuments({
            termsAccepted: { $exists: true },
            termsAcceptedAt: { $exists: true }
        });
        console.log(`✅ Verification: ${verifyCount} users now have terms fields`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔒 Database connection closed');
    }
}

// Run migration
console.log('🚀 Starting Terms Acceptance Migration...\n');
migrateTermsAcceptance();
