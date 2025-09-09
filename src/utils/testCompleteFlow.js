// Complete test of the payment flow to ensure no currency symbols reach the API
import { paymentService } from '../services/paymentService';

export const testCompletePaymentFlow = () => {
  console.log('=== COMPLETE PAYMENT FLOW TEST ===');
  
  // Test 1: Clean data (should work)
  const cleanData = {
    orderNo: 'OR-DOIT-TEST',
    amount: '162.00',
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
  
  console.log('Test 1 - Clean Data:');
  const cleaned1 = paymentService.cleanPaymentData(cleanData);
  console.log('  Original:', cleanData.amount);
  console.log('  Cleaned:', cleaned1.amount);
  console.log('  Has currency symbols:', cleaned1.amount.includes('$') || cleaned1.amount.includes('ETB'));
  
  // Test 2: Data with dollar sign (should be cleaned)
  const dirtyData = {
    ...cleanData,
    amount: '$162.00'
  };
  
  console.log('Test 2 - Data with Dollar Sign:');
  const cleaned2 = paymentService.cleanPaymentData(dirtyData);
  console.log('  Original:', dirtyData.amount);
  console.log('  Cleaned:', cleaned2.amount);
  console.log('  Has currency symbols:', cleaned2.amount.includes('$') || cleaned2.amount.includes('ETB'));
  
  // Test 3: Data with ETB (should be cleaned)
  const etbData = {
    ...cleanData,
    amount: '162.00 ETB'
  };
  
  console.log('Test 3 - Data with ETB:');
  const cleaned3 = paymentService.cleanPaymentData(etbData);
  console.log('  Original:', etbData.amount);
  console.log('  Cleaned:', cleaned3.amount);
  console.log('  Has currency symbols:', cleaned3.amount.includes('$') || cleaned3.amount.includes('ETB'));
  
  // Test 4: Data with spaces and symbols (should be cleaned)
  const messyData = {
    ...cleanData,
    amount: ' $ 162.00 ETB '
  };
  
  console.log('Test 4 - Messy Data:');
  const cleaned4 = paymentService.cleanPaymentData(messyData);
  console.log('  Original:', messyData.amount);
  console.log('  Cleaned:', cleaned4.amount);
  console.log('  Has currency symbols:', cleaned4.amount.includes('$') || cleaned4.amount.includes('ETB'));
  
  // Summary
  const allTestsPassed = 
    !cleaned1.amount.includes('$') && !cleaned1.amount.includes('ETB') &&
    !cleaned2.amount.includes('$') && !cleaned2.amount.includes('ETB') &&
    !cleaned3.amount.includes('$') && !cleaned3.amount.includes('ETB') &&
    !cleaned4.amount.includes('$') && !cleaned4.amount.includes('ETB');
  
  console.log('=== TEST SUMMARY ===');
  console.log('All tests passed:', allTestsPassed ? '✅ YES' : '❌ NO');
  console.log('Final amounts:', {
    clean: cleaned1.amount,
    dollar: cleaned2.amount,
    etb: cleaned3.amount,
    messy: cleaned4.amount
  });
  console.log('=== TEST COMPLETE ===');
  
  return {
    allTestsPassed,
    results: {
      clean: cleaned1,
      dollar: cleaned2,
      etb: cleaned3,
      messy: cleaned4
    }
  };
};
