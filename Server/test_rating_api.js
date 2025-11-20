// Quick Test Script for Rating System
// Run with: node test_rating_api.js

const BASE_URL = 'http://localhost:3001';

// Test helper function
async function testEndpoint(name, method, url, body = null, token = null) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   ${method} ${url}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Message: ${data.message}`);
    
    if (data.data) {
      console.log(`   Data:`, JSON.stringify(data.data, null, 2).substring(0, 200) + '...');
    }
    
    return { success: true, status: response.status, data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error };
  }
}

async function runTests() {
  console.log('🚀 Starting Rating System API Tests');
  console.log('=' .repeat(50));
  
  let token = '';
  let helperId = '';
  let requestId = '';
  let ratingId = '';
  
  // Test 1: Register a user
  const registerResult = await testEndpoint(
    'Register User',
    'POST',
    `${BASE_URL}/api/users/register`,
    {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      phone: `+97250${Math.floor(Math.random() * 10000000)}`
    }
  );
  
  if (registerResult.success && registerResult.data.data) {
    token = registerResult.data.data.token;
    console.log(`   ✅ Token received: ${token.substring(0, 20)}...`);
  }
  
  // Test 2: Register a helper
  const helperResult = await testEndpoint(
    'Register Helper',
    'POST',
    `${BASE_URL}/api/users/register`,
    {
      username: `helper_${Date.now()}`,
      email: `helper_${Date.now()}@example.com`,
      password: 'password123',
      phone: `+97250${Math.floor(Math.random() * 10000000)}`
    }
  );
  
  if (helperResult.success && helperResult.data.data) {
    helperId = helperResult.data.data.user.id;
    console.log(`   ✅ Helper ID: ${helperId}`);
  }
  
  // Test 3: Try to create a rating (will fail - no request)
  await testEndpoint(
    'Create Rating (Should Fail - Invalid Request)',
    'POST',
    `${BASE_URL}/api/ratings`,
    {
      requestId: '673d8e5f8a1b2c3d4e5f6abc', // Fake ID
      score: 5,
      review: 'Test review'
    },
    token
  );
  
  // Test 4: Get ratings for helper (should be empty)
  await testEndpoint(
    'Get Helper Ratings (Empty)',
    'GET',
    `${BASE_URL}/api/users/${helperId}/ratings`,
    null,
    null
  );
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Basic tests completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Create a request via your app');
  console.log('   2. Assign a helper to the request');
  console.log('   3. Mark the request as completed');
  console.log('   4. Create a rating using the request ID');
  console.log('\n📚 Check POSTMAN_REQUESTS.md for detailed examples');
}

// Run the tests
runTests().catch(console.error);
