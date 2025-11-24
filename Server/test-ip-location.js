const API_URL = 'http://localhost:3001/api/users/location/ip';

async function testIP(description, headers = {}) {
    console.log(`\n--- Testing: ${description} ---`);
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(API_URL, { headers });
        const data = await response.json();
        
        console.log('Status:', response.status);
        if (data.success) {
            console.log('Result:', {
                ip: data.data.ip,
                city: data.data.city,
                country: data.data.country,
                source: data.data.source
            });
        } else {
            console.log('Error:', data.message);
        }
    } catch (error) {
        console.error('Request Failed:', error.message);
    }
}

async function runTests() {
    // 1. Test Localhost (Should use auto-detect)
    await testIP('Localhost (No Headers)');

    // 2. Test Private IP in x-forwarded-for (Should use auto-detect)
    await testIP('Private IP (192.168.1.1)', {
        'x-forwarded-for': '192.168.1.1'
    });

    // 3. Test Public IP (Should use specific IP)
    // Using Google's public DNS IP as an example
    await testIP('Public IP (8.8.8.8)', {
        'x-forwarded-for': '8.8.8.8'
    });

    // 4. Test Multiple IPs (Should use first one)
    await testIP('Multiple IPs (8.8.4.4, 10.0.0.1)', {
        'x-forwarded-for': '8.8.4.4, 10.0.0.1'
    });
}

runTests();
