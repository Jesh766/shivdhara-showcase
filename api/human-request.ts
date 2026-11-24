import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchContentStore, mutateContentStore } from './_lib/store.js';
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

  // GET: Poll for status and live replies for an active request ID
  if (req.method === 'GET') {
    const targetId = sanitizeString(req.query.id as string, 50);
    if (!targetId) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    try {
      const { state } = await fetchContentStore();
      const humanRequests = state.humanRequests || [];
      const found = humanRequests.find((r: any) => r.id === targetId);

      if (!found) {
        return res.status(404).json({ error: 'Request not found', replies: [] });
      }

      return res.status(200).json({
        success: true,
        status: found.status || 'NEW',
        replies: found.replies || [],
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch request status', replies: [] });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting per-IP (10 requests per 10 mins)
  if (!enforceRateLimit(req, res, 'human_request_post', { windowMs: 10 * 60 * 1000, maxRequests: 10 })) {
    return;
  }

  const { customerName, phone, reason, currentPage = '/', conversationSummary } = req.body || {};

  const safeCustomerName = sanitizeString(customerName, 100);
  const safePhone = sanitizeString(phone, 25);
  const safeReason = sanitizeTextOnly(reason, 300) || 'Requested direct consultation with SHIV DHARA team';
  const safeCurrentPage = sanitizeString(currentPage, 100, '/');
  const safeConversationSummary = sanitizeTextOnly(conversationSummary, 1000);

  if (!safeCustomerName || !safePhone) {
    return res.status(400).json({
      error: 'Please provide your name and WhatsApp phone number.',
    });
  }

  if (!isValidPhone(safePhone)) {
    return res.status(400).json({ error: 'Please enter a valid phone number' });
  }

  try {
    const humanReq = {
      id: `hr-${Date.now()}`,
      customerName: safeCustomerName,
      phone: safePhone,
      reason: safeReason,
      currentPage: safeCurrentPage,
      conversationSummary: safeConversationSummary || 'Customer submitted direct request via callback form.',
      status: 'NEW',
      replies: [],
      createdAt: new Date().toISOString(),
    };

    await mutateContentStore(
      (state) => {
        state.humanRequests = state.humanRequests || [];
        state.humanRequests.unshift(humanReq);
      },
      `data: human request from ${safeCustomerName}`
    );

    // Telegram Alert (awaiting to ensure delivery before Vercel serverless freeze)
    const alertMsg = `🙋 <b>NEW TEAM CALLBACK REQUEST — SHIV DHARA</b>\n\n<b>Ref ID:</b> <code>${humanReq.id}</code>\n<b>Name:</b> ${safeCustomerName}\n<b>Phone:</b> <code>${safePhone}</code>\n<b>Inquiry:</b> ${safeReason}\n<b>Page:</b> ${safeCurrentPage}\n<b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n💬 <i>Tip: Tap "Reply" to this message in Telegram to send a live response directly to this customer's device!</i>`;
    await sendTelegramAlert(alertMsg).catch((err) => console.error('[Human Request Telegram Error]', err));

    return res.status(201).json({
      success: true,
      message: 'Your request has been shared directly with the SHIV DHARA team. Falgun Thakkr or a senior advisor will reach out to you promptly.',
      request: humanReq,
    });
  } catch (err: any) {
    console.error('[Human Request API Error]');
    return res.status(500).json({ error: 'Failed to record human assistance request' });
  }
}
