const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// YagoutPay Configuration
const YAGOUT_CONFIG = {
  MERCHANT_ID_API: "202508080001",
  ENCRYPTION_KEY_API: "IG3CNW5uNrUO2mU2htUOWb9rgXCF7XMAXmL63d7wNZo=",
  AGGREGATOR_ID: "yagout",
  POST_URL_API:
    "https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/apiRedirection/apiIntegration",
  // Payment Link API endpoints - FIXED URLs
  PAYMENT_LINK_URL:
    "https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/sdk/paymentByLinkResponse",
  STATIC_LINK_URL:
    "https://uatcheckout.yagoutpay.com/ms-transaction-core-1-0/sdk/paymentByLinkResponse",
};

// AES-256-CBC Encryption function - EXACT method from working backend
// CRITICAL REQUIREMENTS:
// 1. IV must be ASCII bytes of "0123456789abcdef" (NOT hex-decoded!)
// 2. Key must be base64-decoded to get exactly 32 bytes
// 3. PKCS7 padding is automatically applied by Node.js crypto module
// 4. Algorithm: AES-256-CBC
class CryptoUtil {
  constructor() {
    this.iv = "0123456789abcdef"; // Fixed IV - exactly 16 characters as ASCII
  }

  aes256CbcEncryptToBase64(text, keyBase64) {
    const key = Buffer.from(keyBase64, "base64"); // Decode key from base64 (results in 32 bytes)
    const iv = Buffer.from(this.iv, "utf8"); // Convert IV from ASCII/UTF-8 (NOT hex!)
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv); // Node.js automatically applies PKCS7 padding

    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    return encrypted;
  }

  aes256CbcDecryptFromBase64(encryptedText, keyBase64) {
    try {
      const key = Buffer.from(keyBase64, "base64"); // Convert key from base64
      const iv = Buffer.from(this.iv, "utf8"); // Convert IV from utf8
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

      let decrypted = decipher.update(encryptedText, "base64", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Parse the clicktowishResponse format from decrypted data
  parseClicktowishResponse(decryptedText) {
    try {
      console.log("=== PARSING CLICKTOWISH RESPONSE ===");
      console.log("Decrypted response:", decryptedText);

      // Check if it's in clicktowishResponse format
      if (decryptedText.startsWith("clicktowishResponse")) {
        console.log("Detected clicktowishResponse format");

        // Parse the response format using regex
        const statusMatch = decryptedText.match(/status = (\w+)/);
        const messageMatch = decryptedText.match(/message = ([^,]+)/);
        const dataMatch = decryptedText.match(/data = ({.*?}), hasErrors/);

        const status = statusMatch ? statusMatch[1] : "unknown";
        const message = messageMatch ? messageMatch[1].trim() : "No message";
        const dataStr = dataMatch ? dataMatch[1].trim() : "null";

        console.log("Parsed clicktowishResponse:");
        console.log("  Status:", status);
        console.log("  Message:", message);
        console.log("  Data:", dataStr);

        if (status.toLowerCase() === "success" && dataStr !== "null") {
          try {
            // Parse the data as JSON
            const dataJson = JSON.parse(dataStr);
            console.log("Parsed data JSON:", dataJson);

            // Extract payment link from various possible fields
            const paymentLink =
              dataJson.PaymentLink ||
              dataJson.payment_link ||
              dataJson.pay_link ||
              dataJson.link ||
              dataJson.url ||
              dataJson.redirectUrl ||
              dataJson.payment_url;

            console.log("Extracted payment link:", paymentLink);

            return {
              success: true,
              status: "SUCCESS",
              message: "Payment link created successfully",
              payment_link: paymentLink,
              order_id: dataJson.orderId || dataJson.order_id,
              link_id: dataJson.LinkId || dataJson.link_id,
              decrypted_data: dataJson,
            };
          } catch (jsonError) {
            console.error("Data JSON parsing failed:", jsonError);
            return {
              success: false,
              status: "ERROR",
              message: "Failed to parse data JSON",
              error: jsonError.message,
              raw_data: dataStr,
            };
          }
        } else {
          console.log("API returned error status:", status, message);
          return {
            success: false,
            status: "API_ERROR",
            message: `API Error: ${message}`,
            error: message,
            api_status: status,
          };
        }
      } else {
        // Try to parse as regular JSON
        console.log("Not clicktowishResponse format, trying JSON parse");
        try {
          const jsonData = JSON.parse(decryptedText);
          console.log("Parsed as regular JSON:", jsonData);

          // Look for payment link in the JSON
          const paymentLink =
            jsonData.PaymentLink ||
            jsonData.payment_link ||
            jsonData.pay_link ||
            jsonData.link ||
            jsonData.url ||
            jsonData.redirectUrl ||
            jsonData.payment_url;

          return {
            success: true,
            status: "SUCCESS",
            message: "Payment link created successfully",
            payment_link: paymentLink,
            decrypted_data: jsonData,
          };
        } catch (jsonError) {
          console.error("JSON parsing failed:", jsonError);
          return {
            success: false,
            status: "ERROR",
            message: "Invalid response format",
            error: jsonError.message,
            raw_response: decryptedText,
          };
        }
      }
    } catch (error) {
      console.error("Response parsing failed:", error);
      return {
        success: false,
        status: "ERROR",
        message: "Response parsing failed",
        error: error.message,
        raw_response: decryptedText,
      };
    }
  }
}

function encryptData(data, key) {
  try {
    console.log("=== ENCRYPTION DEBUG ===");
    console.log("Data to encrypt length:", data.length);
    console.log("Key (base64):", key);
    console.log("IV:", "0123456789abcdef");

    const cryptoUtil = new CryptoUtil();
    const encryptedData = cryptoUtil.aes256CbcEncryptToBase64(data, key);

    console.log("Encrypted data length:", encryptedData.length);
    console.log(
      "Encrypted data (first 50 chars):",
      encryptedData.substring(0, 50)
    );
    console.log("========================");

    return encryptedData;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data: " + error.message);
  }
}

// Generate unique order ID to avoid "Order Id already exists" error
function generateUniqueOrderId(baseOrderId = "STATIC_LINK") {
  // Get current timestamp in milliseconds
  const timestamp = Date.now().toString();
  // Take last 4 digits of timestamp
  const timestampSuffix = timestamp.substring(timestamp.length - 4);

  // Generate random 4-digit number
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");

  // Combine timestamp and random to create unique ID
  const uniqueId = (timestampSuffix + random).substring(0, 4);

  // Return in OR-DOIT-XXXX format
  return `OR-DOIT-${uniqueId}`;
}

// Validate order ID format
function validateOrderId(orderId) {
  const orderIdPattern = /^OR-DOIT-\d{4}$/;
  if (!orderIdPattern.test(orderId)) {
    throw new Error("Invalid order ID format");
  }
  return true;
}

// API endpoint for payment initiation
app.post("/payments/api/initiate", async (req, res) => {
  try {
    console.log("=== BACKEND PAYMENT REQUEST ===");
    console.log("Received data:", JSON.stringify(req.body, null, 2));

    const {
      order_no,
      amount,
      customer_name,
      email_id,
      mobile_no,
      bill_address,
      bill_city,
      bill_state,
      bill_country,
      bill_zip,
      pg_id,
      paymode,
      scheme_id,
      wallet_type,
    } = req.body;

    // Validate required fields
    if (!order_no || !amount || !customer_name || !email_id || !mobile_no) {
      return res.status(400).json({
        status: "Failed",
        message: "Missing required fields",
      });
    }

    // Prepare YagoutPay API data structure with EXACT field order as per spec
    // IMPORTANT: For Direct API integration:
    // - sucessUrl and failureUrl MUST be empty strings (not URLs)
    // - This allows the payment to complete in the app without redirecting
    const yagoutPayData = {
      card_details: {
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardName: "",
      },
      other_details: {
        udf1: "",
        udf2: "",
        udf3: "",
        udf4: "",
        udf5: "",
        udf6: "",
        udf7: "",
      },
      ship_details: {
        shipAddress: "",
        shipCity: "",
        shipState: "",
        shipCountry: "ETH",
        shipZip: "",
        shipDays: "",
        addressCount: "",
      },
      txn_details: {
        agId: YAGOUT_CONFIG.AGGREGATOR_ID,
        meId: YAGOUT_CONFIG.MERCHANT_ID_API,
        orderNo: order_no,
        amount: amount.toString(),
        country: "ETH",
        currency: "ETB",
        transactionType: "SALE",
        sucessUrl: "",
        failureUrl: "",
        channel: "API",
      },
      item_details: {
        itemCount: "1",
        itemValue: amount.toString(),
        itemCategory: "Shoes",
      },
      cust_details: {
        customerName: customer_name,
        emailId: email_id,
        mobileNumber: mobile_no,
        uniqueId: "",
        isLoggedIn: "Y",
      },
      pg_details: {
        pg_Id: pg_id || "67ee846571e740418d688c3f",
        paymode: paymode || "WA",
        scheme_Id: scheme_id || "7",
        wallet_type: wallet_type || "telebirr",
      },
      bill_details: {
        billAddress: bill_address || "",
        billCity: bill_city || "",
        billState: bill_state || "",
        billCountry: bill_country || "ETH",
        billZip: bill_zip || "",
      },
    };

    console.log(
      "YagoutPay data structure:",
      JSON.stringify(yagoutPayData, null, 2)
    );

    // Encrypt the data
    const dataToEncrypt = JSON.stringify(yagoutPayData);
    const encryptedData = encryptData(
      dataToEncrypt,
      YAGOUT_CONFIG.ENCRYPTION_KEY_API
    );

    console.log("Encrypted data length:", encryptedData.length);

    // Prepare request for YagoutPay with EXACT structure required by API
    const yagoutRequest = {
      merchantId: YAGOUT_CONFIG.MERCHANT_ID_API,
      merchantRequest: encryptedData,
    };

    console.log("=== CALLING YAGOUTPAY API ===");
    console.log("URL:", YAGOUT_CONFIG.POST_URL_API);
    console.log("Merchant ID:", YAGOUT_CONFIG.MERCHANT_ID_API);
    console.log(
      "Request structure:",
      JSON.stringify({
        merchantId: YAGOUT_CONFIG.MERCHANT_ID_API,
        merchantRequest: "[ENCRYPTED_DATA]",
      })
    );

    // Call YagoutPay API with required headers (Content-Type and Accept)
    const yagoutResponse = await axios.post(
      YAGOUT_CONFIG.POST_URL_API,
      yagoutRequest,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false, // Disable SSL verification for UAT testing
        }),
      }
    );

    console.log("=== YAGOUTPAY RESPONSE ===");
    console.log("Status:", yagoutResponse.status);
    console.log("Data:", yagoutResponse.data);

    // Return the response to the React Native app
    res.json(yagoutResponse.data);
  } catch (error) {
    console.error("=== BACKEND ERROR ===");
    console.error("Error:", error.message);

    if (error.response) {
      console.error("YagoutPay Error Response:", error.response.data);
      res.status(500).json({
        status: "Failed",
        message: error.response.data?.message || "Payment processing failed",
        error: error.response.data,
      });
    } else {
      res.status(500).json({
        status: "Failed",
        message: "Internal server error",
        error: error.message,
      });
    }
  }
});

