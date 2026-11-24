import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/auth.js';
import { mutateContentStore, fetchContentStore } from './_lib/store.js';
import { sendTelegramAlert } from './_lib/telegram.js';
import { sanitizeString, sanitizeTextOnly } from './_lib/validation.js';

function parseRoute(req: VercelRequest) {
  let pathStr = (req.query.path as string) || '';
  if (!pathStr) {
    const cleanUrl = (req.url || '').split('?')[0];
    pathStr = cleanUrl.replace(/^\/api\/editor\/?/, '');
  }
  const parts = pathStr.split('/').filter(Boolean);
  const section = parts[0] || (req.query.section as string) || '';
  const id = parts[1] || (req.query.id as string) || '';
  return { section, id };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  // Admin authentication required for ALL editor endpoints
  if (!requireAdmin(req, res)) return;

  const { section, id } = parseRoute(req);

  try {
    // 1. WORKSHOPS
    if (section === 'workshops') {
      if (req.method === 'GET') {
        const { state } = await fetchContentStore();
        return res.status(200).json({ workshops: state.workshops || [] });
      }

      if (req.method === 'POST') {
        const payload = req.body || {};
        const priceVal = payload.isFree
          ? 0
          : payload.price !== null && payload.price !== undefined && payload.price !== ''
            ? Number(payload.price)
            : null;

        const newWorkshop = {
          ...payload,
          id: payload.id || `ws-${Date.now()}`,
          title: sanitizeString(payload.title, 150) || 'Sacred Wisdom Circle',
          slug:
            payload.slug ||
            (payload.title ? sanitizeString(payload.title).toLowerCase().replace(/[^a-z0-9]+/g, '-') : `workshop-${Date.now()}`),
          price: priceVal,
          isFree: Boolean(payload.isFree),
          category: sanitizeString(payload.category, 50, 'Meditation'),
          isOnline: payload.isOnline ?? true,
          location: sanitizeString(payload.location, 150, payload.isOnline ? 'Online Zoom' : 'Sanctuary Office, Ahmedabad'),
          description: sanitizeTextOnly(payload.description, 2000),
          tagline: sanitizeString(payload.tagline, 200),
          date: sanitizeString(payload.date, 30, new Date().toISOString().split('T')[0]),
          displayDate: sanitizeString(payload.displayDate, 50, 'Upcoming Cohort'),
          capacity: Number(payload.capacity) || 25,
          registeredCount: Number(payload.registeredCount) || 0,
          active: payload.active !== false,
          image: payload.image || 'https://images.unsplash.com/photo-1517841905240-472988c2477c?auto=format&fit=crop&w=800&q=80',
          createdAt: payload.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await mutateContentStore(
          (state) => {
            state.workshops = state.workshops || [];
            state.workshops.unshift(newWorkshop);
          },
          `data(editor): add workshop ${newWorkshop.title}`
        );

        await sendTelegramAlert(`✨ <b>NEW WORKSHOP ADDED (LIVE EDITOR)</b>\n\n<b>Title:</b> ${newWorkshop.title}\n<b>Price:</b> ₹${newWorkshop.price}`).catch(() => null);

        return res.status(200).json({ success: true, workshop: newWorkshop });
      }

      if (req.method === 'PUT') {
        const payload = req.body || {};
        const targetWorkshopId = id || payload.id;
        let updatedWorkshop: any = null;

        await mutateContentStore(
          (state) => {
            state.workshops = state.workshops || [];
            const index = state.workshops.findIndex((w: any) => w.id === targetWorkshopId);

            if (index === -1) {
              updatedWorkshop = {
                ...payload,
                id: targetWorkshopId || `ws-${Date.now()}`,
                updatedAt: new Date().toISOString(),
              };
              state.workshops.unshift(updatedWorkshop);
            } else {
              state.workshops[index] = {
                ...state.workshops[index],
                ...payload,
                id: state.workshops[index].id,
                updatedAt: new Date().toISOString(),
              };
              updatedWorkshop = state.workshops[index];
            }
          },
          `data(editor): update workshop ${targetWorkshopId}`
        );

        return res.status(200).json({ success: true, workshop: updatedWorkshop });
      }

      if (req.method === 'DELETE') {
        const targetWorkshopId = id || (req.body && req.body.id);
        await mutateContentStore(
          (state) => {
            state.workshops = state.workshops || [];
            const index = state.workshops.findIndex((w: any) => w.id === targetWorkshopId);
            if (index === -1) {
              const notFound = new Error('NOT_FOUND');
              (notFound as any).notFound = true;
              throw notFound;
            }
            state.workshops.splice(index, 1);
          },
          `data(editor): delete workshop ${targetWorkshopId}`
        );

        return res.status(200).json({ success: true, message: 'Workshop deleted successfully' });
      }

      return res.status(405).json({ error: 'Method not allowed for workshops' });
    }

    // 2. PRODUCTS
    if (section === 'products') {
      if (req.method === 'GET') {
        const { state } = await fetchContentStore();
        return res.status(200).json({ products: state.products || [] });
      }

      if (req.method === 'POST') {
        const payload = req.body || {};
        const priceVal = payload.isFree
          ? 0
          : payload.price !== null && payload.price !== undefined && payload.price !== ''
            ? Number(payload.price)
            : null;

        const newProduct = {
          ...payload,
          id: payload.id || `prod-${Date.now()}`,
          name: sanitizeString(payload.name, 150) || 'Sacred Gemstone Offering',
          slug:
            payload.slug ||
            (payload.name ? sanitizeString(payload.name).toLowerCase().replace(/[^a-z0-9]+/g, '-') : `product-${Date.now()}`),
          price: priceVal,
          isFree: Boolean(payload.isFree),
          description: sanitizeTextOnly(payload.description, 2000),
          shortDescription: sanitizeString(payload.shortDescription, 300),
          category: sanitizeString(payload.category, 50, 'bracelets'),
          active: payload.active !== false,
          stock: payload.stock ?? 10,
          images: payload.images?.length ? payload.images : ['https://images.unsplash.com/photo-1611591475102-4fa0120286eb?auto=format&fit=crop&w=800&q=80'],
          createdAt: payload.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await mutateContentStore(
          (state) => {
            state.products = state.products || [];
            state.products.unshift(newProduct);
          },
          `data(editor): add product ${newProduct.name}`
        );

        await sendTelegramAlert(`🛍️ <b>NEW PRODUCT ADDED (LIVE EDITOR)</b>\n\n<b>Name:</b> ${newProduct.name}\n<b>Price:</b> ₹${newProduct.price}`).catch(() => null);

        return res.status(200).json({ success: true, product: newProduct });
      }

      if (req.method === 'PUT') {
        const payload = req.body || {};
        const targetProductId = id || payload.id;
        let updatedProduct: any = null;

        await mutateContentStore(
          (state) => {
            state.products = state.products || [];
            const index = state.products.findIndex((p: any) => p.id === targetProductId);

            if (index === -1) {
              updatedProduct = {
                ...payload,
                id: targetProductId || `prod-${Date.now()}`,
                updatedAt: new Date().toISOString(),
              };
              state.products.unshift(updatedProduct);
            } else {
              state.products[index] = {
                ...state.products[index],
                ...payload,
                id: state.products[index].id,
                updatedAt: new Date().toISOString(),
              };
              updatedProduct = state.products[index];
            }
          },
          `data(editor): update product ${targetProductId}`
        );

        return res.status(200).json({ success: true, product: updatedProduct });
      }

      if (req.method === 'DELETE') {
        const targetProductId = id || (req.body && req.body.id);
        await mutateContentStore(
          (state) => {
            state.products = state.products || [];
            const index = state.products.findIndex((p: any) => p.id === targetProductId);
            if (index === -1) {
              const notFound = new Error('NOT_FOUND');
              (notFound as any).notFound = true;
              throw notFound;
            }
            state.products.splice(index, 1);
          },
          `data(editor): delete product ${targetProductId}`
        );

        return res.status(200).json({ success: true, message: 'Product deleted successfully' });
      }

      return res.status(405).json({ error: 'Method not allowed for products' });
    }

    // 3. SITE SETTINGS
    if (section === 'site-settings') {
      if (req.method === 'GET') {
        const { state } = await fetchContentStore();
        return res.status(200).json({ siteSettings: state.siteSettings || {} });
      }

      if (req.method === 'PUT') {
        let updatedSettings: any = null;
        await mutateContentStore(
          (state) => {
            state.siteSettings = {
              ...(state.siteSettings || {}),
              ...req.body,
            };
            updatedSettings = state.siteSettings;
          },
          'data(editor): update site-settings'
        );

        return res.status(200).json({ success: true, siteSettings: updatedSettings });
      }

      return res.status(405).json({ error: 'Method not allowed for site-settings' });
    }

    // 4. OVERVIEW
    if (section === 'overview') {
      const { state } = await fetchContentStore();
      return res.status(200).json({
        siteSettings: state.siteSettings || {},
        products: state.products || [],
        workshops: state.workshops || [],
        blogPosts: state.blogPosts || [],
      });
    }

    return res.status(404).json({ error: `Unknown editor section: ${section}` });
  } catch (err: any) {
    if (err.notFound) {
      return res.status(404).json({ error: 'Item not found' });
    }
    console.error('[API editor] Error');
    return res.status(500).json({ error: 'Failed to process editor operation' });
  }
}
