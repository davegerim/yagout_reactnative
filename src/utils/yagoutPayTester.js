import { yagoutPayService } from '../services/yagoutPayService';
import {
  generateOrderNumber,
  formatHostedTransactionData,
  formatAPITransactionData,
  YagoutPayCrypto,
} from '../utils/yagoutPayUtils';
import { getCurrentConfig } from '../utils/yagoutPayConfig';

/**
 * YagoutPay Integration Test Utilities
 * Use these functions to test the integration in development
 */
export class YagoutPayTester {
  constructor() {
    this.crypto = new YagoutPayCrypto();
    this.config = getCurrentConfig();
  }

  /**
   * Test encryption and decryption
   */
  testEncryption() {
    console.log('\n=== Testing YagoutPay Encryption ===');
    
    const testData = 'Hello YagoutPay Test';
    const key = this.config.ENCRYPTION_KEY_HOSTED;
    
    try {
      const encrypted = this.crypto.encrypt(testData, key);
      console.log('✓ Encryption successful');
      console.log('Encrypted:', encrypted.substring(0, 50) + '...');
      
      const decrypted = this.crypto.decrypt(encrypted, key);
      console.log('✓ Decryption successful');
      console.log('Decrypted:', decrypted);
      
      if (decrypted === testData) {
        console.log('✓ Encryption/Decryption test PASSED');
        return true;
      } else {
        console.log('✗ Encryption/Decryption test FAILED');
        return false;
      }
    } catch (error) {
      console.log('✗ Encryption test ERROR:', error.message);
      return false;
    }
  }

  /**
   * Test hosted payment data formatting
   */
  testHostedPaymentFormatting() {
    console.log('\n=== Testing Hosted Payment Formatting ===');
    
    const sampleData = {
      orderNo: generateOrderNumber(),
      amount: 100.50,
      successUrl: 'https://test.com/success',
      failureUrl: 'https://test.com/failure',
      customerDetails: {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '0912345678',
        isLoggedIn: 'Y',
      },
      billingDetails: {
        address: '123 Test Street',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
        zip: '1000',
      },
      shippingDetails: {
        address: '123 Test Street',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
        zip: '1000',
        days: '3-5',
      },
      itemDetails: {
        count: '2',
        value: '50.25,50.25',
        category: 'Shoes,Shoes',
      },
    };
    
    try {
      const formatted = formatHostedTransactionData(sampleData);
      console.log('✓ Hosted payment formatting successful');
      console.log('Sample formatted data:', formatted.allValues.substring(0, 100) + '...');
      
      // Test encryption of formatted data
      const encrypted = this.crypto.encrypt(formatted.allValues, formatted.encryptionKey);
      console.log('✓ Formatted data encryption successful');
      
      return true;
    } catch (error) {
      console.log('✗ Hosted payment formatting ERROR:', error.message);
      return false;
    }
  }

  /**
   * Test API payment data formatting
   */
  testAPIPaymentFormatting() {
    console.log('\n=== Testing API Payment Formatting ===');
    
    const sampleData = {
      orderNo: generateOrderNumber(),
      amount: 100.50,
      successUrl: 'https://test.com/success',
      failureUrl: 'https://test.com/failure',
      customerDetails: {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '0912345678',
        isLoggedIn: 'Y',
      },
      billingDetails: {
        address: '123 Test Street',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
        zip: '1000',
      },
      paymentMethod: 'WA',
    };
    
    try {
      const formatted = formatAPITransactionData(sampleData);
      console.log('✓ API payment formatting successful');
      console.log('Sample API data:', JSON.stringify(formatted, null, 2).substring(0, 200) + '...');
      
      // Test encryption of JSON data
      const encrypted = this.crypto.encrypt(
        JSON.stringify(formatted),
        this.config.ENCRYPTION_KEY_API
      );
      console.log('✓ API data encryption successful');
      
      return true;
    } catch (error) {
      console.log('✗ API payment formatting ERROR:', error.message);
      return false;
    }
  }

  /**
   * Test service validation
   */
  testServiceValidation() {
    console.log('\n=== Testing Service Validation ===');
    
    const validData = {
      orderNo: generateOrderNumber(),
      amount: 100.50,
      customerDetails: {
        email: 'john@example.com',
        mobile: '0912345678',
      },
    };
    
    const invalidData = {
      orderNo: '',
      amount: 0,
      customerDetails: {
        email: 'invalid-email',
        mobile: '123',
      },
    };
    
    try {
      const validResult = yagoutPayService.validateTransactionData(validData);
      console.log('✓ Valid data validation:', validResult.isValid ? 'PASSED' : 'FAILED');
      
      const invalidResult = yagoutPayService.validateTransactionData(invalidData);
      console.log('✓ Invalid data validation:', !invalidResult.isValid ? 'PASSED' : 'FAILED');
      console.log('  Errors found:', invalidResult.errors.length);
      
      return validResult.isValid && !invalidResult.isValid;
    } catch (error) {
      console.log('✗ Service validation ERROR:', error.message);
      return false;
    }
  }

  /**
   * Test configuration
   */
  testConfiguration() {
    console.log('\n=== Testing Configuration ===');
    
    try {
      console.log('✓ Test Environment:');
      console.log('  - Hosted URL:', this.config.POST_URL_HOSTED);
      console.log('  - API URL:', this.config.POST_URL_API);
      console.log('  - Merchant ID (Hosted):', this.config.MERCHANT_ID_HOSTED);
      console.log('  - Merchant ID (API):', this.config.MERCHANT_ID_API);
      console.log('  - Has Encryption Keys:', 
        !!this.config.ENCRYPTION_KEY_HOSTED && !!this.config.ENCRYPTION_KEY_API);
      
      return true;
    } catch (error) {
      console.log('✗ Configuration ERROR:', error.message);
      return false;
    }
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('\n🧪 YagoutPay Integration Test Suite');
    console.log('=====================================');
    
    const tests = [
      this.testConfiguration(),
      this.testEncryption(),
      this.testHostedPaymentFormatting(),
      this.testAPIPaymentFormatting(),
      this.testServiceValidation(),
    ];
    
    const passed = tests.filter(Boolean).length;
    const total = tests.length;
    
    console.log('\n📊 Test Results:');
    console.log(`${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('✅ All tests PASSED! YagoutPay integration is ready.');
    } else {
      console.log('❌ Some tests FAILED. Please review the errors above.');
    }
    
    return passed === total;
  }

  /**
   * Create sample transaction for testing
   */
  createSampleTransaction() {
    return {
      orderNo: generateOrderNumber(),
      amount: 199.99,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerMobile: '0911234567',
      billingDetails: {
        address: '123 Test Street, Bole',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
        zip: '1000',
      },
      shippingDetails: {
        address: '123 Test Street, Bole',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
        zip: '1000',
        days: '3-5',
      },
      itemDetails: {
        count: '1',
        value: '199.99',
        category: 'Shoes',
      },
      successUrl: 'https://yourapp.com/payment/success',
      failureUrl: 'https://yourapp.com/payment/failure',
    };
  }
}

// Export singleton instance
export const yagoutPayTester = new YagoutPayTester();

// Helper function to run tests in development
export const runYagoutPayTests = () => {
  if (__DEV__) {
    return yagoutPayTester.runAllTests();
  }
  console.warn('Tests can only be run in development mode');
  return false;
};