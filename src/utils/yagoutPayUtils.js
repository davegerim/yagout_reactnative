import CryptoJS from 'crypto-js';
import { YAGOUT_PAY_CONFIG, getCurrentConfig } from './yagoutPayConfig';

/**
 * YagoutPay Encryption Utility
 * Implements AES-256-CBC encryption with static IV as per YagoutPay documentation
 */
export class YagoutPayCrypto {
  constructor(isProduction = false) {
    this.config = getCurrentConfig(isProduction);
    this.iv = CryptoJS.enc.Utf8.parse(YAGOUT_PAY_CONFIG.COMMON.IV);
  }

  /**
   * Encrypt text using AES-256-CBC
   * @param {string} text - Plain text to encrypt
   * @param {string} key - Base64 encoded encryption key
   * @returns {string} Base64 encoded encrypted text
   */
  encrypt(text, key) {
    try {
      // Add PKCS#7 padding manually
      const blockSize = 16;
      const pad = blockSize - (text.length % blockSize);
      const paddedText = text + String.fromCharCode(pad).repeat(pad);
      
      // Decode the base64 key
      const keyBytes = CryptoJS.enc.Base64.parse(key);
      
      // Encrypt using AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(paddedText),
        keyBytes,
        {
          iv: this.iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.NoPadding
        }
      );
      
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt encrypted text using AES-256-CBC
   * @param {string} encryptedText - Base64 encoded encrypted text
   * @param {string} key - Base64 encoded encryption key
   * @returns {string} Decrypted plain text
   */
  decrypt(encryptedText, key) {
    try {
      // Decode the base64 key
      const keyBytes = CryptoJS.enc.Base64.parse(key);
      
      // Decrypt using AES-256-CBC
      const decrypted = CryptoJS.AES.decrypt(
        encryptedText,
        keyBytes,
        {
          iv: this.iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.NoPadding
        }
      );
      
      const decryptedBytes = decrypted.toString(CryptoJS.enc.Utf8);
      
      // Remove PKCS#7 padding
      const lastByte = decryptedBytes.charCodeAt(decryptedBytes.length - 1);
      if (lastByte > 0 && lastByte <= 16) {
        const paddingLength = lastByte;
        const unpadded = decryptedBytes.slice(0, -paddingLength);
        return unpadded;
      }
      
      return decryptedBytes;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

/**
 * Generate unique order number
 * @returns {string} Unique order number
 */
export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD${timestamp}${random}`;
};

/**
 * Format transaction data for Aggregator Hosted (Non-Seamless) integration
 * @param {Object} transactionData - Transaction details
 * @returns {Object} Formatted data for hosted integration
 */
export const formatHostedTransactionData = (transactionData) => {
  const {
    orderNo,
    amount,
    successUrl,
    failureUrl,
    customerDetails,
    billingDetails,
    shippingDetails,
    itemDetails,
  } = transactionData;

  // Format according to YagoutPay documentation sections
  const txnDetails = [
    YAGOUT_PAY_CONFIG.COMMON.AGGREGATOR_ID, // ag_id
    getCurrentConfig().MERCHANT_ID_HOSTED, // me_id
    orderNo, // order_no
    amount.toString(), // amount
    YAGOUT_PAY_CONFIG.COMMON.COUNTRY, // country
    YAGOUT_PAY_CONFIG.COMMON.CURRENCY, // currency
    YAGOUT_PAY_CONFIG.COMMON.TRANSACTION_TYPE, // txn_type
    successUrl, // success_url
    failureUrl, // failure_url
    YAGOUT_PAY_CONFIG.COMMON.CHANNEL_WEB, // channel
  ].join('|');

  const pgDetails = [
    '', // pg_id (blank for hosted)
    '', // paymode (blank for hosted)
    '', // scheme (blank for hosted)
    '', // wallet_type (blank for hosted)
  ].join('|');

  const cardDetails = [
    '', // card_no (blank for hosted)
    '', // exp_month (blank for hosted)
    '', // exp_year (blank for hosted)
    '', // cvv (blank for hosted)
    '', // card_name (blank for hosted)
  ].join('|');

  const custDetails = [
    customerDetails?.name || '', // cust_name
    customerDetails?.email || '', // email_id
    customerDetails?.mobile || '', // mobile_no
    '', // unique_id
    customerDetails?.isLoggedIn || 'Y', // is_logged_in
  ].join('|');

  const billDetails = [
    billingDetails?.address || '', // bill_address
    billingDetails?.city || '', // bill_city
    billingDetails?.state || '', // bill_state
    billingDetails?.country || '', // bill_country
    billingDetails?.zip || '', // bill_zip
  ].join('|');

  const shipDetails = [
    shippingDetails?.address || '', // ship_address
    shippingDetails?.city || '', // ship_city
    shippingDetails?.state || '', // ship_state
    shippingDetails?.country || '', // ship_country
    shippingDetails?.zip || '', // ship_zip
    shippingDetails?.days || '', // ship_days
    '', // address_count
  ].join('|');

  const itemDetailsStr = [
    itemDetails?.count || '', // item_count
    itemDetails?.value || '', // item_value
    itemDetails?.category || '', // item_category
  ].join('|');

  const upiDetails = ''; // Empty for hosted

  const otherDetails = [
    '', // udf_1
    '', // udf_2
    '', // udf_3
    '', // udf_4
    '', // udf_5
  ].join('|');

  // Combine all sections with ~ separator
  const allValues = [
    txnDetails,
    pgDetails,
    cardDetails,
    custDetails,
    billDetails,
    shipDetails,
    itemDetailsStr,
    upiDetails,
    otherDetails,
  ].join('~');

  return {
    allValues,
    merchantId: getCurrentConfig().MERCHANT_ID_HOSTED,
    encryptionKey: getCurrentConfig().ENCRYPTION_KEY_HOSTED,
  };
};

/**
 * Format transaction data for API integration
 * @param {Object} transactionData - Transaction details
 * @returns {Object} Formatted JSON data for API integration
 */
export const formatAPITransactionData = (transactionData) => {
  const {
    orderNo,
    amount,
    successUrl,
    failureUrl,
    customerDetails,
    billingDetails,
    shippingDetails,
    itemDetails,
    paymentMethod = 'WA', // Default to wallet
  } = transactionData;

  return {
    txn_details: {
      agId: YAGOUT_PAY_CONFIG.COMMON.AGGREGATOR_ID,
      meId: getCurrentConfig().MERCHANT_ID_API,
      orderNo: orderNo,
      amount: amount.toString(),
      country: YAGOUT_PAY_CONFIG.COMMON.COUNTRY,
      currency: YAGOUT_PAY_CONFIG.COMMON.CURRENCY,
      transactionType: YAGOUT_PAY_CONFIG.COMMON.TRANSACTION_TYPE,
      sucessUrl: successUrl || '',
      failureUrl: failureUrl || '',
      channel: YAGOUT_PAY_CONFIG.COMMON.CHANNEL_API,
    },
    pg_details: {
      pg_Id: YAGOUT_PAY_CONFIG.PG_DETAILS.PG_ID,
      paymode: paymentMethod,
      scheme_Id: YAGOUT_PAY_CONFIG.PG_DETAILS.SCHEME_ID,
      wallet_type: YAGOUT_PAY_CONFIG.PG_DETAILS.WALLET_TYPE_TELEBIRR,
    },
    card_details: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardName: '',
    },
    cust_details: {
      customerName: customerDetails?.name || '',
      emailId: customerDetails?.email || '',
      mobileNumber: customerDetails?.mobile || '',
      uniqueId: '',
      isLoggedIn: customerDetails?.isLoggedIn || 'Y',
    },
    bill_details: {
      billAddress: billingDetails?.address || '',
      billCity: billingDetails?.city || '',
      billState: billingDetails?.state || '',
      billCountry: billingDetails?.country || '',
      billZip: billingDetails?.zip || '',
    },
    ship_details: {
      shipAddress: shippingDetails?.address || '',
      shipCity: shippingDetails?.city || '',
      shipState: shippingDetails?.state || '',
      shipCountry: shippingDetails?.country || '',
      shipZip: shippingDetails?.zip || '',
      shipDays: shippingDetails?.days || '',
      addressCount: '',
    },
    item_details: {
      itemCount: itemDetails?.count || '',
      itemValue: itemDetails?.value || '',
      itemCategory: itemDetails?.category || '',
    },
    other_details: {
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
      udf6: '',
      udf7: '',
    },
  };
};

/**
 * Create encrypted request for hosted integration
 * @param {Object} transactionData - Transaction details
 * @returns {Object} Encrypted request data
 */
export const createHostedPaymentRequest = async (transactionData) => {
  try {
    const formattedData = formatHostedTransactionData(transactionData);
    const crypto = new YagoutPayCrypto();
    
    const encryptedRequest = crypto.encrypt(
      formattedData.allValues,
      formattedData.encryptionKey
    );
    
    // Create hash as per documentation
    const hashData = crypto.encrypt(
      formattedData.allValues,
      formattedData.encryptionKey
    );
    
    return {
      me_id: formattedData.merchantId,
      merchant_request: encryptedRequest,
      hash: hashData,
      post_url: getCurrentConfig().POST_URL_HOSTED,
    };
  } catch (error) {
    console.error('Failed to create hosted payment request:', error);
    throw error;
  }
};

/**
 * Create encrypted request for API integration
 * @param {Object} transactionData - Transaction details
 * @returns {Object} Encrypted request data
 */
export const createAPIPaymentRequest = async (transactionData) => {
  try {
    const jsonData = formatAPITransactionData(transactionData);
    const crypto = new YagoutPayCrypto();
    
    const encryptedRequest = crypto.encrypt(
      JSON.stringify(jsonData),
      getCurrentConfig().ENCRYPTION_KEY_API
    );
    
    return {
      merchantId: getCurrentConfig().MERCHANT_ID_API,
      merchantRequest: encryptedRequest,
      post_url: getCurrentConfig().POST_URL_API,
    };
  } catch (error) {
    console.error('Failed to create API payment request:', error);
    throw error;
  }
};

/**
 * Decrypt YagoutPay response
 * @param {string} encryptedResponse - Encrypted response from YagoutPay
 * @param {string} encryptionKey - Encryption key
 * @returns {Object} Decrypted response data
 */
export const decryptPaymentResponse = (encryptedResponse, encryptionKey) => {
  try {
    const crypto = new YagoutPayCrypto();
    const decryptedText = crypto.decrypt(encryptedResponse, encryptionKey);
    
    // Try to parse as JSON first (for API responses)
    try {
      return JSON.parse(decryptedText);
    } catch {
      // If not JSON, parse as pipe-separated values (for hosted responses)
      return parseHostedResponse(decryptedText);
    }
  } catch (error) {
    console.error('Failed to decrypt payment response:', error);
    throw error;
  }
};

/**
 * Parse hosted payment response (pipe-separated format)
 * @param {string} responseText - Decrypted response text
 * @returns {Object} Parsed response data
 */
const parseHostedResponse = (responseText) => {
  // This would need to be implemented based on the actual response format
  // from YagoutPay hosted integration
  return {
    status: 'unknown',
    message: responseText,
    raw: responseText,
  };
};