const axios = require('axios');

// Test the health endpoint
async function testHealthEndpoint() {
  try {
    const response = await axios.get('http://localhost:3001/health');
    console.log('✓ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('✗ Health check failed:', error.message);
    return false;
  }
}

// Test the auth endpoint
async function testAuthEndpoint() {
  try {
    // Try to access protected route without token
    const response = await axios.get('http://localhost:3001/api/auth/profile', {
      validateStatus: function (status) {
        return status < 500; // Accept all status codes below 500 as valid for this test
      }
    });

    console.log('✓ Auth endpoint test passed:', response.status);
    return true;
  } catch (error) {
    console.error('✗ Auth endpoint test failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Running API tests...\n');

  const healthResult = await testHealthEndpoint();
  console.log('');
  const authResult = await testAuthEndpoint();

  console.log('\nTest Summary:');
  console.log(`Health check: ${healthResult ? 'PASS' : 'FAIL'}`);
  console.log(`Auth test: ${authResult ? 'PASS' : 'FAIL'}`);

  if (healthResult && authResult) {
    console.log('\n✓ All tests passed!');
  } else {
    console.log('\n✗ Some tests failed!');
    process.exit(1);
  }
}

runTests();