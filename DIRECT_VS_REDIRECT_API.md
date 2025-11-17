# 🔀 Direct API vs Redirect API - Quick Reference

## 📊 Comparison Table

| Feature             | Direct API (In-App)                | Redirect API (Web)                     |
| ------------------- | ---------------------------------- | -------------------------------------- |
| **Payment Flow**    | User pays **within the app**       | User **redirected to payment gateway** |
| **User Experience** | Seamless, no page leave            | Leaves app/site, returns after payment |
| **`sucessUrl`**     | **Empty string** `""`              | **Valid URL** required                 |
| **`failureUrl`**    | **Empty string** `""`              | **Valid URL** required                 |
| **`channel`**       | `"API"`                            | `"API"` (same)                         |
| **Response**        | Encrypted result returned directly | User redirected to success/failure URL |
| **Best for**        | Mobile apps                        | Web applications                       |
| **Payment PIN**     | Entered in-app                     | Entered on payment gateway             |

---

## 🎯 Direct API (Your Current Implementation)

### Configuration

```javascript
txn_details: {
  agId: "yagout",
  meId: "202508080001",
  orderNo: "OR-DOIT-1234",
  amount: "100",
  country: "ETH",
  currency: "ETB",
  transactionType: "SALE",
  sucessUrl: "",      // ✅ EMPTY STRING - Critical!
  failureUrl: "",     // ✅ EMPTY STRING - Critical!
  channel: "API",
}
```

### Headers

```javascript
headers: {
  "Content-Type": "application/json",
  "Accept": "application/json",  // ✅ Required for Direct API
}
```

### Payment Flow

1. User initiates payment in app
2. App sends encrypted request to YagoutPay
3. YagoutPay returns payment interface **within the app**
4. User enters PIN/credentials **in the app**
5. Payment completes
6. Encrypted response returned **directly to app**
7. App decrypts and shows success/failure

### Use Cases

- ✅ Mobile apps (React Native, Flutter)
- ✅ In-app purchases
- ✅ Seamless checkout experience
- ✅ No page redirects

### Example Response

```json
{
  "merchantId": "202508080001",
  "status": "Success",
  "statusMessage": "Payment completed",
  "response": "<encrypted_payment_data>"
}
```

---

## 🌐 Redirect API (Alternative Approach)

### Configuration

```javascript
txn_details: {
  agId: "yagout",
  meId: "202508080001",
  orderNo: "OR-DOIT-1234",
  amount: "100",
  country: "ETH",
  currency: "ETB",
  transactionType: "SALE",
  sucessUrl: "https://yourdomain.com/payment/success",  // ✅ Valid URL
  failureUrl: "https://yourdomain.com/payment/failure", // ✅ Valid URL
  channel: "API",
}
```

### Headers

```javascript
headers: {
  "Content-Type": "application/json",
  "Accept": "application/json",
}
```

### Payment Flow

1. User initiates payment
2. App sends encrypted request to YagoutPay
3. YagoutPay returns **redirect URL**
4. App/browser **redirects user** to payment gateway
5. User enters PIN/credentials **on payment gateway website**
6. Payment completes
7. User **redirected back** to your `sucessUrl` or `failureUrl`
8. Your server handles the callback

### Use Cases

- ✅ Web applications
- ✅ E-commerce websites
- ✅ Traditional checkout flows
- ✅ When you need callback handling

### Example Response

```json
{
  "merchantId": "202508080001",
  "status": "Success",
  "statusMessage": "Redirect URL generated",
  "response": "https://payment.yagoutpay.com/checkout/xyz123"
}
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Using URLs in Direct API

```javascript
// ❌ WRONG for Direct API
txn_details: {
  sucessUrl: "https://example.com/success",  // Will cause "Something went worng." error
  failureUrl: "https://example.com/failure",
  channel: "API",
}
```

### ✅ Correct for Direct API

```javascript
// ✅ CORRECT for Direct API
txn_details: {
  sucessUrl: "",      // Empty string
  failureUrl: "",     // Empty string
  channel: "API",
}
```

### ❌ Mistake 2: Empty URLs in Redirect API

```javascript
// ❌ WRONG for Redirect API
txn_details: {
  sucessUrl: "",      // Payment gateway won't know where to redirect
  failureUrl: "",
  channel: "API",
}
```

### ✅ Correct for Redirect API

```javascript
// ✅ CORRECT for Redirect API
txn_details: {
  sucessUrl: "https://yourdomain.com/success",   // Valid callback URL
  failureUrl: "https://yourdomain.com/failure",  // Valid callback URL
  channel: "API",
}
```

---

## 🔍 How to Choose?

### Choose **Direct API** if:

- ✅ Building a mobile app (React Native, Flutter)
- ✅ Want seamless in-app payment
- ✅ Don't want users to leave your app
- ✅ Need immediate payment response
- ✅ Can handle encrypted responses in-app

### Choose **Redirect API** if:

- ✅ Building a web application
- ✅ Traditional e-commerce checkout
- ✅ Need callback/webhook handling
- ✅ Want payment gateway to handle UI
- ✅ Need payment confirmation on server

---

## 🛠️ Your Current Setup

You are using **Direct API** because:

1. ✅ `channel: "API"`
2. ✅ React Native mobile app
3. ✅ In-app payment flow
4. ✅ Payment PIN entered within app

**Therefore:**

- ✅ `sucessUrl` must be **empty string** `""`
- ✅ `failureUrl` must be **empty string** `""`
- ✅ `Accept` header **required**

---

## 📝 Quick Checklist

### Direct API Setup ✅

- [ ] `sucessUrl: ""`
- [ ] `failureUrl: ""`
- [ ] `Accept: "application/json"` header included
- [ ] `channel: "API"`
- [ ] Handle encrypted response in-app

### Redirect API Setup (if you switch)

- [ ] `sucessUrl: "https://your-domain.com/success"`
- [ ] `failureUrl: "https://your-domain.com/failure"`
- [ ] `Accept: "application/json"` header included
- [ ] `channel: "API"`
- [ ] Server endpoint to handle callbacks

---

## 🎯 Key Takeaway

**The most critical difference:**

| API Type         | sucessUrl/failureUrl   |
| ---------------- | ---------------------- |
| **Direct API**   | **Empty strings** `""` |
| **Redirect API** | **Valid URLs**         |

**Getting this wrong causes:**

- Direct API with URLs → "Something went worng." error
- Redirect API with empty strings → Redirect failure

---

## 📞 Need Help?

If you're unsure which API type to use:

1. Check your `channel` value (should be `"API"` for both)
2. Determine payment flow:
   - In-app payment = Direct API
   - Redirect to gateway = Redirect API
3. Set URLs accordingly:
   - Direct API = Empty strings
   - Redirect API = Valid URLs

Your current setup is **Direct API** with the correct configuration! 🎉








