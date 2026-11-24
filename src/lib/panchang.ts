/**
 * Vedic Panchang & Astronomical Ephemeris Engine for SHIV DHARA
 * High-Precision Astronomical Implementation based on:
 * - Jean Meeus "Astronomical Algorithms" (2nd Ed.):
 *     - Full 60 periodic terms for Moon's geocentric longitude (Table 47.A)
 *     - Moon orbital eccentricity factor E and additive perturbations (A1, A2, A3)
 *     - Full Sun equation of center, true longitude, and optical aberration
 *     - High-precision Lahiri (Chitra Paksha) Ayanamsha
 * - Timezone & Daylight Saving (DST):
 *     - Dynamic UTC offset computed per selected date via IANA timezones using Intl.DateTimeFormat
 *     - Location-specific "Today" computation
 * - High-Precision Transition Times:
 *     - Exact boundary bracketing and sub-second binary bisection for Tithi, Nakshatra, Yoga, and Karana
 *     - Real JavaScript Date objects returned with localized "Until DD MMM, H:MM AM/PM" formatting
 * - Amanta Lunar Month (Gujarati / Vedic standard):
 *     - Computed from the sidereal solar sign at the preceding New Moon (Elongation = 0°)
 *     - Automated Adhika Masa detection
 * - Ritu (Seasons) & Ayana:
 *     - Lunar Masa Ritu (primary) with Solar Sidereal Ritu comparison
 *     - Exact astronomical Ayana (Uttarayana / Dakshinayana) from Sun's sidereal longitude
 * - Muhurat System:
 *     - Dynamic 8-fold Dinamana daytime division for Rahu Kaal, Yamaganda, and Gulika Kaal
 *     - Brahma Muhurta (96 min to 48 min before sunrise)
 *     - Abhijit Muhurat centered on Solar Noon (with Wednesday Budhavara Varjya rule and Rahu Kaal overlap detection)
 *     - Vedic Day and Night Choghadiya sequences
 * - Additional Cosmic Almanac Attributes:
 *     - 27 Yogas with transition ending times
 *     - 60 Karanas (half-tithis) with transition ending times
 *     - Chandra Rashi (Moon Sign)
 *     - Festival & Vrat calculation based on sunrise tithi
 */

export interface WorldCity {
  city: string;
  country: string;
  region: string;
  timezone: string;
  label: string;
  lat: number;
  lon: number;
  tzOffset: number; // Standard fallback UTC offset in hours
}

