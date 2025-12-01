# YagoutPay React Native — Shoes Store (Expo)

📱 **YagoutPay React Native Shoes Store**  
A production-ready React Native (Expo) mobile e-commerce demo which demonstrates an in-app YagoutPay Direct API integration for Ethiopian merchants including TeleBirr wallet support.

---

## 🌟 Overview

This project is a full-featured cross-platform e-commerce app (iOS / Android / Web) built with Expo and React Native. It demonstrates:

- Product browsing, cart management, and checkout
- In-app payments via **YagoutPay Direct API**
- TeleBirr wallet support (Ethiopian mobile wallet)
- AES-256 encryption utilities (server proxy + client)
- Predictable state with Redux Toolkit and TypeScript-ready structure

**Current Version:** `1.1.0`  
**Status:** Production-ready ✅  
**Last Updated:** December 1, 2025

---

## 🔑 Key Highlights

- 🛍️ Full e-commerce flow (products → cart → checkout → orders)
- 💳 YagoutPay Direct API with TeleBirr support
- 🔐 Secure transmission: AES-256-CBC used in the original implementation (see Security notes)
- 📱 Cross-platform via Expo
- 🧰 Redux Toolkit + React Navigation
- 🧪 Built-in test helpers and developer documentation

---

## 🏗️ Project structure
yagout_reactnative/
├── src/
│ ├── components/
│ │ ├── YagoutPayWebView.js
│ │ └── DirectPayment.js
│ ├── data/
│ │ └── shoesData.js
│ ├── navigation/
│ │ └── AppNavigator.js
│ ├── screens/
│ │ ├── HomeScreen.js
│ │ ├── ProductDetailScreen.js
│ │ ├── CartScreen.js
│ │ ├── CheckoutScreen.js
│ │ ├── PaymentSuccessScreen.js
│ │ ├── PaymentFailureScreen.js
│ │ └── ProfileScreen.js
│ ├── services/
│ │ ├── yagoutPayService.js
│ │ └── paymentService.js
│ ├── store/
│ │ ├── store.js
│ │ ├── cartSlice.js
│ │ ├── productsSlice.js
│ │ ├── authSlice.js
│ │ └── yagoutPaySlice.js
│ └── utils/
│ ├── yagoutPayConfig.js
│ ├── yagoutPayUtils.js
│ └── yagoutPayTester.js
├── assets/
├── server.js
├── App.js
└── package.json


---

## 🛠️ Tech stack

**Frontend**
- React Native (Expo SDK)
- Redux Toolkit
- React Navigation
- Axios
- Crypto-JS (for client-side helpers) — recommended only for utilities; critical encryption should be server-side.

**Backend**
- Node.js + Express
- Native Node `crypto` for server-side encryption/decryption
- CORS enabled
- AES-256-CBC encryption helper (see Security section)

**Payment**
- YagoutPay API v1.01
- TeleBirr wallet integration
- Direct API (in-app payment flow) + Hosted (WebView) alternative

---

## ⚙️ Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android emulator / real device
- YagoutPay merchant credentials (test & production)