// Payment Link API endpoint
app.post("/payments/link/create", async (req, res) => {
  try {
    console.log("=== PAYMENT LINK REQUEST ===");
    console.log("Received data:", JSON.stringify(req.body, null, 2));

    const {
      req_user_id,
      me_id,
      amount,
      customer_email,
      mobile_no,
      expiry_date,
      media_type,
      order_id,
      first_name,
      last_name,
      product,
      dial_code,
      failure_url,
      success_url,
      country,
      currency,
    } = req.body;

    // Validate required fields (order_id is optional now as we'll generate it)
    if (!req_user_id || !me_id || !amount || !mobile_no) {
      return res.status(400).json({
        status: "Failed",
        message:
          "Missing required fields: req_user_id, me_id, amount, mobile_no",
      });
    }

    // Generate unique order ID to avoid "Order Id already exists" error
    const generatedOrderId = generateUniqueOrderId("PAYMENT_LINK");
    console.log("Generated Order ID:", generatedOrderId);

    // Validate the generated order ID
    try {
      validateOrderId(generatedOrderId);
    } catch (error) {
      return res.status(400).json({
        status: "Failed",
        message: "Failed to generate valid order ID: " + error.message,
      });
    }

    // Calculate expiry date (30 days from today)
    const today = new Date();
    const expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from today
    const formattedExpiryDate = expiryDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // Prepare payload as per document
    const linkPayload = {
      req_user_id: req_user_id || "yagou381",
      me_id: me_id || "202508080001",
      amount: amount.toString(),
      customer_email: customer_email || "",
      mobile_no: mobile_no,
      expiry_date: expiry_date || formattedExpiryDate,
      media_type: media_type || ["API"],
      order_id: generatedOrderId, // Use generated order ID instead of static one
      first_name: first_name || "YagoutPay",
      last_name: last_name || "PaymentLink",
      product: product || "Payment Link Test",
      dial_code: dial_code || "+251",
      failure_url: failure_url || "http://localhost:3000/failure",
      success_url: success_url || "http://localhost:3000/success",
      country: country || "ETH",
      currency: currency || "ETB",
    };

    console.log("Payment Link payload:", JSON.stringify(linkPayload, null, 2));

    // Encrypt the payload
    const dataToEncrypt = JSON.stringify(linkPayload);
    const encryptedData = encryptData(
      dataToEncrypt,
      YAGOUT_CONFIG.ENCRYPTION_KEY_API
    );

    console.log("Encrypted data length:", encryptedData.length);

    // Prepare request for YagoutPay Payment Link API
    const yagoutRequest = {
      request: encryptedData,
    };

    console.log("=== CALLING YAGOUTPAY PAYMENT LINK API ===");
    console.log("URL:", YAGOUT_CONFIG.PAYMENT_LINK_URL);
    console.log("Header me_id:", YAGOUT_CONFIG.MERCHANT_ID_API);

    // Call YagoutPay Payment Link API
    const yagoutResponse = await axios.post(
      YAGOUT_CONFIG.PAYMENT_LINK_URL,
      yagoutRequest,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          me_id: YAGOUT_CONFIG.MERCHANT_ID_API,
        },
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false, // Disable SSL verification for UAT testing
        }),
      }
    );

    console.log("=== YAGOUTPAY PAYMENT LINK RESPONSE ===");
    console.log("Status:", yagoutResponse.status);
    console.log("Data:", yagoutResponse.data);

    // Process the response to extract payment link
    let paymentLink = null;
    let responseStatus = "SUCCESS";
    let decryptedResponse = null;

    console.log("=== PROCESSING PAYMENT LINK RESPONSE ===");
    console.log("Response data type:", typeof yagoutResponse.data);
    console.log("Response data:", yagoutResponse.data);

    // Handle different response formats
    if (typeof yagoutResponse.data === "string") {
      // Response is a string (encrypted data)
      console.log("Response is encrypted string, attempting decryption...");
      try {
        const cryptoUtil = new CryptoUtil();
        const decrypted = cryptoUtil.aes256CbcDecryptFromBase64(
          yagoutResponse.data,
          YAGOUT_CONFIG.ENCRYPTION_KEY_API
        );
        console.log("Decrypted response:", decrypted);

        // Use the new clicktowishResponse parser
        const parseResult = cryptoUtil.parseClicktowishResponse(decrypted);
        console.log("Parse result:", parseResult);

        if (parseResult.success) {
          paymentLink = parseResult.payment_link;
          decryptedResponse = parseResult.decrypted_data;
          responseStatus = parseResult.status;
        } else {
          responseStatus = parseResult.status;
          console.log("Parse failed:", parseResult.message);
        }
      } catch (e) {
        console.log("Decryption failed:", e);
        responseStatus = "DECRYPTION_FAILED";
      }
    } else if (yagoutResponse.data && yagoutResponse.data.response) {
      // Response has a nested response field
      const responseStr = yagoutResponse.data.response.trim();
      console.log("Nested response string:", responseStr);

      // Check if it's a direct URL
      if (responseStr.startsWith("http")) {
        paymentLink = responseStr;
      } else {
        // Try to decrypt if it's base64 encrypted
        try {
          const cryptoUtil = new CryptoUtil();
          const decrypted = cryptoUtil.aes256CbcDecryptFromBase64(
            responseStr,
            YAGOUT_CONFIG.ENCRYPTION_KEY_API
          );
          console.log("Decrypted nested response:", decrypted);

          // Use the new clicktowishResponse parser
          const parseResult = cryptoUtil.parseClicktowishResponse(decrypted);
          console.log("Parse result:", parseResult);

          if (parseResult.success) {
            paymentLink = parseResult.payment_link;
            decryptedResponse = parseResult.decrypted_data;
            responseStatus = parseResult.status;
          } else {
            responseStatus = parseResult.status;
            console.log("Parse failed:", parseResult.message);
          }
        } catch (e) {
          console.log("Decryption failed:", e);
          responseStatus = "DECRYPTION_FAILED";
        }
      }
    }

    console.log("Final payment link:", paymentLink);
    console.log("Final response status:", responseStatus);

    // Return the response to the client
    res.json({
      success: true,
      status: responseStatus,
      data: yagoutResponse.data,
      decrypted_data: decryptedResponse,
      payment_link: paymentLink,
      order_id: generatedOrderId,
      originalPayload: linkPayload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("=== PAYMENT LINK ERROR ===");
    console.error("Error:", error.message);
    console.error("Error Stack:", error.stack);

    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Headers:", error.response.headers);
      console.error("YagoutPay Error Response:", error.response.data);
      res.status(500).json({
        status: "ERROR",
        message: `API Error: ${error.response.status} - ${error.response.statusText}`,
        error: error.response.data,
        order_id: generatedOrderId || "UNKNOWN",
      });
    } else if (error.request) {
      console.error("Request Error:", error.request);
      res.status(500).json({
        status: "ERROR",
        message: `Network Error: ${error.message}`,
        order_id: generatedOrderId || "UNKNOWN",
      });
    } else {
      res.status(500).json({
        status: "ERROR",
        message: "Internal server error",
        error: error.message,
        order_id: generatedOrderId || "UNKNOWN",
      });
    }
  }
});