export const WORLD_CITIES: WorldCity[] = [
  // India
  { city: 'Ahmedabad', country: 'India', region: 'Gujarat', timezone: 'Asia/Kolkata', label: 'Ahmedabad, Gujarat (India)', lat: 23.0225, lon: 72.5714, tzOffset: 5.5 },
  { city: 'New Delhi', country: 'India', region: 'Delhi', timezone: 'Asia/Kolkata', label: 'New Delhi (India)', lat: 28.6139, lon: 77.2090, tzOffset: 5.5 },
  { city: 'Mumbai', country: 'India', region: 'Maharashtra', timezone: 'Asia/Kolkata', label: 'Mumbai, Maharashtra (India)', lat: 19.0760, lon: 72.8777, tzOffset: 5.5 },
  { city: 'Bengaluru', country: 'India', region: 'Karnataka', timezone: 'Asia/Kolkata', label: 'Bengaluru, Karnataka (India)', lat: 12.9716, lon: 77.5946, tzOffset: 5.5 },
  { city: 'Surat', country: 'India', region: 'Gujarat', timezone: 'Asia/Kolkata', label: 'Surat, Gujarat (India)', lat: 21.1702, lon: 72.8311, tzOffset: 5.5 },
  { city: 'Chennai', country: 'India', region: 'Tamil Nadu', timezone: 'Asia/Kolkata', label: 'Chennai (India)', lat: 13.0827, lon: 80.2707, tzOffset: 5.5 },
  { city: 'Kolkata', country: 'India', region: 'West Bengal', timezone: 'Asia/Kolkata', label: 'Kolkata (India)', lat: 22.5726, lon: 88.3639, tzOffset: 5.5 },
  { city: 'Hyderabad', country: 'India', region: 'Telangana', timezone: 'Asia/Kolkata', label: 'Hyderabad (India)', lat: 17.3850, lon: 78.4867, tzOffset: 5.5 },
  { city: 'Jaipur', country: 'India', region: 'Rajasthan', timezone: 'Asia/Kolkata', label: 'Jaipur (India)', lat: 26.9124, lon: 75.7873, tzOffset: 5.5 },
  { city: 'Pune', country: 'India', region: 'Maharashtra', timezone: 'Asia/Kolkata', label: 'Pune (India)', lat: 18.5204, lon: 73.8567, tzOffset: 5.5 },
  { city: 'Jamnagar', country: 'India', region: 'Gujarat', timezone: 'Asia/Kolkata', label: 'Jamnagar, Gujarat (India)', lat: 22.4707, lon: 70.0577, tzOffset: 5.5 },
  { city: 'Vadodara', country: 'India', region: 'Gujarat', timezone: 'Asia/Kolkata', label: 'Vadodara, Gujarat (India)', lat: 22.3072, lon: 73.1812, tzOffset: 5.5 },
  { city: 'Rajkot', country: 'India', region: 'Gujarat', timezone: 'Asia/Kolkata', label: 'Rajkot, Gujarat (India)', lat: 22.3039, lon: 70.8022, tzOffset: 5.5 },
  { city: 'Varanasi', country: 'India', region: 'Uttar Pradesh', timezone: 'Asia/Kolkata', label: 'Varanasi (India)', lat: 25.3176, lon: 82.9739, tzOffset: 5.5 },
  { city: 'Ujjain', country: 'India', region: 'Madhya Pradesh', timezone: 'Asia/Kolkata', label: 'Ujjain (India)', lat: 23.1765, lon: 75.7885, tzOffset: 5.5 },

  // USA
  { city: 'New York', country: 'USA', region: 'NY (EST)', timezone: 'America/New_York', label: 'New York, NY (USA)', lat: 40.7128, lon: -74.0060, tzOffset: -5.0 },
  { city: 'Los Angeles', country: 'USA', region: 'CA (PST)', timezone: 'America/Los_Angeles', label: 'Los Angeles, CA (USA)', lat: 34.0522, lon: -118.2437, tzOffset: -8.0 },
  { city: 'Chicago', country: 'USA', region: 'IL (CST)', timezone: 'America/Chicago', label: 'Chicago, IL (USA)', lat: 41.8781, lon: -87.6298, tzOffset: -6.0 },
  { city: 'Houston', country: 'USA', region: 'TX (CST)', timezone: 'America/Chicago', label: 'Houston, TX (USA)', lat: 29.7604, lon: -95.3698, tzOffset: -6.0 },
  { city: 'San Francisco', country: 'USA', region: 'CA (PST)', timezone: 'America/Los_Angeles', label: 'San Francisco, CA (USA)', lat: 37.7749, lon: -122.4194, tzOffset: -8.0 },
  { city: 'Dallas', country: 'USA', region: 'TX (CST)', timezone: 'America/Chicago', label: 'Dallas, TX (USA)', lat: 32.7767, lon: -96.7970, tzOffset: -6.0 },
  { city: 'Seattle', country: 'USA', region: 'WA (PST)', timezone: 'America/Los_Angeles', label: 'Seattle, WA (USA)', lat: 47.6062, lon: -122.3321, tzOffset: -8.0 },
  { city: 'Atlanta', country: 'USA', region: 'GA (EST)', timezone: 'America/New_York', label: 'Atlanta, GA (USA)', lat: 33.7490, lon: -84.3880, tzOffset: -5.0 },
  { city: 'Miami', country: 'USA', region: 'FL (EST)', timezone: 'America/New_York', label: 'Miami, FL (USA)', lat: 25.7617, lon: -80.1918, tzOffset: -5.0 },
  { city: 'Washington D.C.', country: 'USA', region: 'DC (EST)', timezone: 'America/New_York', label: 'Washington D.C. (USA)', lat: 38.9072, lon: -77.0369, tzOffset: -5.0 },
  { city: 'Boston', country: 'USA', region: 'MA (EST)', timezone: 'America/New_York', label: 'Boston, MA (USA)', lat: 42.3601, lon: -71.0589, tzOffset: -5.0 },
  { city: 'Phoenix', country: 'USA', region: 'AZ (MST)', timezone: 'America/Phoenix', label: 'Phoenix, AZ (USA)', lat: 33.4484, lon: -112.0740, tzOffset: -7.0 },
  { city: 'Denver', country: 'USA', region: 'CO (MST)', timezone: 'America/Denver', label: 'Denver, CO (USA)', lat: 39.7392, lon: -104.9903, tzOffset: -7.0 },

  // United Kingdom
  { city: 'London', country: 'United Kingdom', region: 'England', timezone: 'Europe/London', label: 'London (UK)', lat: 51.5074, lon: -0.1278, tzOffset: 0.0 },
  { city: 'Birmingham', country: 'United Kingdom', region: 'England', timezone: 'Europe/London', label: 'Birmingham (UK)', lat: 52.4862, lon: -1.8904, tzOffset: 0.0 },
  { city: 'Manchester', country: 'United Kingdom', region: 'England', timezone: 'Europe/London', label: 'Manchester (UK)', lat: 53.4808, lon: -2.2426, tzOffset: 0.0 },
  { city: 'Leicester', country: 'United Kingdom', region: 'England', timezone: 'Europe/London', label: 'Leicester (UK)', lat: 52.6369, lon: -1.1398, tzOffset: 0.0 },

  // Canada
  { city: 'Toronto', country: 'Canada', region: 'ON (EST)', timezone: 'America/Toronto', label: 'Toronto, ON (Canada)', lat: 43.6532, lon: -79.3832, tzOffset: -5.0 },
  { city: 'Vancouver', country: 'Canada', region: 'BC (PST)', timezone: 'America/Vancouver', label: 'Vancouver, BC (Canada)', lat: 49.2827, lon: -123.1207, tzOffset: -8.0 },
  { city: 'Calgary', country: 'Canada', region: 'AB (MST)', timezone: 'America/Edmonton', label: 'Calgary, AB (Canada)', lat: 51.0447, lon: -114.0719, tzOffset: -7.0 },
  { city: 'Montreal', country: 'Canada', region: 'QC (EST)', timezone: 'America/Montreal', label: 'Montreal, QC (Canada)', lat: 45.5017, lon: -73.5673, tzOffset: -5.0 },

  // Australia & New Zealand
  { city: 'Sydney', country: 'Australia', region: 'NSW (AEST)', timezone: 'Australia/Sydney', label: 'Sydney, NSW (Australia)', lat: -33.8688, lon: 151.2093, tzOffset: 10.0 },
  { city: 'Melbourne', country: 'Australia', region: 'VIC (AEST)', timezone: 'Australia/Melbourne', label: 'Melbourne, VIC (Australia)', lat: -37.8136, lon: 144.9631, tzOffset: 10.0 },
  { city: 'Brisbane', country: 'Australia', region: 'QLD (AEST)', timezone: 'Australia/Brisbane', label: 'Brisbane, QLD (Australia)', lat: -27.4698, lon: 153.0251, tzOffset: 10.0 },
  { city: 'Perth', country: 'Australia', region: 'WA (AWST)', timezone: 'Australia/Perth', label: 'Perth, WA (Australia)', lat: -31.9505, lon: 115.8605, tzOffset: 8.0 },
  { city: 'Auckland', country: 'New Zealand', region: 'North Island', timezone: 'Pacific/Auckland', label: 'Auckland (New Zealand)', lat: -36.8485, lon: 174.7633, tzOffset: 12.0 },

  // Middle East
  { city: 'Dubai', country: 'UAE', region: 'Dubai', timezone: 'Asia/Dubai', label: 'Dubai (UAE)', lat: 25.2048, lon: 55.2708, tzOffset: 4.0 },
  { city: 'Abu Dhabi', country: 'UAE', region: 'Abu Dhabi', timezone: 'Asia/Dubai', label: 'Abu Dhabi (UAE)', lat: 24.4539, lon: 54.3773, tzOffset: 4.0 },
  { city: 'Doha', country: 'Qatar', region: 'Doha', timezone: 'Asia/Qatar', label: 'Doha (Qatar)', lat: 25.2854, lon: 51.5310, tzOffset: 3.0 },
  { city: 'Riyadh', country: 'Saudi Arabia', region: 'Riyadh', timezone: 'Asia/Riyadh', label: 'Riyadh (Saudi Arabia)', lat: 24.7136, lon: 46.6753, tzOffset: 3.0 },
  { city: 'Muscat', country: 'Oman', region: 'Muscat', timezone: 'Asia/Muscat', label: 'Muscat (Oman)', lat: 23.5880, lon: 58.3829, tzOffset: 4.0 },

  // Europe & Asia
  { city: 'Singapore', country: 'Singapore', region: 'Singapore', timezone: 'Asia/Singapore', label: 'Singapore', lat: 1.3521, lon: 103.8198, tzOffset: 8.0 },
  { city: 'Kuala Lumpur', country: 'Malaysia', region: 'Federal Territory', timezone: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (Malaysia)', lat: 3.1390, lon: 101.6869, tzOffset: 8.0 },
  { city: 'Tokyo', country: 'Japan', region: 'Kanto', timezone: 'Asia/Tokyo', label: 'Tokyo (Japan)', lat: 35.6762, lon: 139.6503, tzOffset: 9.0 },
  { city: 'Paris', country: 'France', region: 'Île-de-France', timezone: 'Europe/Paris', label: 'Paris (France)', lat: 48.8566, lon: 2.3522, tzOffset: 1.0 },
  { city: 'Berlin', country: 'Germany', region: 'Berlin', timezone: 'Europe/Berlin', label: 'Berlin (Germany)', lat: 52.5200, lon: 13.4050, tzOffset: 1.0 },
  { city: 'Zurich', country: 'Switzerland', region: 'Zurich', timezone: 'Europe/Zurich', label: 'Zurich (Switzerland)', lat: 47.3769, lon: 8.5417, tzOffset: 1.0 },
];

/**
 * Computes the exact UTC offset in hours for any target date and IANA timezone,
 * correctly accounting for Daylight Saving Time (DST).
 */
export function getTimezoneOffsetHours(date: Date, timeZone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);
    const targetUTC = Date.UTC(
      getPart('year'),
      getPart('month') - 1,
      getPart('day'),
      getPart('hour'),
      getPart('minute'),
      getPart('second')
    );
    return (targetUTC - date.getTime()) / (3600 * 1000);
  } catch {
    return 5.5;
  }
}

/**
 * Computes "Today" at noon in the target city's timezone.
 */
export function getCityToday(timeZone: string): Date {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);
    return new Date(getPart('year'), getPart('month') - 1, getPart('day'), 12, 0, 0);
  } catch {
    return new Date();
  }
}

/**
 * Checks whether selectedDate matches "Today" in the target city's timezone.
 */
export function isCityToday(selectedDate: Date, timeZone: string): boolean {
  try {
    const today = getCityToday(timeZone);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    return formatter.format(selectedDate) === formatter.format(today);
  } catch {
    return selectedDate.toDateString() === new Date().toDateString();
  }
}

/**
 * Resolves location string against known world cities.
 * If the location is not in WORLD_CITIES, falls back to Ahmedabad.
 */
