const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const base = "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const res = await axios({
    url: `${base}/v1/oauth2/token`,
    method: 'post',
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECRET
    },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: 'grant_type=client_credentials'
  });
  return res.data.access_token;
}

app.post("/api/create-order", async (req, res) => {
  const { name, email, address } = req.body;
  console.log("Received create-order request:", req.body);

  if (
    !name ||
    !email ||
    !address ||
    !address.address_line_1 ||
    !address.admin_area_2 ||
    !address.postal_code ||
    !address.country_code
  ) {
    return res.status(400).json({ error: true, message: "Missing required fields in buyer information." });
  }

  try {
    const accessToken = await getAccessToken();

    const response = await axios({
      url: `${base}/v2/checkout/orders`,
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        intent: 'CAPTURE',
        payer: {
          email_address: email,
          name: { full_name: name }
        },
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: '50.00'
          },
          shipping: {
            name: { full_name: name },
            address
          }
        }]
      }
    });

    console.log("Order created:", response.data);
    res.json({ id: response.data.id });

  } catch (error) {
    console.error("Create order failed:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: true,
      message: error.response?.data || error.message
    });
  }
});

app.post("/api/capture-order/:orderID", async (req, res) => {
  const { orderID } = req.params;
  console.log(`Attempting to capture order ID: ${orderID}`);
  const accessToken = await getAccessToken();

  try {
    const response = await axios({
      url: `${base}/v2/checkout/orders/${orderID}/capture`,
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Order captured:", response.data);
    res.json({
      orderID: response.data.id,
      debugId: response.headers['paypal-debug-id']
    });

  } catch (error) {
    console.error("Capture failed:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: true,
      message: error.response?.data || error.message
    });
  }
});

app.post("/api/refund", async (req, res) => {
  const { captureId, amount } = req.body;
  console.log("Refund request received:", req.body);

  if (!captureId) {
    return res.status(400).json({ error: true, message: "Missing captureId" });
  }

  try {
    const accessToken = await getAccessToken();
    const response = await axios({
      url: `https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}/refund`,
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: amount ? { amount: { value: amount, currency_code: "USD" } } : {}
    });

    console.log("Refund successful:", response.data);
    res.json({
      refundId: response.data.id,
      debugId: response.headers['paypal-debug-id']
    });

  } catch (error) {
    console.error("Refund failed:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: true,
      message: error.response?.data || error.message
    });
  }
});

app.listen(4000, () => console.log("Backend running at http://localhost:4000"));