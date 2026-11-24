import { calculatePanchang, getTimezoneOffsetHours } from '../src/lib/panchang';

let failed = false;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    failed = true;
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log('=== RUNNING PANCHANG ENGINE VERIFICATION ===\n');

// 1. Ahmedabad, 18 Nov 2026 (Wednesday)
console.log('--- Test 1: Ahmedabad 18 Nov 2026 ---');
const d18 = new Date(2026, 10, 18, 12, 0, 0); // 18 Nov 2026
const p18 = calculatePanchang(d18, 'Ahmedabad, Gujarat (India)');

console.log('Results for Ahmedabad 18 Nov 2026:');
console.log(`  Masa: ${p18.masa}`);
console.log(`  Paksha: ${p18.paksha}`);
console.log(`  Tithi: ${p18.tithi.name} (${p18.tithi.validUntil})`);
console.log(`  Nakshatra: ${p18.nakshatra.name} (${p18.nakshatra.validUntil})`);
console.log(`  Sunrise: ${p18.sunriseTime}, Sunset: ${p18.sunsetTime}`);
console.log(`  Rahu Kaal: ${p18.ashubhMuhurats.rahuKaal}`);
console.log(`  Yamaganda: ${p18.ashubhMuhurats.yamaganda}`);
console.log(`  Gulika: ${p18.ashubhMuhurats.gulikaKaal}`);
console.log(`  Brahma Muhurta: ${p18.shubhMuhurats.brahmaMuhurta}`);
console.log(`  Abhijit: ${p18.shubhMuhurats.abhijit.timing} (applicable=${p18.shubhMuhurats.abhijit.applicable}, overlapsRahu=${p18.shubhMuhurats.abhijit.overlapsRahuKaal})`);
console.log(`  Ritu: ${p18.ritu}, Solar Ritu: ${p18.solarRitu}, Ayana: ${p18.ayana}`);
console.log(`  Yoga: ${p18.yoga.name} (${p18.yoga.validUntil})`);
console.log(`  Karana: ${p18.karana.name} (${p18.karana.validUntil})`);
console.log(`  Moon Rashi: ${p18.moonRashi.name} (${p18.moonRashi.sanskrit})`);

assert(p18.masa === 'Kartika', `Masa is Kartika (got ${p18.masa})`);
assert(p18.paksha === 'Shukla-Paksha', `Paksha is Shukla-Paksha (got ${p18.paksha})`);
assert(p18.tithi.name.includes('Navami'), `Tithi is Navami (got ${p18.tithi.name})`);
assert(p18.nakshatra.name.includes('Shatabhisha'), `Nakshatra is Shatabhisha (got ${p18.nakshatra.name})`);
assert(p18.sunriseTime.startsWith('6:5'), `Sunrise ~6:5x AM (got ${p18.sunriseTime})`);
assert(p18.sunsetTime.startsWith('5:5'), `Sunset ~5:5x PM (got ${p18.sunsetTime})`);
assert(p18.shubhMuhurats.abhijit.applicable === false, `Abhijit applicable=false on Wednesday`);
assert(p18.shubhMuhurats.abhijit.overlapsRahuKaal === true, `Abhijit overlaps Rahu Kaal on Wednesday`);
assert(p18.ritu.includes('Sharad'), `Lunar Ritu is Sharad (got ${p18.ritu})`);
assert(p18.solarRitu.includes('Hemant'), `Solar Ritu is Hemant (got ${p18.solarRitu})`);
assert(p18.ayana === 'Dakshinayana', `Ayana is Dakshinayana (got ${p18.ayana})`);

// 2. Masa regression: 10, 12, 16 Nov 2026 in Ahmedabad all give Kartika
console.log('\n--- Test 2: Masa Regression (10, 12, 16 Nov 2026) ---');
for (const day of [10, 12, 16]) {
  const p = calculatePanchang(new Date(2026, 10, day, 12, 0, 0), 'Ahmedabad, Gujarat (India)');
  assert(p.masa === 'Kartika', `Day ${day} Nov 2026 gives Masa Kartika (got ${p.masa})`);
}

// 3. DST checks
console.log('\n--- Test 3: DST & International Cities ---');
const pSydney = calculatePanchang(d18, 'Sydney (Australia)');
console.log(`Sydney 18 Nov 2026 Sunrise: ${pSydney.sunriseTime}, Timezone: ${pSydney.timezone}`);
assert(pSydney.sunriseTime.startsWith('5:4') || pSydney.sunriseTime.startsWith('5:3'), `Sydney sunrise ~5:4x AM (got ${pSydney.sunriseTime})`);

const pAuckland = calculatePanchang(d18, 'Auckland (New Zealand)');
console.log(`Auckland 18 Nov 2026 Sunrise: ${pAuckland.sunriseTime}, Timezone: ${pAuckland.timezone}`);
assert(pAuckland.sunriseTime.startsWith('5:5') || pAuckland.sunriseTime.startsWith('6:0'), `Auckland sunrise ~6:0x AM (got ${pAuckland.sunriseTime})`);

const pNewYork = calculatePanchang(d18, 'New York, NY (USA)');
console.log(`New York 18 Nov 2026 Sunrise: ${pNewYork.sunriseTime}, Timezone: ${pNewYork.timezone}`);
assert(pNewYork.sunriseTime.startsWith('6:4') || pNewYork.sunriseTime.startsWith('6:5'), `New York sunrise ~6:4x-6:5x AM (got ${pNewYork.sunriseTime})`);

const pLondon = calculatePanchang(d18, 'London (United Kingdom)');
console.log(`London 18 Nov 2026 Sunrise: ${pLondon.sunriseTime}, Timezone: ${pLondon.timezone}`);
assert(pLondon.sunriseTime.startsWith('7:2') || pLondon.sunriseTime.startsWith('7:3'), `London sunrise ~7:2x-7:3x AM (got ${pLondon.sunriseTime})`);

// 4. 8 other 2026 dates in Ahmedabad
console.log('\n--- Test 4: 8 Other Dates in 2026 ---');
const sampleDates = [
  new Date(2026, 0, 14),  // Makar Sankranti
  new Date(2026, 2, 3),   // Holi
  new Date(2026, 2, 20),  // Chaitra Navratri / New Year
  new Date(2026, 3, 14),  // Solar New Year
  new Date(2026, 6, 29),  // Guru Purnima
  new Date(2026, 7, 15),  // Independence Day
  new Date(2026, 9, 20),  // Dussehra
  new Date(2026, 10, 8),  // Diwali
];

sampleDates.forEach((dt) => {
  const res = calculatePanchang(dt, 'Ahmedabad, Gujarat (India)');
  assert(!!res.tithi.name, `Valid Tithi for ${dt.toDateString()}: ${res.tithi.name}`);
  assert(!!res.nakshatra.name, `Valid Nakshatra for ${dt.toDateString()}: ${res.nakshatra.name}`);
  assert(!!res.yoga.name, `Valid Yoga for ${dt.toDateString()}: ${res.yoga.name}`);
  assert(!!res.karana.name, `Valid Karana for ${dt.toDateString()}: ${res.karana.name}`);
  assert(!!res.shubhMuhurats.brahmaMuhurta, `Valid Brahma Muhurta for ${dt.toDateString()}`);
});

console.log('\n=== VERIFICATION SUMMARY ===');
if (failed) {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('✅ ALL PANCHANG VERIFICATION TESTS PASSED SUCCESSFULLY!');
}
