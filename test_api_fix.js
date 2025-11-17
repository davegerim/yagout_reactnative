/**
 * Test Script for YagoutPay API Integration Fix
 *
 * This script tests the fixed API integration to verify that
 * the "Merchant is not Authorized" error is resolved.
 */

const axios = require("axios");

// Configuration
const SERVER_URL = "http://localhost:3000";
const TEST_ENDPOINT = `${SERVER_URL}/payments/api/initiate`;

// Test data matching the specification
const testPayload = {
  order_no: `OR-DOIT-${Math.floor(1000 + Math.random() * 9000)}`,
  amount: "100",
  customer_name: "Test User",
  email_id: "test@example.com",
  mobile_no: "0985392862",
  bill_address: "Test Address",
  bill_city: "Addis Ababa",
  bill_state: "Addis Ababa",
  bill_country: "ETH",
  bill_zip: "1000",
  pg_id: "67ee846571e740418d688c3f",
  paymode: "WA",
  scheme_id: "7",
  wallet_type: "telebirr",
};

console.log("🧪 Testing YagoutPay API Integration Fix\n");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("📋 Test Configuration:");
console.log(`   Server URL: ${SERVER_URL}`);
console.log(`   Endpoint: ${TEST_ENDPOINT}`);
console.log(`   Order ID: ${testPayload.order_no}`);
console.log(`   Amount: ${testPayload.amount} ETB`);
console.log("\n═══════════════════════════════════════════════════════════\n");

// Test function
async function testAPIIntegration() {
  try {
    console.log("🚀 Sending test request to server...\n");

    const response = await axios.post(TEST_ENDPOINT, testPayload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    console.log("✅ Response received!\n");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📥 Response Details:");
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );
    console.log(`Status Code: ${response.status}`);
    console.log("\nResponse Data:");
    console.log(JSON.stringify(response.data, null, 2));
    console.log(
      "\n═══════════════════════════════════════════════════════════\n"
    );

    // Check for success
    if (response.data && response.data.status === "Failure") {
      if (response.data.statusMessage === "Merchant is not Authorized.") {
        console.log(
          '❌ TEST FAILED: Still getting "Merchant is not Authorized" error'
        );
        console.log("\n🔍 Possible issues:");
        console.log("   1. Server not restarted after code changes");
        console.log("   2. Wrong merchant credentials");
        console.log("   3. API configuration issue");
        process.exit(1);
      } else {
        console.log(`⚠️  API returned failure: ${response.data.statusMessage}`);
        console.log(
          "\nThis might be a different API error, not the authorization issue."
        );
      }
    } else if (response.data && response.data.status === "Success") {
      console.log("✅ TEST PASSED: API integration working correctly!");
      console.log('\n🎉 The "Merchant is not Authorized" error is fixed!');
    } else {
      console.log(
        "⚠️  Unexpected response format. Check the response data above."
      );
    }
  } catch (error) {
    console.error("❌ TEST FAILED: Error occurred\n");
    console.error(
      "═══════════════════════════════════════════════════════════"
    );
    console.error("📥 Error Details:");
    console.error(
      "═══════════════════════════════════════════════════════════\n"
    );

    if (error.response) {
      // Server responded with error
      console.error(`Status Code: ${error.response.status}`);
      console.error("\nResponse Data:");
      console.error(JSON.stringify(error.response.data, null, 2));

      if (
        error.response.data?.statusMessage === "Merchant is not Authorized."
      ) {
        console.error('\n❌ Still getting "Merchant is not Authorized" error');
        console.error("\n🔍 Debugging steps:");
        console.error("   1. Verify server.js has been updated with the fixes");
        console.error(
          "   2. Restart the server: node yagout_reactnative/server.js"
        );
        console.error("   3. Check that merchant ID is: 202508080001");
        console.error("   4. Verify encryption key matches the configuration");
      }
    } else if (error.request) {
      // Request made but no response
      console.error("No response received from server");
      console.error("\n🔍 Possible issues:");
      console.error("   1. Server is not running");
      console.error("   2. Wrong server URL");
      console.error("   3. Network connectivity issue");
      console.error(
        "\nStart the server with: node yagout_reactnative/server.js"
      );
    } else {
      // Other errors
      console.error(`Error: ${error.message}`);
    }

    console.error(
      "\n═══════════════════════════════════════════════════════════\n"
    );
    process.exit(1);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    console.log("🔍 Checking if server is running...\n");
    const response = await axios.get(SERVER_URL, { timeout: 5000 });
    console.log(`✅ Server is running: ${response.data.message}\n`);
    return true;
  } catch (error) {
    console.error("❌ Server is not responding!");
    console.error("\n🔧 Please start the server first:");
    console.error("   cd yagout_reactnative");
    console.error("   node server.js");
    console.error("\nThen run this test again:\n");
    console.error("   node test_api_fix.js\n");
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();

  if (serverRunning) {
    await testAPIIntegration();
  } else {
    process.exit(1);
  }
})();








