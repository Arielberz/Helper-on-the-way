/**
 * Test script for currency converter utilities
 * Run with: node server/api/utils/test-currency-converter.js
 */

const { ilsToAgorot, agorotToIlsString, agorotToIls, isValidAgorotAmount } = require('./currencyConverter');

console.log('🧪 Testing Currency Converter Utilities\n');

// Test 1: ILS to Agorot
console.log('Test 1: ILS to Agorot');
console.log('------------------------');
const tests = [
    { ils: 50, expected: 5000 },
    { ils: 100, expected: 10000 },
    { ils: 10.50, expected: 1050 },
    { ils: 0.01, expected: 1 },
    { ils: 0, expected: 0 }
];

tests.forEach(({ ils, expected }) => {
    const result = ilsToAgorot(ils);
    const pass = result === expected;
    console.log(`${pass ? '✅' : '❌'} ${ils} ILS → ${result} agorot (expected ${expected})`);
});

// Test 2: Agorot to ILS String
console.log('\nTest 2: Agorot to ILS String (for PayPal)');
console.log('------------------------------------------');
const stringTests = [
    { agorot: 5000, expected: '50.00' },
    { agorot: 10000, expected: '100.00' },
    { agorot: 1050, expected: '10.50' },
    { agorot: 1, expected: '0.01' },
    { agorot: 0, expected: '0.00' }
];

stringTests.forEach(({ agorot, expected }) => {
    const result = agorotToIlsString(agorot);
    const pass = result === expected;
    console.log(`${pass ? '✅' : '❌'} ${agorot} agorot → "${result}" (expected "${expected}")`);
});

// Test 3: Agorot to ILS Number
console.log('\nTest 3: Agorot to ILS Number');
console.log('----------------------------');
const numberTests = [
    { agorot: 5000, expected: 50 },
    { agorot: 10000, expected: 100 },
    { agorot: 1050, expected: 10.5 },
    { agorot: 1, expected: 0.01 },
    { agorot: 0, expected: 0 }
];

numberTests.forEach(({ agorot, expected }) => {
    const result = agorotToIls(agorot);
    const pass = result === expected;
    console.log(`${pass ? '✅' : '❌'} ${agorot} agorot → ${result} ILS (expected ${expected})`);
});

// Test 4: Validation
console.log('\nTest 4: Validation');
console.log('------------------');
const validTests = [
    { agorot: 5000, expected: true, desc: 'positive integer' },
    { agorot: 0, expected: true, desc: 'zero' },
    { agorot: -100, expected: false, desc: 'negative' },
    { agorot: 10.5, expected: false, desc: 'decimal' },
    { agorot: 'abc', expected: false, desc: 'string' },
    { agorot: null, expected: false, desc: 'null' }
];

validTests.forEach(({ agorot, expected, desc }) => {
    const result = isValidAgorotAmount(agorot);
    const pass = result === expected;
    console.log(`${pass ? '✅' : '❌'} ${desc}: ${agorot} → ${result} (expected ${expected})`);
});

// Test 5: Error Handling
console.log('\nTest 5: Error Handling');
console.log('----------------------');

try {
    ilsToAgorot(-50);
    console.log('❌ Should throw error for negative ILS');
} catch (e) {
    console.log('✅ Correctly throws error for negative ILS:', e.message);
}

try {
    ilsToAgorot('abc');
    console.log('❌ Should throw error for invalid ILS');
} catch (e) {
    console.log('✅ Correctly throws error for invalid ILS:', e.message);
}

try {
    agorotToIlsString(-100);
    console.log('❌ Should throw error for negative agorot');
} catch (e) {
    console.log('✅ Correctly throws error for negative agorot:', e.message);
}

try {
    agorotToIlsString(10.5);
    console.log('❌ Should throw error for decimal agorot');
} catch (e) {
    console.log('✅ Correctly throws error for decimal agorot:', e.message);
}

// Test 6: Round Trip
console.log('\nTest 6: Round Trip Conversion');
console.log('------------------------------');
const roundTripTests = [50, 100, 10.50, 0.01, 123.45];

roundTripTests.forEach(ils => {
    const agorot = ilsToAgorot(ils);
    const backToIls = agorotToIls(agorot);
    const pass = Math.abs(backToIls - ils) < 0.01; // Allow tiny floating-point difference
    console.log(`${pass ? '✅' : '❌'} ${ils} ILS → ${agorot} agorot → ${backToIls} ILS`);
});

// Test 7: Commission Calculation (in agorot)
console.log('\nTest 7: Commission Calculation');
console.log('-------------------------------');
const commissionTests = [
    { total: 5000, rate: 10 }, // 50 ILS, 10% commission
    { total: 10000, rate: 10 }, // 100 ILS, 10% commission
    { total: 1050, rate: 10 }  // 10.50 ILS, 10% commission
];

commissionTests.forEach(({ total, rate }) => {
    const commission = Math.round(total * (rate / 100));
    const helper = total - commission;
    const totalIls = agorotToIls(total);
    const commissionIls = agorotToIls(commission);
    const helperIls = agorotToIls(helper);
    
    console.log(`Total: ${total} agorot (${totalIls} ILS)`);
    console.log(`  → Commission (${rate}%): ${commission} agorot (${commissionIls} ILS)`);
    console.log(`  → Helper gets: ${helper} agorot (${helperIls} ILS)`);
});

console.log('\n✅ All tests completed!');
console.log('\n💡 Key Takeaways:');
console.log('  - Always store amounts in agorot (integer)');
console.log('  - Use agorotToIlsString() for PayPal API');
console.log('  - Use agorotToIls() for display');
console.log('  - Validate with isValidAgorotAmount()');
console.log('  - Integer math prevents floating-point errors');
