// Test utility to verify data formatting
import { paymentService } from '../services/paymentService';

export const testDataFormatting = () => {
  console.log('=== Data Formatting Test ===');
  
  // Test data with currency symbols and various formats
  const testPaymentData = {
    orderNo: 'OR-DOIT-TEST',
    amount: '$162.00', // With currency symbol
    customerName: 'Test User',
    email: 'test@example.com',
    mobile: '1234567890',
    billingAddress: 'Test Address',
    billingCity: 'Test City',
    billingState: 'Test State',
    billingCountry: 'Ethiopia',
    billingZip: '1000',
    paymode: 'WA',
    walletType: 'telebirr',
    itemCount: '1',
    itemCategory: 'Shoes'
  };
  
  console.log('Original Test Data:', testPaymentData);
  
  // Clean the data
  const cleanedData = paymentService.cleanPaymentData(testPaymentData);
  
  console.log('Cleaned Data:', cleanedData);
  
  // Verify specific fields
  console.log('Amount Check:');
  console.log('  Original:', testPaymentData.amount);
  console.log('  Cleaned:', cleanedData.amount);
  console.log('  Is Valid:', cleanedData.amount === '162.00');
  
  console.log('Item Value Check:');
  console.log('  Item Value:', cleanedData.item_value);
  console.log('  Matches Amount:', cleanedData.item_value === cleanedData.amount);
  
  console.log('Data Type Check:');
  console.log('  Amount Type:', typeof cleanedData.amount);
  console.log('  All Fields Are Strings:', Object.values(cleanedData).every(val => typeof val === 'string'));
  
  console.log('=== Data Formatting Test Complete ===');
  
  return {
    original: testPaymentData,
    cleaned: cleanedData,
    isValid: cleanedData.amount === '162.00' && cleanedData.item_value === '162.00'
  };
};
