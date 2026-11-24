/**
 * High-Accuracy Geolocation & Reverse Geocoding Utility for SHIV DHARA
 *
 * Flow:
 * 1. Check navigator.permissions state BEFORE calling getCurrentPosition.
 *    - 'denied'  → Never silently fall to IP. Throw GPS_DENIED error so the UI
 *                   can show the user exactly how to unblock GPS in their browser.
 *    - 'prompt'  → Call getCurrentPosition → browser shows the permission dialog.
 *    - 'granted' → Call getCurrentPosition → returns coordinates immediately.
 * 2. On success, reverse-geocode via Nominatim → BigDataCloud.
 * 3. On geolocation API error (unavailable / timeout), fall to IP detection.
 *    IP is NEVER used when the user has actively denied location access.
 */

export interface DetectedLocationResult {
  city: string;
  state: string;
  country: string;
  formatted: string;
  latitude?: number;
  longitude?: number;
  source?: 'GPS' | 'NETWORK_IP';
}

export class GpsPermissionDeniedError extends Error {
  readonly isDenied = true;
  constructor() {
    super('GPS_PERMISSION_DENIED');
    this.name = 'GpsPermissionDeniedError';
  }
}

/** Reverse geocode GPS coordinates → city / state / country */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<DetectedLocationResult> {
  // 1. OpenStreetMap Nominatim (high zoom = city-level)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
      { headers: { Accept: 'application/json', 'User-Agent': 'ShivDhara/1.0' } }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city =
        addr.city || addr.town || addr.village || addr.suburb ||
        addr.municipality || addr.county || addr.state_district || '';
      const state = addr.state || '';
      const country = addr.country || '';
      const parts = [city, state, country].filter(Boolean);
      if (parts.length >= 2) {
        return { city, state, country, formatted: parts.join(', '), latitude, longitude, source: 'GPS' };
      }
    }
  } catch { /* fall through */ }

  // 2. BigDataCloud reverse geocode
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || '';
      const state = data.principalSubdivision && data.principalSubdivision !== city
        ? data.principalSubdivision : '';
      const country = data.countryName || '';
      const parts = [city, state, country].filter(Boolean);
      if (parts.length > 0) {
        return { city, state, country, formatted: parts.join(', '), latitude, longitude, source: 'GPS' };
      }
    }
  } catch { /* fall through */ }

  return {
    city: '', state: '', country: '',
    formatted: `GPS Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
    latitude, longitude, source: 'GPS',
  };
}

/** IP-based geolocation — only used when GPS is unavailable (not when denied) */
export async function detectLocationByIp(): Promise<DetectedLocationResult> {
  try {
    const res = await fetch('https://ipapi.co/json/', { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (!data.error) {
        const city = data.city || '';
        const state = data.region || '';
        const country = data.country_name || '';
        const lat = typeof data.latitude === 'number' ? data.latitude : undefined;
        const lon = typeof data.longitude === 'number' ? data.longitude : undefined;
        const formatted = `${city}${state ? `, ${state}` : ''}${country ? ` (${country})` : ''}`;
        if (formatted.trim()) {
          return { city, state, country, formatted, latitude: lat, longitude: lon, source: 'NETWORK_IP' };
        }
      }
    }
  } catch { /* fall through */ }

  try {
    const res = await fetch('https://api.bigdatacloud.net/data/client-info');
    if (res.ok) {
      const data = await res.json();
      const city = data.city || '';
      const country = data.countryName || '';
      if (city || country) {
        return {
          city, state: '', country,
          formatted: `${city}${country ? ` (${country})` : ''}`,
          source: 'NETWORK_IP',
        };
      }
    }
  } catch { /* fall through */ }

  // Last resort: Ahmedabad default
  return {
    city: 'Ahmedabad', state: 'Gujarat', country: 'India',
    formatted: 'Ahmedabad, Gujarat (India)',
    latitude: 23.0225, longitude: 72.5714, source: 'NETWORK_IP',
  };
}

/**
 * Request exact device location.
 *
 * - If permission is 'denied' → throws GpsPermissionDeniedError immediately.
 *   Caller must catch and show the user how to unlock GPS in browser settings.
 *   IP-based location is NOT used as a silent fallback in this case.
 *
 * - If permission is 'prompt' → browser shows the native "Allow / Block" dialog.
 *   User must tap Allow for GPS to work.
 *
 * - If GPS is unavailable / times out (not denied) → falls back to IP detection.
 */
export async function requestExactDeviceLocation(): Promise<DetectedLocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser.');
  }

  // --- Step 1: Check current permission state ---
  if (navigator.permissions) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'denied') {
        // Permission explicitly blocked — do NOT silently use IP
        throw new GpsPermissionDeniedError();
      }
      // 'prompt' or 'granted' → proceed to getCurrentPosition below
    } catch (err) {
      // Re-throw GpsPermissionDeniedError
      if (err instanceof GpsPermissionDeniedError) throw err;
      // If permissions API itself fails, continue and let getCurrentPosition decide
    }
  }

  // --- Step 2: Request GPS (will show browser dialog if 'prompt') ---
  return new Promise<DetectedLocationResult>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await reverseGeocodeCoordinates(pos.coords.latitude, pos.coords.longitude);
          saveToStorage(result.formatted);
          resolve({ ...result, source: 'GPS' });
        } catch {
          // Reverse geocode failed → try IP as last resort
          const ip = await detectLocationByIp();
          resolve(ip);
        }
      },
      async (err) => {
        if (err.code === 1 /* PERMISSION_DENIED */) {
          // User clicked Block during the prompt
          reject(new GpsPermissionDeniedError());
        } else {
          // Position unavailable or timeout → use IP (not a user denial)
          try {
            const ip = await detectLocationByIp();
            resolve(ip);
          } catch {
            reject(new Error('Location unavailable. Please search your city below.'));
          }
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

function saveToStorage(formatted: string) {
  try {
    localStorage.setItem('shiv_dhara_user_location', formatted);
    localStorage.setItem('shiv_dhara_panchang_location', formatted);
  } catch { /* ignore */ }
}
