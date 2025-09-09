// Test to verify force cleaning removes ETB from amounts
export const testForceClean = () => {
  console.log('=== FORCE CLEAN TEST ===');
  
  // Test various amount formats that might contain ETB
  const testAmounts = [
    '1.08',
    '1.08 ETB',
    '1.08 ETB ',
    ' 1.08 ETB ',
    '$1.08',
    '$1.08 ETB',
    '1.08$',
    'ETB 1.08',
    '1.08 ETB $'
  ];
  
  console.log('Testing force clean on various amount formats:');
  
  testAmounts.forEach((amount, index) => {
    // Force clean the amount
    const forceCleanAmount = amount.toString().replace(/[$,ETB\s]/g, '');
    const finalAmount = parseFloat(forceCleanAmount).toFixed(2);
    
    console.log(`${index + 1}. "${amount}" → "${finalAmount}"`);
    
    // Verify result
    const hasCurrencySymbols = finalAmount.includes('$') || finalAmount.includes('ETB');
    const isValidNumber = !isNaN(parseFloat(finalAmount));
    const hasTwoDecimals = /^\d+\.\d{2}$/.test(finalAmount);
    
    console.log(`   ✅ Clean: ${!hasCurrencySymbols ? 'YES' : 'NO'}`);
    console.log(`   ✅ Valid Number: ${isValidNumber ? 'YES' : 'NO'}`);
    console.log(`   ✅ Two Decimals: ${hasTwoDecimals ? 'YES' : 'NO'}`);
    console.log('');
  });
  
  // Test the specific case from the user
  const userAmount = '1.08 ETB';
  const cleanedUserAmount = userAmount.toString().replace(/[$,ETB\s]/g, '');
  const finalUserAmount = parseFloat(cleanedUserAmount).toFixed(2);
  
  console.log('=== USER SPECIFIC TEST ===');
  console.log(`Input: "${userAmount}"`);
  console.log(`Cleaned: "${cleanedUserAmount}"`);
  console.log(`Final: "${finalUserAmount}"`);
  console.log(`Ready for API: ${finalUserAmount === '1.08' ? '✅ YES' : '❌ NO'}`);
  
  console.log('=== FORCE CLEAN TEST COMPLETE ===');
  
  return {
    testResults: testAmounts.map(amount => ({
      input: amount,
      output: parseFloat(amount.toString().replace(/[$,ETB\s]/g, '')).toFixed(2)
    })),
    userTest: {
      input: userAmount,
      output: finalUserAmount,
      success: finalUserAmount === '1.08'
    }
  };
};