export function resolveLocationCoordinates(locationStr: string): {
  lat: number;
  lon: number;
  tzOffset: number;
  timezone: string;
  name: string;
} {
  const norm = (locationStr || '').toLowerCase().trim();
  const found = WORLD_CITIES.find(
    (c) => norm === c.label.toLowerCase() || norm === c.city.toLowerCase() || norm.includes(c.city.toLowerCase())
  );
  if (found) {
    return {
      lat: found.lat,
      lon: found.lon,
      tzOffset: found.tzOffset,
      timezone: found.timezone,
      name: found.label,
    };
  }

  // Fallback to Ahmedabad, Gujarat, India (Asia/Kolkata)
  return {
    lat: 23.0225,
    lon: 72.5714,
    tzOffset: 5.5,
    timezone: 'Asia/Kolkata',
    name: 'Ahmedabad, Gujarat (India)',
  };
}

export interface ChoghadiyaSlot {
  name: 'Shubh' | 'Amrit' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
  nature: 'Shubh' | 'Ashubh' | 'Neutral';
  start: string;
  end: string;
  ruler: string;
}

export interface PanchangData {
  date: Date;
  dateFormatted: string;
  dayName: string;
  dayLord: string;
  dayLordPlanet: string;
  masa: string;
  isAdhikaMasa: boolean;
  paksha: 'Shukla-Paksha' | 'Krishna-Paksha';
  ritu: string;
  solarRitu: string;
  rituDisplay: string;
  ayana: 'Uttarayana' | 'Dakshinayana';
  tithi: {
    name: string;
    pakshaName: string;
    deity: string;
    category: 'Nanda' | 'Bhadra' | 'Jaya' | 'Rikta' | 'Purna';
    validUntil: string;
    endDate: Date;
    description: string;
  };
  nakshatra: {
    name: string;
    lord: string;
    deity: string;
    qualities: string;
    validUntil: string;
    endDate: Date;
  };
  yoga: {
    name: string;
    validUntil: string;
    endDate: Date;
  };
  karana: {
    name: string;
    validUntil: string;
    endDate: Date;
  };
  moonRashi: {
    name: string;
    sanskrit: string;
  };
  sunRashi: {
    name: string;
  };
  festival: string | null;
  sunriseTime: string;
  sunsetTime: string;
  shubhMuhurats: {
    brahmaMuhurta: string;
    abhijit: {
      timing: string;
      start: string;
      end: string;
      applicable: boolean;
      overlapsRahuKaal: boolean;
      statusText: string;
    };
  };
  ashubhMuhurats: {
    rahuKaal: string;
    yamaganda: string;
    gulikaKaal: string;
  };
  choghadiya: {
    daySlots: ChoghadiyaSlot[];
    nightSlots: ChoghadiyaSlot[];
  };
  location: string;
  timezone: string;
}

const TITHI_NAMES = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dvadashi',
  'Trayodashi',
  'Chaturdashi',
  'Purnima / Amavasya',
];

const TITHI_METADATA: Record<number, { deity: string; cat: 'Nanda' | 'Bhadra' | 'Jaya' | 'Rikta' | 'Purna'; desc: string }> = {
  1: { deity: 'Agni', cat: 'Nanda', desc: 'Favorable for auspicious beginnings, sacred ceremonies, and initiating creative knowledge.' },
  2: { deity: 'Brahma', cat: 'Bhadra', desc: 'Auspicious for creative foundations, community gatherings, and laying stones.' },
  3: { deity: 'Gauri', cat: 'Jaya', desc: 'Beneficial for overcoming obstacles, trade enterprise, and victory in arts.' },
  4: { deity: 'Ganesha', cat: 'Rikta', desc: 'Ideal for spiritual sadhana, obstacle clearance, and inward introspection.' },
  5: { deity: 'Nagadevata', cat: 'Purna', desc: 'Highly auspicious for wellness, sacred mantras, and financial investments.' },
  6: { deity: 'Kartikeya', cat: 'Nanda', desc: 'Good for decisive action, victory over hurdles, and establishing boundaries.' },
  7: { deity: 'Surya', cat: 'Bhadra', desc: 'Ideal for honoring lineage, solar vitality, leadership, and public ceremonies.' },
  8: { deity: 'Brahma', cat: 'Jaya', desc: 'Good for architecture, spiritual rituals, clarity, and establishing enterprises.' },
  9: { deity: 'Durga', cat: 'Rikta', desc: 'Auspicious for protection, conquering persistent challenges, and spiritual fortitude.' },
  10: { deity: 'Dharmaraja', cat: 'Purna', desc: 'Favorable for agreements, ethical matters, administrative clarity, and partnerships.' },
  11: { deity: 'Vishnu', cat: 'Nanda', desc: 'Sacred Ekadashi window: best for fasting, prayer, conscious stillness, and meditation.' },
  12: { deity: 'Vishnu', cat: 'Bhadra', desc: 'Favorable for philanthropy, charity, and consecrating auspicious environments.' },
  13: { deity: 'Kamadeva', cat: 'Jaya', desc: 'Auspicious for relationship harmony, friendship, and aesthetic and cultural celebrations.' },
  14: { deity: 'Shiva', cat: 'Rikta', desc: 'Sacred Pradosh energy: ideal for deep contemplation and shedding outgrown karma.' },
  15: { deity: 'Chandra / Pitrus', cat: 'Purna', desc: 'Full moon culmination (Purnima) or inward new seed (Amavasya) for spiritual focus.' },
};

