import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/auth.js';
import { mutateContentStore } from './_lib/store.js';
import { sendTelegramAlert } from './_lib/telegram.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';

  // GET: One-click setup endpoint to register or check the Telegram webhook (Admin only)
  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    const action = req.query.action as string;
    const host = req.headers.host || 'www.shivdhara.co.in';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const webhookUrl = `${proto}://${host}/api/telegram-webhook`;

    if (action === 'setWebhook') {
      try {
        const setupRes = await fetch(
          `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
        );
        const setupData = await setupRes.json();
        return res.status(200).json({ webhookUrl, result: setupData });
      } catch (err: any) {
        return res.status(500).json({ error: 'Failed to set webhook', details: err.message });
      }
    }

    try {
      const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
      const infoData = await infoRes.json();
      return res.status(200).json({ currentWebhookInfo: infoData, targetWebhookUrl: webhookUrl });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get webhook info', details: err.message });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const update = req.body || {};
  const message = update.message;

  // Ignore updates without message or text
  if (!message || !message.text) {
    return res.status(200).json({ ok: true, note: 'No message text to process' });
  }

  const replyText = message.text.trim();
  const replyTo = message.reply_to_message;

  // 1. Look for Ref ID in replied message if present
  let targetRequestId: string | null = null;
  if (replyTo && replyTo.text) {
    const idMatch = replyTo.text.match(/hr-\d+/);
    if (idMatch) {
      targetRequestId = idMatch[0];
    }
  }

  let matchedCustomerName = 'Seeker';

  try {
    await mutateContentStore(
      (state) => {
        state.humanRequests = state.humanRequests || [];
        let target: any = null;

        if (targetRequestId) {
          target = state.humanRequests.find((r: any) => r.id === targetRequestId);
        }

        // Fallback: if no Ref ID found in replied message, route to the most recent active request!
        if (!target && state.humanRequests.length > 0) {
          target = state.humanRequests[0];
          targetRequestId = target.id;
        }

        if (target) {
          matchedCustomerName = target.customerName || 'Seeker';
          target.replies = target.replies || [];
          target.replies.push({
            id: `rep-${Date.now()}`,
            from: 'Falgun Thakkr & Team',
            text: replyText,
            createdAt: new Date().toISOString(),
          });
          target.status = 'REPLIED';
        }
      },
      `data: team reply to ${targetRequestId || 'latest'}`
    );

    // Send confirmation in Telegram to Falgun Thakkr & Team
    const confirmMsg = `✅ <b>DELIVERED TO LIVE CHAT</b>\n\n<b>Seeker:</b> ${matchedCustomerName} (<code>${targetRequestId || 'Recent'}</code>)\n<b>Message Sent:</b>\n<i>"${replyText}"</i>\n\n🟢 <i>This message is now live on the customer's chat screen.</i>`;
    await sendTelegramAlert(confirmMsg).catch(() => null);

    return res.status(200).json({ ok: true, deliveredTo: targetRequestId });
  } catch (err: any) {
    console.error('[Telegram Webhook Error]', err);
    return res.status(500).json({ error: 'Failed to process team reply' });
  }
}
