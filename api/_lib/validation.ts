/**
 * api/_lib/validation.ts
 * Shared validation, sanitization, and IP rate-limiting for public API endpoints.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitStores = new Map<string, Map<string, { count: number; windowStart: number }>>();

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0].trim();
  }
  return (req as any).socket?.remoteAddress || 'unknown';
}

/**
 * Checks per-endpoint, per-IP rate limit.
 * Returns true if allowed, false if rate limited.
 */
export function enforceRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  endpointKey: string,
  config: RateLimitConfig = { windowMs: 10 * 60 * 1000, maxRequests: 25 }
): boolean {
  const ip = getClientIp(req);
  if (!rateLimitStores.has(endpointKey)) {
    rateLimitStores.set(endpointKey, new Map());
  }

  const store = rateLimitStores.get(endpointKey)!;
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now - record.windowStart > config.windowMs) {
    store.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= config.maxRequests) {
    res.status(429).json({
      error: 'Too many requests. Please wait a few moments before trying again.',
    });
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Sanitizes a string input: trims and enforces max length.
 */
export function sanitizeString(val: unknown, maxLength = 250, defaultVal = ''): string {
  if (typeof val !== 'string') return defaultVal;
  return val.trim().slice(0, maxLength);
}

/**
 * Validates email format.
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim()) && email.trim().length <= 150;
}

/**
 * Validates phone format (supports Indian & international numbers, 8-16 chars).
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return cleaned.length >= 8 && cleaned.length <= 16;
}

/**
 * Sanitizes an order / consultation / workshop payload to prevent prototype pollution and oversized fields.
 */
export function sanitizeTextOnly(val: unknown, maxLength = 500): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>]/g, '') // strip potential html tags
    .trim()
    .slice(0, maxLength);
}
