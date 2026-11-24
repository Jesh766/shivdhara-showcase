import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/auth.js';
import { mutateContentStore, fetchContentStore } from './_lib/store.js';
import { sendTelegramAlert } from './_lib/telegram.js';
import { enforceRateLimit, isValidEmail, isValidPhone, sanitizeString } from './_lib/validation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  // 1. GET /api/users requires master admin auth (stops public data leaks)
  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;

    try {
      const { state } = await fetchContentStore();
      return res.status(200).json({ users: state.registeredUsers || [] });
    } catch (err: any) {
      console.error('[API users GET] Error');
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // 2. POST /api/users: user sign in / sync
  if (req.method === 'POST') {
    if (!enforceRateLimit(req, res, 'users_post', { windowMs: 10 * 60 * 1000, maxRequests: 20 })) {
      return;
    }

    const body = req.body || {};
    const email = sanitizeString(body.email, 120);
    const name = sanitizeString(body.name, 100, 'Seeker');
    const phone = sanitizeString(body.phone, 20);
    const authProvider = sanitizeString(body.authProvider, 30, 'Direct');

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }

    try {
      let isNew = false;
      await mutateContentStore(
        (state) => {
          state.registeredUsers = state.registeredUsers || [];
          const existingIdx = state.registeredUsers.findIndex(
            (u: any) => u.email && u.email.toLowerCase() === email.toLowerCase()
          );

          if (existingIdx > -1) {
            state.registeredUsers[existingIdx] = {
              ...state.registeredUsers[existingIdx],
              name: name || state.registeredUsers[existingIdx].name,
              phone: phone || state.registeredUsers[existingIdx].phone,
              authProvider: authProvider || state.registeredUsers[existingIdx].authProvider,
              loginCount: (state.registeredUsers[existingIdx].loginCount || 1) + 1,
              lastLoginAt: new Date().toISOString(),
            };
          } else {
            isNew = true;
            state.registeredUsers.unshift({
              id: `usr-${Date.now()}`,
              name,
              email,
              phone,
              authProvider,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              loginCount: 1,
            });
          }
        },
        `data: sync user ${email}`
      );

      // Telegram notification (safe)
      const title = isNew ? '🌟 NEW CLIENT REGISTERED' : '🔑 CLIENT SIGNED IN';
      const alertMsg = `<b>${title} — SHIV DHARA</b>\n\n<b>Name:</b> ${name}\n<b>Email:</b> ${email}\n<b>Phone:</b> <code>${phone || 'Not Provided'}</code>\n<b>Provider:</b> ${authProvider}\n<b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
      await sendTelegramAlert(alertMsg).catch((err) => console.error('[User Telegram Error]', err));

      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('[API users POST] Error');
      return res.status(500).json({ error: 'Failed to sync user account' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
