import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_PRODUCTS } from './initialCatalog.js';
import { fetchContentStore } from './_lib/store.js';
import { sanitizeString } from './_lib/validation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    try {
      const { state } = await fetchContentStore();
      const customProducts = (state.products || []).filter((p: any) => p.active !== false);

      // Merge custom products with initial catalog (custom products take precedence)
      const mergedMap = new Map<string, any>();
      INITIAL_PRODUCTS.forEach((p: any) => mergedMap.set(p.id, p));
      customProducts.forEach((p: any) => mergedMap.set(p.id, p));
      let products = Array.from(mergedMap.values()).filter((p: any) => p.active !== false);

      const category = sanitizeString(req.query.category, 50);
      const number = req.query.number ? Number(req.query.number) : null;
      const featured = req.query.featured === 'true';

      if (category) {
        products = products.filter((p: any) => p.category?.toLowerCase() === category.toLowerCase());
      }
      if (number !== null && !isNaN(number)) {
        products = products.filter((p: any) => p.numerologyNumber === number);
      }
      if (featured) {
        products = products.filter((p: any) => p.featured);
      }

      return res.status(200).json({ products });
    } catch (err: any) {
      console.warn('[API products] Store error, serving static catalog fallback');
      return res.status(200).json({ products: INITIAL_PRODUCTS });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