### Setup
```bash
git clone <repository-url>
cd yagout_reactnative

# install
npm install
# or
yarn install

# start backend proxy
node server.js

# start Expo
npm start
# or
expo start


Run on device:

iOS: Press i or scan QR code (Mac)

Android: Press a or scan with Expo Go

Web: Press w

🔧 Configuration

Edit src/utils/yagoutPayConfig.js (do NOT commit production keys):

export const YAGOUT_PAY_CONFIG = {

  PRODUCTION: {
    POST_URL_API: 'https://checkout.yagoutpay.com/...',
    MERCHANT_ID_API: 'YOUR_PROD_MERCHANT_ID',
    ENCRYPTION_KEY_API: 'BASE64_PROD_KEY',
    AGGREGATOR_ID: 'yagout',
  }
};


Update server.js env usage:

const YAGOUT_CONFIG = {
  MERCHANT_ID_API: process.env.YAGOUT_MERCHANT_ID,
  ENCRYPTION_KEY_API: process.env.YAGOUT_ENC_KEY,
  POST_URL_API: process.env.YAGOUT_POST_URL,
};


Important: Use environment variables and secret storage (e.g., GitHub Secrets) for production.

💳 Payment integration (flow)

User places order → client builds paymentData

Client sends paymentData to backend POST /api/pay

Backend encrypts using AES-256-CBC (or AES-GCM preferred) and forwards to YagoutPay

YagoutPay responds → backend decrypts/validates and sends status to client

App navigates to success/failure screen with transaction details

🔒 Security (recommended updates & notes)

Do not hardcode production keys or merchant credentials. Always use environment variables.

Encryption notes:

The original README shows a fixed IV: 0123456789abcdef. This is insecure when reused. Replace with a random IV per message and transmit IV (nonce) alongside the ciphertext.

Prefer AES-GCM (authenticated encryption) over AES-CBC + PKCS padding because it provides integrity (prevents tampering).

If you must use AES-CBC, compute an HMAC over IV + ciphertext to detect tampering.

Always use server-side encryption for production; client-side crypto should only prepare non-sensitive data or be used for dev tools.

Example secure approach (server-side high level):

Generate 12- or 16-byte random IV per request.

Use AES-GCM with 12-byte IV if supported by gateway; otherwise AES-CBC + HMAC-SHA256.

Transmit IV (base64) + ciphertext (base64) + HMAC (if used).

🧪 Testing

Manual test steps:

Start backend + Expo.

Add product → Checkout → Use TEST credentials:

Test amount: 1.00 ETB

Test phone: any valid Ethiopian number

Verify success & failure screens.

Automated:

Add unit tests for yagoutPayUtils.js (encryption/decryption).

Add integration tests for server.js endpoints (supertest).

🚀 Deployment checklist

 Replace test credentials with production keys (via env)

 Use secure IV + authenticated encryption

 Remove debug logs

 Enable HTTPS, SSL pinning on mobile

 Add monitoring (Sentry)

 Add rate limiting & input validation

 End-to-end payment tests on real device

🐛 Troubleshooting (common fixes)

Merchant not authorized: ensure merchantId & request structure match docs.

WebView not loading: check network, CORS, and allowed origins.

Encryption errors: verify base64 key decode and IV length (16 bytes for AES-256-CBC).

Unexpected errors: add Accept: application/json header and inspect raw gateway response in server logs.

📚 Documentation & Files

YagoutPay_Integration_README.md — full integration guide

YAGOUTPAY_API_FIXES.md — fixes & tips

DIRECT_API_FIX.md — Direct API notes

YagoutPay_PaymentLink_Implementation.md — payment link approach

🧾 License

MIT — see LICENSE

🤝 Contributing

Please follow the standard fork → branch → PR workflow. See CONTRIBUTING.md if present.

📞 Support

YagoutPay official channels

Open issues on GitHub for technical problems

Built with ❤️ for Ethiopian merchants


---

# 2) Step-by-step guide to update README on GitHub

Below are two approaches. Choose whichever you prefer.

## Option A — Quick edit through **GitHub web UI** (fast, no local setup)

1. Go to your repo on GitHub.
2. Click the `README.md` file in the file list.
3. Click the pencil ✏️ (Edit this file) button in the top-right of the file view.
4. Replace the content with the updated README markdown above (paste).
5. Scroll down to "Commit changes":
   - Select **Create a new branch** (recommended): name it `docs/update-readme-20251201` (or similar).
   - Add a short commit message: `docs: update README (Dec 1, 2025)`.
6. Click **Propose changes**.
7. GitHub will prompt you to open a Pull Request; click **Create pull request**.
8. Review the PR, add reviewers, and when ready, **Merge** (Squash or Merge as your policy).
9. Optionally tag a release: in "Releases" create `v1.1.0` with notes.

## Option B — Edit **locally** (recommended if you make multiple changes)

1. Clone the repo locally (if not already):
   ```bash
   git clone <repository-url>
   cd yagout_reactnative


Create and switch to a branch:

git checkout -b docs/update-readme-20251201


Open README.md in your editor and replace content with the provided markdown (or create a new README.md).

Stage and commit:

git add README.md
git commit -m "docs: update README — modernized, security notes, Dec 1, 2025"


Push branch:

git push -u origin docs/update-readme-20251201


On GitHub open a Pull Request from that branch → review → merge.

Tag a release (optional):

git tag -a v1.1.0 -m "Release v1.1.0 — README updates"
git push origin v1.1.0

3) Suggested follow-up edits (small PRs — keep changes atomic)

src/utils/yagoutPayConfig.js — ensure test/prod separation and env var usage.

server.js — update to use process.env.* and implement secure random IV + AES-GCM if possible.

src/utils/yagoutPayUtils.js — add HMAC verification or migrate to AES-GCM; add unit tests.

package.json — bump version to 1.1.0 (if you release).

CONTRIBUTING.md — add branch & PR rules.

SECURITY.md — brief security disclosure policy and how to report issues.

4) Security & best practice checklist (must-do before production)

 Move all keys to environment variables (GitHub Secrets for CI)

 Replace fixed IV with random IV per encryption

 Prefer AES-GCM (authenticated encryption) where possible

 Do encryption on the backend; client sends only non-sensitive payment metadata

 Log only non-sensitive info; never log full ciphertexts or keys

 Add rate limiting, input sanitization, and request validation

 Add tests that validate encryption/decryption roundtrip

 Run a security review or short pen-test if deploying for real payments

5) GitHub Actions sample (CI) — basic lint & tests on PR

Create .github/workflows/ci.yml:

name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x]

    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run lint      # add lint script in package.json
      - run: npm test          # add test script for unit tests
