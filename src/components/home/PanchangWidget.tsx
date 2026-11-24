import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Moon,
  Compass,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sun,
  Star,
  CheckCircle2,
  X,
  Search,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { calculatePanchang, WORLD_CITIES, isCityToday } from '../../lib/panchang';

interface PanchangWidgetProps {
  onOpenConsultation?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CHOGHADIYA_META: Record<
  string,
  { hindi: string; badge: string; desc: string; bg: string; border: string; text: string; badgeClass: string }
> = {
  Amrit: {
    hindi: 'अमृत',
    badge: 'Supreme • Auspicious',
    desc: 'Best for all auspicious deeds, spiritual milestones, sanctification & worship.',
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-300',
    text: 'text-emerald-950',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  Shubh: {
    hindi: 'शुभ',
    badge: 'Auspicious • Prosperity',
    desc: 'Excellent for ceremonies, agreements, education, and spiritual beginnings.',
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-300',
    text: 'text-emerald-950',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  Labh: {
    hindi: 'लाभ',
    badge: 'Gain • Commerce',
    desc: 'Optimal for commercial initiatives, financial transactions & business growth.',
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-300',
    text: 'text-emerald-950',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  Char: {
    hindi: 'चल',
    badge: 'Movable • Travel',
    desc: 'Favorable for journeys, transit, moving goods, and dynamic change.',
    bg: 'bg-amber-50/70',
    border: 'border-amber-300',
    text: 'text-amber-950',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  Rog: {
    hindi: 'रोग',
    badge: 'Caution • Avoid',
    desc: 'Inauspicious. Avoid starting new ventures; potential for friction or illness.',
    bg: 'bg-rose-50/70',
    border: 'border-rose-200',
    text: 'text-rose-950',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  Kaal: {
    hindi: 'काल',
    badge: 'Caution • Avoid',
    desc: 'Inauspicious period of Saturn. Postpone important ventures; obstacle risk.',
    bg: 'bg-rose-50/70',
    border: 'border-rose-200',
    text: 'text-rose-950',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  Udveg: {
    hindi: 'उद्वेग',
    badge: 'Caution • Avoid',
    desc: 'Inauspicious period of Sun. Postpone celebration; anxiety or tension potential.',
    bg: 'bg-rose-50/70',
    border: 'border-rose-200',
    text: 'text-rose-950',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
};

export const PanchangWidget: React.FC<PanchangWidgetProps> = ({ onOpenConsultation }) => {
  // Always default to today's date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<string>('Ahmedabad, Gujarat (India)');
  const [showMuhuratTab, setShowMuhuratTab] = useState<'DAY' | 'MUHURAT'>('DAY');
  const [choghadiyaPeriod, setChoghadiyaPeriod] = useState<'DAY' | 'NIGHT'>('DAY');

  // Modals
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Calendar modal navigation
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());

  // Location search state
  const [locationSearch, setLocationSearch] = useState('');
  const [locationCategory, setLocationCategory] = useState<'ALL' | 'USA' | 'INDIA' | 'UK' | 'CANADA' | 'AUSTRALIA' | 'OTHER'>('ALL');

  // Load saved location on mount — Ahmedabad is default; strictly match known cities
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shiv_dhara_panchang_location');
      if (saved && saved.length > 3 && saved !== 'Jamnagar, Gujarat, India') {
        const found = WORLD_CITIES.find(
          (c) => c.label.toLowerCase() === saved.toLowerCase() || c.city.toLowerCase() === saved.toLowerCase()
        );
        if (found) {
          setLocation(found.label);
        } else {
          setLocation('Ahmedabad, Gujarat (India)');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const panchang = calculatePanchang(selectedDate, location);

  const isToday = isCityToday(selectedDate, panchang.timezone);

  // Navigation handlers
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
    setCalendarYear(prev.getFullYear());
    setCalendarMonth(prev.getMonth());
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
    setCalendarYear(next.getFullYear());
    setCalendarMonth(next.getMonth());
  };

  const handleResetToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCalendarYear(today.getFullYear());
    setCalendarMonth(today.getMonth());
  };

  const handleSelectSpecificDate = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    setSelectedDate(d);
    setIsDatePickerOpen(false);
  };

  // Calendar calculation
  const daysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sun, 1 is Mon...

  // Filtered world cities
  const filteredCities = WORLD_CITIES.filter((item) => {
    const matchesSearch =
      locationSearch === '' ||
      item.city.toLowerCase().includes(locationSearch.toLowerCase()) ||
      item.country.toLowerCase().includes(locationSearch.toLowerCase()) ||
      item.region.toLowerCase().includes(locationSearch.toLowerCase()) ||
      item.label.toLowerCase().includes(locationSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (locationCategory === 'ALL') return true;
    if (locationCategory === 'USA') return item.country === 'USA';
    if (locationCategory === 'INDIA') return item.country === 'India';
    if (locationCategory === 'UK') return item.country === 'United Kingdom';
    if (locationCategory === 'CANADA') return item.country === 'Canada';
    if (locationCategory === 'AUSTRALIA') return item.country === 'Australia' || item.country === 'New Zealand';
    if (locationCategory === 'OTHER') return !['USA', 'India', 'United Kingdom', 'Canada', 'Australia', 'New Zealand'].includes(item.country);

    return true;
  });

  return (
    <section id="daily-panchang-section" className="py-20 bg-gradient-to-b from-[#F7F3EA] via-[#FAF6EE] to-[#F7F3EA] text-[#163A36] relative overflow-hidden border-y border-[#E6D5B8]/80">
      {/* Background Sacred Geometries */}
      <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-[700px] h-[700px] bg-[#E6B55A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 top-1/3 w-80 h-80 bg-[#163A36]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#163A36] text-[#E6B55A] text-[10px] font-mono font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E6B55A]" />
            <span>Daily Cosmic Almanac</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#163A36]">
            Sacred Vedic Panchang
          </h2>

          <p className="type-body-sm text-xs sm:text-sm text-[#2B211E]/75 leading-relaxed">
            Align your daily decisions, Vastu rectifications, and enterprise initiatives with the cosmic rhythm of Tithi, Nakshatra, and Shubh Muhurat anywhere in the world.
          </p>
        </div>

        {/* Master Panchang Card */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border-2 border-[#E6D5B8] shadow-xl overflow-hidden">
          
          {/* Header Controls: Date Navigator & Location */}
          <div className="bg-[#163A36] text-[#F7F1E6] p-4 sm:p-6 border-b border-[#315C52] flex flex-col gap-4">
            
            {/* Top row: Date navigation & interactive date selector button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Stepper with prev, active date, next */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  title="Previous Day"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E6B55A] hover:text-[#163A36] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Previous Day"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Central Date Header Button: 100% Pressable to open Full Date Picker Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setCalendarYear(selectedDate.getFullYear());
                    setCalendarMonth(selectedDate.getMonth());
                    setIsDatePickerOpen(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-center cursor-pointer group"
                  title="Click to select any Date, Month, or Year (Past or Future)"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#E6B55A]" />
                    <span className="text-base sm:text-lg font-serif font-bold tracking-wide text-white group-hover:text-[#E6B55A] transition-colors">
                      {panchang.dateFormatted}
                    </span>
                    <span className="text-xs text-[#E6B55A]">▾</span>
                  </div>
                  {isToday ? (
                    <span className="text-[10px] font-mono uppercase font-bold text-[#E6B55A] tracking-widest block mt-0.5">
                      • Today •
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase font-medium text-emerald-300 block mt-0.5">
                      Change Date
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNextDay}
                  title="Next Day"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E6B55A] hover:text-[#163A36] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Next Day"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Action Buttons: Pick Date Modal + Location Trigger */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
                
                {/* Dedicated Calendar Button */}
                <button
                  type="button"
                  onClick={() => {
                    setCalendarYear(selectedDate.getFullYear());
                    setCalendarMonth(selectedDate.getMonth());
                    setIsDatePickerOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#E6B55A] text-[#163A36] hover:bg-[#F2CD7E] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Select month, year, or any date"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Select Date</span>
                </button>

                {/* Return to Today (if looking at past or future) */}
                {!isToday && (
                  <button
                    type="button"
                    onClick={handleResetToday}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#E6B55A] text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#E6B55A]/30"
                    title="Jump back to today"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Today</span>
                  </button>
                )}

                {/* Location Pill (Clickable Worldwide Location Modal) */}
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF4EA] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10 group"
                  title="Change Location (Worldwide auto-detection & custom city search)"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#E6B55A] group-hover:scale-110 transition-transform" />
                  <span className="truncate max-w-[150px] sm:max-w-[180px] text-left">
                    {location}
                  </span>
                  <span className="text-[10px] text-[#E6B55A]">▾</span>
                </button>

              </div>

            </div>

          </div>

          {/* Sub Navigation: Day View vs Shubh Muhurat */}
          <div className="bg-[#FAF4EA] p-3 border-b border-[#E6D5B8] flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowMuhuratTab('DAY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                showMuhuratTab === 'DAY'
                  ? 'bg-[#163A36] text-[#F7F1E6] shadow-sm'
                  : 'text-[#163A36] hover:bg-[#E6D5B8]/50'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-[#E6B55A]" />
              <span>Panchang Day View</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMuhuratTab('MUHURAT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                showMuhuratTab === 'MUHURAT'
                  ? 'bg-[#163A36] text-[#F7F1E6] shadow-sm'
                  : 'text-[#163A36] hover:bg-[#E6D5B8]/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#E6B55A]" />
              <span>Shubh & Rahu Muhurats</span>
            </button>
          </div>

          {/* Panchang Content Body */}
          <div className="p-5 sm:p-8 space-y-6">

            {showMuhuratTab === 'DAY' ? (
              <div className="space-y-4">
                
                {/* 1. Weekday & Cosmic Hierarchy Banner */}
                <div className="bg-gradient-to-br from-[#FAF6EE] to-[#F5EEDD] p-5 sm:p-6 rounded-2xl border border-[#E6D5B8] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#163A36]">
                        {panchang.dayName}
                      </h3>
                      <span className="text-xs font-semibold text-[#8B6914] flex items-center gap-1 mt-0.5">
                        <Sun className="w-3.5 h-3.5 text-[#E6B55A]" />
                        <span>Day Lord: {panchang.dayLordPlanet}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-white text-[#163A36] text-[10px] font-mono font-bold border border-[#E6D5B8]">
                        Masa: {panchang.masa}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white text-[#163A36] text-[10px] font-mono font-bold border border-[#E6D5B8]">
                        {panchang.paksha}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white text-[#163A36] text-[10px] font-mono font-bold border border-[#E6D5B8]">
                        Ritu: {panchang.rituDisplay || panchang.ritu}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white text-[#163A36] text-[10px] font-mono font-bold border border-[#E6D5B8]">
                        {panchang.ayana}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[10px] font-mono font-bold border border-amber-200 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-[#E6B55A]" />
                        <span>Rise: {panchang.sunriseTime}</span>
                        <span>•</span>
                        <span>Set: {panchang.sunsetTime}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Festival / Special Observance Banner */}
                {panchang.festival && (
                  <div className="bg-gradient-to-r from-amber-500/15 via-[#E6B55A]/20 to-amber-500/15 p-3 rounded-2xl border border-[#E6B55A]/50 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#8B6914] shrink-0" />
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B6914] block">Special Observance</span>
                      <span className="text-sm font-serif font-bold text-[#163A36]">{panchang.festival}</span>
                    </div>
                  </div>
                )}

                {/* 2. Tithi Card */}
                <div className="bg-white p-5 rounded-2xl border-2 border-[#E6D5B8] shadow-sm space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-[#C56A45]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Lunar Tithi
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-500 font-medium">
                      {panchang.tithi.validUntil}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-serif font-bold text-[#163A36]">
                        {panchang.tithi.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                        {panchang.tithi.category} Tithi
                      </span>
                    </div>

                    <span className="text-xs text-gray-500 block">
                      Deity: <strong className="text-[#163A36]">{panchang.tithi.deity}</strong>
                    </span>

                    <p className="text-xs text-[#2B211E]/80 pt-1 leading-relaxed">
                      {panchang.tithi.description}
                    </p>
                  </div>
                </div>

                {/* 3. Nakshatra Card */}
                <div className="bg-white p-5 rounded-2xl border-2 border-[#E6D5B8] shadow-sm space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#A6833D]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Constellation (Nakshatra)
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-500 font-medium">
                      {panchang.nakshatra.validUntil}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xl font-serif font-bold text-[#163A36]">
                      {panchang.nakshatra.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span>Ruling Planet: <strong className="text-[#163A36]">{panchang.nakshatra.lord}</strong></span>
                      <span>•</span>
                      <span>Deity: <strong className="text-[#163A36]">{panchang.nakshatra.deity}</strong></span>
                    </div>

                    <p className="text-xs text-[#2B211E]/80 pt-1 leading-relaxed">
                      {panchang.nakshatra.qualities}
                    </p>
                  </div>
                </div>

                {/* 4. Yoga, Karana & Moon Sign Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-2xl border-2 border-[#E6D5B8] shadow-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-400 block">Lunar Yoga</span>
                    <h5 className="text-base font-serif font-bold text-[#163A36]">{panchang.yoga.name}</h5>
                    <span className="text-[11px] font-mono text-gray-500 block">{panchang.yoga.validUntil}</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border-2 border-[#E6D5B8] shadow-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-400 block">Karana</span>
                    <h5 className="text-base font-serif font-bold text-[#163A36]">{panchang.karana.name}</h5>
                    <span className="text-[11px] font-mono text-gray-500 block">{panchang.karana.validUntil}</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border-2 border-[#E6D5B8] shadow-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-400 block">Chandra Rashi</span>
                    <h5 className="text-base font-serif font-bold text-[#163A36]">{panchang.moonRashi.name}</h5>
                    <span className="text-[11px] font-sans text-gray-500 block">{panchang.moonRashi.sanskrit}</span>
                  </div>
                </div>

              </div>
            ) : (
              /* Shubh & Ashubh Muhurat Windows */
              <div className="space-y-4">
                
                {/* Auspicious Windows */}
                <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-serif font-bold text-sm">Shubh Muhurats (Auspicious Windows)</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Abhijit Muhurat with Classical Rule Handling */}
                    <div className={`p-3.5 rounded-xl border space-y-1 ${
                      !panchang.shubhMuhurats.abhijit.applicable
                        ? 'bg-gray-50/90 border-gray-300 text-gray-600'
                        : panchang.shubhMuhurats.abhijit.overlapsRahuKaal
                        ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                        : 'bg-white border-emerald-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-800">Abhijit Muhurat</span>
                        {!panchang.shubhMuhurats.abhijit.applicable ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-200 text-gray-700">
                            Wednesdays: Avoided
                          </span>
                        ) : panchang.shubhMuhurats.abhijit.overlapsRahuKaal ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                            Overlaps Rahu Kaal
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Auspicious
                          </span>
                        )}
                      </div>
                      <span className={`font-bold text-sm block ${!panchang.shubhMuhurats.abhijit.applicable ? 'text-gray-500 line-through' : 'text-[#163A36]'}`}>
                        {panchang.shubhMuhurats.abhijit.timing}
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        {!panchang.shubhMuhurats.abhijit.applicable
                          ? 'Not recommended on Wednesdays per classical tradition'
                          : panchang.shubhMuhurats.abhijit.overlapsRahuKaal
                          ? 'Caution: Time coincides with Rahu Kaal'
                          : 'Supreme daily window for victory & beginnings'}
                      </span>
                    </div>

                    {/* Brahma Muhurta */}
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-800">Brahma Muhurta</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          Pre-Dawn
                        </span>
                      </div>
                      <span className="font-bold text-[#163A36] text-sm block">{panchang.shubhMuhurats.brahmaMuhurta}</span>
                      <span className="text-[10px] text-gray-500 block">Ideal for pranayama, dhyana & mantra sadhana</span>
                    </div>
                  </div>
                </div>

                {/* Inauspicious Windows */}
                <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <h4 className="font-serif font-bold text-sm">Ashubh Kaal (Caution Windows to Avoid)</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-800 block">Rahu Kaal</span>
                      <span className="font-bold text-red-700 text-sm block">{panchang.ashubhMuhurats.rahuKaal}</span>
                      <span className="text-[10px] text-gray-500 block">Avoid starting major contracts or house warmings</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-800 block">Yamaganda</span>
                      <span className="font-bold text-[#163A36] text-sm block">{panchang.ashubhMuhurats.yamaganda}</span>
                      <span className="text-[10px] text-gray-500 block">Unfavorable for financial speculations</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-800 block">Gulika Kaal</span>
                      <span className="font-bold text-[#163A36] text-sm block">{panchang.ashubhMuhurats.gulikaKaal}</span>
                      <span className="text-[10px] text-gray-500 block">Repetitive action karmic window</span>
                    </div>
                  </div>
                </div>

                {/* 3. Choghadiya Muhurats (Shubh, Labh, Amrit, Char, Rog, Kaal, Udveg) */}
                <div className="bg-[#FAF6EE] p-5 rounded-2xl border-2 border-[#E6D5B8] space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E6D5B8]">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C8A45D]" />
                        <h4 className="font-serif font-bold text-base text-[#163A36]">
                          Vedic Choghadiya Muhurats (चौघड़िया मुहूर्त)
                        </h4>
                      </div>
                      <p className="text-xs text-[#2B211E]/75 mt-0.5">
                        Classical 8-fold planetary division for choosing Shubh, Labh, Amrit, Char and avoiding inauspicious hours.
                      </p>
                    </div>

                    {/* Day / Night Choghadiya Toggle */}
                    <div className="inline-flex rounded-xl p-1 bg-white border border-[#D9D2C3] shrink-0 self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setChoghadiyaPeriod('DAY')}
                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          choghadiyaPeriod === 'DAY'
                            ? 'bg-[#163A36] text-[#E6B55A] shadow-xs'
                            : 'text-[#163A36] hover:bg-gray-100'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5 text-[#E6B55A]" />
                        <span>Day (दिन)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChoghadiyaPeriod('NIGHT')}
                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          choghadiyaPeriod === 'NIGHT'
                            ? 'bg-[#163A36] text-[#E6B55A] shadow-xs'
                            : 'text-[#163A36] hover:bg-gray-100'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5 text-[#E6B55A]" />
                        <span>Night (रात्रि)</span>
                      </button>
                    </div>
                  </div>

                  {/* Period Time Range Subtitle */}
                  <div className="flex items-center justify-between text-xs text-[#8B6914] px-1 font-mono">
                    <span>
                      {choghadiyaPeriod === 'DAY'
                        ? `☀️ Dinamana Daytime: ${panchang.sunriseTime} to ${panchang.sunsetTime}`
                        : `🌙 Ratrimana Nighttime: ${panchang.sunsetTime} to Next Sunrise`}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-500">
                      8 Choghadiya Slots
                    </span>
                  </div>

                  {/* 8 Choghadiya Slots Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {(choghadiyaPeriod === 'DAY'
                      ? panchang.choghadiya.daySlots
                      : panchang.choghadiya.nightSlots
                    ).map((slot, idx) => {
                      const meta = CHOGHADIYA_META[slot.name] || CHOGHADIYA_META.Shubh;
                      return (
                        <div
                          key={`${choghadiyaPeriod}-${idx}-${slot.name}`}
                          className={`p-3 rounded-xl border ${meta.bg} ${meta.border} space-y-1.5 transition-all shadow-xs`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-sm text-[#163A36]">
                              {slot.name} <span className="font-normal text-xs text-gray-500">({meta.hindi})</span>
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${meta.badgeClass}`}
                            >
                              {slot.nature === 'Shubh' ? 'Shubh' : slot.nature === 'Neutral' ? 'Char' : 'Avoid'}
                            </span>
                          </div>

                          <div className="font-mono text-xs font-bold text-[#163A36]">
                            {slot.start} – {slot.end}
                          </div>

                          <div className="text-[10px] text-gray-500 flex items-center justify-between pt-0.5 border-t border-gray-200/50">
                            <span>Lord: {slot.ruler}</span>
                          </div>

                          <p className="text-[10px] text-[#2B211E]/70 leading-snug">
                            {meta.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Classical Guidance Note */}
                  <div className="p-3 rounded-xl bg-white border border-[#E6D5B8] text-[11px] text-[#2B211E]/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Classical Rule:</strong> <strong>Amrit (अमृत)</strong>, <strong>Shubh (शुभ)</strong>, and <strong>Labh (लाभ)</strong> are prime auspicious muhurats for all beginnings, agreements, ceremonies, and investments. <strong>Char / Chal (चल)</strong> is ideal for journeys and travel. Avoid starting major endeavors during <strong>Rog (रोग)</strong>, <strong>Kaal (काल)</strong>, or <strong>Udveg (उद्वेग)</strong>.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Accuracy & Pandit Consultation Disclaimer */}
            <p className="text-[11px] text-center text-gray-500 italic pt-1">
              Timings are calculated for the selected city and may vary by a few minutes between panchang sources. For important rituals, please consult your pandit.
            </p>

            {/* Bottom Consultation Link */}
            <div className="pt-2 border-t border-[#E6D5B8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left space-y-0.5">
                <span className="text-xs font-bold text-[#163A36] block">
                  Planning an Auspicious Milestone, Griha Pravesh, or Venture?
                </span>
                <p className="text-[11px] text-[#2B211E]/70">
                  Book a personalized Muhurat & Kundali consultation with Falgun Thakkr.
                </p>
              </div>

              {onOpenConsultation && (
                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="px-5 py-2.5 rounded-full bg-[#163A36] hover:bg-[#0E2623] text-[#F7F1E6] text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shrink-0 group"
                >
                  <span>Book Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E6B55A] group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================================
          DATE & CALENDAR PICKER MODAL (Supports Any Past or Future Date)
         ========================================================================= */}
      <AnimatePresence>
        {isDatePickerOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101827]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-[#E6D5B8] overflow-hidden text-[#163A36]"
            >
              {/* Header */}
              <div className="bg-[#163A36] text-[#F7F1E6] p-5 flex items-center justify-between border-b border-[#315C52]">
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className="w-5 h-5 text-[#E6B55A]" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Select Panchang Date</h3>
                    <p className="text-xs text-[#E6D5B8]/80 font-sans">View Vedic Almanac for any past, present, or future day</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close date picker"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">

                {/* Year & Month Selection Controls */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Month Selector */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#163A36]/70 mb-1">
                      Month
                    </label>
                    <select
                      value={calendarMonth}
                      onChange={(e) => setCalendarMonth(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#D9D2C3] bg-[#FAF7F0] text-sm font-semibold text-[#163A36] focus:outline-none focus:border-[#E6B55A] cursor-pointer"
                    >
                      {MONTH_NAMES.map((name, idx) => (
                        <option key={name} value={idx}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selector (1900 to 2050) */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#163A36]/70 mb-1">
                      Year
                    </label>
                    <select
                      value={calendarYear}
                      onChange={(e) => setCalendarYear(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#D9D2C3] bg-[#FAF7F0] text-sm font-semibold text-[#163A36] focus:outline-none focus:border-[#E6B55A] cursor-pointer"
                    >
                      {Array.from({ length: 151 }, (_, i) => 2050 - i).map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calendar Days Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-serif font-bold text-[#163A36]">
                      {MONTH_NAMES[calendarMonth]} {calendarYear}
                    </span>
                    <span className="text-[11px] text-gray-500 font-sans">
                      Select a day below:
                    </span>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {WEEKDAY_NAMES.map((w) => (
                      <span key={w} className="text-[10px] font-bold uppercase text-gray-400 py-1">
                        {w}
                      </span>
                    ))}
                  </div>

                  {/* Day numbers */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {/* Empty padding for days before the 1st */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-full h-9" />
                    ))}

                    {/* Actual day buttons */}
                    {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((dayNum) => {
                      const isSelected =
                        selectedDate.getFullYear() === calendarYear &&
                        selectedDate.getMonth() === calendarMonth &&
                        selectedDate.getDate() === dayNum;

                      const isCurrentToday =
                        new Date().getFullYear() === calendarYear &&
                        new Date().getMonth() === calendarMonth &&
                        new Date().getDate() === dayNum;

                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => handleSelectSpecificDate(calendarYear, calendarMonth, dayNum)}
                          className={`w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#163A36] text-[#E6B55A] font-bold shadow-md scale-105'
                              : isCurrentToday
                              ? 'bg-amber-100 text-[#163A36] font-bold border-2 border-[#E6B55A]'
                              : 'hover:bg-[#FAF6EE] text-[#163A36] border border-transparent'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Native Date Input Field */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Direct date:</span>
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [y, m, d] = e.target.value.split('-').map(Number);
                          if (y && m && d) {
                            handleSelectSpecificDate(y, m - 1, d);
                          }
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#D9D2C3] bg-white text-xs font-medium text-[#163A36] focus:outline-none focus:border-[#E6B55A] cursor-pointer"
                    />
                  </div>

                  {/* Quick Shortcut Buttons */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        handleSelectSpecificDate(today.getFullYear(), today.getMonth(), today.getDate());
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#E6D5B8] text-xs font-bold text-[#163A36] transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tmrw = new Date();
                        tmrw.setDate(tmrw.getDate() + 1);
                        handleSelectSpecificDate(tmrw.getFullYear(), tmrw.getMonth(), tmrw.getDate());
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#E6D5B8] text-xs font-bold text-[#163A36] transition-colors cursor-pointer"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          WORLDWIDE LOCATION SELECTOR MODAL (Auto-Detect, USA, Global, Custom Search)
         ========================================================================= */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101827]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-[#E6D5B8] overflow-hidden text-[#163A36]"
            >
              {/* Header */}
              <div className="bg-[#163A36] text-[#F7F1E6] p-5 flex items-center justify-between border-b border-[#315C52]">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-[#E6B55A]" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Select Location for Panchang</h3>
                    <p className="text-xs text-[#E6D5B8]/80 font-sans">Search and select your city for accurate Panchang calculations</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsLocationModalOpen(false); }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close location selector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">

                {/* Search / Custom City Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Search City or Country (USA, UK, India, Canada, etc.)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Type e.g. New York, London, Dallas, Ahmedabad, Toronto..."
                      className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-[#D9D2C3] bg-[#FAF7F0] text-sm text-[#163A36] focus:outline-none focus:border-[#E6B55A]"
                    />
                    {locationSearch.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          const customLoc = locationSearch.trim();
                          setLocation(customLoc);
                          localStorage.setItem('shiv_dhara_panchang_location', customLoc);
                          setIsLocationModalOpen(false);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#163A36] text-[#E6B55A] text-xs font-bold hover:bg-[#0E2623] cursor-pointer"
                      >
                        Use "{locationSearch.trim()}"
                      </button>
                    )}
                  </div>
                </div>

                {/* Region Category Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { id: 'ALL', label: 'All Global' },
                    { id: 'USA', label: '🇺🇸 USA' },
                    { id: 'INDIA', label: '🇮🇳 India' },
                    { id: 'UK', label: '🇬🇧 UK' },
                    { id: 'CANADA', label: '🇨🇦 Canada' },
                    { id: 'AUSTRALIA', label: '🇦🇺 Australia' },
                    { id: 'OTHER', label: '🌍 Global' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLocationCategory(tab.id as any)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        locationCategory === tab.id
                          ? 'bg-[#163A36] text-[#E6B55A]'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Cities List */}
                <div className="max-h-60 overflow-y-auto space-y-1 border border-[#D9D2C3] rounded-2xl p-2 bg-[#FAF7F0]/50 divide-y divide-gray-100">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((item) => {
                      const isCurrent = location === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setLocation(item.label);
                            localStorage.setItem('shiv_dhara_panchang_location', item.label);
                            setIsLocationModalOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-[#163A36] text-[#E6B55A] font-bold'
                              : 'hover:bg-white text-[#163A36]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#E6B55A]' : 'text-gray-400'}`} />
                            <span>{item.label}</span>
                          </div>
                          <span className={`text-[10px] ${isCurrent ? 'text-emerald-300' : 'text-gray-400'}`}>
                            {item.region}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No matching predefined cities found.{' '}
                      {locationSearch.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocation(locationSearch.trim());
                            localStorage.setItem('shiv_dhara_panchang_location', locationSearch.trim());
                            setIsLocationModalOpen(false);
                          }}
                          className="font-bold text-[#163A36] underline ml-1 cursor-pointer"
                        >
                          Click here to set "{locationSearch.trim()}" as your location.
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};