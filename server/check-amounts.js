/**
 * Check payment amounts in database
 * Run with: node server/check-amounts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Request = require('./api/models/requestsModel');

async function checkAmounts() {
    try {
        console.log('🔵 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        const requests = await Request.find({ 
            'payment.offeredAmount': { $exists: true, $gt: 0 } 
        }).limit(10);

        console.log(`📊 Found ${requests.length} requests with payment amounts:\n`);

        requests.forEach((req, index) => {
            const amount = req.payment.offeredAmount;
            console.log(`${index + 1}. Request ${req._id}`);
            console.log(`   Amount: ${amount}`);
            
            if (amount < 1000) {
                console.log(`   ⚠️  Likely in ILS (should be multiplied by 100)`);
                console.log(`   Should be: ${amount * 100} agorot`);
            } else {
                console.log(`   ✅ Likely already in agorot`);
                console.log(`   Equals: ${amount / 100} ILS`);
            }
            console.log('');
        });

        if (requests.length > 0 && requests[0].payment.offeredAmount < 1000) {
            console.log('⚠️  WARNING: Your amounts appear to be in ILS, not agorot!');
            console.log('💡 Run migration:');
            console.log('   node server/migrations/convertToAgorot.js --dry-run  # Preview');
            console.log('   node server/migrations/convertToAgorot.js            # Migrate');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAmounts();
