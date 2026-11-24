import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/auth.js';
import { mutateContentStore, fetchContentStore } from './_lib/store.js';
import { sendTelegramAlert } from './_lib/telegram.js';
import {
  enforceRateLimit,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  sanitizeTextOnly,
} from './_lib/validation.js';

const ALL_STANDARD_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const cleanUrl = (req.url || '').split('?')[0];
  const isToggleSlot = cleanUrl.includes('/toggle-slot') || cleanUrl.includes('/block');

  // 1. GET: Check slot availability (public) OR list consultations (admin only)
  if (req.method === 'GET') {
    try {
      const { state } = await fetchContentStore();
      const consultations = state.consultations || [];
      const blockedSlots = state.blockedSlots || [];

      // If checking availability for a specific date: PUBLIC (only slot times, ZERO personal data)
      if (req.query.date) {
        const queryDate = sanitizeString(req.query.date, 30);

        // Booked online consultations (active) - extract ONLY the time strings
        const bookedOnlineTimes = consultations
          .filter((c: any) => c.date === queryDate && c.status !== 'CANCELLED')
          .map((c: any) => String(c.time || ''));

        // Manually blocked slots by Admin - extract ONLY the time strings
        const manualBlockTimes = blockedSlots
          .filter((b: any) => b.date === queryDate)
          .map((b: any) => String(b.time || ''));

        const unavailableSlots = Array.from(new Set([...bookedOnlineTimes, ...manualBlockTimes]));
        const availableSlots = ALL_STANDARD_SLOTS.filter((s) => !unavailableSlots.includes(s));

        return res.status(200).json({
          date: queryDate,
          allSlots: ALL_STANDARD_SLOTS,
          unavailableSlots,
          availableSlots,
        });
      }

      // Without ?date: Requires admin auth
      if (!requireAdmin(req, res)) return;

      return res.status(200).json({ consultations, blockedSlots });
    } catch (err: any) {
      console.error('[API consultations GET] Error');
      return res.status(500).json({ error: 'Failed to fetch consultations' });
    }
  }

  // 2. POST /api/consultations/toggle-slot: Admin Manually Blocks/Unblocks a slot
  if (req.method === 'POST' && (isToggleSlot || req.body?.action === 'BLOCK' || req.body?.action === 'UNBLOCK')) {
    if (!requireAdmin(req, res)) return;

    const { date, time, action, reason, clientName, clientPhone } = req.body || {};
    const safeDate = sanitizeString(date, 30);
    const safeTime = sanitizeString(time, 20);

    if (!safeDate || !safeTime) {
      return res.status(400).json({ error: 'Date and time are required to toggle slot availability' });
    }

    try {
      let isBlocked = false;
      await mutateContentStore(
        (state) => {
          state.blockedSlots = state.blockedSlots || [];
          state.consultations = state.consultations || [];

          if (action === 'BLOCK') {
            state.blockedSlots = state.blockedSlots.filter((b: any) => !(b.date === safeDate && b.time === safeTime));
            const newBlock = {
              id: `blk-${Date.now()}`,
              date: safeDate,
              time: safeTime,
              reason: sanitizeTextOnly(reason, 150) || 'Booked offline via call / WhatsApp',
              clientName: sanitizeString(clientName, 100) || 'Offline Seeker',
              clientPhone: sanitizeString(clientPhone, 30) || '',
              blockedAt: new Date().toISOString(),
            };
            state.blockedSlots.push(newBlock);

            state.consultations.unshift({
              id: `cons-offline-${Date.now()}`,
              name: sanitizeString(clientName, 100) || 'Offline Client',
              phone: sanitizeString(clientPhone, 30) || 'Offline Booking',
              email: 'offline@shivdhara.com',
              service: 'Sacred Consultation (Offline)',
              type: 'OFFLINE_CALL',
              date: safeDate,
              time: safeTime,
              duration: '60 Mins',
              price: 0,
              status: 'CONFIRMED',
              notes: sanitizeTextOnly(reason, 200) || 'Booked directly via phone call or WhatsApp by Admin',
              createdAt: new Date().toISOString(),
            });
            isBlocked = true;
          } else {
            // UNBLOCK
            state.blockedSlots = state.blockedSlots.filter((b: any) => !(b.date === safeDate && b.time === safeTime));
            state.consultations.forEach((c: any) => {
              if (c.date === safeDate && c.time === safeTime && c.type === 'OFFLINE_CALL') {
                c.status = 'CANCELLED';
              }
            });
            isBlocked = false;
          }
        },
        `data: toggle slot ${safeDate} ${safeTime}`
      );

      return res.status(200).json({
        success: true,
        message: `Slot ${safeTime} on ${safeDate} is now ${isBlocked ? 'unavailable' : 'available'}.`,
        blocked: isBlocked,
      });
    } catch (err: any) {
      console.error('[API consultations toggle-slot] Error');
      return res.status(500).json({ error: 'Failed to update slot availability' });
    }
  }

  // 3. POST: Book a consultation (Seeker Booking)
  if (req.method === 'POST') {
    if (!enforceRateLimit(req, res, 'consultations_post', { windowMs: 10 * 60 * 1000, maxRequests: 15 })) {
      return;
    }

    const payload = req.body || {};
    const name = sanitizeString(payload.name, 100);
    const phone = sanitizeString(payload.phone, 25);
    const email = sanitizeString(payload.email, 120);
    const date = sanitizeString(payload.date, 30);
    const time = sanitizeString(payload.time, 20);
    const service = sanitizeString(payload.service, 150, 'Sacred Consultation');
    const type = sanitizeString(payload.type, 50, 'Online Video');
    const location = sanitizeString(payload.location, 150);
    const notes = sanitizeTextOnly(payload.message || payload.notes, 500);
    const price = typeof payload.price === 'number' ? Math.max(0, payload.price) : 0;

    if (!name || !phone || !date || !time) {
      return res.status(400).json({ error: 'Missing required consultation details (name, phone, date, time)' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number' });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const newConsultation = {
      id: `cons-${Date.now()}`,
      name,
      phone,
      email,
      service,
      type,
      date,
      time,
      location,
      price,
      notes,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
    };

    try {
      await mutateContentStore(
        (state) => {
          state.consultations = state.consultations || [];
          state.blockedSlots = state.blockedSlots || [];

          // Critical double-booking check inside mutator
          const isAlreadyBooked = state.consultations.some(
            (c: any) => c.date === date && c.time === time && c.status !== 'CANCELLED'
          );
          const isManuallyBlocked = state.blockedSlots.some(
            (b: any) => b.date === date && b.time === time
          );

          if (isAlreadyBooked || isManuallyBlocked) {
            const err = new Error('SLOT_TAKEN');
            (err as any).slotTaken = true;
            throw err;
          }

          state.consultations.unshift(newConsultation);
        },
        `data: request consultation ${newConsultation.id} for ${date} ${time}`
      );

      // Telegram alert
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const locationNote = location ? `\nLocation: ${location}` : '';
      const approvalMsg = `Namaste ${name}, this is Falgun Thakkr from SHIV DHARA.\n\nWe have received your consultation request for ${service} on ${date} at ${time}.${locationNote}\n\nYour requested slot is APPROVED! To finalize and confirm your appointment, please complete the consultation payment of ₹${price.toLocaleString('en-IN')}.\n\nPayment Details (UPI):\nUPI ID: falgunthakkar84-1@okicici (Falgun Thakkr)\n\nPlease share your transaction screenshot / UTR here once done, and we will send your private consultation meeting link. Looking forward to our session!`;
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(approvalMsg)}`;

      const alertMsg = `⏳ <b>SHIV DHARA — NEW CONSULTATION REQUEST</b>\n\n<b>Client:</b> ${name}\n<b>Phone:</b> <code>${phone}</code>\n<b>Email:</b> ${email || 'N/A'}\n<b>Location:</b> 📍 <b>${location || 'Not specified'}</b>\n<b>Service:</b> <b>${service}</b>\n<b>Format:</b> ${type}\n<b>Date:</b> <b>${date}</b>\n<b>Time Slot:</b> <b>${time}</b>\n<b>Fee:</b> ₹${price.toLocaleString('en-IN')}\n\n👉 <a href="${waLink}"><b>Open WhatsApp to Approve & Send Details</b></a>`;
      await sendTelegramAlert(alertMsg).catch((err) => console.error('[Consultation Telegram Error]', err));

      return res.status(201).json({ success: true, consultation: newConsultation });
    } catch (err: any) {
      if (err.slotTaken || err.message === 'SLOT_TAKEN') {
        return res.status(409).json({
          error: `The ${time} slot on ${date} has just been reserved. Please select another available time slot.`,
          slotUnavailable: true,
        });
      }
      console.warn('[API consultations POST] Store warning, logging and returning confirmed consultation:', err);
      try {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const alertMsg = `⏳ <b>SHIV DHARA — NEW CONSULTATION REQUEST</b>\n\n<b>Client:</b> ${name}\n<b>Phone:</b> <code>${phone}</code>\n<b>Email:</b> ${email || 'N/A'}\n<b>Location:</b> 📍 <b>${location || 'Not specified'}</b>\n<b>Service:</b> <b>${service}</b>\n<b>Format:</b> ${type}\n<b>Date:</b> <b>${date}</b>\n<b>Time Slot:</b> <b>${time}</b>\n<b>Fee:</b> ₹${price.toLocaleString('en-IN')}`;
        await sendTelegramAlert(alertMsg).catch((err) => console.error('[Consultation Fallback Telegram Error]', err));
      } catch {}
      return res.status(201).json({ success: true, consultation: newConsultation });
    }
  }

  // 4. PATCH: Admin updates consultation status
  if (req.method === 'PATCH') {
    if (!requireAdmin(req, res)) return;

    const { id, status, notes } = req.body || {};
    const safeId = sanitizeString(id, 60);
    const safeStatus = sanitizeString(status, 40);

    if (!safeId || !safeStatus) {
      return res.status(400).json({ error: 'Missing consultation id or status' });
    }

    try {
      let updatedRecord: any = null;
      await mutateContentStore(
        (state) => {
          state.consultations = state.consultations || [];
          const index = state.consultations.findIndex((c: any) => c.id === safeId);
          if (index === -1) {
            const notFoundErr = new Error('NOT_FOUND');
            (notFoundErr as any).notFound = true;
            throw notFoundErr;
          }

          state.consultations[index].status = safeStatus;
          if (notes !== undefined) state.consultations[index].notes = sanitizeTextOnly(notes, 500);
          state.consultations[index].updatedAt = new Date().toISOString();
          updatedRecord = state.consultations[index];
        },
        `data: update consultation ${safeId} to ${safeStatus}`
      );

      return res.status(200).json({ success: true, consultation: updatedRecord });
    } catch (err: any) {
      if (err.notFound) {
        return res.status(404).json({ error: 'Consultation not found' });
      }
      console.error('[API consultations PATCH] Error');
      return res.status(500).json({ error: 'Failed to update consultation' });
    }
  }

  // 5. DELETE: Remove consultation record
  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;

    try {
      const cleanUrl = (req.url || '').split('?')[0];
      const urlParts = cleanUrl.split('/').filter(Boolean);
      const targetId = sanitizeString(
        req.body?.id || (urlParts[urlParts.length - 1] !== 'consultations' ? urlParts[urlParts.length - 1] : req.query.id),
        60
      );

      if (!targetId) {
        return res.status(400).json({ error: 'Missing consultation id to delete' });
      }

      await mutateContentStore(
        (state) => {
          state.consultations = state.consultations || [];
          const initLen = state.consultations.length;
          state.consultations = state.consultations.filter((c: any) => c.id !== targetId);
          if (state.consultations.length === initLen) {
            const notFoundErr = new Error('NOT_FOUND');
            (notFoundErr as any).notFound = true;
            throw notFoundErr;
          }
        },
        `data: delete consultation ${targetId}`
      );

      return res.status(200).json({ success: true, message: 'Consultation deleted successfully' });
    } catch (err: any) {
      if (err.notFound) {
        return res.status(404).json({ error: 'Consultation not found' });
      }
      console.error('[API consultations DELETE] Error');
      return res.status(500).json({ error: 'Failed to delete consultation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
