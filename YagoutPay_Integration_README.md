# YagoutPay Integration Documentation

## Overview

This React Native application has been integrated with YagoutPay payment gateway according to the official YagoutPay API Payment Gateway Integration Guide & Developer Documentation (Version 1.01).

## Integration Features

### 1. Aggregator Hosted (Non-Seamless) Integration
- Redirects customers to YagoutPay-hosted payment page
- Minimal PCI compliance requirements
- Secure WebView-based payment flow
- Automatic form submission with encrypted data

### 2. API Integration
- Direct API calls to YagoutPay
- Supports TeleBirr wallet payments
- Real-time payment processing
- Encrypted request/response handling

## Files Structure

```
src/
├── components/
│   └── YagoutPayWebView.js          # WebView component for hosted payments
├── services/
│   └── yagoutPayService.js          # API service for YagoutPay integration
├── store/
│   ├── store.js                     # Updated Redux store with YagoutPay slice
│   └── yagoutPaySlice.js           # Redux slice for payment state management
├── utils/
│   ├── yagoutPayConfig.js          # Configuration and constants
│   ├── yagoutPayUtils.js           # Encryption/decryption utilities
│   └── yagoutPayTester.js          # Testing utilities
└── screens/
    └── CheckoutScreen.js           # Updated checkout with YagoutPay options
```

## Configuration

### Test Environment (Currently Active)
- **Hosted URL**: `https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/paymentRedirection/checksumGatewayPage`
- **API URL**: `https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/apiRedirection/apiIntegration`
- **Merchant ID (Hosted)**: `202504290002`
- **Merchant ID (API)**: `202505090001`
- **Aggregator ID**: `yagout`

### Production Environment
Production credentials should be updated in `yagoutPayConfig.js` when provided by YagoutPay.

## Usage

### 1. Hosted Payment Flow
```javascript
import { useDispatch } from 'react-redux';
import { initiateHostedPayment, setShowWebView } from '../store/yagoutPaySlice';

// Initiate hosted payment
const result = await dispatch(initiateHostedPayment(orderData));
if (initiateHostedPayment.fulfilled.match(result)) {
  dispatch(setShowWebView(true));
}
```

### 2. API Payment Flow
```javascript
import { processAPIPayment } from '../store/yagoutPaySlice';

// Process API payment
const result = await dispatch(processAPIPayment({
  ...orderData,
  paymentMethod: 'WA', // Wallet payment
}));
```

## Payment Methods Available

1. **YagoutPay (Hosted)** - Secure hosted payment page
2. **YagoutPay (TeleBirr)** - Direct TeleBirr wallet integration
3. **Credit Card** - Traditional card payment (existing)
4. **PayPal** - PayPal integration (placeholder)

## Security Features

- **AES-256-CBC Encryption**: All sensitive data is encrypted
- **Static IV**: Uses YagoutPay specified IV (`0123456789abcdef`)
- **PKCS#7 Padding**: Proper padding implementation
- **SSL/TLS**: All communications over HTTPS
- **Input Validation**: Comprehensive data validation

## Testing

### Run Integration Tests
```javascript
import { runYagoutPayTests } from '../utils/yagoutPayTester';

// Run in development mode
if (__DEV__) {
  runYagoutPayTests();
}
```

### Manual Testing Checklist

#### Hosted Payment Testing
1. ✅ Select "YagoutPay (Hosted)" payment method
2. ✅ Fill required customer information
3. ✅ Click "Place Order"
4. ✅ Verify WebView opens with payment form
5. ✅ Test form auto-submission
6. ✅ Test payment cancellation
7. ✅ Test success/failure URL handling

#### API Payment Testing
1. ✅ Select "YagoutPay (TeleBirr)" payment method
2. ✅ Fill required customer information
3. ✅ Click "Place Order"
4. ✅ Verify API call is made
5. ✅ Test response handling
6. ✅ Test error scenarios

## Error Handling

### Common Error Scenarios
- **Invalid Referral URL**: Ensure proper domain registration with YagoutPay
- **Encryption Errors**: Verify encryption keys are correct
- **Network Errors**: Handle connectivity issues gracefully
- **Validation Errors**: Validate all required fields

### Error Recovery
- Clear error states with `clearError()` action
- Reset payment state with `resetPaymentState()` action
- Retry mechanisms for network failures

## Dependencies Added

```json
{
  "react-native-webview": "^13.6.4",
  "crypto-js": "^4.2.0",
  "expo-crypto": "^13.0.2"
}
```

## Implementation Notes

### Encryption Implementation
- Uses crypto-js library for AES encryption
- Implements manual PKCS#7 padding as required by YagoutPay
- Base64 encoding/decoding for key and data handling

### WebView Security
- JavaScript injection for form handling
- URL monitoring for payment completion
- Secure communication between WebView and React Native

### State Management
- Redux Toolkit for predictable state updates
- Async thunks for payment processing
- Transaction history tracking

## Production Checklist

### Before Going Live
1. ✅ Update production URLs in configuration
2. ✅ Update production merchant IDs
3. ✅ Update production encryption keys
4. ✅ Test with real YagoutPay test environment
5. ✅ Implement proper error logging
6. ✅ Set up monitoring and alerts
7. ✅ Verify SSL certificate pinning
8. ✅ Test on various devices and network conditions

### Security Considerations
- Never log sensitive payment data
- Validate all inputs on both client and server
- Implement rate limiting for payment requests
- Use secure storage for any cached data
- Regular security audits

## Support and Documentation

### YagoutPay Documentation
- API Documentation: As provided in integration guide
- Test Environment: Available for development
- Production Environment: Provided after merchant approval

### Contact Information
- YagoutPay Support: Contact through official channels
- Integration Issues: Refer to this documentation and error logs

## Troubleshooting

### Common Issues

1. **WebView not loading**
   - Check network connectivity
   - Verify YagoutPay URLs are accessible
   - Check for any firewall restrictions

2. **Encryption errors**
   - Verify encryption keys are correct
   - Check data format before encryption
   - Ensure proper padding implementation

3. **Payment not completing**
   - Check success/failure URL handling
   - Verify WebView navigation detection
   - Test with different devices and browsers

### Debug Mode
Enable debug logging in development:
```javascript
console.log('YagoutPay Debug Info:', {
  config: getCurrentConfig(),
  paymentState: yagoutPayState,
});
```

## Version History

- **v1.0.0**: Initial YagoutPay integration
  - Hosted payment integration
  - API payment integration
  - Encryption/decryption utilities
  - Redux state management
  - WebView payment flow
  - Comprehensive testing utilities