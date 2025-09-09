// Final test to verify the complete payment flow
import { paymentService } from '../services/paymentService';

export const testFinalPaymentFlow = () => {
  console.log('=== FINAL PAYMENT FLOW TEST ===');
  
  // Test with the exact data from the checkout screen
  const checkoutData = {
    orderNo: 'OR-DOIT-TEST',
    amount: '324.00', // This should be clean from checkout
    customerName: 'Lidetu Ketema',
    email: 'lij@gmail.com',
    mobile: '0972315453',
    billingAddress: 'Bole Japan',
    billingCity: 'Addis Ababa',
    billingState: 'Addis Ababa',
    billingCountry: 'Ethiopia',
    billingZip: '1000',
    paymode: 'WA',
    walletType: 'telebirr',
    itemCount: '1',
    itemCategory: 'Shoes'
  };
  
  console.log('1. Checkout Data:', checkoutData);
  
  // Test the cleaning function
  const cleanedData = paymentService.cleanPaymentData(checkoutData);
  console.log('2. After Cleaning:', cleanedData);
  
  // Verify no currency symbols
  const hasCurrencySymbols = 
    cleanedData.amount.includes('$') || 
    cleanedData.amount.includes('ETB') ||
    cleanedData.item_value.includes('$') || 
    cleanedData.item_value.includes('ETB');
  
  console.log('3. Currency Symbol Check:', hasCurrencySymbols ? '❌ FAILED' : '✅ PASSED');
  
  // Verify data types
  const allStrings = Object.values(cleanedData).every(val => typeof val === 'string');
  console.log('4. All Fields Are Strings:', allStrings ? '✅ PASSED' : '❌ FAILED');
  
  // Verify amount format
  const amountFormat = /^\d+\.\d{2}$/.test(cleanedData.amount);
  console.log('5. Amount Format (XXX.XX):', amountFormat ? '✅ PASSED' : '❌ FAILED');
  
  // Verify item_value matches amount
  const valuesMatch = cleanedData.amount === cleanedData.item_value;
  console.log('6. Amount Matches Item Value:', valuesMatch ? '✅ PASSED' : '❌ FAILED');
  
  const allTestsPassed = !hasCurrencySymbols && allStrings && amountFormat && valuesMatch;
  
  console.log('=== FINAL TEST SUMMARY ===');
  console.log('All tests passed:', allTestsPassed ? '✅ YES' : '❌ NO');
  console.log('Final cleaned data:', cleanedData);
  console.log('=== TEST COMPLETE ===');
  
  return {
    allTestsPassed,
    cleanedData,
    tests: {
      noCurrencySymbols: !hasCurrencySymbols,
      allStrings,
      amountFormat,
      valuesMatch
    }
  };
};
