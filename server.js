const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// YagoutPay Configuration
const YAGOUT_CONFIG = {
  MERCHANT_ID_API: '202508080001',
  ENCRYPTION_KEY_API: 'IG3CNW5uNrUO2mU2htUOWb9rgXCF7XMAXmL63d7wNZo=',
  AGGREGATOR_ID: 'yagout',
  POST_URL_API: 'https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/apiRedirection/apiIntegration'
};

// AES-256-CBC Encryption function - EXACT method from working backend
class CryptoUtil {
  constructor() {
    this.iv = '0123456789abcdef';  // Fixed IV - exactly 16 characters
  }

  aes256CbcEncryptToBase64(text, keyBase64) {
    const key = Buffer.from(keyBase64, 'base64');     // Convert key from base64
    const iv = Buffer.from(this.iv, 'utf8');          // Convert IV from utf8
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return encrypted;
  }
}

function encryptData(data, key) {
  try {
    console.log('=== ENCRYPTION DEBUG ===');
    console.log('Data to encrypt length:', data.length);
    console.log('Key (base64):', key);
    console.log('IV:', '0123456789abcdef');
    
    const cryptoUtil = new CryptoUtil();
    const encryptedData = cryptoUtil.aes256CbcEncryptToBase64(data, key);
    
    console.log('Encrypted data length:', encryptedData.length);
    console.log('Encrypted data (first 50 chars):', encryptedData.substring(0, 50));
    console.log('========================');
    
    return encryptedData;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data: ' + error.message);
  }
}

// API endpoint for payment initiation
app.post('/payments/api/initiate', async (req, res) => {
  try {
    console.log('=== BACKEND PAYMENT REQUEST ===');
    console.log('Received data:', JSON.stringify(req.body, null, 2));
    
    const {
      order_no,
      amount,
      customer_name,
      email_id,
      mobile_no,
      bill_address,
      bill_city,
      bill_state,
      bill_country,
      bill_zip,
      pg_id,
      paymode,
      scheme_id,
      wallet_type
    } = req.body;
    
    // Validate required fields
    if (!order_no || !amount || !customer_name || !email_id || !mobile_no) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Missing required fields'
      });
    }
    
    // Prepare YagoutPay API data structure
    const yagoutPayData = {
      txn_details: {
        agId: YAGOUT_CONFIG.AGGREGATOR_ID,
        meId: YAGOUT_CONFIG.MERCHANT_ID_API,
        orderID: order_no,
        orderNo: order_no,
        amount: amount.toString(),
        country: "ETH",
        currency: "ETB",
        transactionType: "SALE",
        sucessUrl: "",
        failureUrl: "",
        channel: "API"
      },
      pg_details: {
        pg_Id: pg_id || "67ee846571e740418d688c3f",
        paymode: paymode || "WA",
        scheme_Id: scheme_id || "7",
        wallet_type: wallet_type || "telebirr"
      },
      card_details: {
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardName: ""
      },
      cust_details: {
        customerName: customer_name,
        emailId: email_id,
        mobileNumber: mobile_no,
        uniqueId: "",
        isLoggedIn: "Y"
      },
      bill_details: {
        billAddress: bill_address || "",
        billCity: bill_city || "",
        billState: bill_state || "",
        billCountry: bill_country || "ET",
        billZip: bill_zip || ""
      },
      ship_details: {
        shipAddress: "",
        shipCity: "",
        shipState: "",
        shipCountry: "",
        shipZip: "",
        shipDays: "",
        addressCount: ""
      },
      item_details: {
        itemCount: "1",
        itemValue: amount.toString(),
        itemCategory: "General"
      },
      other_details: {
        udf1: "",
        udf2: "",
        udf3: "",
        udf4: "",
        udf5: "",
        udf6: "",
        udf7: ""
      }
    };
    
    console.log('YagoutPay data structure:', JSON.stringify(yagoutPayData, null, 2));
    
    // Encrypt the data
    const dataToEncrypt = JSON.stringify(yagoutPayData);
    const encryptedData = encryptData(dataToEncrypt, YAGOUT_CONFIG.ENCRYPTION_KEY_API);
    
    console.log('Encrypted data length:', encryptedData.length);
    
    // Prepare request for YagoutPay
    const yagoutRequest = {
      merchantId: YAGOUT_CONFIG.MERCHANT_ID_API,
      merchantRequest: encryptedData
    };
    
    console.log('=== CALLING YAGOUTPAY API ===');
    console.log('URL:', YAGOUT_CONFIG.POST_URL_API);
    console.log('Merchant ID:', YAGOUT_CONFIG.MERCHANT_ID_API);
    
    // Call YagoutPay API with SSL verification disabled for UAT testing
    const yagoutResponse = await axios.post(YAGOUT_CONFIG.POST_URL_API, yagoutRequest, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false  // Disable SSL verification for UAT testing
      })
    });
    
    console.log('=== YAGOUTPAY RESPONSE ===');
    console.log('Status:', yagoutResponse.status);
    console.log('Data:', yagoutResponse.data);
    
    // Return the response to the React Native app
    res.json(yagoutResponse.data);
    
  } catch (error) {
    console.error('=== BACKEND ERROR ===');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('YagoutPay Error Response:', error.response.data);
      res.status(500).json({
        status: 'Failed',
        message: error.response.data?.message || 'Payment processing failed',
        error: error.response.data
      });
    } else {
      res.status(500).json({
        status: 'Failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'YagoutPay Backend Server is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}`);
  console.log(`💳 Payment endpoint: http://localhost:${PORT}/payments/api/initiate`);
});

module.exports = app;
