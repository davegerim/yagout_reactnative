// Test script to verify YagoutPay configuration
import { getCurrentConfig } from './yagoutPayConfig';

export const testYagoutPayConfig = () => {
  const config = getCurrentConfig(false); // Test environment
  
  console.log('=== YagoutPay Configuration Test ===');
  console.log('Merchant ID (API):', config.MERCHANT_ID_API);
  console.log('Encryption Key (API):', config.ENCRYPTION_KEY_API);
  console.log('Aggregator ID:', config.AGGREGATOR_ID);
  console.log('API URL:', config.POST_URL_API);
  console.log('Hosted URL:', config.POST_URL_HOSTED);
  
  // Verify the correct merchant ID
  if (config.MERCHANT_ID_API === '202508080001') {
    console.log('✅ Merchant ID is correct: 202508080001');
  } else {
    console.log('❌ Merchant ID is incorrect:', config.MERCHANT_ID_API);
    console.log('Expected: 202508080001');
  }
  
  // Verify the correct encryption key
  if (config.ENCRYPTION_KEY_API === 'IG3CNW5uNrUO2mU2htUOWb9rgXCF7XMAXmL63d7wNZo=') {
    console.log('✅ Encryption Key is correct');
  } else {
    console.log('❌ Encryption Key is incorrect');
    console.log('Expected: IG3CNW5uNrUO2mU2htUOWb9rgXCF7XMAXmL63d7wNZo=');
  }
  
  console.log('=== Configuration Test Complete ===');
  
  return {
    merchantId: config.MERCHANT_ID_API,
    encryptionKey: config.ENCRYPTION_KEY_API,
    aggregatorId: config.AGGREGATOR_ID,
    apiUrl: config.POST_URL_API
  };
};
