import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createHostedPaymentRequest,
  createAPIPaymentRequest,
  decryptPaymentResponse,
  generateOrderNumber,
} from '../utils/yagoutPayUtils';
import { getCurrentConfig } from '../utils/yagoutPayConfig';

// Async thunk for initiating hosted payment
export const initiateHostedPayment = createAsyncThunk(
  'yagoutPay/initiateHostedPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const orderNo = generateOrderNumber();
      
      const transactionData = {
        orderNo,
        amount: paymentData.amount,
        successUrl: paymentData.successUrl,
        failureUrl: paymentData.failureUrl,
        customerDetails: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          mobile: paymentData.customerMobile,
          isLoggedIn: 'Y',
        },
        billingDetails: paymentData.billingDetails,
        shippingDetails: paymentData.shippingDetails,
        itemDetails: paymentData.itemDetails,
      };

      const encryptedRequest = await createHostedPaymentRequest(transactionData);
      
      return {
        orderNo,
        encryptedRequest,
        transactionData,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to initiate hosted payment',
        error: error,
      });
    }
  }
);

// Async thunk for API payment
export const processAPIPayment = createAsyncThunk(
  'yagoutPay/processAPIPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const orderNo = generateOrderNumber();
      
      const transactionData = {
        orderNo,
        amount: paymentData.amount,
        successUrl: paymentData.successUrl,
        failureUrl: paymentData.failureUrl,
        customerDetails: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          mobile: paymentData.customerMobile,
          isLoggedIn: 'Y',
        },
        billingDetails: paymentData.billingDetails,
        shippingDetails: paymentData.shippingDetails,
        itemDetails: paymentData.itemDetails,
        paymentMethod: paymentData.paymentMethod || 'WA',
      };

      const encryptedRequest = await createAPIPaymentRequest(transactionData);
      
      // Make API call to YagoutPay
      const response = await fetch(encryptedRequest.post_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId: encryptedRequest.merchantId,
          merchantRequest: encryptedRequest.merchantRequest,
        }),
      });

      const responseData = await response.json();
      
      if (responseData.status === 'Success') {
        // Decrypt the response
        const decryptedResponse = decryptPaymentResponse(
          responseData.response,
          getCurrentConfig().ENCRYPTION_KEY_API
        );
        
        return {
          orderNo,
          status: 'success',
          response: decryptedResponse,
          transactionData,
        };
      } else {
        throw new Error(responseData.statusMessage || 'Payment failed');
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'API payment processing failed',
        error: error,
      });
    }
  }
);

// Async thunk for handling payment response
export const handlePaymentResponse = createAsyncThunk(
  'yagoutPay/handlePaymentResponse',
  async (responseData, { rejectWithValue }) => {
    try {
      const { encryptedResponse, encryptionKey, paymentMethod } = responseData;
      
      const decryptedResponse = decryptPaymentResponse(encryptedResponse, encryptionKey);
      
      return {
        decryptedResponse,
        paymentMethod,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to process payment response',
        error: error,
      });
    }
  }
);

const initialState = {
  // Payment states
  isProcessing: false,
  currentOrderNo: null,
  paymentMethod: null, // 'hosted' or 'api'
  
  // Hosted payment data
  hostedPaymentData: null,
  hostedPaymentUrl: null,
  
  // API payment data
  apiPaymentResponse: null,
  
  // Payment result
  paymentResult: null,
  paymentStatus: null, // 'idle', 'processing', 'success', 'failed'
  
  // Transaction history
  transactions: [],
  
  // Error handling
  error: null,
  lastError: null,
  
  // UI states
  showPaymentModal: false,
  showWebView: false,
};