// Static Link API endpoint
app.post("/payments/static-link/create", async (req, res) => {
  try {
    console.log("=== STATIC LINK REQUEST ===");
    console.log("Received data:", JSON.stringify(req.body, null, 2));

    const {
      req_user_id,
      me_id,
      amount,
      customer_email,
      mobile_no,
      expiry_date,
      media_type,
      order_id,
      first_name,
      last_name,
      product,
      dial_code,
      failure_url,
      success_url,
      country,
      currency,
    } = req.body;

    // Validate required fields (order_id is optional now as we'll generate it)
    if (!req_user_id || !me_id || !amount || !mobile_no) {
      return res.status(400).json({
        status: "Failed",
        message:
          "Missing required fields: req_user_id, me_id, amount, mobile_no",
      });
    }

    // Generate unique order ID to avoid "Order Id already exists" error
    const generatedOrderId = generateUniqueOrderId("STATIC_LINK");
    console.log("Generated Order ID:", generatedOrderId);

    // Validate the generated order ID
    try {
      validateOrderId(generatedOrderId);
    } catch (error) {
      return res.status(400).json({
        status: "Failed",
        message: "Failed to generate valid order ID: " + error.message,
      });
    }

    // Calculate expiry date (30 days from today)
    const today = new Date();
    const expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from today
    const formattedExpiryDate = expiryDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // Prepare payload as per document
    const staticPayload = {
      req_user_id: req_user_id || "yagou381",
      me_id: me_id || "202508080001",
      amount: amount.toString(),
      customer_email: customer_email || "",
      mobile_no: mobile_no,
      expiry_date: expiry_date || formattedExpiryDate,
      media_type: media_type || ["API"],
      order_id: generatedOrderId, // Use generated order ID instead of static one
      first_name: first_name || "YagoutPay",
      last_name: last_name || "StaticLink",
      product: product || "Premium Subscription",
      dial_code: dial_code || "+251",
      failure_url: failure_url || "http://localhost:3000/failure",
      success_url: success_url || "http://localhost:3000/success",
      country: country || "ETH",
      currency: currency || "ETB",
    };

    console.log("Static Link payload:", JSON.stringify(staticPayload, null, 2));

    // Encrypt the payload
    const dataToEncrypt = JSON.stringify(staticPayload);
    const encryptedData = encryptData(
      dataToEncrypt,
      YAGOUT_CONFIG.ENCRYPTION_KEY_API
    );

    console.log("Encrypted data length:", encryptedData.length);

    // Prepare request for YagoutPay Static Link API
    const yagoutRequest = {
      request: encryptedData,
    };

    console.log("=== CALLING YAGOUTPAY STATIC LINK API ===");
    console.log("URL:", YAGOUT_CONFIG.STATIC_LINK_URL);
    console.log("Header me_id:", YAGOUT_CONFIG.MERCHANT_ID_API);

    // Call YagoutPay Static Link API
    const yagoutResponse = await axios.post(
      YAGOUT_CONFIG.STATIC_LINK_URL,
      yagoutRequest,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          me_id: YAGOUT_CONFIG.MERCHANT_ID_API,
        },
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false, // Disable SSL verification for UAT testing
        }),
      }
    );

    console.log("=== YAGOUTPAY STATIC LINK RESPONSE ===");
    console.log("Status:", yagoutResponse.status);
    console.log("Data:", yagoutResponse.data);

    // Process the response to extract payment link
    let paymentLink = null;
    let responseStatus = "SUCCESS";
    let decryptedResponse = null;

    console.log("=== PROCESSING STATIC LINK RESPONSE ===");
    console.log("Response data type:", typeof yagoutResponse.data);
    console.log("Response data:", yagoutResponse.data);

    // Handle different response formats
    if (typeof yagoutResponse.data === "string") {
      // Response is a string (encrypted data)
      console.log("Response is encrypted string, attempting decryption...");
      try {
        const cryptoUtil = new CryptoUtil();
        const decrypted = cryptoUtil.aes256CbcDecryptFromBase64(
          yagoutResponse.data,
          YAGOUT_CONFIG.ENCRYPTION_KEY_API
        );
        console.log("Decrypted response:", decrypted);

        // Use the new clicktowishResponse parser
        const parseResult = cryptoUtil.parseClicktowishResponse(decrypted);
        console.log("Parse result:", parseResult);

        if (parseResult.success) {
          paymentLink = parseResult.payment_link;
          decryptedResponse = parseResult.decrypted_data;
          responseStatus = parseResult.status;
        } else {
          responseStatus = parseResult.status;
          console.log("Parse failed:", parseResult.message);
        }
      } catch (e) {
        console.log("Decryption failed:", e);
        responseStatus = "DECRYPTION_FAILED";
      }
    } else if (yagoutResponse.data && yagoutResponse.data.response) {
      // Response has a nested response field
      const responseStr = yagoutResponse.data.response.trim();
      console.log("Nested response string:", responseStr);

      // Check if it's a direct URL
      if (responseStr.startsWith("http")) {
        paymentLink = responseStr;
      } else {
        // Try to decrypt if it's base64 encrypted
        try {
          const cryptoUtil = new CryptoUtil();
          const decrypted = cryptoUtil.aes256CbcDecryptFromBase64(
            responseStr,
            YAGOUT_CONFIG.ENCRYPTION_KEY_API
          );
          console.log("Decrypted nested response:", decrypted);

          // Use the new clicktowishResponse parser
          const parseResult = cryptoUtil.parseClicktowishResponse(decrypted);
          console.log("Parse result:", parseResult);

          if (parseResult.success) {
            paymentLink = parseResult.payment_link;
            decryptedResponse = parseResult.decrypted_data;
            responseStatus = parseResult.status;
          } else {
            responseStatus = parseResult.status;
            console.log("Parse failed:", parseResult.message);
          }
        } catch (e) {
          console.log("Decryption failed:", e);
          responseStatus = "DECRYPTION_FAILED";
        }
      }
    }

    console.log("Final payment link:", paymentLink);
    console.log("Final response status:", responseStatus);

    // Return the response to the client
    res.json({
      success: true,
      status: responseStatus,
      data: yagoutResponse.data,
      decrypted_data: decryptedResponse,
      payment_link: paymentLink,
      order_id: generatedOrderId,
      originalPayload: staticPayload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("=== STATIC LINK ERROR ===");
    console.error("Error:", error.message);
    console.error("Error Stack:", error.stack);

    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Headers:", error.response.headers);
      console.error("YagoutPay Error Response:", error.response.data);
      res.status(500).json({
        status: "ERROR",
        message: `API Error: ${error.response.status} - ${error.response.statusText}`,
        error: error.response.data,
        order_id: generatedOrderId || "UNKNOWN",
      });
    } else if (error.request) {
      console.error("Request Error:", error.request);
      res.status(500).json({
        status: "ERROR",
        message: `Network Error: ${error.message}`,
        order_id: generatedOrderId || "UNKNOWN",
      });
    } else {
      res.status(500).json({
        status: "ERROR",
        message: "Internal server error",
        error: error.message,
        order_id: generatedOrderId || "UNKNOWN",
      });
    }
  }
});