const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', qualities: 'Swift, healing grace, auspicious for new beginnings' },
  { name: 'Bharani', lord: 'Venus', deity: 'Yama', qualities: 'Transformative, disciplined, honoring natural truth' },
  { name: 'Krittika', lord: 'Sun', deity: 'Agni', qualities: 'Fiery, sharp focus, cutting through illusions' },
  { name: 'Rohini', lord: 'Moon', deity: 'Brahma', qualities: 'Fertile, creative, highly auspicious for prosperity' },
  { name: 'Mrigashirsha', lord: 'Mars', deity: 'Soma', qualities: 'Curious, seeking spiritual truth, gentle exploration' },
  { name: 'Ardra', lord: 'Rahu', deity: 'Rudra', qualities: 'Stormy clarity, emotional release, overcoming obstacles' },
  { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', qualities: 'Renewal, restorative grace, homecoming and harmony' },
  { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', qualities: 'Supreme auspiciousness for all spiritual and worldly endeavors' },
  { name: 'Ashlesha', lord: 'Mercury', deity: 'Sarpa', qualities: 'Mystical wisdom, protective awareness, sharp intuition' },
  { name: 'Magha', lord: 'Ketu', deity: 'Pitrus', qualities: 'Ancestral dignity, self-respect, honoring sacred lineage' },
  { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', qualities: 'Abundance, social harmony, relaxation and creative expression' },
  { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', qualities: 'Enduring alliances, noble commitments, integrity and truth' },
  { name: 'Hasta', lord: 'Moon', deity: 'Savitur', qualities: 'Skillful handcrafting, healing, dexterity, artisan mastery' },
  { name: 'Chitra', lord: 'Mars', deity: 'Tvashtar', qualities: 'Architecture, divine craftsmanship, Vastu harmony and design' },
  { name: 'Swati', lord: 'Rahu', deity: 'Vayu', qualities: 'Independent, gentle breeze, artistic expansion and mobility' },
  { name: 'Vishakha', lord: 'Jupiter', deity: 'Indra-Agni', qualities: 'Goal-oriented, triumphant perseverance, focused triumph' },
  { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', qualities: 'Devotion, friendship, steadfast cooperation and loyalty' },
  { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', qualities: 'Seniority, protective leadership, inner courage and mastery' },
  { name: 'Mula', lord: 'Ketu', deity: 'Nirriti', qualities: 'Investigative, getting to the root of karmic patterns' },
  { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', qualities: 'Invincible confidence, purification, fluid resilience' },
  { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishwadevas', qualities: 'Universal victory, enduring success, righteousness' },
  { name: 'Shravana', lord: 'Moon', deity: 'Vishnu', qualities: 'Deep sacred listening, oral wisdom, education and learning' },
  { name: 'Dhanishtha', lord: 'Mars', deity: 'Ashtavasu', qualities: 'Rhythm, musical harmony, enterprise, spiritual abundance' },
  { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', qualities: 'Cosmic healing, medicinal secrets, broad vision and seclusion' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', qualities: 'Fiery spiritual aspiration, intense sadhana and devotion' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya', qualities: 'Deep stillness, oceanic wisdom, grounded stability' },
  { name: 'Revati', lord: 'Mercury', deity: 'Pushan', qualities: 'Safe journeys, compassionate guidance, auspicious completion' },
];

const YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

const REPEATING_KARANAS = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
];

const RASHIS = [
  { name: 'Aries', sanskrit: 'Mesha' },
  { name: 'Taurus', sanskrit: 'Vrishabha' },
  { name: 'Gemini', sanskrit: 'Mithuna' },
  { name: 'Cancer', sanskrit: 'Karka' },
  { name: 'Leo', sanskrit: 'Simha' },
  { name: 'Virgo', sanskrit: 'Kanya' },
  { name: 'Libra', sanskrit: 'Tula' },
  { name: 'Scorpio', sanskrit: 'Vrischika' },
  { name: 'Sagittarius', sanskrit: 'Dhanu' },
  { name: 'Capricorn', sanskrit: 'Makara' },
  { name: 'Aquarius', sanskrit: 'Kumbha' },
  { name: 'Pisces', sanskrit: 'Meena' },
];

const DAY_LORDS = [
  { day: 'Sunday', lord: 'Sun (Surya)' },
  { day: 'Monday', lord: 'Moon (Chandra)' },
  { day: 'Tuesday', lord: 'Mars (Mangal)' },
  { day: 'Wednesday', lord: 'Mercury (Budha)' },
  { day: 'Thursday', lord: 'Jupiter (Guru)' },
  { day: 'Friday', lord: 'Venus (Shukra)' },
  { day: 'Saturday', lord: 'Saturn (Shani)' },
];

const VEDIC_MONTHS = [
  'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana',
  'Bhadrapada', 'Ashvina', 'Kartika', 'Margashirsha',
  'Pausha', 'Magha', 'Phalguna', 'Chaitra',
];

// ============================================================================
// ASTRONOMICAL EPHEMERIS PRIMITIVES (Meeus Chapter 47 / VSOP87 / Lahiri)
// ============================================================================

const D2R = Math.PI / 180.0;
const R2D = 180.0 / Math.PI;

function normalizeDeg(deg: number): number {
  let d = deg % 360.0;
  if (d < 0) d += 360.0;
  return d;
}

export function calculateJulianDay(year: number, month: number, day: number, utHour: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5 + utHour / 24.0;
}

/**
 * Sun Apparent Geocentric Longitude with equation of center and aberration
 */
export function calculateSunLongitude(T: number): number {
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * D2R;

  // Full equation of center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  const trueLong = L0 + C;

  // Optical aberration
  const aberration = -0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * T) * D2R);

  return normalizeDeg(trueLong + aberration);
}

/**
 * Table 47.A from Meeus "Astronomical Algorithms" (2nd Ed.):
 * 60 periodic terms for the Moon's geocentric longitude [D, M, M', F, coefficient]
 */
const MOON_TERMS_60: [number, number, number, number, number][] = [
  [0, 0, 1, 0, 6288774],
  [2, 0, -1, 0, 1274027],
  [2, 0, 0, 0, 658314],
  [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116],
  [0, 0, 0, 2, -114332],
  [2, 0, -2, 0, 58793],
  [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322],
  [2, -1, 0, 0, 45758],
  [0, 1, -1, 0, -40923],
  [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383],
  [2, 0, 0, -2, 15327],
  [0, 0, 1, 2, -12528],
  [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675],
  [0, 0, 3, 0, 10034],
  [4, 0, -2, 0, 8548],
  [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766],
  [1, 0, -1, 0, -5163],
  [1, 1, 0, 0, 4987],
  [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994],
  [4, 0, 0, 0, 3861],
  [2, 0, -3, 0, 3665],
  [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602],
  [2, -1, -2, 0, 2390],
  [1, 0, 1, 0, -2348],
  [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120],
  [0, 2, 0, 0, -2069],
  [2, -2, -1, 0, 2048],
  [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595],
  [4, -1, -1, 0, 1215],
  [0, 0, 2, 2, -1110],
  [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810],
  [4, -1, -2, 0, 759],
  [0, 2, -1, 0, -713],
  [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691],
  [2, -1, 0, -2, 596],
  [4, 0, 1, 0, 549],
  [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520],
  [1, 0, -2, 0, -487],
  [2, 1, 0, -2, -399],
  [0, 0, 2, -2, -381],
  [1, 1, 1, 0, 351],
  [3, 0, -2, 0, -340],
  [4, 0, -3, 0, 330],
  [2, -1, -1, -2, 327],
  [0, 2, 1, 0, -323],
  [1, 1, -1, 0, 299],
  [2, 0, 3, 0, 294],
  [2, 0, -1, -2, -283],
];

/**
 * High-Precision Moon Geocentric Apparent Longitude (Meeus Ch 47)
 */
export function calculateMoonLongitude(T: number): number {
  const Lprime = normalizeDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868.0);
  const M = normalizeDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000.0);
  const Mprime = normalizeDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699.0);
  const F = normalizeDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000.0);

  const A1 = normalizeDeg(119.75 + 131.849 * T);
  const A2 = normalizeDeg(53.09 + 479264.290 * T);

  // Eccentricity multiplier
  const E = 1.0 - 0.002516 * T - 0.0000074 * T * T;

  let sumL = 0;
  for (const term of MOON_TERMS_60) {
    const [d, m, mp, f, coeff] = term;
    let factor = 1.0;
    const absM = Math.abs(m);
    if (absM === 1) factor = E;
    else if (absM === 2) factor = E * E;

    const angle = (d * D + m * M + mp * Mprime + f * F) * D2R;
    sumL += coeff * factor * Math.sin(angle);
  }

  // Additive perturbations
  sumL += 3958 * Math.sin(A1 * D2R);
  sumL += 1962 * Math.sin((Lprime - F) * D2R);
  sumL += 318 * Math.sin(A2 * D2R);

  return normalizeDeg(Lprime + sumL / 1000000.0);
}

/**
 * Lahiri (Chitra Paksha) Ayanamsha:
 * ~23.85708° at J2000.0 with 50.29 arcseconds/year precession (~24.2326° in 2026)
 */
export function calculateLahiriAyanamsha(T: number): number {
  return 23.85708 + 1.3969 * T + 0.000308 * T * T;
}

/**
 * Sunrise, Sunset, and Solar Noon calculation with standard atmospheric refraction
 */
export function calculateSunRiseSetNoon(
  year: number,
  month: number,
  day: number,
  lat: number,
  lon: number,
  tzOffset: number
): { sunrise: number; sunset: number; solarNoon: number } {
  const N1 = Math.floor((275 * month) / 9);
  const N2 = Math.floor((month + 9) / 12);
  const N3 = 1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3);
  const N = N1 - N2 * N3 + day - 30;

  function getTime(isSunrise: boolean): number {
    const lngHour = lon / 15.0;
    const t = isSunrise ? N + (6 - lngHour) / 24.0 : N + (18 - lngHour) / 24.0;
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin(M * D2R) + 0.02 * Math.sin(2 * M * D2R) + 282.634;
    L = normalizeDeg(L);

    let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R));
    RA = normalizeDeg(RA);
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = (RA + (Lquadrant - RAquadrant)) / 15.0;

    const sinDec = 0.39782 * Math.sin(L * D2R);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(90.833 * D2R) - sinDec * Math.sin(lat * D2R)) / (cosDec * Math.cos(lat * D2R));

    if (cosH > 1 || cosH < -1) return isSunrise ? 6.0 : 18.0;

    const H = isSunrise ? 360 - R2D * Math.acos(cosH) : R2D * Math.acos(cosH);
    const Hhours = H / 15.0;
    const Tval = Hhours + RA - 0.06571 * t - 6.622;
    let UT = ((Tval - lngHour) % 24 + 24) % 24;
    let localT = UT + tzOffset;
    if (localT >= 24) localT -= 24;
    if (localT < 0) localT += 24;
    return localT;
  }

  const sunrise = getTime(true);
  const sunset = getTime(false);
  let solarNoon = (sunrise + (sunset > sunrise ? sunset : sunset + 24)) / 2;
  if (solarNoon >= 24) solarNoon -= 24;

  return { sunrise, sunset, solarNoon };
}

