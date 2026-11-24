/**
 * api/_lib/auth.ts
 * Shared admin authentication helper.
 * Underscore prefix → Vercel does NOT expose this as an HTTP route.
 *
 * Rules:
 * - Admin token is accepted ONLY from x-admin-token header (never query string).
 * - Constant-time compare via crypto.timingSafeEqual to prevent timing attacks.
 * - Per-IP brute-force rate limiting on failed attempts (in-memory, resets on cold start).
 * - If ADMIN_PASSWORD env var is not set → admin endpoints return 503.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Rate limiting (in-memory, per serverless instance) ---
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_FAILURES = 10;

interface RateEntry {
  failures: number;
  windowStart: number;
}

const ipFailures = new Map<string, RateEntry>();

function getClientIp(req: VercelRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req as any).socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipFailures.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    return true; // allow
  }
  return entry.failures < RATE_LIMIT_MAX_FAILURES;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = ipFailures.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipFailures.set(ip, { failures: 1, windowStart: now });
  } else {
    entry.failures++;
  }
}

function clearFailures(ip: string): void {
  ipFailures.delete(ip);
}

// --- Constant-time string compare ---
function safeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      // Still run timingSafeEqual on same-length buffers to avoid early exit
      timingSafeEqual(bufA, bufA);
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Returns the configured admin password, or null if not set.
 */
export function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || null;
}

/**
 * Verifies the x-admin-token header against ADMIN_PASSWORD env var.
 * Returns:
 *   { ok: true }  → caller may proceed
 *   { ok: false, status: number, body: object }  → caller should return this response
 *
 * Never reads from req.query.token (not an authentication source).
 */
export function verifyAdmin(
  req: VercelRequest
): { ok: true } | { ok: false; status: number; body: Record<string, unknown> } {
  const password = getAdminPassword();

  if (!password) {
    return {
      ok: false,
      status: 503,
      body: { error: 'Admin authentication is not configured on this server.' },
    };
  }

  const ip = getClientIp(req);

  if (!checkRateLimit(ip)) {
    return {
      ok: false,
      status: 429,
      body: { error: 'Too many failed attempts. Please wait 15 minutes.' },
    };
  }

  // Token must come from header only, never query string
  const provided = req.headers['x-admin-token'];
  if (typeof provided !== 'string' || !provided) {
    recordFailure(ip);
    return { ok: false, status: 401, body: { error: 'Unauthorized: x-admin-token header required.' } };
  }

  if (!safeEqual(provided, password)) {
    recordFailure(ip);
    return { ok: false, status: 401, body: { error: 'Unauthorized: Invalid admin token.' } };
  }

  clearFailures(ip);
  return { ok: true };
}

/**
 * Convenience wrapper: sends the error response and returns false if auth fails.
 * Usage:
 *   if (!requireAdmin(req, res)) return;
 */
export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const result = verifyAdmin(req);
  if (!result.ok) {
    const failure = result as { ok: false; status: number; body: Record<string, unknown> };
    res.status(failure.status).json(failure.body);
    return false;
  }
  return true;
}

// --- Optional: HMAC session token (short-lived, so raw password is not stored client-side) ---
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'shivdhara-session-fallback-change-me';
}

export function issueSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${expires}`;
  const sig = createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return false;
    const expected = createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
    if (!safeEqual(sig, expected)) return false;
    const expires = parseInt(payload, 10);
    return Date.now() < expires;
  } catch {
    return false;
  }
}
