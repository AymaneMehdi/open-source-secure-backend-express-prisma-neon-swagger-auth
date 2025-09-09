#!/usr/bin/env node

// Simple API test script to verify the backend setup
const http = require('http');

const testEndpoint = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health check
    console.log('1️⃣  Testing health endpoint...');
    const health = await testEndpoint('/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data, null, 2)}\n`);

    // Test root endpoint
    console.log('2️⃣  Testing root endpoint...');
    const root = await testEndpoint('/');
    console.log(`   Status: ${root.status}`);
    console.log(`   Message: ${root.data.message}\n`);

    // Test API documentation
    console.log('3️⃣  Testing API documentation...');
    const docs = await testEndpoint('/api-docs/swagger-ui-bundle.js');
    console.log(`   Status: ${docs.status}`);
    console.log(`   Swagger UI: ${docs.status === 200 ? '✅ Available' : '❌ Not Available'}\n`);

    // Test categories endpoint (public)
    console.log('4️⃣  Testing categories endpoint...');
    const categories = await testEndpoint('/api/categories');
    console.log(`   Status: ${categories.status}`);
    console.log(`   Categories: ${JSON.stringify(categories.data, null, 2)}\n`);

    console.log('🎉 Basic API tests completed!');
    console.log('\n📚 To test the full API:');
    console.log('   1. Visit http://localhost:3000/api-docs for Swagger documentation');
    console.log('   2. Register a user via POST /auth/register');
    console.log('   3. Login via POST /auth/login to get JWT token');
    console.log('   4. Use the JWT token for authenticated endpoints');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n🔍 Make sure the server is running:');
    console.log('   npm run dev');
  }
}

// Only run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testEndpoint, runTests };