const yagoutPaySlice = createSlice({
  name: 'yagoutPay',
  initialState,
  reducers: {
    // Reset payment state
    resetPaymentState: (state) => {
      state.isProcessing = false;
      state.currentOrderNo = null;
      state.paymentMethod = null;
      state.hostedPaymentData = null;
      state.hostedPaymentUrl = null;
      state.apiPaymentResponse = null;
      state.paymentResult = null;
      state.paymentStatus = 'idle';
      state.error = null;
      state.showPaymentModal = false;
      state.showWebView = false;
    },
    
    // Set payment method
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    
    // Show/hide payment modal
    setShowPaymentModal: (state, action) => {
      state.showPaymentModal = action.payload;
    },
    
    // Show/hide WebView
    setShowWebView: (state, action) => {
      state.showWebView = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Add transaction to history
    addTransaction: (state, action) => {
      state.transactions.unshift({
        id: action.payload.orderNo,
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
      
      // Keep only last 50 transactions
      if (state.transactions.length > 50) {
        state.transactions = state.transactions.slice(0, 50);
      }
    },
    
    // Set hosted payment URL for WebView
    setHostedPaymentUrl: (state, action) => {
      state.hostedPaymentUrl = action.payload;
    },
    
    // Handle WebView navigation for hosted payment
    handleWebViewNavigation: (state, action) => {
      const { url } = action.payload;
      
      // Check if it's a success or failure URL
      if (url.includes('success') || url.includes('Response.php')) {
        state.paymentStatus = 'success';
        state.showWebView = false;
      } else if (url.includes('failure') || url.includes('error')) {
        state.paymentStatus = 'failed';
        state.showWebView = false;
        state.error = 'Payment was cancelled or failed';
      }
    },
  },
  extraReducers: (builder) => {
    // Hosted payment initiation
    builder
      .addCase(initiateHostedPayment.pending, (state) => {
        state.isProcessing = true;
        state.paymentStatus = 'processing';
        state.error = null;
      })
      .addCase(initiateHostedPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentOrderNo = action.payload.orderNo;
        state.hostedPaymentData = action.payload.encryptedRequest;
        state.paymentMethod = 'hosted';
        state.paymentStatus = 'ready';
        
        // Add to transaction history
        state.transactions.unshift({
          id: action.payload.orderNo,
          method: 'hosted',
          status: 'initiated',
          data: action.payload.transactionData,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(initiateHostedPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.paymentStatus = 'failed';
        state.error = action.payload?.message || 'Failed to initiate hosted payment';
        state.lastError = action.payload;
      });
    
    // API payment processing
    builder
      .addCase(processAPIPayment.pending, (state) => {
        state.isProcessing = true;
        state.paymentStatus = 'processing';
        state.error = null;
      })
      .addCase(processAPIPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentOrderNo = action.payload.orderNo;
        state.apiPaymentResponse = action.payload.response;
        state.paymentMethod = 'api';
        state.paymentStatus = 'success';
        state.paymentResult = action.payload;
        
        // Add to transaction history
        state.transactions.unshift({
          id: action.payload.orderNo,
          method: 'api',
          status: 'completed',
          result: action.payload.response,
          data: action.payload.transactionData,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(processAPIPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.paymentStatus = 'failed';
        state.error = action.payload?.message || 'API payment processing failed';
        state.lastError = action.payload;
      });
    
    // Payment response handling
    builder
      .addCase(handlePaymentResponse.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(handlePaymentResponse.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.paymentResult = action.payload.decryptedResponse;
        state.paymentStatus = 'success';
        
        // Update the latest transaction
        if (state.transactions.length > 0) {
          state.transactions[0].result = action.payload.decryptedResponse;
          state.transactions[0].status = 'completed';
          state.transactions[0].processedAt = action.payload.processedAt;
        }
      })
      .addCase(handlePaymentResponse.rejected, (state, action) => {
        state.isProcessing = false;
        state.paymentStatus = 'failed';
        state.error = action.payload?.message || 'Failed to process payment response';
        state.lastError = action.payload;
      });
  },
});

export const {
  resetPaymentState,
  setPaymentMethod,
  setShowPaymentModal,
  setShowWebView,
  clearError,
  addTransaction,
  setHostedPaymentUrl,
  handleWebViewNavigation,
} = yagoutPaySlice.actions;

// Selectors
export const selectYagoutPayState = (state) => state.yagoutPay;
export const selectIsProcessing = (state) => state.yagoutPay.isProcessing;
export const selectPaymentStatus = (state) => state.yagoutPay.paymentStatus;
export const selectPaymentResult = (state) => state.yagoutPay.paymentResult;
export const selectHostedPaymentData = (state) => state.yagoutPay.hostedPaymentData;
export const selectTransactions = (state) => state.yagoutPay.transactions;
export const selectCurrentOrderNo = (state) => state.yagoutPay.currentOrderNo;
export const selectPaymentError = (state) => state.yagoutPay.error;

export default yagoutPaySlice.reducer;