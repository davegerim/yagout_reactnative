// YagoutPay Configuration
export const YAGOUT_PAY_CONFIG = {
  // Test Environment Configuration
  TEST: {
    POST_URL_HOSTED: 'https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/paymentRedirection/checksumGatewayPage',
    POST_URL_API: 'https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/apiRedirection/apiIntegration',
    ENCRYPTION_URL: 'https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/othersRedirection/encryption',
    MERCHANT_ID_HOSTED: '202504290002',
    MERCHANT_ID_API: '202505090001',
    ENCRYPTION_KEY_HOSTED: 'neTdYIKd87JEj4C6ZoYjaeBiCoeOr40ZKBEI8EU/8lo=',
    ENCRYPTION_KEY_API: '6eUzH0ZdoVVBMTHrgdA0sqOFyKm54zojV4/faiSirkE=',
    AGGREGATOR_ID: 'yagout',
  },
  
  // Production Environment Configuration (to be shared by YagoutPay)
  PRODUCTION: {
    POST_URL_HOSTED: '', // To be provided
    POST_URL_API: '', // To be provided
    ENCRYPTION_URL: '', // To be provided
    MERCHANT_ID_HOSTED: '', // To be provided
    MERCHANT_ID_API: '', // To be provided
    ENCRYPTION_KEY_HOSTED: '', // To be provided
    ENCRYPTION_KEY_API: '', // To be provided
    AGGREGATOR_ID: 'yagout',
  },
  
  // Common Configuration
  COMMON: {
    IV: '0123456789abcdef', // Static IV for AES encryption
    ALGORITHM: 'AES-256-CBC',
    COUNTRY: 'ETH',
    CURRENCY: 'ETB',
    TRANSACTION_TYPE: 'SALE',
    CHANNEL_WEB: 'WEB',
    CHANNEL_MOBILE: 'MOBILE',
    CHANNEL_API: 'API',
  },
  
  // Payment Gateway Details for API Integration
  PG_DETAILS: {
    PG_ID: '67ee846571e740418d688c3f',
    PAYMODE_WALLET: 'WA',
    SCHEME_ID: '7',
    WALLET_TYPE_TELEBIRR: 'telebirr',
  },
  
  // Response Status
  STATUS: {
    SUCCESS: 'Success',
    FAILED: 'Failed',
    PENDING: 'Pending',
  },
};

// Environment selector
export const getCurrentConfig = (isProduction = false) => {
  return isProduction ? YAGOUT_PAY_CONFIG.PRODUCTION : YAGOUT_PAY_CONFIG.TEST;
};

// Payment method types
export const PAYMENT_METHODS = {
  YAGOUT_HOSTED: 'yagout_hosted',
  YAGOUT_API: 'yagout_api',
  CREDIT_CARD: 'credit',
  PAYPAL: 'paypal',
};

// YagoutPay specific error codes
export const YAGOUT_ERROR_CODES = {
  INVALID_REFERRAL_URL: 'Invalid Referral URL',
  ENCRYPTION_FAILED: 'Encryption Failed',
  DECRYPTION_FAILED: 'Decryption Failed',
  INVALID_REQUEST: 'Invalid Request',
  PAYMENT_CANCELLED: 'Payment Cancelled',
  PAYMENT_FAILED: 'Payment Failed',
};