function formatHoursMinutes(decimalHours: number): string {
  let totalMinutes = Math.round(decimalHours * 60);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  totalMinutes = totalMinutes % (24 * 60);

  const hours24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;

  return `${hours12}:${minsStr} ${ampm}`;
}

/**
 * Formats an astronomical Date into localized "Until DD MMM, H:MM AM/PM"
 */
function formatTransitionDate(date: Date, timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone,
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `Until ${formatter.format(date)}`;
  } catch {
    return `Until ${date.toLocaleString()}`;
  }
}

// Helper: computes elongation at a specific Julian Day
function getElongationJD(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return normalizeDeg(calculateMoonLongitude(T) - calculateSunLongitude(T));
}

/**
 * Finds the exact New Moon (Elongation = 0°) at or before a given Julian Day
 * using bracketing and sub-second binary bisection.
 */
function findPrecedingNewMoonJD(jdSunrise: number): number {
  let step = 0.5;
  let prevElong = getElongationJD(jdSunrise);
  let t0 = jdSunrise;
  let t1 = jdSunrise;

  for (let d = 0.5; d <= 33; d += step) {
    const jdPrev = jdSunrise - d;
    const elong = getElongationJD(jdPrev);
    if (prevElong < 180 && elong > 180) {
      t0 = jdPrev;
      t1 = jdPrev + step;
      break;
    }
    prevElong = elong;
  }

  // Sub-second bisection (25 iterations = 0.5 / 2^25 days < 0.001 sec)
  for (let i = 0; i < 25; i++) {
    const mid = (t0 + t1) / 2.0;
    const e = getElongationJD(mid);
    if (e > 180) {
      t0 = mid;
    } else {
      t1 = mid;
    }
  }
  return (t0 + t1) / 2.0;
}

/**
 * Finds the subsequent New Moon (Elongation = 0°) after a given New Moon
 */
function findNextNewMoonJD(precedingNewMoonJD: number): number {
  let t0 = precedingNewMoonJD + 25.0;
  let t1 = precedingNewMoonJD + 35.0;
  let prevElong = getElongationJD(t0);

  for (let d = 25.5; d <= 35.0; d += 0.5) {
    const jdCurr = precedingNewMoonJD + d;
    const elong = getElongationJD(jdCurr);
    if (prevElong > 180 && elong < 180) {
      t0 = jdCurr - 0.5;
      t1 = jdCurr;
      break;
    }
    prevElong = elong;
  }

  for (let i = 0; i < 25; i++) {
    const mid = (t0 + t1) / 2.0;
    const e = getElongationJD(mid);
    if (e > 180) {
      t0 = mid;
    } else {
      t1 = mid;
    }
  }
  return (t0 + t1) / 2.0;
}

/**
 * Rule-based sacred festival resolver based on Sunrise (Masa, Paksha, Tithi)
 */
function resolveFestival(masa: string, paksha: 'Shukla-Paksha' | 'Krishna-Paksha', tithiNum: number): string | null {
  const isShukla = paksha === 'Shukla-Paksha';

  // Chaitra
  if (masa === 'Chaitra') {
    if (isShukla && tithiNum === 1) return 'Chaitra Navratri Starts / Gudi Padwa / Ugadi';
    if (isShukla && tithiNum === 9) return 'Rama Navami (Sacred Solar Appearance)';
    if (isShukla && tithiNum === 15) return 'Hanuman Jayanti (Chaitra Purnima)';
  }

  // Vaishakha
  if (masa === 'Vaishakha') {
    if (isShukla && tithiNum === 3) return 'Akshaya Tritiya (Supreme Muhurat of Eternal Prosperity)';
    if (isShukla && tithiNum === 15) return 'Buddha Purnima / Kurma Jayanti';
  }

  // Jyeshtha
  if (masa === 'Jyeshtha') {
    if (!isShukla && tithiNum === 15) return 'Vat Savitri Amavasya';
    if (isShukla && tithiNum === 10) return 'Ganga Dussehra';
    if (isShukla && tithiNum === 15) return 'Vat Purnima';
  }

  // Ashadha
  if (masa === 'Ashadha') {
    if (isShukla && tithiNum === 2) return 'Jagannath Ratha Yatra';
    if (isShukla && tithiNum === 11) return 'Devshayani Ekadashi (Chaturmas Begins)';
    if (isShukla && tithiNum === 15) return 'Guru Purnima (Vyasa Puja)';
  }

  // Shravana
  if (masa === 'Shravana') {
    if (isShukla && tithiNum === 3) return 'Hariyali Teej';
    if (isShukla && tithiNum === 5) return 'Nag Panchami';
    if (isShukla && tithiNum === 15) return 'Raksha Bandhan / Shravana Purnima';
    if (!isShukla && tithiNum === 8) return 'Krishna Janmashtami (Sacred Midnight Advent)';
  }

  // Bhadrapada
  if (masa === 'Bhadrapada') {
    if (isShukla && tithiNum === 4) return 'Ganesh Chaturthi (Vinayaka Sacred Mahotsav)';
    if (isShukla && tithiNum === 14) return 'Anant Chaturdashi (Ganesh Visarjan)';
  }

  // Ashvina
  if (masa === 'Ashvina') {
    if (isShukla && tithiNum === 1) return 'Sharad Navratri Begins (Ghatasthapana)';
    if (isShukla && tithiNum === 8) return 'Maha Ashtami / Durga Ashtami';
    if (isShukla && tithiNum === 9) return 'Maha Navami / Ayudha Puja';
    if (isShukla && tithiNum === 10) return 'Vijayadashami / Dussehra';
    if (isShukla && tithiNum === 15) return 'Sharad Purnima (Kojagiri Lakshmi Vrat)';
    if (!isShukla && tithiNum === 13) return 'Dhanteras (Dhanvantari Jayanti)';
    if (!isShukla && tithiNum === 14) return 'Naraka Chaturdashi (Chhoti Diwali)';
    if (!isShukla && tithiNum === 15) return 'Diwali / Deepawali (Maha Lakshmi Puja)';
  }

  // Kartika
  if (masa === 'Kartika') {
    if (isShukla && tithiNum === 1) return 'Govardhan Puja / Gujarati New Year (Bestu Varas)';
    if (isShukla && tithiNum === 2) return 'Bhai Dooj / Yama Dwitiya';
    if (isShukla && tithiNum === 6) return 'Chhath Puja (Surya Shashthi)';
    if (isShukla && tithiNum === 9) return 'Akshaya (Amla) Navami';
    if (isShukla && tithiNum === 11) return 'Devutthana / Prabodhini Ekadashi (Tulsi Vivah)';
    if (isShukla && tithiNum === 15) return 'Kartika Purnima / Dev Deepawali';
  }

  // Margashirsha
  if (masa === 'Margashirsha') {
    if (isShukla && tithiNum === 11) return 'Mokshada Ekadashi / Gita Jayanti';
    if (isShukla && tithiNum === 15) return 'Dattatreya Jayanti';
  }

  // Pausha
  if (masa === 'Pausha') {
    if (isShukla && tithiNum === 11) return 'Pausha Putrada Ekadashi';
  }

  // Magha
  if (masa === 'Magha') {
    if (isShukla && tithiNum === 5) return 'Vasant Panchami (Saraswati Puja)';
    if (isShukla && tithiNum === 7) return 'Ratha Saptami (Surya Jayanti)';
  }

  // Phalguna
  if (masa === 'Phalguna') {
    if (!isShukla && tithiNum === 14) return 'Maha Shivaratri (The Great Cosmic Night of Shiva)';
    if (isShukla && tithiNum === 15) return 'Holi / Holika Dahan';
  }

  // Generic lunar dates
  if (tithiNum === 11) return `${isShukla ? 'Shukla' : 'Krishna'} Ekadashi Vrat`;
  if (tithiNum === 15 && isShukla) return `${masa} Purnima`;
  if (tithiNum === 15 && !isShukla) return `${masa} Amavasya`;

  return null;
}

