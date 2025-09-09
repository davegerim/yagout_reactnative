import axios from 'axios';
import { getCurrentConfig } from '../utils/yagoutPayConfig';
import { YagoutPayCrypto, formatAPITransactionData } from '../utils/yagoutPayUtils';

// Replace with your actual backend URL
const API_BASE_URL = 'http://localhost:3000'; // Update this to your backend URL

export const paymentService = {
  // For Hosted Checkout (WebView)
  async initiateHostedPayment(paymentData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/initiate`, {
        order_no: paymentData.orderNo,
        amount: paymentData.amount,
        customer_name: paymentData.customerName,
        email_id: paymentData.email,
        mobile_no: paymentData.mobile,
        bill_address: paymentData.billingAddress,
        bill_city: paymentData.billingCity,
        bill_state: paymentData.billingState,
        bill_country: paymentData.billingCountry,
        bill_zip: paymentData.billingZip,
        success_url: paymentData.successUrl,
        failure_url: paymentData.failureUrl,
      });
      
      return response.data;
    } catch (error) {
      console.error('Hosted payment initiation failed:', error);
      throw error;
    }
  },

  // For Direct API Integration
  async initiateDirectPayment(paymentData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/api`, {
        order_no: paymentData.orderNo,
        amount: paymentData.amount,
        customer_name: paymentData.customerName,
        email_id: paymentData.email,
        mobile_no: paymentData.mobile,
        bill_address: paymentData.billingAddress,
        bill_city: paymentData.billingCity,
        bill_state: paymentData.billingState,
        bill_country: paymentData.billingCountry,
        bill_zip: paymentData.billingZip,
        pg_id: paymentData.pgId || "67ee846571e740418d688c3f",
        paymode: paymentData.paymode || "WA",
        scheme_id: paymentData.schemeId || "7",
        wallet_type: paymentData.walletType || "telebirr",
        item_count: paymentData.itemCount || "1",
        item_value: paymentData.amount,
        item_category: paymentData.itemCategory || "General"
      });
      
      return response.data;
    } catch (error) {
      console.error('Direct payment initiation failed:', error);
      throw error;
    }
  },

  // Check transaction status
  async getTransactionStatus(orderNo) {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/transaction/${orderNo}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  },

  // Clean and validate payment data
  cleanPaymentData(paymentData) {
    console.log('=== CLEANING PAYMENT DATA ===');
    console.log('Input paymentData:', paymentData);
    console.log('Required fields check:', {
      customerName: paymentData.customerName,
      email: paymentData.email,
      mobile: paymentData.mobile,
      billingAddress: paymentData.billingAddress,
      billingCity: paymentData.billingCity,
      billingState: paymentData.billingState,
      billingCountry: paymentData.billingCountry,
      billingZip: paymentData.billingZip
    });
    
    // Remove currency symbols and ensure proper formatting
    let cleanAmount = paymentData.amount.toString();
    
    // Remove all currency symbols and extra spaces
    cleanAmount = cleanAmount.replace(/[$,ETB\s]/g, '');
    
    // Ensure it's a valid number
    const numericAmount = parseFloat(cleanAmount);
    if (isNaN(numericAmount)) {
      throw new Error('Invalid amount format: ' + paymentData.amount);
    }
    
    const formattedAmount = numericAmount.toFixed(2);
    
    console.log('Data cleaning:', {
      original: paymentData.amount,
      cleaned: cleanAmount,
      numeric: numericAmount,
      formatted: formattedAmount
    });
    
    return {
      order_no: paymentData.orderNo || `OR-DOIT-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      amount: formattedAmount,
      customer_name: paymentData.customerName || "",
      email_id: paymentData.email || "",
      mobile_no: paymentData.mobile || "",
      bill_address: paymentData.billingAddress || "",
      bill_city: paymentData.billingCity || "",
      bill_state: paymentData.billingState || "",
      bill_country: paymentData.billingCountry || "",
      bill_zip: paymentData.billingZip || "",
      pg_id: paymentData.pgId || "67ee846571e740418d688c3f",
      paymode: paymentData.paymode || "WA",
      scheme_id: paymentData.schemeId || "7",
      wallet_type: paymentData.walletType || "telebirr",
      item_count: paymentData.itemCount || "1",
      item_value: formattedAmount, // Use same cleaned amount
      item_category: paymentData.itemCategory || "General"
    };
  },

  // Direct API payment through backend (like your working React app)
  async processDirectPayment(paymentData) {
    try {
      console.log('🚀 PROCESS DIRECT PAYMENT CALLED!');
      console.log('🚀 Raw paymentData received:', JSON.stringify(paymentData, null, 2));
      
      // Use EXACT data structure from working React app - NO CLEANING NEEDED
      const formData = {
        order_no: paymentData.order_no,
        amount: paymentData.amount,
        customer_name: paymentData.customer_name,
        email_id: paymentData.email_id,
        mobile_no: paymentData.mobile_no,
        bill_address: paymentData.bill_address,
        bill_city: paymentData.bill_city,
        bill_state: paymentData.bill_state,
        bill_country: paymentData.bill_country,
        bill_zip: paymentData.bill_zip,
        pg_id: paymentData.pg_id,
        paymode: paymentData.paymode,
        scheme_id: paymentData.scheme_id,
        wallet_type: paymentData.wallet_type
      };
      
      console.log('=== BACKEND API REQUEST ===');
      console.log('URL:', `${API_BASE_URL}/payments/api/initiate`);
      console.log('Form Data:', JSON.stringify(formData, null, 2));
      console.log('================================');

      // Call your backend (same as your working React app)
      const response = await axios.post(`${API_BASE_URL}/payments/api/initiate`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('=== BACKEND API RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);
      console.log('Response Headers:', response.headers);
      console.log('===============================');
      
      return response.data;
    } catch (error) {
      console.error('=== DIRECT PAYMENT ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
        
        // Try to parse the error response for more details
        if (error.response.data) {
          try {
            const errorData = typeof error.response.data === 'string' 
              ? JSON.parse(error.response.data) 
              : error.response.data;
            console.error('Parsed error data:', errorData);
          } catch (parseError) {
            console.error('Could not parse error response:', parseError);
          }
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      console.error('============================');
      
      throw error;
    }
  }
};
