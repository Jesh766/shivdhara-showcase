import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Phone,
  ShieldCheck,
  MessageCircle,
  Check,
  Plus,
  Crown,
} from 'lucide-react';
import { Consultation } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { recordFormSubmission } from '../../lib/analytics';
import { getLenis } from '../../lib/lenis';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export interface ServicePlan {
  title: string;
  price: number;
  duration: string;
  desc: string;
  badge?: string;
  isAllInOne?: boolean;
  includes: string[];
}

export const servicePricing: Record<string, ServicePlan> = {
  'Personal Numerology': {
    title: 'Personal Numerology',
    price: 5000,
    duration: '60 Minutes',
    desc: 'Deep dive into your date of birth, life destiny numbers, and energetic alignments.',
    includes: [
      'DOB Analysis',
      'Name Analysis',
      'Mulank & Bhagyank',
      'Lucky Numbers, Stone, Colors',
      'Lucky Direction',
      'Health, Money & Relationship',
      'Lucky Rudraksha, Bracelets',
    ],
  },
  'Business Name': {
    title: 'Business Name',
    price: 5000,
    duration: '60 Minutes',
    desc: 'Commercial name vibration tuning, brand growth, and auspicious direction alignment.',
    includes: [
      "Owner's DOB Analysis",
      'Business Name Suggestions',
      'Lucky Direction',
      'Lucky Numbers, Stone, Colors',
      'Lucky Rudraksha, Bracelets',
    ],
  },
  'Name Numerology': {
    title: 'Name Numerology',
    price: 3500,
    duration: '45 Minutes',
    desc: 'Name vibration correction, spelling tuning, and personal career resonance.',
    includes: [
      'DOB Analysis',
      'Name Analysis',
      'Mulank & Bhagyank',
      'Health, Money & Relationship',
      'Lucky Numbers, Stone, Colors',
      'Lucky Rudraksha, Bracelets',
      'Name Change Suggestion',
    ],
  },
  'Marriage Compatibility': {
    title: 'Marriage Compatibility',
    price: 5000,
    duration: '60 Minutes',
    desc: 'Deep two-chart synastry, partner harmony analysis, and mutual destiny alignment.',
    includes: [
      'Both DOB Analysis',
      'Marriage Compatibility Analysis',
      'Mulank & Bhagyank Analysis',
      'Name Analysis',
      'Health, Money & Relationship',
      'Lucky Numbers, Stone, Colors',
      'Lucky Rudraksha, Bracelets',
    ],
  },
  'Baby Name': {
    title: 'Baby Name',
    price: 2500,
    duration: '45 Minutes',
    desc: 'Sacred first-letter selection and auspicious Vedic naming for newborn prosperity.',
    includes: [
      'DOB Analysis',
      'Baby Name Suggestions',
      'Mulank & Bhagyank',
      'Health, Money & Relationship',
      'Lucky Numbers, Stone, Colors',
      'Lucky Rudraksha, Bracelets',
    ],
  },
  'Mobile Number': {
    title: 'Mobile Number',
    price: 2500,
    duration: '30 Minutes',
    desc: 'Digit frequency audit and lucky phone number selection for wealth & relationships.',
    includes: [
      'Mobile Number Correction',
      'Lucky Mobile Number Selection',
    ],
  },
  'Kundali & Vastu Report': {
    title: 'Kundali & Vastu Report',
    price: 2500,
    duration: 'Written PDF Report',
    desc: 'Detailed written Numerology & Vastu Kundali report delivered to WhatsApp & Email (No call required).',
    includes: [
      'Full Numerology & Vastu Kundali Chart',
      'Written Report via WhatsApp & Email',
      'Auspicious Directions & Remedies',
      'Prescribed Gemstones & Yantras',
    ],
  },
  'Complete Life Mastery (All-in-One)': {
    title: 'Complete Life Mastery (All-in-One)',
    price: 15000,
    duration: '120 Mins Master Session + Dossier',
    desc: 'The ultimate sacred alignment: Personal & Business Numerology, Name Tuning, Marriage Harmony, Auspicious Baby Naming, Lucky Mobile, and complete Vastu Kundali remedies.',
    badge: '⭐ Most Chosen • Flagship Sacred Alignment',
    isAllInOne: true,
    includes: [
      'Full Personal & Business Numerology',
      'Name Correction & Spelling Resonance',
      'Marriage & Partner Compatibility',
      'Auspicious Baby & Family Naming',
      'Lucky Mobile Number Selection',
      'Vastu Kundali Spatial Audit',
      'Prescribed Gemstones & Rudrakshas',
      'Comprehensive Written PDF Dossier',
    ],
  },
};

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  initialService = 'Personal Numerology',
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Multi-selection of services
  const [selectedServices, setSelectedServices] = useState<string[]>(() => [initialService]);

  useEffect(() => {
    if (isOpen && initialService) {
      setSelectedServices([initialService]);
      setStep(1);
    }
  }, [isOpen, initialService]);

  const [format, setFormat] = useState<'ONLINE_VIDEO' | 'IN_PERSON_AHMEDABAD'>('ONLINE_VIDEO');

  // Tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const ALL_STANDARD_SLOTS = [
    '10:00 AM',
    '11:30 AM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM',
    '06:30 PM',
  ];

  const [date, setDate] = useState(minDateStr);
  const [availableSlots, setAvailableSlots] = useState<string[]>(ALL_STANDARD_SLOTS);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('11:30 AM');

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [partnerDob, setPartnerDob] = useState('');
  const [mobileAuditNumber, setMobileAuditNumber] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment / Flat');
  const [seekerLocation, setSeekerLocation] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('shiv_dhara_user_location') ||
        localStorage.getItem('shiv_dhara_panchang_location') ||
        ''
      );
    } catch {
      return '';
    }
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Consultation | null>(null);

  const { showToast } = useToast();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Guarantee mouse-wheel scrolling inside modal by pausing Lenis and trapping scroll events
  useEffect(() => {
    if (isOpen) {
      const lenis = getLenis();
      lenis?.stop();
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleWheel = (e: WheelEvent) => {
        // If wheel is over modal or backdrop, scroll the inner container directly
        const target = e.target as HTMLElement | null;
        if (target?.closest('#consultation-modal-backdrop') && scrollContainerRef.current) {
          e.stopPropagation();
          // If cursor is outside the scroll container (e.g. on backdrop or header), scroll container
          if (!target.closest('#consultation-scroll-container')) {
            e.preventDefault();
            scrollContainerRef.current.scrollTop += e.deltaY;
          }
        }
      };

      window.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        lenis?.start();
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('wheel', handleWheel);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.name);
      if (!email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Handle plan toggle (Multi-selection)
  const toggleServicePlan = (key: string) => {
    setSelectedServices((prev) => {
      // If clicking All-in-One, make it the sole selection (it already contains everything)
      if (key === 'Complete Life Mastery (All-in-One)') {
        if (prev.includes(key)) {
          return ['Personal Numerology'];
        }
        return [key];
      }

      // If All-in-One was already selected, switch to specific selection
      let filtered = prev.filter((s) => s !== 'Complete Life Mastery (All-in-One)');

      if (filtered.includes(key)) {
        if (filtered.length > 1) {
          return filtered.filter((s) => s !== key);
        }
        return filtered; // Keep at least one selected
      } else {
        return [...filtered, key];
      }
    });
  };

  // Pricing & duration calculations
  const totalPrice = selectedServices.reduce(
    (sum, key) => sum + (servicePricing[key]?.price || 0),
    0
  );

  const combinedServicesTitle =
    selectedServices.length === 1
      ? selectedServices[0]
      : selectedServices.join(' + ');

  const combinedDuration = selectedServices.includes('Complete Life Mastery (All-in-One)')
    ? '120 Minutes Master Session'
    : selectedServices.length > 1
    ? `${Math.min(120, selectedServices.length * 45)} Mins Combined Session`
    : servicePricing[selectedServices[0]]?.duration || '60 Minutes';

  // Fetch slots on date change
  const fetchAvailability = (targetDate = date) => {
    if (!targetDate) return;
    fetch(`/api/consultations?date=${targetDate}`)
      .then((res) => res.json())
      .then((data) => {
        const unavailable = data.unavailableSlots || [];
        setUnavailableSlots(unavailable);
        const available =
          data.availableSlots ||
          ALL_STANDARD_SLOTS.filter((s: string) => !unavailable.includes(s));
        setAvailableSlots(available);
        if (
          unavailable.includes(selectedSlot) ||
          (!available.includes(selectedSlot) && available.length > 0)
        ) {
          setSelectedSlot(available[0] || '');
        }
      })
      .catch(() => {
        setAvailableSlots(ALL_STANDARD_SLOTS);
        setUnavailableSlots([]);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchAvailability(date);
    }
  }, [date, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return showToast('Error', 'Please provide your full name', 'error');
    if (!phone.trim()) return showToast('Error', 'Please provide your WhatsApp phone number', 'error');
    if (!email.trim()) return showToast('Error', 'Please provide your email address', 'error');
    if (!dob.trim()) return showToast('Error', 'Please provide your date of birth for chart casting', 'error');
    if (!selectedSlot) return showToast('Error', 'Please pick an available time slot', 'error');

    setSubmitting(true);

    const bookingPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      service: combinedServicesTitle,
      services: selectedServices,
      location: seekerLocation.trim() || undefined,
      type: (format === 'ONLINE_VIDEO' ? 'ONLINE_VIDEO' : 'IN_PERSON') as 'ONLINE_VIDEO' | 'IN_PERSON',
      date,
      time: selectedSlot,
      price: totalPrice,
      duration: combinedDuration,
      status: 'PENDING_APPROVAL' as const,
      dateOfBirth: dob || undefined,
      birthTime: birthTime || undefined,
      partnerDob: partnerDob || undefined,
      mobileAuditNumber: mobileAuditNumber || undefined,
      propertyType: selectedServices.some((s) => s.includes('Vastu') || s.includes('Mastery'))
        ? propertyType
        : undefined,
      message: message || undefined,
      createdAt: new Date().toISOString(),
    };

    const localConsultation: Consultation = {
      ...bookingPayload,
      id: `cons-${Date.now()}`,
    };

    // 1. Instantly persist to local storage
    try {
      const existing = JSON.parse(localStorage.getItem('shiv_dhara_consultations') || '[]');
      existing.unshift(localConsultation);
      localStorage.setItem('shiv_dhara_consultations', JSON.stringify(existing));
    } catch (e) {
      console.warn('Could not cache consultation locally', e);
    }

    // 2. Track in live analytics
    recordFormSubmission('consultations', {
      service: combinedServicesTitle,
      name: name.trim(),
      phone: phone.trim(),
      date,
      time: selectedSlot,
    });

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({}));
        showToast(
          'Slot No Longer Available',
          errorData.error || `The ${selectedSlot} slot on ${date} is already reserved. Please choose another time slot.`,
          'error'
        );
        setStep(2);
        fetchAvailability(date);
        return;
      }

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.consultation) {
          setConfirmedBooking(data.consultation);
        } else {
          setConfirmedBooking(localConsultation);
        }
      } else {
        // Graceful fallback to local booking so seeker is never blocked
        setConfirmedBooking(localConsultation);
      }
    } catch (err: any) {
      console.warn('Network issue or offline mode, proceeding with confirmed local appointment:', err);
      setConfirmedBooking(localConsultation);
    } finally {
      setSubmitting(false);
    }

    setStep(4);
    showToast(
      'Appointment Submitted!',
      'Opening WhatsApp to send your details directly to Falgun Thakkr...',
      'success'
    );

    // Automatically trigger WhatsApp direct dispatch to Falgun Thakkr (+91 63596 66315)
    const autoWaMsg = `Namaste Falgunji, I have requested an appointment on the SHIV DHARA website.

Booking Ref: ${localConsultation.id.toUpperCase()}
Name: ${name.trim()}
Phone: ${phone.trim()}
Email: ${email.trim()}
Location: ${seekerLocation.trim() || 'Not specified'}
Service: ${combinedServicesTitle} (${format === 'ONLINE_VIDEO' ? 'Online Zoom' : 'In-Person'})
Requested Date: ${date}
Requested Time: ${selectedSlot} (IST)
Tuition: ₹${totalPrice.toLocaleString('en-IN')}
${dob ? `DOB: ${dob} ${birthTime ? `(${birthTime})` : ''}\n` : ''}${message ? `Focus / Questions: ${message}\n` : ''}
Please confirm my appointment slot. Thank you!`;

    const autoWaUrl = `https://wa.me/916359666315?text=${encodeURIComponent(autoWaMsg)}`;
    try {
      window.open(autoWaUrl, '_blank');
    } catch {
      // browser popup blocker handled by UI button in Step 4
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setConfirmedBooking(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="consultation-modal-backdrop"
      data-lenis-prevent
      className="fixed inset-0 z-50 bg-[#101827]/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 lg:p-6 overflow-hidden"
    >
      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#F7F3EA] text-[#101827] w-full max-w-full sm:max-w-4xl lg:max-w-6xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl border-0 sm:border border-[#D9D2C3] flex flex-col overflow-hidden relative"
      >
        {/* ===================================================================
            PINNED STICKY HEADER
           =================================================================== */}
        <div className="bg-[#101827] text-[#F7F3EA] px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#C8A45D]/30 shrink-0 z-20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C8A45D]/20 border border-[#C8A45D]/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#C8A45D]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base lg:text-lg font-serif tracking-wider uppercase text-[#F7F3EA]">
                Book a Personal Consultation
              </h2>
              <p className="text-[10px] sm:text-xs text-[#D9D2C3]/70 font-sans">
                Direct Guidance with Falgun Thakkr • SHIV DHARA
              </p>
            </div>
          </div>

          <button
            id="close-consultation-modal-btn"
            onClick={resetAndClose}
            className="p-1.5 sm:p-2 text-[#D9D2C3]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close consultation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================================
            PINNED STEP INDICATOR
           =================================================================== */}
        {step < 4 && (
          <div className="bg-[#EDE8DE] px-4 sm:px-8 py-2.5 flex items-center justify-between border-b border-[#D9D2C3] shrink-0 text-xs z-10">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold ${
                  step >= 1 ? 'bg-[#101827] text-[#F7F3EA]' : 'bg-[#D9D2C3] text-[#101827]'
                }`}
              >
                1
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-[#101827]">
                1. Select Plans ({selectedServices.length})
              </span>
            </div>
            <div className="h-[1px] flex-1 mx-2 sm:mx-4 bg-[#D9D2C3]" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold ${
                  step >= 2 ? 'bg-[#101827] text-[#F7F3EA]' : 'bg-[#D9D2C3] text-[#101827]'
                }`}
              >
                2
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-[#101827]">
                2. Date & Time
              </span>
            </div>
            <div className="h-[1px] flex-1 mx-2 sm:mx-4 bg-[#D9D2C3]" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold ${
                  step >= 3 ? 'bg-[#101827] text-[#F7F3EA]' : 'bg-[#D9D2C3] text-[#101827]'
                }`}
              >
                3
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-[#101827]">
                3. Seeker Profile
              </span>
            </div>
          </div>
        )}

        {/* ===================================================================
            SCROLLABLE MODAL BODY
           =================================================================== */}
        <div
          id="consultation-scroll-container"
          ref={scrollContainerRef}
          data-lenis-prevent
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 overscroll-contain space-y-6"
        >
          
          {/* Direct Concierge Banner */}
          {step < 4 && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#163A36] via-[#1A4440] to-[#0E2623] text-[#F7F1E6] border border-[#E6B55A]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E6B55A]">
                    Immediate Concierge Booking
                  </span>
                </div>
                <p className="text-xs text-[#E6D5B8] font-medium">
                  Prefer scheduling directly with Falgun Thakkr over WhatsApp or Call?
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <a
                  href={`https://wa.me/916359666315?text=${encodeURIComponent(
                    `Namaste Falgunji, I would like to schedule a personal consultation session with SHIV DHARA for: ${combinedServicesTitle}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Concierge</span>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 text-[#E6B55A]">
                    Recommended
                  </span>
                </a>

                <a
                  href="tel:+916359666315"
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#C56A45] hover:bg-[#D47E5B] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Direct</span>
                </a>
              </div>
            </div>
          )}

          {/* ===================================================================
              STEP 1: SELECT CONSULTATION PLANS (Multi-Select Enabled!)
             =================================================================== */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9D2C3]/60 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#101827]">
                    1. Choose Consultation Disciplines
                  </h3>
                  <p className="text-xs text-[#101827]/70">
                    You can select <strong>multiple plans</strong> at once. Each session is individually conducted by Falgun Thakkr.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#163A36] text-[#E6B55A] text-xs font-mono font-bold shrink-0 self-start sm:self-auto">
                  <span>{selectedServices.length} Selected • ₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Plans Grid (3 columns on Desktop, 2 on Tablet, 1 on Mobile) - All-in-One strictly at the end */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  ...Object.keys(servicePricing).filter((k) => k !== 'Complete Life Mastery (All-in-One)'),
                  'Complete Life Mastery (All-in-One)',
                ].map((key) => {
                  const item = servicePricing[key];
                  const isSelected = selectedServices.includes(key);
                  const isAllInOne = item.isAllInOne;

                  return (
                    <div
                      key={key}
                      onClick={() => toggleServicePlan(key)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative group ${
                        isAllInOne ? 'md:col-span-2 lg:col-span-3' : ''
                      } ${
                        isSelected
                          ? 'border-[#C8A45D] bg-white shadow-xl ring-2 ring-[#C8A45D]/40'
                          : 'border-[#D9D2C3] bg-[#FAF7F0] hover:border-[#B8AF9C] hover:bg-white'
                      }`}
                    >
                      <div>
                        {/* Top bar: Badge/Duration + Price + Selection Checkbox */}
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#D9D2C3]/40">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.badge ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-700" />
                                <span>{item.badge}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A6833D] bg-[#A6833D]/10 px-2.5 py-0.5 rounded-full">
                                {item.duration}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-base sm:text-lg font-serif font-bold text-[#101827]">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'border-2 border-gray-300 text-transparent group-hover:border-gray-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-sm sm:text-base font-serif font-bold text-[#101827] mt-3 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#101827]/70 leading-relaxed font-sans">
                          {item.desc}
                        </p>
                      </div>

                      {/* Clean Non-Messy Includes Tags */}
                      {item.includes && item.includes.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-[#D9D2C3]/60">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#101827]/50 block mb-1">
                            What it includes:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {item.includes.map((inc, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-white border border-[#D9D2C3] text-[#163A36] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1"
                              >
                                <span className="w-1 h-1 rounded-full bg-[#C8A45D]" />
                                {inc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Consultation Format Options */}
              <div className="p-4 rounded-2xl bg-white border border-[#D9D2C3] space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101827]">
                  Preferred Consultation Medium
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('ONLINE_VIDEO')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      format === 'ONLINE_VIDEO'
                        ? 'bg-[#101827] text-[#F7F3EA] border-[#101827]'
                        : 'bg-white border-[#D9D2C3] text-[#101827] hover:bg-[#EDE8DE]'
                    }`}
                  >
                    <Video className="w-4 h-4 text-[#C8A45D]" />
                    <span>Online Video (Zoom HD)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('IN_PERSON_AHMEDABAD')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      format === 'IN_PERSON_AHMEDABAD'
                        ? 'bg-[#101827] text-[#F7F3EA] border-[#101827]'
                        : 'bg-white border-[#D9D2C3] text-[#101827] hover:bg-[#EDE8DE]'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[#C8A45D]" />
                    <span>In-Person / On-Site (Ahmedabad)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              STEP 2: DATE AND TIME SLOT SELECTION
             =================================================================== */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#101827] mb-1">
                  2. Choose Appointment Date & Available Slot
                </h3>
                <p className="text-xs text-[#101827]/70">
                  Times are listed in Indian Standard Time (IST / UTC+5:30). If you are in USA or abroad, Falgun Thakkr will coordinate suitable timezone adjustments via WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C8A45D]" />
                    <span>Consultation Date</span>
                  </label>
                  <input
                    type="date"
                    min={minDateStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D] shadow-sm cursor-pointer"
                  />
                  <p className="text-[11px] text-[#101827]/60 mt-1.5">
                    Sessions are scheduled at least 24 hours in advance to allow Falgun Thakkr to study your charts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C8A45D]" />
                      <span>Time Slot Selection</span>
                    </span>
                    <span className="text-[10px] font-normal text-[#101827]/60">
                      {availableSlots.length} available
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {ALL_STANDARD_SLOTS.map((slot) => {
                      const isUnavailable = unavailableSlots.includes(slot);
                      const isSelected = selectedSlot === slot && !isUnavailable;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => !isUnavailable && setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center justify-between ${
                            isUnavailable
                              ? 'bg-[#EDE8DE]/60 border-dashed border-[#D9D2C3] text-gray-400 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-[#101827] text-[#F7F3EA] border-[#101827] shadow-sm ring-2 ring-[#C8A45D]'
                              : 'bg-white border-[#D9D2C3] text-[#101827] hover:border-[#A6833D] hover:bg-[#FAF7F0] cursor-pointer'
                          }`}
                        >
                          <span className={isUnavailable ? 'line-through text-gray-400' : 'font-semibold'}>
                            {slot}
                          </span>
                          {isUnavailable ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              Booked
                            </span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Available" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-[#EDE8DE] border border-[#D9D2C3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-[#101827]/70 block">Selected Plans ({selectedServices.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedServices.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-white text-[#163A36] text-xs font-bold border border-[#D9D2C3]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs text-[#101827]/70 block">Total Tuition</span>
                  <p className="text-lg font-serif font-bold text-[#101827]">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              STEP 3: SEEKER CONTACT & DETAILED PROFILE + LOCATION
             =================================================================== */}
          {step === 3 && (
            <form id="consultation-step3-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#101827] mb-1">
                  3. Seeker Profile & Location Alignment
                </h3>
                <p className="text-xs text-[#101827]/70">
                  Your information is strictly confidential. Location helps Falgun Thakkr map solar trajectories and Vastu coordinates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your full legal or calling name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D]"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210 (Include country code if outside India)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D]"
                    />
                  </div>
                </div>

                {/* Seeker City / Country (Location) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1 flex items-center justify-between">
                    <span>Your City / Country (Location)</span>
                    <span className="text-[10px] text-[#A6833D] font-mono">Visible to Falgunji</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Ahmedabad, Gujarat, India or New York, USA"
                      value={seekerLocation}
                      onChange={(e) => setSeekerLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D]"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                    Date of Birth (DOB) *
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D] cursor-pointer"
                  />
                </div>

                {/* Birth Time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                    Birth Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D] cursor-pointer"
                  />
                </div>

                {/* Additional conditional fields */}
                {selectedServices.includes('Marriage Compatibility') && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                      Partner's Date of Birth (For Compatibility)
                    </label>
                    <input
                      type="date"
                      value={partnerDob}
                      onChange={(e) => setPartnerDob(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D] cursor-pointer"
                    />
                  </div>
                )}

                {selectedServices.includes('Mobile Number') && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                      Current Phone Number to Analyze
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={mobileAuditNumber}
                      onChange={(e) => setMobileAuditNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D]"
                    />
                  </div>
                )}
              </div>

              {/* Inquiries or Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                  Specific Questions or Context for Falgun Thakkr
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us what you wish to focus on: career, enterprise expansion, relationship harmony, health vibrations, etc."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D]"
                />
              </div>
            </form>
          )}

          {/* ===================================================================
              STEP 4: SUCCESS RECEIPT & APPROVAL PENDING
             =================================================================== */}
          {step === 4 && confirmedBooking && (() => {
            const waApprovalMsg = `Namaste Falgunji, I have submitted a consultation request on the SHIV DHARA website.

Booking Ref: ${confirmedBooking.id.toUpperCase()}
Name: ${confirmedBooking.name}
Phone: ${confirmedBooking.phone}
Location: ${confirmedBooking.location || 'Not provided'}
Discipline: ${confirmedBooking.service} (${confirmedBooking.type === 'ONLINE_VIDEO' ? 'Online Zoom' : 'In-Person'})
Requested Date: ${confirmedBooking.date}
Requested Time: ${confirmedBooking.time}
Tuition: ₹${confirmedBooking.price?.toLocaleString('en-IN')}

Please check your availability and confirm approval so I can proceed with the payment. Thank you!`;

            const waDirectUrl = `https://wa.me/916359666315?text=${encodeURIComponent(waApprovalMsg)}`;

            return (
              <div className="text-center py-2 space-y-6">
                <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 mx-auto flex items-center justify-center text-amber-700 shadow-sm">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>

                <div>
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-100 text-amber-900 border border-amber-300 inline-block">
                    REQUEST SENT • APPROVAL PENDING
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#101827] mt-2">
                    Consultation Request Received!
                  </h3>
                  <p className="text-xs text-[#101827]/75 max-w-lg mx-auto mt-2 leading-relaxed">
                    Thank you, <strong>{confirmedBooking.name}</strong>. Your request has been sent to our sanctuary desk. Falgun Thakkr is reviewing your requested slot for <strong>{confirmedBooking.date}</strong> at <strong>{confirmedBooking.time}</strong>. Approval will be sent to you shortly via WhatsApp and Email.
                  </p>
                </div>

                {/* 4-Step Next Journey Flow */}
                <div className="max-w-lg mx-auto bg-white p-5 rounded-2xl border border-[#D9D2C3] shadow-sm text-left space-y-3">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#163A36] border-b border-[#D9D2C3] pb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C8A45D]" />
                    <span>What Happens Next (Approval & Payment Process)</span>
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <p className="text-gray-700">
                        <strong>Availability Review:</strong> Falgun Thakkr verifies schedule availability for {confirmedBooking.date} at {confirmedBooking.time}.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <p className="text-gray-700">
                        <strong>Approval Notification:</strong> You will receive an approval message on WhatsApp ({confirmedBooking.phone}) and Email ({confirmedBooking.email}).
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <p className="text-gray-700">
                        <strong>Payment via WhatsApp:</strong> Consultation fee (₹{confirmedBooking.price?.toLocaleString('en-IN')}) is completed on WhatsApp to confirm and lock your slot.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <p className="text-gray-700">
                        <strong>Session Details:</strong> Private Zoom HD meeting link and preparation guidelines are dispatched directly to your WhatsApp chat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instant WhatsApp & Email Dispatch CTAs */}
                <div className="max-w-lg mx-auto p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex flex-col gap-3">
                  <div className="text-left space-y-0.5">
                    <span className="text-xs font-bold text-emerald-950 block">Instant WhatsApp & Email Confirmation</span>
                    <p className="text-[11px] text-emerald-800">
                      Send your appointment details directly to Falgun Thakkr so your slot is locked in real-time.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <a
                      href={waDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Send to Falgun Thakkr on WhatsApp</span>
                      <span className="text-[9px] font-sans font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                        Recommended
                      </span>
                    </a>

                    <a
                      href={`mailto:contact@shivdhara.co.in?subject=${encodeURIComponent(
                        `Consultation Request: ${confirmedBooking.name} - ${confirmedBooking.service} (${confirmedBooking.date})`
                      )}&body=${encodeURIComponent(waApprovalMsg)}`}
                      className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#163A36] hover:bg-[#0E2623] text-[#F7F1E6] text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                    >
                      <Mail className="w-4 h-4 text-[#E6B55A]" />
                      <span>Email Details</span>
                    </a>
                  </div>
                </div>

                {/* Booking Voucher Summary */}
                <div className="max-w-lg mx-auto p-5 rounded-2xl bg-[#EDE8DE] border border-[#D9D2C3] shadow-sm text-left space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-[#D9D2C3]">
                    <span className="text-xs font-mono text-gray-500">
                      Ref: {confirmedBooking.id.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      APPROVAL PENDING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                        Discipline(s)
                      </span>
                      <span className="font-semibold text-[#101827]">
                        {confirmedBooking.service}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                        Session Format
                      </span>
                      <span className="font-semibold text-[#101827]">
                        {confirmedBooking.type === 'ONLINE_VIDEO' ? 'Zoom HD Video' : 'In-Person'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                        Requested Slot
                      </span>
                      <span className="font-semibold text-[#101827]">
                        {confirmedBooking.date} • {confirmedBooking.time}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                        Total Tuition
                      </span>
                      <span className="font-semibold text-[#101827]">
                        ₹{confirmedBooking.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {confirmedBooking.location && (
                      <div className="col-span-2">
                        <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                          Seeker Location
                        </span>
                        <span className="font-semibold text-[#101827] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{confirmedBooking.location}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-8 py-3 rounded-full bg-[#101827] hover:bg-[#182236] text-[#F7F3EA] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md"
                >
                  Close & Return to Sanctuary
                </button>
              </div>
            );
          })()}

        </div>

        {/* ===================================================================
            PINNED STICKY FOOTER (Always Visible on Laptop & Mobile)
           =================================================================== */}
        {step < 4 && (
          <div className="bg-white px-4 sm:px-8 py-3.5 sm:py-4 border-t border-[#D9D2C3] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 z-20 shadow-lg">
            
            {/* Left: Selected Plans Pill & Back Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="px-4 py-2 rounded-xl border border-[#D9D2C3] text-xs font-semibold uppercase tracking-wider text-[#101827] hover:bg-[#FAF7F0] cursor-pointer"
                >
                  ← Back
                </button>
              )}

              <div className="text-left">
                <span className="text-[10px] font-mono uppercase font-bold text-gray-400 block">
                  {selectedServices.length} {selectedServices.length === 1 ? 'Plan' : 'Plans'} Selected
                </span>
                <span className="text-sm sm:text-base font-serif font-bold text-[#163A36]">
                  Total: ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Right: Step Action Button */}
            <div className="w-full sm:w-auto flex justify-end">
              {step === 1 && (
                <button
                  type="button"
                  disabled={selectedServices.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#101827] hover:bg-[#182236] text-[#F7F3EA] text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span>Continue to Date & Slot</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A45D]" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#101827] hover:bg-[#182236] text-[#F7F3EA] text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Continue to Seeker Profile</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A45D]" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="submit"
                  form="consultation-step3-form"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#C56A45] hover:bg-[#D47E5B] text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Request for Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}

      </motion.div>
    </div>
  );
};