/**
 * Calculates Day and Night Choghadiya for any weekday and sunrise/sunset
 */
function calculateChoghadiya(
  dayOfWeek: number,
  sunrise: number,
  sunset: number
): { daySlots: ChoghadiyaSlot[]; nightSlots: ChoghadiyaSlot[] } {
  const CHOGHADIYA_ORDER: Array<{ name: ChoghadiyaSlot['name']; nature: ChoghadiyaSlot['nature']; ruler: string }> = [
    { name: 'Udveg', nature: 'Ashubh', ruler: 'Sun' },
    { name: 'Char', nature: 'Neutral', ruler: 'Venus' },
    { name: 'Labh', nature: 'Shubh', ruler: 'Mercury' },
    { name: 'Amrit', nature: 'Shubh', ruler: 'Moon' },
    { name: 'Kaal', nature: 'Ashubh', ruler: 'Saturn' },
    { name: 'Shubh', nature: 'Shubh', ruler: 'Jupiter' },
    { name: 'Rog', nature: 'Ashubh', ruler: 'Mars' },
  ];

  // Day Choghadiya starting ruler index (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const DAY_START_INDEX = [0, 3, 6, 2, 5, 1, 4];
  // Night Choghadiya starting ruler index (5th from day ruler)
  const NIGHT_START_INDEX = [5, 1, 4, 0, 3, 6, 2];

  const dinamana = sunset > sunrise ? sunset - sunrise : sunset + 24 - sunrise;
  const ratrimana = 24.0 - dinamana;
  const daySegment = dinamana / 8.0;
  const nightSegment = ratrimana / 8.0;

  const dayStartIndex = DAY_START_INDEX[dayOfWeek];
  const daySlots: ChoghadiyaSlot[] = [];
  for (let i = 0; i < 8; i++) {
    const item = CHOGHADIYA_ORDER[(dayStartIndex + i) % 7];
    const sStart = sunrise + i * daySegment;
    const sEnd = sStart + daySegment;
    daySlots.push({
      name: item.name,
      nature: item.nature,
      start: formatHoursMinutes(sStart),
      end: formatHoursMinutes(sEnd),
      ruler: item.ruler,
    });
  }

  const nightStartIndex = NIGHT_START_INDEX[dayOfWeek];
  const nightSlots: ChoghadiyaSlot[] = [];
  for (let i = 0; i < 8; i++) {
    const item = CHOGHADIYA_ORDER[(nightStartIndex + i) % 7];
    const sStart = sunset + i * nightSegment;
    const sEnd = sStart + nightSegment;
    nightSlots.push({
      name: item.name,
      nature: item.nature,
      start: formatHoursMinutes(sStart),
      end: formatHoursMinutes(sEnd),
      ruler: item.ruler,
    });
  }

  return { daySlots, nightSlots };
}

// ============================================================================
// MAIN PANCHANG CALCULATION ENGINE
// ============================================================================

