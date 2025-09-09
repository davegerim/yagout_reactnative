// Test the complete data flow to ensure no currency symbols reach the API
import { paymentService } from '../services/paymentService';

export const testCompleteDataFlow = () => {
  console.log('=== COMPLETE DATA FLOW TEST ===');
  
  // Simulate the exact data that comes from the checkout screen
  const originalPaymentData = {
    orderNo: 'OR-DOIT-TEST',
    amount: '162.00', // This should be clean already from checkout
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
  
  console.log('1. Original Payment Data:', originalPaymentData);
  
  // Test the cleaning function
  const cleanedData = paymentService.cleanPaymentData(originalPaymentData);
  console.log('2. After Cleaning:', cleanedData);
  
  // Verify no currency symbols
  const hasCurrencySymbols = 
    cleanedData.amount.includes('$') || 
    cleanedData.amount.includes('ETB') ||
    cleanedData.item_value.includes('$') || 
    cleanedData.item_value.includes('ETB');
  
  console.log('3. Currency Symbol Check:', hasCurrencySymbols ? '❌ FAILED' : '✅ PASSED');
  
  // Test with problematic data
  const problematicData = {
    ...originalPaymentData,
    amount: '$162.00' // With currency symbol
  };
  
  console.log('4. Testing with problematic data:', problematicData);
  const cleanedProblematic = paymentService.cleanPaymentData(problematicData);
  console.log('5. After cleaning problematic data:', cleanedProblematic);
  
  const problematicHasCurrency = 
    cleanedProblematic.amount.includes('$') || 
    cleanedProblematic.amount.includes('ETB');
  
  console.log('6. Problematic data currency check:', problematicHasCurrency ? '❌ FAILED' : '✅ PASSED');
  
  console.log('=== DATA FLOW TEST COMPLETE ===');
  
  return {
    original: originalPaymentData,
    cleaned: cleanedData,
    problematicCleaned: cleanedProblematic,
    allTestsPassed: !hasCurrencySymbols && !problematicHasCurrency
  };
};
