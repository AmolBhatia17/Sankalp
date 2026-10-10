// Sankalp payment API — the only server-side piece of the app.
// Creates Razorpay orders and verifies payment signatures.
//
// Run with:  npm run server      (or npm run dev:all to run web + api together)
//
// Secrets live in server/.env (gitignored) — see server/.env.example.

import crypto from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import Razorpay from 'razorpay';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config(); // fall back to the root .env for VITE_RAZORPAY_KEY_ID

const PORT = process.env.PORT || 5000;
const KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const hasCreds = Boolean(
  KEY_ID && KEY_SECRET && KEY_SECRET !== 'your_razorpay_key_secret_here'
);

const razorpay = hasCreds ? new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET }) : null;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, razorpayConfigured: hasCreds });
});

app.post('/api/razorpay/order', async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ error: 'Razorpay is not configured on the server.' });
  }
  const { amount, courseId } = req.body || {};
  const rupees = Number(amount);
  if (!rupees || rupees <= 0) {
    return res.status(400).json({ error: 'A valid amount is required.' });
  }
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(rupees * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${courseId || 'course'}_${Date.now()}`,
      notes: { courseId: courseId || '' },
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Could not create the payment order.' });
  }
});

app.post('/api/razorpay/verify', (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ error: 'Razorpay is not configured on the server.' });
  }
  const { orderId, paymentId, signature } = req.body || {};
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ verified: false, error: 'Missing payment fields.' });
  }
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const verified =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!verified) {
    return res.status(400).json({ verified: false, error: 'Signature mismatch.' });
  }
  res.json({ verified: true });
});

app.listen(PORT, () => {
  console.log(`Sankalp payment API listening on http://localhost:${PORT}`);
  if (!hasCreds) {
    console.warn('  ⚠ RAZORPAY_KEY_SECRET not set — add it to server/.env to enable live checkout.');
  }
});