export function calculatePanchang(dateInput: Date = new Date(), locationStr = 'Ahmedabad, Gujarat (India)'): PanchangData {
  const targetDate = new Date(dateInput);

  // 1. Resolve Location & IANA Timezone with DST
  const loc = resolveLocationCoordinates(locationStr);
  const tzOffset = getTimezoneOffsetHours(targetDate, loc.timezone);

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1; // 1 to 12
  const day = targetDate.getDate();
  const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ... 3 = Wednesday

  // 2. Exact Sunrise, Sunset, and Solar Noon in Local Time
  const { sunrise, sunset, solarNoon } = calculateSunRiseSetNoon(
    year,
    month,
    day,
    loc.lat,
    loc.lon,
    tzOffset
  );

  // 3. Astronomical Ephemeris at Local Sunrise (Udaya Tithi Principle)
  const utAtSunrise = sunrise - tzOffset;
  const jdSunrise = calculateJulianDay(year, month, day, utAtSunrise);
  const T_sunrise = (jdSunrise - 2451545.0) / 36525.0;

  const sunLongSunrise = calculateSunLongitude(T_sunrise);
  const moonLongSunrise = calculateMoonLongitude(T_sunrise);
  const ayanamshaSunrise = calculateLahiriAyanamsha(T_sunrise);

  // Sidereal positions at Sunrise
  const sunSidereal = normalizeDeg(sunLongSunrise - ayanamshaSunrise);
  const moonSidereal = normalizeDeg(moonLongSunrise - ayanamshaSunrise);

  // 4. Tithi at Sunrise (Udaya Tithi)
  const elongationSunrise = normalizeDeg(moonLongSunrise - sunLongSunrise);
  const rawTithiIndex = Math.floor(elongationSunrise / 12.0) % 30; // 0 to 29
  const isShukla = rawTithiIndex < 15;
  const paksha: 'Shukla-Paksha' | 'Krishna-Paksha' = isShukla ? 'Shukla-Paksha' : 'Krishna-Paksha';
  const tithiNum = (rawTithiIndex % 15) + 1; // 1 to 15
  const rawTithiName = TITHI_NAMES[tithiNum - 1];
  const tithiInfo = TITHI_METADATA[tithiNum] || TITHI_METADATA[8];
  const prefix = isShukla ? 'Shukla' : 'Krishna';
  const fullTithiName = tithiNum === 15 ? (isShukla ? 'Purnima' : 'Amavasya') : `${prefix}-${rawTithiName}`;

  // 5. Tithi Transition Ending Time (Sub-second Bisection)
  const baseTithiElong = rawTithiIndex * 12.0;
  let tithiT0 = 0;
  let tithiT1 = 0;
  let foundTithiBracket = false;

  for (let step = 0; step <= 360; step++) {
    const h = step * 0.1;
    const utCheck = sunrise + h - tzOffset;
    const jdCheck = calculateJulianDay(year, month, day, utCheck);
    const T_check = (jdCheck - 2451545.0) / 36525.0;
    const elong = normalizeDeg(calculateMoonLongitude(T_check) - calculateSunLongitude(T_check));

    let diff = elong - baseTithiElong;
    if (diff < 0) diff += 360.0;

    if (diff >= 12.0) {
      tithiT0 = h - 0.1;
      tithiT1 = h;
      foundTithiBracket = true;
      break;
    }
  }

  if (!foundTithiBracket) {
    tithiT0 = 0;
    tithiT1 = 24.0;
  }

  // 20 bisection steps: (0.1 / 2^20) hours ~ 0.0003 sec
  for (let i = 0; i < 20; i++) {
    const mid = (tithiT0 + tithiT1) / 2.0;
    const utCheck = sunrise + mid - tzOffset;
    const jdCheck = calculateJulianDay(year, month, day, utCheck);
    const T_check = (jdCheck - 2451545.0) / 36525.0;
    const elong = normalizeDeg(calculateMoonLongitude(T_check) - calculateSunLongitude(T_check));

    let diff = elong - baseTithiElong;
    if (diff < 0) diff += 360.0;

    if (diff >= 12.0) {
      tithiT1 = mid;
    } else {
      tithiT0 = mid;
    }
  }

  const tithiHoursFromMidnight = sunrise + (tithiT0 + tithiT1) / 2.0;
  const tithiEndDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + (tithiHoursFromMidnight - tzOffset) * 3600 * 1000);
  const validUntilTithi = formatTransitionDate(tithiEndDate, loc.timezone);

  // 6. Nakshatra at Sunrise and Transition Ending Time
  const nakshatraIndex = Math.floor(moonSidereal / (360.0 / 27.0)) % 27;
  const nakshatraObj = NAKSHATRAS[nakshatraIndex];
  const baseNakLong = nakshatraIndex * (360.0 / 27.0);

  let nakT0 = 0;
  let nakT1 = 0;
  let foundNakBracket = false;

  for (let step = 0; step <= 360; step++) {
    const h = step * 0.1;
    const utCheck = sunrise + h - tzOffset;
    const jdCheck = calculateJulianDay(year, month, day, utCheck);
    const T_check = (jdCheck - 2451545.0) / 36525.0;
    const mL = calculateMoonLongitude(T_check);
    const ay = calculateLahiriAyanamsha(T_check);
    const mSid = normalizeDeg(mL - ay);

    let diff = mSid - baseNakLong;
    if (diff < 0) diff += 360.0;

    if (diff >= 360.0 / 27.0) {
      nakT0 = h - 0.1;
      nakT1 = h;
      foundNakBracket = true;
      break;
    }
  }

  if (!foundNakBracket) {
    nakT0 = 0;
    nakT1 = 24.0;
  }

  for (let i = 0; i < 20; i++) {
    const mid = (nakT0 + nakT1) / 2.0;
    const utCheck = sunrise + mid - tzOffset;
    const jdCheck = calculateJulianDay(year, month, day, utCheck);
    const T_check = (jdCheck - 2451545.0) / 36525.0;
    const mL = calculateMoonLongitude(T_check);
    const ay = calculateLahiriAyanamsha(T_check);
    const mSid = normalizeDeg(mL - ay);

    let diff = mSid - baseNakLong;
    if (diff < 0) diff += 360.0;

    if (diff >= 360.0 / 27.0) {
      nakT1 = mid;
    } else {
      nakT0 = mid;
    }
  }

  const nakHoursFromMidnight = sunrise + (nakT0 + nakT1) / 2.0;
  const nakEndDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + (nakHoursFromMidnight - tzOffset) * 3600 * 1000);
  const validUntilNak = formatTransitionDate(nakEndDate, loc.timezone);

  // 7. Yoga (27) at Sunrise and Transition Ending Time
  // Yoga = (Moon Sidereal + Sun Sidereal) / (360/27)
  const yogaSumSunrise = normalizeDeg(moonSidereal + sunSidereal);
  const yogaIndex = Math.floor(yogaSumSunrise / (360.0 / 27.0)) % 27;
  const yogaName = YOGAS[yogaIndex];
  const baseYogaSum = yogaIndex * (360.0 / 27.0);

  let yogaT0 = 0;
  let yogaT1 = 0;
  let foundYogaBracket = false;

  for (let step = 0; step <= 360; step++) {
    const h = step * 0.1;
    const utCheck = sunrise + h - tzOffset;
    const jdCheck = calculateJulianDay(year, month, day, utCheck);
    const T_check = (jdCheck - 2451545.0) / 36525.0;
    const sL = calculateSunLongitude(T_check);
    const mL = calculateMoonLongitude(T_check);
    const ay = calculateLahiriAyanamsha(T_check);
    const sumSid = normalizeDeg(mL - ay + (sL - ay));

    let diff = sumSid - baseYogaSum;
    if (diff < 0) diff += 360.0;

    if (diff >= 360.0 / 27.0) {
      yogaT0 = h - 0.1;
      yogaT1 = h;
      foundYogaBracket = true;
      break;
    }
  }

  if (!foundYogaBracket) {
    yogaT0 = 0;
    yogaT1 = 24.0;
  }

  for (let i = 0; i < 20; i++) {
    const mid = (yogaT0 + yogaT1) / 2.0;
    const utCheck = sunrise + mid - tzOffset;
    const jdCheck = calculateJulianDay(year, month, day, utCheck);
    const T_check = (jdCheck - 2451545.0) / 36525.0;
    const sL = calculateSunLongitude(T_check);
    const mL = calculateMoonLongitude(T_check);
    const ay = calculateLahiriAyanamsha(T_check);
    const sumSid = normalizeDeg(mL - ay + (sL - ay));

    let diff = sumSid - baseYogaSum;
    if (diff < 0) diff += 360.0;

    if (diff >= 360.0 / 27.0) {
      yogaT1 = mid;
    } else {
      yogaT0 = mid;
    }
  }

  const yogaHoursFromMidnight = sunrise + (yogaT0 + yogaT1) / 2.0;
  const yogaEndDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + (yogaHoursFromMidnight - tzOffset) * 3600 * 1000);
  const validUntilYoga = formatTransitionDate(yogaEndDate, loc.timezone);

  // 8. Karana (Half-Tithi, 60 half-tithis per lunar month)
  const karanaHalfIndex = Math.floor(elongationSunrise / 6.0) % 60;
  let karanaName = '';
  if (karanaHalfIndex === 0) {
    karanaName = 'Kimstughna';
  } else if (karanaHalfIndex >= 57) {
    const fixedKaranas = ['Shakuni', 'Chatushpada', 'Naga'];
    karanaName = fixedKaranas[karanaHalfIndex - 57];
  } else {
    karanaName = REPEATING_KARANAS[(karanaHalfIndex - 1) % 7];
  }

  const baseKaranaElong = karanaHalfIndex * 6.0;
  let karanaT0 = 0;
  let karanaT1 = 0;
  let foundKaranaBracket = false;

  for (let step = 0; step <= 360; step++) {
    const h = step * 0.1;
    const utCheck = sunrise + h - tzOffset;
    const jdCheck = calculateJulianDay(year, month, day, utCheck);
    const T_check = (jdCheck - 2451545.0) / 36525.0;
    const elong = normalizeDeg(calculateMoonLongitude(T_check) - calculateSunLongitude(T_check));

    let diff = elong - baseKaranaElong;
    if (diff < 0) diff += 360.0;

    if (diff >= 6.0) {
      karanaT0 = h - 0.1;
      karanaT1 = h;
      foundKaranaBracket = true;
      break;
    }
  }

  if (!foundKaranaBracket) {
    karanaT0 = 0;
    karanaT1 = 24.0;
  }

  for (let i = 0; i < 20; i++) {
    const mid = (karanaT0 + karanaT1) / 2.0;
    const utCheck = sunrise + mid - tzOffset;
    const jdCheck = calculateJulianDay(year, month, day, utCheck);
    const T_check = (jdCheck - 2451545.0) / 36525.0;
    const elong = normalizeDeg(calculateMoonLongitude(T_check) - calculateSunLongitude(T_check));

    let diff = elong - baseKaranaElong;
    if (diff < 0) diff += 360.0;

    if (diff >= 6.0) {
      karanaT1 = mid;
    } else {
      karanaT0 = mid;
    }
  }

  const karanaHoursFromMidnight = sunrise + (karanaT0 + karanaT1) / 2.0;
  const karanaEndDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + (karanaHoursFromMidnight - tzOffset) * 3600 * 1000);
  const validUntilKarana = formatTransitionDate(karanaEndDate, loc.timezone);

  // 9. Moon Rashi & Sun Rashi
  const moonRashiIndex = Math.floor(moonSidereal / 30.0) % 12;
  const moonRashi = {
    name: RASHIS[moonRashiIndex].name,
    sanskrit: RASHIS[moonRashiIndex].sanskrit,
  };

  const sunRashiIndex = Math.floor(sunSidereal / 30.0) % 12;
  const sunRashi = {
    name: RASHIS[sunRashiIndex].sanskrit,
  };

  // 10. Hindu Lunar Month (Amanta, Gujarati / Vedic Tradition)
  // Determined by Sun's sidereal sign at the preceding New Moon (Elongation = 0°)
  const nmPrecedingJD = findPrecedingNewMoonJD(jdSunrise);
  const T_nm = (nmPrecedingJD - 2451545.0) / 36525.0;
  const sunSidAtNM = normalizeDeg(calculateSunLongitude(T_nm) - calculateLahiriAyanamsha(T_nm));
  const nmSign = Math.floor(sunSidAtNM / 30.0) % 12;

  // Check for Adhika Masa (if Sun does not transition signs between this and next new moon)
  const nmNextJD = findNextNewMoonJD(nmPrecedingJD);
  const T_nmNext = (nmNextJD - 2451545.0) / 36525.0;
  const sunSidAtNMNext = normalizeDeg(calculateSunLongitude(T_nmNext) - calculateLahiriAyanamsha(T_nmNext));
  const nmNextSign = Math.floor(sunSidAtNMNext / 30.0) % 12;
  const isAdhikaMasa = nmSign === nmNextSign;

  const rawMasaName = VEDIC_MONTHS[nmSign];
  const masa = isAdhikaMasa ? `Adhika ${rawMasaName}` : rawMasaName;

  // 11. Ritu (Seasons) & Ayana
  // Lunar Ritu (derived from lunar masa)
  const LUNAR_RITU_MAP: Record<string, string> = {
    Chaitra: 'Vasant',
    Vaishakha: 'Vasant',
    Jyeshtha: 'Grishma',
    Ashadha: 'Grishma',
    Shravana: 'Varsha',
    Bhadrapada: 'Varsha',
    Ashvina: 'Sharad',
    Kartika: 'Sharad',
    Margashirsha: 'Hemant',
    Pausha: 'Hemant',
    Magha: 'Shishir',
    Phalguna: 'Shishir',
  };
  const ritu = LUNAR_RITU_MAP[rawMasaName] || 'Sharad';

  // Solar Ritu (derived from Sun's sidereal rashi)
  // Meena (11) / Mesha (0) = Vasant
  // Vrishabha (1) / Mithuna (2) = Grishma
  // Karka (3) / Simha (4) = Varsha
  // Kanya (5) / Tula (6) = Sharad
  // Vrischika (7) / Dhanu (8) = Hemant
  // Makara (9) / Kumbha (10) = Shishir
  const SOLAR_RITU_MAP: Record<number, string> = {
    11: 'Vasant', 0: 'Vasant',
    1: 'Grishma', 2: 'Grishma',
    3: 'Varsha', 4: 'Varsha',
    5: 'Sharad', 6: 'Sharad',
    7: 'Hemant', 8: 'Hemant',
    9: 'Shishir', 10: 'Shishir',
  };
  const solarRitu = SOLAR_RITU_MAP[sunRashiIndex] || 'Hemant';
  const rituDisplay = ritu === solarRitu ? ritu : `${ritu} (${solarRitu} by solar calendar)`;

  // Ayana from Sun's sidereal longitude (Makara 270° through Mithuna 90° = Uttarayana)
  const isUttarayana = sunSidereal >= 270.0 || sunSidereal < 90.0;
  const ayana: 'Uttarayana' | 'Dakshinayana' = isUttarayana ? 'Uttarayana' : 'Dakshinayana';

  // 12. Festival Line
  const festival = resolveFestival(rawMasaName, paksha, tithiNum);

  // 13. Dinamana & Ashubh Muhurats (8-fold division)
  const dinamana = sunset > sunrise ? sunset - sunrise : sunset + 24.0 - sunrise;
  const segmentDuration = dinamana / 8.0;
  const muhurtaDuration = dinamana / 15.0;

  // Rahu Kaal (Sunday: 8th, Mon: 2nd, Tue: 7th, Wed: 5th, Thu: 6th, Fri: 4th, Sat: 3rd)
  const rahuKaalParts = [7, 1, 6, 4, 5, 3, 2];
  const rahuPart = rahuKaalParts[dayOfWeek];
  const rahuStart = sunrise + rahuPart * segmentDuration;
  const rahuEnd = rahuStart + segmentDuration;
  const rahuKaalStr = `${formatHoursMinutes(rahuStart)} - ${formatHoursMinutes(rahuEnd)}`;

  // Yamaganda
  const yamaParts = [4, 3, 2, 1, 0, 6, 5];
  const yamaPart = yamaParts[dayOfWeek];
  const yamaStart = sunrise + yamaPart * segmentDuration;
  const yamaEnd = yamaStart + segmentDuration;
  const yamagandaStr = `${formatHoursMinutes(yamaStart)} - ${formatHoursMinutes(yamaEnd)}`;

  // Gulika Kaal
  const gulikaParts = [6, 5, 4, 3, 2, 1, 0];
  const gulikaPart = gulikaParts[dayOfWeek];
  const gulikaStart = sunrise + gulikaPart * segmentDuration;
  const gulikaEnd = gulikaStart + segmentDuration;
  const gulikaKaalStr = `${formatHoursMinutes(gulikaStart)} - ${formatHoursMinutes(gulikaEnd)}`;

  // 14. Shubh Muhurats
  // Brahma Muhurta (Starts 96 min before sunrise, ends 48 min before sunrise)
  const brahmaStart = sunrise - 1.6;
  const brahmaEnd = sunrise - 0.8;
  const brahmaMuhurtaStr = `${formatHoursMinutes(brahmaStart)} - ${formatHoursMinutes(brahmaEnd)}`;

  // Abhijit Muhurat: 8th Muhurta centered on Solar Noon (Solar Noon ± muhurtaDuration / 2)
  const abhijitStart = solarNoon - muhurtaDuration / 2.0;
  const abhijitEnd = solarNoon + muhurtaDuration / 2.0;
  const abhijitTiming = `${formatHoursMinutes(abhijitStart)} - ${formatHoursMinutes(abhijitEnd)}`;

  // Abhijit applicability: Not applicable on Wednesday (Budhavara Varjya)
  const isWednesday = dayOfWeek === 3;
  const abhijitApplicable = !isWednesday;

  // Overlap check with Rahu Kaal: intersects if start < rahuEnd && end > rahuStart
  const overlapsRahuKaal = abhijitStart < rahuEnd && abhijitEnd > rahuStart;

  let abhijitStatusText = 'Supreme daily window for victory and enterprise';
  if (!abhijitApplicable) {
    abhijitStatusText = 'Not recommended on Wednesdays';
  } else if (overlapsRahuKaal) {
    abhijitStatusText = 'Overlaps Rahu Kaal';
  }

  // 15. Choghadiya
  const choghadiya = calculateChoghadiya(dayOfWeek, sunrise, sunset);

  // Formatted date string in English / Indian calendar standard
  const dateFormatted = targetDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const dayLordInfo = DAY_LORDS[dayOfWeek];

  return {
    date: targetDate,
    dateFormatted,
    dayName: dayLordInfo.day,
    dayLord: dayLordInfo.lord.split(' ')[0],
    dayLordPlanet: dayLordInfo.lord,
    masa,
    isAdhikaMasa,
    paksha,
    ritu,
    solarRitu,
    rituDisplay,
    ayana,
    tithi: {
      name: fullTithiName,
      pakshaName: rawTithiName,
      deity: tithiInfo.deity,
      category: tithiInfo.cat,
      validUntil: validUntilTithi,
      endDate: tithiEndDate,
      description: tithiInfo.desc,
    },
    nakshatra: {
      name: nakshatraObj.name,
      lord: nakshatraObj.lord,
      deity: nakshatraObj.deity,
      qualities: nakshatraObj.qualities,
      validUntil: validUntilNak,
      endDate: nakEndDate,
    },
    yoga: {
      name: yogaName,
      validUntil: validUntilYoga,
      endDate: yogaEndDate,
    },
    karana: {
      name: karanaName,
      validUntil: validUntilKarana,
      endDate: karanaEndDate,
    },
    moonRashi,
    sunRashi,
    festival,
    sunriseTime: formatHoursMinutes(sunrise),
    sunsetTime: formatHoursMinutes(sunset),
    shubhMuhurats: {
      brahmaMuhurta: brahmaMuhurtaStr,
      abhijit: {
        timing: abhijitTiming,
        start: formatHoursMinutes(abhijitStart),
        end: formatHoursMinutes(abhijitEnd),
        applicable: abhijitApplicable,
        overlapsRahuKaal,
        statusText: abhijitStatusText,
      },
    },
    ashubhMuhurats: {
      rahuKaal: rahuKaalStr,
      yamaganda: yamagandaStr,
      gulikaKaal: gulikaKaalStr,
    },
    choghadiya,
    location: loc.name,
    timezone: loc.timezone,
  };
}
