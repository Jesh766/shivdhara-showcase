import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/auth.js';
import { fetchContentStore } from './_lib/store.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Authenticate admin via x-admin-token header
  if (!requireAdmin(req, res)) return;

  try {
    const { state } = await fetchContentStore();

    const verifiedRevenue =
      (state.orders || []).reduce(
        (acc: number, o: any) => acc + (o.paymentStatus === 'PAYMENT_VERIFIED' ? o.total || 0 : 0),
        0
      ) +
      (state.workshopRegistrations || []).reduce(
        (acc: number, w: any) => acc + (w.paymentStatus === 'PAID' ? w.totalAmount || 0 : 0),
        0
      ) +
      (state.consultations || []).reduce((acc: number, c: any) => acc + (c.price || 0), 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders: (state.orders || []).length,
        totalConsultations: (state.consultations || []).length,
        totalWorkshopRegistrations: (state.workshopRegistrations || []).length,
        totalHumanRequests: (state.humanRequests || []).length,
        totalActiveCarts: (state.activeCarts || []).length,
        totalRegisteredUsers: (state.registeredUsers || []).length,
        totalContactSubmissions: (state.contactSubmissions || []).length,
        verifiedRevenue,
      },
      consultations: state.consultations || [],
      orders: state.orders || [],
      activeCarts: state.activeCarts || [],
      humanRequests: state.humanRequests || [],
      registeredUsers: state.registeredUsers || [],
      workshopRegistrations: state.workshopRegistrations || [],
      contactSubmissions: state.contactSubmissions || [],
    });
  } catch (err: any) {
    console.error('[API admin] Error processing admin request');
    return res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
}
