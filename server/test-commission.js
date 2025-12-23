/**
 * Test commission calculation utility
 * Run with: node test-commission.js
 */

const { calculateCommission, roundToClean, getCommissionRatePercentage } = require('./api/utils/commissionUtils');

console.log('=== Commission Calculation Tests ===\n');

// Test cases
const testCases = [
    { amount: 100, description: 'Round amount' },
    { amount: 37.3, description: 'Should round 3.73 commission to 4' },
    { amount: 82.1, description: 'Should round 8.21 commission to 8' },
    { amount: 125, description: 'Should result in 12.5 commission' },
    { amount: 50, description: 'Small amount' },
    { amount: 200, description: 'Larger amount' },
    { amount: 33.33, description: 'Decimal input' },
    { amount: 15.75, description: 'Another decimal' },
    { amount: 0, description: 'Zero amount' },
    { amount: -10, description: 'Negative amount' }
];

console.log(`Commission Rate: ${getCommissionRatePercentage()}%\n`);

testCases.forEach(({ amount, description }) => {
    const result = calculateCommission(amount);
    
    console.log(`Test: ${description}`);
    console.log(`  Input Amount: ${amount}`);
    console.log(`  Commission: ${result.commissionAmount}`);
    console.log(`  Helper Gets: ${result.helperAmount}`);
    console.log(`  Verification: ${result.commissionAmount + result.helperAmount} = ${result.originalTotal}`);
    console.log('');
});

// Test roundToClean function specifically
console.log('\n=== Round To Clean Tests ===\n');

const roundTests = [
    3.73, 3.74, 3.75, 3.76,
    8.21, 8.22, 8.24, 8.25,
    12.5, 12.4, 12.6,
    0.1, 0.24, 0.25, 0.26, 0.49, 0.5, 0.51, 0.74, 0.75, 0.76,
    10.0, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9
];

roundTests.forEach(value => {
    const rounded = roundToClean(value);
    console.log(`${value.toFixed(2)} → ${rounded}`);
});

console.log('\n=== Tests Complete ===');
