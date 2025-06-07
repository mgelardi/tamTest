import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

const baseURL = 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const response = await axios({
    url: `${baseURL}/v1/oauth2/token`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECRET
    },
    data: 'grant_type=client_credentials'
  });
  return response.data.access_token;
}

// Create order
app.post('/api/create-order', async (req, res) => {
  try {
    const token = await getAccessToken();
    const order = await axios.post(`${baseURL}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '50.00',
          breakdown: {
            item_total: { value: '45.00', currency_code: 'USD' },
            shipping: { value: '5.00', currency_code: 'USD' }
          }
        },
        items: [{
          name: "T-Shirt",
          unit_amount: { value: '45.00', currency_code: 'USD' },
          quantity: "1"
        }]
      }],
      application_context: {
        return_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json({ id: order.data.id });
  } catch (err) {
    console.error("❌ Error creating order:", err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order details
app.get('/api/get-order/:id', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { id } = req.params;
    const response = await axios.get(`${baseURL}/v2/checkout/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json({
      shipping: response.data.purchase_units[0].shipping.address
    });
  } catch (err) {
    console.error("❌ Error getting order:", err.message);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Patch order with updated shipping
app.patch('/api/update-shipping/:id', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { id } = req.params;
    const { postalCode } = req.body;

    const newShipping = postalCode.startsWith('9') ? '10.00' : '5.00';

    await axios.patch(`${baseURL}/v2/checkout/orders/${id}`, [
      {
        op: "replace",
        path: "/purchase_units/@reference_id=='default'/amount",
        value: {
          currency_code: 'USD',
          value: (45 + parseFloat(newShipping)).toFixed(2),
          breakdown: {
            item_total: { value: '45.00', currency_code: 'USD' },
            shipping: { value: newShipping, currency_code: 'USD' }
          }
        }
      }
    ], {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ updated: true });
  } catch (err) {
    console.error("❌ Error updating shipping:", err.message);
    res.status(500).json({ error: 'Failed to update shipping' });
  }
});

// Capture order
app.post('/api/capture-order/:id', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { id } = req.params;

    const capture = await axios.post(`${baseURL}/v2/checkout/orders/${id}/capture`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const debugId = capture.headers['paypal-debug-id'];
    res.json({ status: 'captured', orderID: capture.data.id, debugId });
  } catch (err) {
    console.error("❌ Error capturing order:", err.message);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

// Fallback route to serve index.html on /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});