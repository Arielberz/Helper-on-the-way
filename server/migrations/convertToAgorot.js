/**
 * Migration script to convert existing payment amounts from ILS to agorot
 * 
 * Run this ONLY if you have existing requests with amounts stored in ILS
 * Run with: node server/migrations/convertToAgorot.js
 * 
 * WARNING: This will modify your database. Make a backup first!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Request = require('../api/models/requestsModel');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in environment variables');
    process.exit(1);
}

async function convertToAgorot() {
    try {
        console.log('🔵 Connecting to database...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to database\n');

        // Find all requests with payment amounts
        const requests = await Request.find({ 
            'payment.offeredAmount': { $exists: true, $gt: 0 } 
        });

        console.log(`📊 Found ${requests.length} requests with payment amounts\n`);

        if (requests.length === 0) {
            console.log('✅ No requests to migrate');
            await mongoose.connection.close();
            return;
        }

        let converted = 0;
        let skipped = 0;
        let errors = 0;

        for (const request of requests) {
            try {
                const currentAmount = request.payment.offeredAmount;

                // Heuristic: if amount is less than 10,000, it's likely in ILS (not agorot)
                // Since most amounts are under 1000 ILS, this should catch them
                // Amounts over 10,000 ILS (1,000,000 agorot) are rare
                if (currentAmount < 10000) {
                    // Likely in ILS, convert to agorot
                    const agorot = Math.round(currentAmount * 100);
                    
                    console.log(`🔄 Converting request ${request._id}:`);
                    console.log(`   Old amount: ${currentAmount} (assumed ILS)`);
                    console.log(`   New amount: ${agorot} (agorot)`);
                    
                    request.payment.offeredAmount = agorot;
                    
                    // Also convert helper and commission amounts if they exist
                    if (request.payment.helperAmount) {
                        const oldHelper = request.payment.helperAmount;
                        request.payment.helperAmount = Math.round(oldHelper * 100);
                        console.log(`   Helper: ${oldHelper} → ${request.payment.helperAmount}`);
                    }
                    
                    if (request.payment.commissionAmount) {
                        const oldCommission = request.payment.commissionAmount;
                        request.payment.commissionAmount = Math.round(oldCommission * 100);
                        console.log(`   Commission: ${oldCommission} → ${request.payment.commissionAmount}`);
                    }
                    
                    // Save without triggering the pre-save hook that recalculates commission
                    await Request.updateOne(
                        { _id: request._id },
                        { 
                            $set: { 
                                'payment.offeredAmount': request.payment.offeredAmount,
                                'payment.helperAmount': request.payment.helperAmount,
                                'payment.commissionAmount': request.payment.commissionAmount
                            }
                        }
                    );
                    
                    console.log(`   ✅ Converted\n`);
                    converted++;
                } else {
                    // Already in agorot (probably)
                    console.log(`⏭️  Skipping request ${request._id}: amount ${currentAmount} likely already in agorot\n`);
                    skipped++;
                }
            } catch (error) {
                console.error(`❌ Error converting request ${request._id}:`, error.message);
                errors++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Converted: ${converted} requests`);
        console.log(`⏭️  Skipped: ${skipped} requests (already in agorot)`);
        console.log(`❌ Errors: ${errors} requests`);
        console.log('='.repeat(60));

        if (converted > 0) {
            console.log('\n✅ Migration completed successfully!');
            console.log('💡 Verify the changes in your database');
            console.log('💡 Test the payment system to ensure everything works');
        }

        await mongoose.connection.close();
        console.log('\n🔵 Database connection closed');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Dry run mode - preview changes without making them
async function dryRun() {
    try {
        console.log('🔵 Running in DRY RUN mode (no changes will be made)\n');
        await mongoose.connect(MONGO_URI);

        const requests = await Request.find({ 
            'payment.offeredAmount': { $exists: true, $gt: 0 } 
        });

        console.log(`📊 Found ${requests.length} requests with payment amounts\n`);

        let wouldConvert = 0;
        let wouldSkip = 0;

        for (const request of requests) {
            const currentAmount = request.payment.offeredAmount;

            if (currentAmount < 10000) {
                const agorot = Math.round(currentAmount * 100);
                console.log(`Would convert request ${request._id}:`);
                console.log(`   ${currentAmount} ILS → ${agorot} agorot`);
                wouldConvert++;
            } else {
                console.log(`Would skip request ${request._id}: ${currentAmount} (likely already in agorot)`);
                wouldSkip++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`Would convert: ${wouldConvert} requests`);
        console.log(`Would skip: ${wouldSkip} requests`);
        console.log('='.repeat(60));

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Dry run failed:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--dry-run') || args.includes('-d')) {
    console.log('🧪 DRY RUN MODE\n');
    dryRun();
} else if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node migrations/convertToAgorot.js [options]\n');
    console.log('Options:');
    console.log('  --dry-run, -d    Preview changes without making them');
    console.log('  --help, -h       Show this help message');
    console.log('\nExample:');
    console.log('  node migrations/convertToAgorot.js --dry-run   # Preview changes');
    console.log('  node migrations/convertToAgorot.js             # Run migration');
} else {
    console.log('⚠️  WARNING: This will modify your database!');
    console.log('⚠️  Make sure you have a backup before proceeding.');
    console.log('\n💡 Run with --dry-run to preview changes first\n');
    
    // Give user 5 seconds to cancel
    console.log('Starting in 5 seconds... (Press Ctrl+C to cancel)');
    setTimeout(() => {
        console.log('\n🚀 Starting migration...\n');
        convertToAgorot();
    }, 5000);
}
