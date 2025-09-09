import {
  createAPIPaymentRequest,
  decryptPaymentResponse,
  YagoutPayCrypto,
} from '../utils/yagoutPayUtils';
import { getCurrentConfig, YAGOUT_PAY_CONFIG } from '../utils/yagoutPayConfig';

/**
 * YagoutPay API Service
 * Handles all API interactions with YagoutPay payment gateway
 */
export class YagoutPayService {
  constructor(isProduction = false) {
    this.config = getCurrentConfig(isProduction);
    this.crypto = new YagoutPayCrypto(isProduction);
    this.isProduction = isProduction;
  }

  /**
   * Process payment using YagoutPay API
   * @param {Object} paymentData - Payment transaction data
   * @returns {Promise<Object>} Payment response
   */
  async processPayment(paymentData) {
    try {
      // Create encrypted request
      const encryptedRequest = await createAPIPaymentRequest(paymentData);
      
      // Make API call
      const response = await this.makeAPICall(
        encryptedRequest.post_url,
        {
          merchantId: encryptedRequest.merchantId,
          merchantRequest: encryptedRequest.merchantRequest,
        }
      );

      // Handle response
      return await this.handleAPIResponse(response);
    } catch (error) {
      console.error('YagoutPay API payment failed:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Make API call to YagoutPay
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request data
   * @returns {Promise<Object>} API response
   */
  async makeAPICall(url, data) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'YagoutPay-ReactNative/1.0',
      },
      body: JSON.stringify(data),
    };

    try {
      console.log('Making YagoutPay API call to:', url);
      console.log('Request data:', { merchantId: data.merchantId });
      
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('YagoutPay API response:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  /**
   * Handle and decrypt API response
   * @param {Object} response - Raw API response
   * @returns {Promise<Object>} Processed response
   */
  async handleAPIResponse(response) {
    try {
      if (response.status !== YAGOUT_PAY_CONFIG.STATUS.SUCCESS) {
        throw new Error(response.statusMessage || 'Payment processing failed');
      }

      // Decrypt the response
      const decryptedData = decryptPaymentResponse(
        response.response,
        this.config.ENCRYPTION_KEY_API
      );

      return {
        success: true,
        data: decryptedData,
        raw: response,
        decryptedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to handle API response:', error);
      throw error;
    }
  }

  /**
   * Verify payment status
   * @param {string} orderNo - Order number to verify
   * @returns {Promise<Object>} Payment status
   */
  async verifyPayment(orderNo) {
    try {
      // This would be implemented based on YagoutPay's verification API
      // For now, return a mock response
      return {
        orderNo,
        status: 'success',
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Encrypt data for YagoutPay
   * @param {string} data - Data to encrypt
   * @returns {string} Encrypted data
   */
  encryptData(data) {
    try {
      return this.crypto.encrypt(data, this.config.ENCRYPTION_KEY_API);
    } catch (error) {
      console.error('Data encryption failed:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Decrypt data from YagoutPay
   * @param {string} encryptedData - Encrypted data to decrypt
   * @returns {string} Decrypted data
   */
  decryptData(encryptedData) {
    try {
      return this.crypto.decrypt(encryptedData, this.config.ENCRYPTION_KEY_API);
    } catch (error) {
      console.error('Data decryption failed:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Test API connectivity
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      // Test with encryption API
      const testData = JSON.stringify({
        test: true,
        timestamp: Date.now(),
      });
      
      const encrypted = this.encryptData(testData);
      
      const response = await this.makeAPICall(
        this.config.ENCRYPTION_URL,
        { data: encrypted }
      );
      
      return response.status === 'Success';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Format error for consistent error handling
   * @param {Error} error - Original error
   * @returns {Object} Formatted error
   */
  formatError(error) {
    return {
      message: error.message || 'Unknown error occurred',
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details || null,
      timestamp: new Date().toISOString(),
      service: 'YagoutPay',
    };
  }

  /**
   * Get payment methods configuration
   * @returns {Object} Available payment methods
   */
  getPaymentMethods() {
    return {
      wallet: {
        telebirr: {
          id: YAGOUT_PAY_CONFIG.PG_DETAILS.WALLET_TYPE_TELEBIRR,
          name: 'TeleBirr',
          icon: 'wallet',
          description: 'Pay with TeleBirr wallet',
        },
      },
      cards: {
        supported: ['visa', 'mastercard', 'amex'],
        description: 'Pay with credit/debit card',
      },
    };
  }

  /**
   * Format amount for YagoutPay (ensure 2 decimal places)
   * @param {number} amount - Amount to format
   * @returns {string} Formatted amount
   */
  formatAmount(amount) {
    return parseFloat(amount).toFixed(2);
  }

  /**
   * Validate transaction data
   * @param {Object} transactionData - Transaction data to validate
   * @returns {Object} Validation result
   */
  validateTransactionData(transactionData) {
    const errors = [];
    
    // Required fields validation
    if (!transactionData.orderNo) {
      errors.push('Order number is required');
    }
    
    if (!transactionData.amount || transactionData.amount <= 0) {
      errors.push('Valid amount is required');
    }
    
    if (!transactionData.customerDetails?.email) {
      errors.push('Customer email is required');
    }
    
    if (!transactionData.customerDetails?.mobile) {
      errors.push('Customer mobile number is required');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (transactionData.customerDetails?.email && 
        !emailRegex.test(transactionData.customerDetails.email)) {
      errors.push('Valid email address is required');
    }
    
    // Mobile number validation (basic)
    const mobileRegex = /^\d{10,15}$/;
    if (transactionData.customerDetails?.mobile && 
        !mobileRegex.test(transactionData.customerDetails.mobile.replace(/\D/g, ''))) {
      errors.push('Valid mobile number is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get transaction status mapping
   * @param {string} yagoutStatus - YagoutPay status
   * @returns {string} Normalized status
   */
  mapTransactionStatus(yagoutStatus) {
    const statusMap = {
      'Success': 'completed',
      'Failed': 'failed',
      'Pending': 'pending',
      'Processing': 'processing',
      'Cancelled': 'cancelled',
    };
    
    return statusMap[yagoutStatus] || 'unknown';
  }
}

// Export singleton instance
export const yagoutPayService = new YagoutPayService();

// Export production instance factory
export const createProductionService = () => new YagoutPayService(true);