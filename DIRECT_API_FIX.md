# 🔧 Direct API Fix - "Something went worng." Error

## 🎯 Issue Identified

After fixing the "Merchant is not Authorized" error, a new error appeared:

```json
{
  "merchantId": null,
  "status": "Failure",
  "statusMessage": "Something went worng.",
  "response": null
}
```

**Symptoms:**

- ✅ Payment works on mobile phone (PIN entry successful)
- ❌ Web shows failure page with "Something went worng." error
- HTTP Status: 200 (not a network error)

---

## 🔍 Root Cause Analysis

By comparing with the **working Flutter implementation**, I identified two critical differences:

### 1. Missing `Accept` Header

**Working Flutter Code:**

```dart
headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json',  // ✅ CRITICAL for API response handling
}
```

**Previous React Native Code:**

```javascript
headers: {
  'Content-Type': 'application/json',
  // ❌ Missing Accept header
}
```

### 2. Wrong Success/Failure URLs for Direct API

**Working Flutter Code (Direct API):**

```dart
txn_details: {
  // ...
  'sucessUrl': '',   // ✅ EMPTY STRING for Direct API
  'failureUrl': '',  // ✅ EMPTY STRING for Direct API
  'channel': 'API',
}
```

**Previous React Native Code:**

```javascript
txn_details: {
  // ...
  "sucessUrl": "https://example.com/success",  // ❌ Should be empty
  "failureUrl": "https://example.com/failure", // ❌ Should be empty
  "channel": "API",
}
```

---

## ✅ Fixes Applied

### Fix 1: Added Accept Header

```javascript
// server.js - Line 363-366
headers: {
  "Content-Type": "application/json",
  "Accept": "application/json",  // ✅ Added this header
}
```

**Why it matters:** The `Accept` header tells the API what response format the client expects. Without it, the API may not process the response correctly, leading to `merchantId: null` errors.

### Fix 2: Changed URLs to Empty Strings

```javascript
// server.js - Line 302-304
txn_details: {
  agId: "yagout",
  meId: "202508080001",
  orderNo: order_no,
  amount: amount.toString(),
  country: "ETH",
  currency: "ETB",
  transactionType: "SALE",
  sucessUrl: "",      // ✅ Changed to empty string
  failureUrl: "",     // ✅ Changed to empty string
  channel: "API",
}
```

**Why it matters:** For **Direct API integration** (payments completed within the app), the success/failure URLs should be empty strings. URLs are only used for **redirect-based** payment flows. Having URLs in Direct API mode causes the API to expect a redirect, which conflicts with the in-app payment flow.

---

## 🔄 Before vs After

### ❌ BEFORE (Incorrect)

```javascript
// Missing Accept header
headers: {
  "Content-Type": "application/json",
}

// Wrong URLs for Direct API
txn_details: {
  // ...
  sucessUrl: "https://example.com/success",
  failureUrl: "https://example.com/failure",
  channel: "API",
}
```

**Result:**

```json
{
  "merchantId": null,
  "status": "Failure",
  "statusMessage": "Something went worng.",
  "response": null
}
```

### ✅ AFTER (Correct)

```javascript
// Added Accept header
headers: {
  "Content-Type": "application/json",
  "Accept": "application/json",
}

// Empty URLs for Direct API
txn_details: {
  // ...
  sucessUrl: "",
  failureUrl: "",
  channel: "API",
}
```

**Expected Result:**

```json
{
  "merchantId": "202508080001",
  "status": "Success",
  "statusMessage": "Payment completed",
  "response": "<encrypted_response>"
}
```

---

## 🧪 Testing the Fix

### 1. Restart Your Server

```bash
# Stop the current server (Ctrl+C)
cd yagout_reactnative
node server.js
```

### 2. Test from React Native App

```javascript
// Make a payment request
const response = await axios.post(
  "http://localhost:3000/payments/api/initiate",
  {
    order_no: "OR-DOIT-" + Math.floor(1000 + Math.random() * 9000),
    amount: "100",
    customer_name: "Test User",
    email_id: "test@example.com",
    mobile_no: "0985392862",
    pg_id: "67ee846571e740418d688c3f",
    paymode: "WA",
    scheme_id: "7",
    wallet_type: "telebirr",
  }
);

console.log(response.data);
```

### 3. Test with curl

```bash
curl -X POST http://localhost:3000/payments/api/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "order_no": "OR-DOIT-1234",
    "amount": "100",
    "customer_name": "Test User",
    "email_id": "test@example.com",
    "mobile_no": "0985392862"
  }'
```

---

## 📊 Understanding Direct API vs Redirect API

### Direct API (In-App Payment)

- User enters PIN/credentials **within the app**
- Payment completes **without leaving the app**
- Success/Failure URLs: **Empty strings** ✅
- Response: Encrypted payment result returned directly

**Use Case:** Mobile apps, seamless UX

### Redirect API (Browser Payment)

- User is **redirected to payment gateway**
- Payment completes on **external website**
- Success/Failure URLs: **Required** ✅
- Response: User redirected back to your URLs

**Use Case:** Web apps, traditional payment flow

### 🎯 Your Integration Type

You're using **Direct API** (`channel: "API"`), so:

- ✅ `sucessUrl: ""`
- ✅ `failureUrl: ""`
- ✅ Payment completes in-app

---

## ✅ Success Criteria

After applying these fixes, you should see:

1. ✅ No "Something went worng." error
2. ✅ `merchantId` is `"202508080001"` (not `null`)
3. ✅ `status` is `"Success"`
4. ✅ Payment works on both **mobile** and **web**
5. ✅ Response contains encrypted payment data

---

## 🔍 Troubleshooting

### Still seeing "Something went worng."?

**Check 1: Verify headers are correct**

```javascript
// Should be:
headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Check 2: Verify URLs are empty strings**

```javascript
// Should be:
sucessUrl: "",
failureUrl: "",
```

**Check 3: Verify order ID format**

```javascript
// Should match pattern: OR-DOIT-XXXX
orderNo: "OR-DOIT-1234"; // ✅ Correct
orderNo: "ORD-1234"; // ❌ Wrong
```

**Check 4: Check server logs**
Look for encryption errors or API response details in the server console.

---

## 📝 Key Takeaways

1. **Accept header is required** for YagoutPay Direct API
2. **Empty URLs** are required for Direct API (in-app payments)
3. **URLs are only used** for redirect-based payment flows
4. **Match your working Flutter implementation exactly**

---

## 🎉 Summary

The "Something went worng." error was caused by:

1. Missing `Accept: application/json` header
2. Non-empty success/failure URLs (should be empty for Direct API)

Both issues have been fixed! 🚀

---

## 📞 Next Steps

1. ✅ Restart your server
2. ✅ Test the payment flow
3. ✅ Verify both mobile and web work correctly
4. ✅ Check that `merchantId` is not `null` in response

If issues persist, check:

- Server logs for detailed errors
- Network tab to see actual request/response
- Encryption implementation matches Flutter exactly