// Test decryption endpoint
app.post("/test/decrypt", (req, res) => {
  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({
        error: "Missing encryptedData in request body",
      });
    }

    console.log("=== TESTING DECRYPTION ===");
    console.log("Encrypted data:", encryptedData);

    const cryptoUtil = new CryptoUtil();
    const decrypted = cryptoUtil.aes256CbcDecryptFromBase64(
      encryptedData,
      YAGOUT_CONFIG.ENCRYPTION_KEY_API
    );

    console.log("Decrypted data:", decrypted);

    // Try to parse using the clicktowishResponse parser
    const parseResult = cryptoUtil.parseClicktowishResponse(decrypted);
    console.log("Parse result:", parseResult);

    res.json({
      success: true,
      encrypted_data: encryptedData,
      decrypted_data: decrypted,
      parse_result: parseResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Decryption test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "YagoutPay Backend Server is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}`);
  console.log(
    `💳 Payment endpoint: http://localhost:${PORT}/payments/api/initiate`
  );
  console.log(
    `🔗 Payment Link endpoint: http://localhost:${PORT}/payments/link/create`
  );
  console.log(
    `📱 Static Link endpoint: http://localhost:${PORT}/payments/static-link/create`
  );
  console.log(
    `🧪 Test Decryption endpoint: http://localhost:${PORT}/test/decrypt`
  );
});

module.exports = app;
