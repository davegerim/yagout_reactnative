// Simple debug function to test the exact API call
import axios from 'axios';

export const debugAPI = async () => {
  console.log('=== DEBUG API TEST ===');
  
  // Test data exactly as it should be
  const testData = {
    order_no: "OR-DOIT-TEST",
    amount: "1.08",
    item_value: "1.08",
    customer_name: "Test User",
    email_id: "test@example.com",
    mobile_no: "911223344",
    bill_address: "Test Address",
    bill_city: "Addis Ababa",
    bill_state: "Addis Ababa",
    bill_country: "Ethiopia",
    bill_zip: "1000",
    pg_id: "67ee846571e740418d688c3f",
    paymode: "WA",
    scheme_id: "7",
    wallet_type: "telebirr",
    item_count: "1",
    item_category: "General",
    merchant_id: "202508080001",
    aggregator_id: "yagout",
    country: "ETH",
    transaction_type: "SALE",
    channel: "API"
  };
  
  console.log('Test data to encrypt:', JSON.stringify(testData, null, 2));
  
  // Test the backend endpoint first
  const backendUrl = 'http://localhost:3000/payments/api/initiate';
  const yagoutUrl = 'https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/apiRedirection/apiIntegration';
  
  // Test backend connection
  try {
    console.log('Testing backend connection...');
    const backendResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('Backend is reachable:', backendResponse.status);
  } catch (error) {
    console.log('Backend connection test:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
  }
  
  // Test the API endpoint directly
  const apiUrl = yagoutUrl;
  
  try {
    // First, let's test if the endpoint is reachable
    console.log('Testing API endpoint reachability...');
    const testResponse = await axios.get(apiUrl, { timeout: 5000 });
    console.log('API endpoint is reachable:', testResponse.status);
  } catch (error) {
    console.log('API endpoint test result:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
  }
  
  // Test with different merchant IDs and order ID formats
  const merchantIds = ["202508080001", "202504290002"];
  
  for (const merchantId of merchantIds) {
    // Test with simple request
    const simpleRequest = {
      merchantId: merchantId,
      merchantRequest: "test"
    };
    
    try {
      console.log(`Testing with merchant ID: ${merchantId}...`);
      const response = await axios.post(apiUrl, simpleRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000
      });
      console.log(`Merchant ${merchantId} response:`, response.data);
    } catch (error) {
      console.log(`Merchant ${merchantId} error:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
    
    // Test with order ID in request
    const orderRequest = {
      merchantId: merchantId,
      orderID: "OR-DOIT-TEST",
      merchantRequest: "test"
    };
    
    try {
      console.log(`Testing with order ID for merchant: ${merchantId}...`);
      const response = await axios.post(apiUrl, orderRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000
      });
      console.log(`Order ID test response:`, response.data);
    } catch (error) {
      console.log(`Order ID test error:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
  }
  
  // Test with empty request
  try {
    console.log('Testing with empty request...');
    const response = await axios.post(apiUrl, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000
    });
    console.log('Empty request response:', response.data);
  } catch (error) {
    console.log('Empty request error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
  }
  
  console.log('=== DEBUG API TEST COMPLETE ===');
};
