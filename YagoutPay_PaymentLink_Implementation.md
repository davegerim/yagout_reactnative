# YagoutPay Payment Link & Static Link API Implementation

This document describes the implementation of YagoutPay Payment Link and Static Link APIs as per the provided specification.

## Overview

The implementation includes:
1. **Payment Link API** - Creates payment links for dynamic transactions
2. **Static Link API** - Creates static QR code links for recurring payments
3. **Test UI** - React Native interface for testing both APIs

## API Endpoints

### Backend Server (Node.js/Express)

#### Payment Link API
- **Endpoint**: `POST /payments/link/create`
- **YagoutPay URL**: `https://uatcheckout.yagoutpay.com/ms-transaction-core-10/sdk/paymentByLinkResponse`
- **Header**: `me_id: 202508080001`

#### Static Link API
- **Endpoint**: `POST /payments/static-link/create`
- **YagoutPay URL**: `https://uatcheckout.yagoutpay.com/ms-transaction-core-10/sdk/staticQRPaymentResponse`
- **Header**: `me_id: 202508080001`

## Request Format

Both APIs accept the following payload structure:

```json
{
  "req_user_id": "yagou381",
  "me_id": "202508080001",
  "amount": "500",
  "customer_email": "test@example.com",
  "mobile_no": "0965680964",
  "expiry_date": "2025-12-31",
  "media_type": ["API"],
  "order_id": "ORDER_TEST_001",
  "first_name": "YagoutPay",
  "last_name": "TestUser",
  "product": "Test Product",
  "dial_code": "+251",
  "failure_url": "http://localhost:3000/failure",
  "success_url": "http://localhost:3000/success",
  "country": "ETH",
  "currency": "ETB"
}
```

## Encryption/Decryption

The implementation uses AES-256-CBC encryption with:
- **Key**: `IG3CNW5uNrUO2mU2htUOWb9rgXCF7XMAXmL63d7wNZo=` (Base64 encoded)
- **IV**: `0123456789abcdef` (Fixed 16-character IV)
- **Algorithm**: AES-256-CBC

The same encryption function is used for both encryption and decryption as specified in the document.

## Testing UI

### Accessing the Test Interface

1. Open the React Native app
2. Navigate to the **Profile** tab
3. Tap on **"YagoutPay Link Testing"**
4. Select between **Payment Link** or **Static Link** tabs
5. Fill in the form fields
6. Tap **"Create [Link Type]"** to test the API

### Test Interface Features

- **Tab Selection**: Switch between Payment Link and Static Link testing
- **Form Fields**: All required and optional fields as per API specification
- **Real-time Testing**: Direct API calls to backend endpoints
- **Response Display**: Shows complete API response including encrypted data
- **Error Handling**: Displays error messages for failed requests

## File Structure

```
yagout_reactnative/
├── server.js                                    # Backend server with new endpoints
├── src/
│   ├── screens/
│   │   └── PaymentLinkTestScreen.js            # Test UI component
│   ├── navigation/
│   │   └── AppNavigator.js                     # Updated with new screen
│   └── screens/
│       └── ProfileScreen.js                    # Updated with test link
└── YagoutPay_PaymentLink_Implementation.md     # This documentation
```

## Usage Instructions

### Starting the Backend Server

```bash
cd yagout_reactnative
node server.js
```

The server will start on `http://localhost:3000` with the following endpoints:
- Health check: `GET /`
- Payment initiation: `POST /payments/api/initiate`
- Payment Link: `POST /payments/link/create`
- Static Link: `POST /payments/static-link/create`

### Testing the APIs

1. **Start the React Native app**
2. **Navigate to Profile → YagoutPay Link Testing**
3. **Select API type** (Payment Link or Static Link)
4. **Fill in test data** or use defaults
5. **Tap create button** to test the API
6. **Review response** in the response section

## Default Test Values

The test interface comes pre-populated with sample data:
- User ID: `yagou381`
- Merchant ID: `202508080001`
- Amount: `500`
- Mobile: `0965680964`
- Country: `ETH`
- Currency: `ETB`

## Error Handling

The implementation includes comprehensive error handling:
- **Validation**: Required field validation
- **Network Errors**: Connection timeout and network failure handling
- **API Errors**: YagoutPay API error response handling
- **Encryption Errors**: Encryption/decryption failure handling

## Security Notes

- SSL verification is disabled for UAT testing (`rejectUnauthorized: false`)
- Encryption keys are hardcoded for testing purposes
- In production, implement proper key management and SSL verification

## Response Format

Successful API responses include:
```json
{
  "success": true,
  "data": { /* YagoutPay API response */ },
  "originalPayload": { /* Original request payload */ },
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

Error responses include:
```json
{
  "status": "Failed",
  "message": "Error description",
  "error": { /* Detailed error information */ }
}
```

## Next Steps

1. Test both APIs with the provided interface
2. Verify encryption/decryption functionality
3. Test with different payload variations
4. Implement production-ready key management
5. Add comprehensive logging and monitoring

## Support

For issues or questions regarding this implementation, refer to the YagoutPay documentation or contact the development team.
