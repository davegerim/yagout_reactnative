// Test to verify currency update to ETB
import { shoesData } from '../data/shoesData';

export const testCurrencyUpdate = () => {
  console.log('=== CURRENCY UPDATE TEST ===');
  
  // Test 1: Verify all products are 1.00 ETB
  console.log('1. Product Price Check:');
  const allProductsOneETB = shoesData.every(product => product.price === 1.00);
  console.log('  All products priced at 1.00 ETB:', allProductsOneETB ? '✅ PASSED' : '❌ FAILED');
  
  // Test 2: Show sample product prices
  console.log('2. Sample Product Prices:');
  shoesData.slice(0, 3).forEach(product => {
    console.log(`  ${product.brand} ${product.name}: ${product.price.toFixed(2)} ETB`);
  });
  
  // Test 3: Calculate cart totals
  console.log('3. Cart Calculation Test:');
  const sampleCart = [
    { id: 1, price: 1.00, quantity: 2 },
    { id: 2, price: 1.00, quantity: 1 }
  ];
  
  const subtotal = sampleCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  console.log(`  Items: ${sampleCart.length}`);
  console.log(`  Subtotal: ${subtotal.toFixed(2)} ETB`);
  console.log(`  Tax: ${tax.toFixed(2)} ETB`);
  console.log(`  Total: ${total.toFixed(2)} ETB`);
  
  // Test 4: Verify expected totals
  const expectedSubtotal = 3.00; // 2 items at 1.00 each + 1 item at 1.00
  const expectedTax = 0.24; // 8% of 3.00
  const expectedTotal = 3.24; // 3.00 + 0.24
  
  console.log('4. Expected vs Actual:');
  console.log(`  Subtotal: ${subtotal === expectedSubtotal ? '✅' : '❌'} (Expected: ${expectedSubtotal}, Actual: ${subtotal})`);
  console.log(`  Tax: ${tax === expectedTax ? '✅' : '❌'} (Expected: ${expectedTax}, Actual: ${tax})`);
  console.log(`  Total: ${total === expectedTotal ? '✅' : '❌'} (Expected: ${expectedTotal}, Actual: ${total})`);
  
  const allCalculationsCorrect = 
    subtotal === expectedSubtotal && 
    tax === expectedTax && 
    total === expectedTotal;
  
  console.log('=== CURRENCY UPDATE TEST SUMMARY ===');
  console.log('All tests passed:', allCalculationsCorrect && allProductsOneETB ? '✅ YES' : '❌ NO');
  console.log('=== TEST COMPLETE ===');
  
  return {
    allTestsPassed: allCalculationsCorrect && allProductsOneETB,
    productPrices: shoesData.map(p => ({ name: p.name, price: p.price })),
    cartCalculation: {
      subtotal,
      tax,
      total,
      expected: { subtotal: expectedSubtotal, tax: expectedTax, total: expectedTotal }
    }
  };
};
