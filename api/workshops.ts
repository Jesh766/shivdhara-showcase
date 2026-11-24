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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  // 1. GET: Public list of active workshops
  if (req.method === 'GET') {
    try {
      const { state } = await fetchContentStore();
      const workshops = (state.workshops || []).filter((w: any) => w.active !== false);
      return res.status(200).json({ workshops });
    } catch (err: any) {
      console.error('[API workshops GET] Error');
      return res.status(500).json({ error: 'Failed to fetch workshops' });
    }
  }

  // 2. POST: Register for a workshop (Seeker)
  if (req.method === 'POST') {
    if (!enforceRateLimit(req, res, 'workshops_post', { windowMs: 10 * 60 * 1000, maxRequests: 15 })) {
      return;
    }

    try {
      const { workshopId, name, email, phone, seats = 1, paymentMethod = 'FREE', utr, paymentScreenshot } =
        req.body || {};

      const safeName = sanitizeString(name, 100);
      const safeEmail = sanitizeString(email, 120);
      const safePhone = sanitizeString(phone, 25);
      const safeWorkshopId = sanitizeString(workshopId, 60, 'general');
      const safePaymentMethod = sanitizeString(paymentMethod, 30, 'FREE');
      const safeUtr = sanitizeString(utr, 60);
      const safePaymentScreenshot = sanitizeString(paymentScreenshot, 500);

      if (!safeName || !safeEmail || !safePhone) {
        return res.status(400).json({ error: 'Name, email, and phone are required for cohort registration.' });
      }

      if (!isValidEmail(safeEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }

      if (!isValidPhone(safePhone)) {
        return res.status(400).json({ error: 'Please provide a valid phone number' });
      }

      const seatCount = Math.max(1, Math.min(20, Number(seats) || 1));
      let createdRegistration: any = null;
      let targetTitle = 'Sacred Wisdom Circle';

      await mutateContentStore(
        (state) => {
          state.workshops = state.workshops || [];
          const workshopIndex = state.workshops.findIndex((w: any) => w.id === safeWorkshopId);
          const workshop = workshopIndex > -1 ? state.workshops[workshopIndex] : null;

          // Guard: Coming soon check
          const isComingSoon =
            workshop?.status === 'COMING_SOON' ||
            workshop?.isComingSoon ||
            (workshop?.title || '').toLowerCase().includes('coming soon');

          if (isComingSoon) {
            const err = new Error('COMING_SOON');
            (err as any).isComingSoon = true;
            throw err;
          }

          targetTitle = workshop ? workshop.title : 'Sacred Wisdom Circle';
          const pricePerSeat = workshop?.isFree ? 0 : Number(workshop?.price || 0);
          const totalAmount = pricePerSeat * seatCount;

          if (workshopIndex > -1) {
            state.workshops[workshopIndex].registeredCount =
              (state.workshops[workshopIndex].registeredCount || 0) + seatCount;
          }

          const isPaid = totalAmount > 0 && !workshop?.isFree;
          const paymentStatus = !isPaid
            ? 'CONFIRMED'
            : safeUtr
              ? 'VERIFICATION_PENDING'
              : safePaymentMethod === 'WHATSAPP'
                ? 'WHATSAPP_PENDING'
                : 'PENDING';

          createdRegistration = {
            id: `wreg-${Date.now()}`,
            workshopId: safeWorkshopId,
            workshopTitle: targetTitle,
            name: safeName,
            email: safeEmail,
            phone: safePhone,
            seats: seatCount,
            totalAmount,
            paymentMethod: isPaid ? safePaymentMethod : 'FREE',
            paymentStatus,
            registrationStatus: 'CONFIRMED',
            utr: safeUtr || null,
            paymentScreenshot: safePaymentScreenshot || null,
            createdAt: new Date().toISOString(),
          };

          state.workshopRegistrations = state.workshopRegistrations || [];
          state.workshopRegistrations.unshift(createdRegistration);
        },
        `data: register ${safeName} for workshop ${safeWorkshopId}`
      );

      // Telegram notification
      if (createdRegistration) {
        const alertMsg = `🧘 <b>SHIV DHARA — NEW WORKSHOP REGISTRATION</b>\n\n<b>Cohort:</b> ${targetTitle}\n<b>Seeker:</b> ${safeName}\n<b>Phone:</b> <code>${safePhone}</code>\n<b>Seats:</b> ${seatCount}\n<b>Total:</b> ₹${createdRegistration.totalAmount}\n<b>Payment:</b> ${createdRegistration.paymentMethod}\n<b>UTR:</b> <code>${safeUtr || 'N/A'}</code>`;
        await sendTelegramAlert(alertMsg).catch((err) => console.error('[Workshop Telegram Error]', err));
      }

      return res.status(201).json({ success: true, registration: createdRegistration });
    } catch (err: any) {
      if (err.isComingSoon) {
        return res.status(400).json({
          error:
            'This workshop cohort is currently being curated and is coming soon. Registrations have not opened yet.',
        });
      }
      console.error('[API workshops register] Error');
      return res.status(500).json({ error: 'Failed to record registration' });
    }
  }

  // 3. PATCH: Admin updates registration or workshop
  if (req.method === 'PATCH') {
    if (!requireAdmin(req, res)) return;

    try {
      const { action, registrationId, paymentStatus, workshopId, capacity, registeredCount, status } =
        req.body || {};

      let responsePayload: any = null;

      await mutateContentStore(
        (state) => {
          if (action === 'UPDATE_REGISTRATION' && registrationId) {
            state.workshopRegistrations = state.workshopRegistrations || [];
            const regIdx = state.workshopRegistrations.findIndex((r: any) => r.id === registrationId);
            if (regIdx === -1) {
              const notFound = new Error('NOT_FOUND');
              (notFound as any).notFound = true;
              throw notFound;
            }

            if (paymentStatus) {
              state.workshopRegistrations[regIdx].paymentStatus = sanitizeString(paymentStatus, 40);
            }
            state.workshopRegistrations[regIdx].updatedAt = new Date().toISOString();
            responsePayload = { registration: state.workshopRegistrations[regIdx] };
            return;
          }

          if (action === 'UPDATE_WORKSHOP' && workshopId) {
            state.workshops = state.workshops || [];
            const wsIdx = state.workshops.findIndex((w: any) => w.id === workshopId);
            if (wsIdx === -1) {
              const notFound = new Error('NOT_FOUND');
              (notFound as any).notFound = true;
              throw notFound;
            }

            if (capacity !== undefined) state.workshops[wsIdx].capacity = Number(capacity);
            if (registeredCount !== undefined) state.workshops[wsIdx].registeredCount = Number(registeredCount);
            if (status) {
              const safeStatus = sanitizeString(status, 40);
              state.workshops[wsIdx].status = safeStatus;
              state.workshops[wsIdx].isComingSoon = safeStatus === 'COMING_SOON';
              state.workshops[wsIdx].isSoldOut = safeStatus === 'SOLD_OUT';
            }
            state.workshops[wsIdx].updatedAt = new Date().toISOString();
            responsePayload = { workshop: state.workshops[wsIdx] };
            return;
          }

          const badReq = new Error('BAD_REQUEST');
          (badReq as any).badRequest = true;
          throw badReq;
        },
        `data: update workshop/registration`
      );

      return res.status(200).json({ success: true, ...responsePayload });
    } catch (err: any) {
      if (err.notFound) {
        return res.status(404).json({ error: 'Record not found' });
      }
      if (err.badRequest) {
        return res.status(400).json({ error: 'Invalid action or missing parameters' });
      }
      console.error('[API workshops PATCH] Error');
      return res.status(500).json({ error: 'Failed to update workshop data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
