// Test encryption to verify it's working correctly
import { YagoutPayCrypto } from './yagoutPayUtils';
import { getCurrentConfig } from './yagoutPayConfig';

export const testEncryption = () => {
  console.log('=== ENCRYPTION TEST ===');
  
  // Test data that should work
  const testData = {
    order_no: "OR-DOIT-TEST",
    amount: "1.08",
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
    item_value: "1.08",
    item_category: "General",
    merchant_id: getCurrentConfig(false).MERCHANT_ID_API,
    aggregator_id: getCurrentConfig(false).AGGREGATOR_ID,
    country: "ETH",
    currency: "ETB",
    transaction_type: "SALE",
    channel: "API"
  };
  
  console.log('Test data:', JSON.stringify(testData, null, 2));
  
  try {
    // Test encryption
    const dataString = JSON.stringify(testData);
    console.log('Data string to encrypt:', dataString);
    console.log('Data string length:', dataString.length);
    
    const crypto = new YagoutPayCrypto(false); // Use test environment
    const config = getCurrentConfig(false);
    
    const encrypted = crypto.encrypt(dataString, config.ENCRYPTION_KEY_API);
    console.log('Encrypted data length:', encrypted.length);
    console.log('Encrypted data preview:', encrypted.substring(0, 100) + '...');
    
    // Test decryption to verify it works
    const decrypted = crypto.decrypt(encrypted, config.ENCRYPTION_KEY_API);
    console.log('Decrypted data:', decrypted);
    
    const parsedDecrypted = JSON.parse(decrypted);
    console.log('Parsed decrypted data:', parsedDecrypted);
    
    // Verify the data matches
    const matches = JSON.stringify(parsedDecrypted) === JSON.stringify(testData);
    console.log('Encryption/Decryption test:', matches ? '✅ PASSED' : '❌ FAILED');
    
    return {
      success: matches,
      originalData: testData,
      encryptedData: encrypted,
      decryptedData: parsedDecrypted
    };
    
  } catch (error) {
    console.error('Encryption test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test with problematic data
export const testProblematicEncryption = () => {
  console.log('=== PROBLEMATIC DATA ENCRYPTION TEST ===');
  
  // Test data that might cause issues
  const problematicData = {
    order_no: "OR-DOIT-TEST",
    amount: "1.08 ETB", // This should cause issues
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
    item_value: "1.08 ETB", // This should cause issues
    item_category: "General",
    merchant_id: getCurrentConfig(false).MERCHANT_ID_API,
    aggregator_id: getCurrentConfig(false).AGGREGATOR_ID,
    country: "ETH",
    currency: "ETB",
    transaction_type: "SALE",
    channel: "API"
  };
  
  console.log('Problematic data:', JSON.stringify(problematicData, null, 2));
  
  try {
    const dataString = JSON.stringify(problematicData);
    console.log('Problematic data string:', dataString);
    
    const crypto = new YagoutPayCrypto(false); // Use test environment
    const config = getCurrentConfig(false);
    
    const encrypted = crypto.encrypt(dataString, config.ENCRYPTION_KEY_API);
    console.log('Encrypted problematic data length:', encrypted.length);
    
    return {
      success: true,
      originalData: problematicData,
      encryptedData: encrypted
    };
    
  } catch (error) {
    console.error('Problematic encryption test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
