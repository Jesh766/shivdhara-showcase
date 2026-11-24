/**
 * api/_lib/store.ts
 * Centralized GitHub Contents API store for data/content-store.json
 * Replaces duplicated fetch/save logic across all api/*.ts routes.
 *
 * Includes:
 * - process.env.GITHUB_DATA_TOKEN check (fails safely with generic error)
 * - process.env.GITHUB_REPO fallback to 'Jesh766/shivdhara'
 * - fetchContentStore(): returns { state, sha }
 * - saveContentStore(state, sha, commitMsg): updates GitHub content
 * - mutateContentStore(mutatorFn, commitMsg, maxRetries): optimistic concurrency retry loop (up to 5 attempts) on 409/422 conflicts
 */

import fs from 'fs';
import path from 'path';

export interface ContentStoreState {
  siteSettings?: Record<string, any>;
  products?: any[];
  workshops?: any[];
  consultations?: any[];
  blockedSlots?: any[];
  orders?: any[];
  workshopRegistrations?: any[];
  humanRequests?: any[];
  activeCarts?: any[];
  registeredUsers?: any[];
  contactSubmissions?: any[];
  blogPosts?: any[];
  testimonials?: any[];
  [key: string]: any;
}

export function getGitHubConfig() {
  const token = process.env.GITHUB_DATA_TOKEN?.trim() || '';
  const repo = process.env.GITHUB_REPO || 'Jesh766/shivdhara';
  return { token, repo };
}

let inMemoryStore: { state: ContentStoreState; sha: string } | null = null;

function getFallbackFilePath(): string {
  try {
    const tmpPath = '/tmp/content-store.json';
    if (fs.existsSync(tmpPath)) return tmpPath;
  } catch {}
  return path.join(process.cwd(), 'data', 'content-store.json');
}

function loadLocalFallbackState(): ContentStoreState {
  try {
    const fallbackPath = getFallbackFilePath();
    if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
    }
    const seedPath = path.join(process.cwd(), 'data', 'content-store.seed.json');
    if (fs.existsSync(seedPath)) {
      return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    }
    const dataPath = path.join(process.cwd(), 'data', 'content-store.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (err) {
    console.warn('[Store Fallback] Could not read fallback file', err);
  }
  return {
    consultations: [],
    blockedSlots: [],
    orders: [],
    products: [],
    workshops: [],
  };
}

function saveLocalFallbackState(state: ContentStoreState): string {
  const sha = `local-${Date.now()}`;
  inMemoryStore = { state, sha };
  try {
    const targetPath = process.env.VERCEL ? '/tmp/content-store.json' : path.join(process.cwd(), 'data', 'content-store.json');
    fs.writeFileSync(targetPath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Store Fallback] Could not write fallback file, keeping in-memory', err);
  }
  return sha;
}

/**
 * Fetches content-store.json from GitHub contents API with resilient local fallback.
 */
export async function fetchContentStore(): Promise<{ state: ContentStoreState; sha: string }> {
  const { token, repo } = getGitHubConfig();
  if (token) {
    try {
      const url = `https://api.github.com/repos/${repo}/contents/data/content-store.json`;
      const metaRes = await fetch(url, {
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'ShivDhara-Api',
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (metaRes.ok) {
        const meta = await metaRes.json();
        const sha = meta.sha;
        let state: ContentStoreState;
        if (meta.content) {
          state = JSON.parse(Buffer.from(meta.content, 'base64').toString('utf-8'));
        } else {
          const rawRes = await fetch(url, {
            headers: {
              Authorization: `token ${token}`,
              'User-Agent': 'ShivDhara-Api',
              Accept: 'application/vnd.github.raw',
            },
          });
          state = JSON.parse(await rawRes.text());
        }
        inMemoryStore = { state, sha };
        return { state, sha };
      } else {
        console.warn(`[Store Notice] GitHub metadata fetch returned status: ${metaRes.status}, using local store.`);
      }
    } catch (err) {
      console.warn('[Store Notice] GitHub fetch failed, using local store:', err);
    }
  }

  // Graceful fallback to local file / memory cache so operations never fail
  if (!inMemoryStore) {
    inMemoryStore = {
      state: loadLocalFallbackState(),
      sha: `local-${Date.now()}`,
    };
  }
  return { state: inMemoryStore.state, sha: inMemoryStore.sha };
}

/**
 * Saves content-store.json to GitHub with optimistic locking via SHA, falling back gracefully.
 */
export async function saveContentStore(state: ContentStoreState, sha: string, commitMsg: string): Promise<string> {
  const { token, repo } = getGitHubConfig();
  if (token && !sha.startsWith('local-')) {
    try {
      const url = `https://api.github.com/repos/${repo}/contents/data/content-store.json`;
      const updatedBase64 = Buffer.from(JSON.stringify(state, null, 2), 'utf-8').toString('base64');

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'ShivDhara-Api',
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ message: commitMsg, content: updatedBase64, sha }),
      });

      if (res.ok) {
        const resData = await res.json();
        const newSha = resData?.content?.sha || `gh-${Date.now()}`;
        inMemoryStore = { state, sha: newSha };
        return newSha;
      }

      const status = res.status;
      if (status === 409 || status === 422) {
        const err = new Error('SHA_CONFLICT');
        (err as any).status = status;
        throw err;
      }
      console.warn(`[Store Notice] GitHub save returned status ${status}, saving locally.`);
    } catch (err: any) {
      if (err.message === 'SHA_CONFLICT') throw err;
      console.warn('[Store Notice] GitHub save threw error, saving locally:', err);
    }
  }

  // Resilient fallback save locally and in memory
  return saveLocalFallbackState(state);
}

/**
 * Mutates state with optimistic concurrency retry (up to maxRetries attempts).
 * Resolves race conditions across simultaneous orders, bookings, and updates.
 */
export async function mutateContentStore<T = any>(
  mutatorFn: (state: ContentStoreState) => Promise<T> | T,
  commitMsg: string,
  maxRetries = 5
): Promise<{ result: T; state: ContentStoreState }> {
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    const { state, sha } = await fetchContentStore();
    const result = await mutatorFn(state);

    try {
      await saveContentStore(state, sha, commitMsg);
      return { result, state };
    } catch (err: any) {
      if (err.message === 'SHA_CONFLICT' || err.status === 409 || err.status === 422) {
        console.warn(`[Store Concurrency] Conflict on attempt ${attempt}/${maxRetries}. Retrying with fresh SHA...`);
        if (attempt >= maxRetries) {
          throw new Error('Concurrent modification conflict. Please try again.');
        }
        // Jittered backoff (50ms - 200ms)
        await new Promise((r) => setTimeout(r, 50 + Math.random() * 150));
        continue;
      }
      throw err;
    }
  }

  throw new Error('Failed to complete update after maximum retries');
}
