import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_PRODUCTS } from './initialCatalog.js';
import { mutateContentStore } from './_lib/store.js';
import { sendTelegramAlert } from './_lib/telegram.js';
import {
  enforceRateLimit,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  sanitizeTextOnly,
} from './_lib/validation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting per-IP (15 orders per 10 mins)
  if (!enforceRateLimit(req, res, 'orders_post', { windowMs: 10 * 60 * 1000, maxRequests: 15 })) {
    return;
  }

  const payload = req.body || {};
  const customerName = sanitizeString(payload?.customerName || payload?.name, 100);
  const customerPhone = sanitizeString(payload?.customerPhone || payload?.phone, 25);
  const customerEmail = sanitizeString(payload?.customerEmail || payload?.email, 120);
  const rawItems = Array.isArray(payload.items) ? payload.items : [];

  if (!customerName || !customerPhone || rawItems.length === 0) {
    return res.status(400).json({ error: 'Missing required order details (name, phone, items)' });
  }

  if (!isValidPhone(customerPhone)) {
    return res.status(400).json({ error: 'Please enter a valid phone number' });
  }

  if (customerEmail && !isValidEmail(customerEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const rawAddress =
    payload.address ||
    payload.shippingAddress ||
    (payload.addressLine1
      ? `${payload.addressLine1}, ${payload.city || ''} ${payload.pincode || ''}`
      : 'Direct WhatsApp Concierge');
  const fullAddress = sanitizeTextOnly(
    typeof rawAddress === 'string' ? rawAddress : JSON.stringify(rawAddress),
    300
  );

  const city = sanitizeString(payload.city, 60);
  const state = sanitizeString(payload.state, 60);
  const pincode = sanitizeString(payload.pincode || payload.postalCode, 15);
  const paymentMethod = sanitizeString(payload.paymentMethod, 30, 'WHATSAPP');
  const utr = sanitizeString(payload.utr || payload.paymentDetails?.utrNumber, 60);

  try {
    const orderNumber = `SD-${Date.now().toString().slice(-6)}`;
    let createdOrder: any = null;

    await mutateContentStore(
      (storeState) => {
        const storeProducts = [...(storeState.products || []), ...INITIAL_PRODUCTS];

        let calculatedSubtotal = 0;
        const items = rawItems.slice(0, 50).map((it: any) => {
          const matched = storeProducts.find(
            (p: any) => p.id === it.productId || p.slug === it.productSlug || p.name === it.productName
          );
          const rawPrice = it.unitPrice ?? it.price ?? matched?.price ?? 0;
          const unitPrice = Math.max(0, Number(rawPrice));
          const qty = Math.max(1, Math.min(100, Number(it.quantity || 1)));
          const itemTotal = unitPrice * qty;
          calculatedSubtotal += itemTotal;

          return {
            productId: sanitizeString(it.productId || matched?.id, 60),
            productSlug: sanitizeString(it.productSlug || matched?.slug, 60),
            productName: sanitizeString(it.productName || matched?.name || it.name, 120, 'Sacred Offering'),
            variantName: sanitizeString(it.variantName || it.selectedVariant?.name, 60) || null,
            unitPrice,
            price: unitPrice,
            quantity: qty,
            total: itemTotal,
          };
        });

        const shipping = calculatedSubtotal >= 1999 || calculatedSubtotal === 0 ? 0 : 150;
        const total = calculatedSubtotal + shipping;

        createdOrder = {
          id: `ord-${Date.now()}`,
          orderNumber,
          customerName,
          customerPhone,
          phone: customerPhone,
          customerEmail,
          email: customerEmail,
          address: fullAddress,
          city,
          state,
          pincode,
          items,
          subtotal: calculatedSubtotal,
          shipping,
          total,
          paymentMethod,
          paymentStatus: utr ? 'PAYMENT_VERIFIED_PENDING' : 'PENDING_VERIFICATION',
          utr: utr || null,
          createdAt: new Date().toISOString(),
        };

        storeState.orders = storeState.orders || [];
        storeState.orders.unshift(createdOrder);
      },
      `data: add order ${orderNumber}`
    );

    // Telegram Alert
    if (createdOrder) {
      const itemsSummary = (createdOrder.items || [])
        .map((i: any) => `• ${i.productName} (x${i.quantity}) - ₹${i.unitPrice * i.quantity}`)
        .join('\n');

      const alertMsg = `🛍️ <b>SHIV DHARA — NEW SACRED ORDER</b>\n\n<b>Order Number:</b> <code>${createdOrder.orderNumber}</code>\n<b>Customer:</b> ${customerName}\n<b>Phone:</b> <code>${customerPhone}</code>\n<b>Total Amount:</b> ₹${createdOrder.total.toLocaleString('en-IN')}\n<b>Payment:</b> ${paymentMethod}\n<b>UTR:</b> <code>${utr || 'Pending'}</code>\n\n<b>Items:</b>\n${itemsSummary}`;
      await sendTelegramAlert(alertMsg).catch((err) => console.error('[Order Telegram Error]', err));
    }

    return res.status(201).json({ success: true, order: createdOrder });
  } catch (err: any) {
    console.error('[API orders] Error');
    return res.status(500).json({ error: 'Failed to record order' });
  }
}
