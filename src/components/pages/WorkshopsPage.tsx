import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Users, Sparkles, CheckCircle2, ArrowRight, X, ShieldCheck, Mail, Phone, User, Lock, MessageCircle, QrCode, Upload, Copy, Check, Minus, SlidersHorizontal } from 'lucide-react';
import { Workshop } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getAdminToken } from '../../lib/auth';
import { QRCodeSVG } from 'qrcode.react';
import { PAYMENT_CONFIG } from '../../lib/paymentConfig';

interface WorkshopsPageProps {
  onOpenConsultation: () => void;
  selectedWorkshopInitial?: Workshop | null;
  editorMode?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: (minimized: boolean) => void;
  onExitEditorMode?: () => void;
  onUpdateSiteSettings?: (settings: any) => void;
}

export const WorkshopsPage: React.FC<WorkshopsPageProps> = ({
  onOpenConsultation,
  selectedWorkshopInitial = null,
  editorMode = false,
  isMinimized = false,
  onToggleMinimize,
  onExitEditorMode,
  onUpdateSiteSettings,
}) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Numerology' | 'Vastu' | 'Meditation'>('ALL');
  const [activeModalWorkshop, setActiveModalWorkshop] = useState<Workshop | null>(selectedWorkshopInitial);

  // Registration Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSeats, setRegSeats] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState<any | null>(null);
  const [draftWorkshop, setDraftWorkshop] = useState<Workshop | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Payment flow state
  const [regStep, setRegStep] = useState<'details' | 'payment'>('details');
  const [payMethod, setPayMethod] = useState<'WHATSAPP' | 'UPI_QR'>('WHATSAPP');
  const [utrNumber, setUtrNumber] = useState('');
  const [payScreenshot, setPayScreenshot] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();

  const fetchWorkshops = () => {
    fetch('/api/workshops')
      .then(res => res.json())
      .then(data => {
        if (data.workshops) {
          setWorkshops(data.workshops);
        }
      })
      .catch(err => console.error('Failed to load workshops', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  useEffect(() => {
    if (selectedWorkshopInitial) {
      setActiveModalWorkshop(selectedWorkshopInitial);
    }
  }, [selectedWorkshopInitial]);

  const saveWorkshop = async () => {
    if (!draftWorkshop) return;

    setSaveState('saving');
    setSaveMessage('Saving...');
    const token = getAdminToken();
    const isNew = !workshops.some(item => item.id === draftWorkshop.id);

    const priceVal = draftWorkshop.isFree
      ? 0
      : (draftWorkshop.price !== null && draftWorkshop.price !== undefined && draftWorkshop.price !== ('' as any)
          ? Number(draftWorkshop.price)
          : null);

    const sanitizedWorkshop = {
      ...draftWorkshop,
      title: draftWorkshop.title?.trim() || 'Sacred Wisdom Circle',
      price: priceVal,
      isFree: Boolean(draftWorkshop.isFree),
      category: draftWorkshop.category || 'Meditation',
      isOnline: draftWorkshop.isOnline ?? true,
      location: draftWorkshop.location || (draftWorkshop.isOnline ? 'Online Zoom' : 'Sanctuary Office, Ahmedabad'),
      description: draftWorkshop.description?.trim() || 'Join Falgun Thakkr for this sacred alignment cohort.',
      tagline: draftWorkshop.tagline || 'A guided transformational experience.',
      date: draftWorkshop.date || new Date().toISOString().split('T')[0],
      displayDate: draftWorkshop.displayDate || 'Upcoming Cohort',
      capacity: draftWorkshop.capacity ? Number(draftWorkshop.capacity) : 25,
      registeredCount: draftWorkshop.registeredCount || 0,
      status: draftWorkshop.status || 'OPEN',
      isComingSoon: draftWorkshop.status === 'COMING_SOON',
      isSoldOut: draftWorkshop.status === 'SOLD_OUT',
      active: true,
      image: draftWorkshop.image || 'https://images.unsplash.com/photo-1517841905240-472988c2477c?auto=format&fit=crop&w=800&q=80',
    };

    try {
      const url = isNew ? '/api/editor/workshops' : `/api/editor/workshops/${draftWorkshop.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(sanitizedWorkshop),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Save failed (${response.status})`);
      }

      fetchWorkshops();
      setDraftWorkshop(null);
      setSaveState('saved');
      setSaveMessage('Saved successfully');
    } catch (error) {
      console.error('Workshop save failed', error);
      setSaveState('error');
      setSaveMessage(error instanceof Error ? error.message : 'Save failed. Restart the server and try again.');
    }
  };

  const deleteWorkshop = async (workshopId: string) => {
    const token = getAdminToken();
    try {
      const response = await fetch(`/api/editor/workshops/${workshopId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': token,
        },
      });

      if (response.ok) {
        setDraftWorkshop(null);
        fetchWorkshops();
      }
    } catch (error) {
      console.error('Workshop delete failed', error);
    }
  };

  const handleWorkshopImageUpload = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      console.error('Please choose an image file');
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.65);
      setDraftWorkshop((previous) => previous ? { ...previous, image: imageData } : previous);
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => URL.revokeObjectURL(objectUrl);
    image.src = objectUrl;
  };

  const isPaidWorkshop = (w: Workshop | null) =>
    w !== null && !w.isFree && w.price !== null && w.price !== undefined && Number(w.price) > 0;

  const isComingSoonWorkshop = (w: Workshop | null) =>
    w !== null && (w.status === 'COMING_SOON' || (w as any).isComingSoon === true);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalWorkshop || !regName || !regEmail || !regPhone) {
      showToast('Missing Details', 'Please provide name, email, and phone.', 'error');
      return;
    }

    // For paid workshops, go to payment step first
    if (isPaidWorkshop(activeModalWorkshop) && regStep === 'details') {
      setRegStep('payment');
      return;
    }

    // For paid workshops via WhatsApp path: open WhatsApp then register
    if (isPaidWorkshop(activeModalWorkshop) && regStep === 'payment' && payMethod === 'WHATSAPP') {
      const total = (activeModalWorkshop.price! * regSeats).toLocaleString('en-IN');
      const msg = encodeURIComponent(
        `🙏 Workshop Registration — ${activeModalWorkshop.title}\n\nName: ${regName}\nEmail: ${regEmail}\nPhone: ${regPhone}\nSeats: ${regSeats}\nTotal: ₹${total}\n\nPlease confirm my seat reservation.`
      );
      window.open(`https://wa.me/916359666315?text=${msg}`, '_blank');
      // Register with WHATSAPP payment method
      await submitRegistration({ paymentMethod: 'WHATSAPP' });
      return;
    }

    // For paid workshops via UPI QR path
    if (isPaidWorkshop(activeModalWorkshop) && regStep === 'payment' && payMethod === 'UPI_QR') {
      if (!utrNumber.trim()) {
        showToast('UTR Required', 'Please enter the UTR / Transaction reference number.', 'error');
        return;
      }
      await submitRegistration({ paymentMethod: 'UPI_QR', utr: utrNumber.trim(), paymentScreenshot: payScreenshot || undefined });
      return;
    }

    // Free / no-price workshops: direct registration
    await submitRegistration({});
  };

  const submitRegistration = async (extra: Record<string, any>) => {
    if (!activeModalWorkshop) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/workshops/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: activeModalWorkshop.id,
          name: regName,
          email: regEmail,
          phone: regPhone,
          seats: regSeats,
          ...extra,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      setRegisteredSuccess(data.registration);
      showToast(
        'Seat Reserved',
        `You are confirmed for ${activeModalWorkshop.title}. Welcome to the cohort!`,
        'success'
      );
      fetchWorkshops();
    } catch (err: any) {
      showToast('Registration Error', err.message || 'Could not register for workshop', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScreenshotUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPayScreenshot(e.target?.result as string || '');
    reader.readAsDataURL(file);
  };

  const closeModal = () => {
    setActiveModalWorkshop(null);
    setRegisteredSuccess(null);
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegSeats(1);
    setRegStep('details');
    setPayMethod('WHATSAPP');
    setUtrNumber('');
    setPayScreenshot('');
  };

  const filtered = categoryFilter === 'ALL'
    ? workshops
    : workshops.filter(w =>
        (w.category && w.category.toLowerCase() === categoryFilter.toLowerCase()) ||
        (w.title || '').toLowerCase().includes(categoryFilter.toLowerCase()) ||
        (w.tagline || '').toLowerCase().includes(categoryFilter.toLowerCase()) ||
        (w.description || '').toLowerCase().includes(categoryFilter.toLowerCase())
      );

  return (
    <div id="page-workshops" className="min-h-screen bg-[#F7F3EA] text-[#101827] pt-28 sm:pt-32 pb-20">
      {/* NOTE: Minimized pill is now rendered globally in App.tsx so it
          persists across all page navigation. Only the EXPANDED panel lives here. */}

      {/* Expanded Editor Panel */}
      {editorMode && !isMinimized && (
        <div className="editor-panel-scroll fixed left-3 right-3 top-20 z-40 flex max-h-[calc(100vh-6rem)] w-auto flex-col overflow-y-scroll overscroll-contain rounded-2xl border border-[#D9D2C3] bg-[#FFFDF9]/95 p-4 shadow-2xl backdrop-blur-md pointer-events-auto sm:left-auto sm:right-4 sm:top-24 sm:max-h-[calc(100vh-7rem)] sm:w-[340px]">
          <div className="mb-3 flex items-center justify-between border-b border-[#D9D2C3]/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A6833D]">Workshops Editor</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">Live</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDraftWorkshop({
                  id: `ws-${Date.now()}`,
                  title: 'New Sacred Workshop',
                  slug: 'new-sacred-workshop',
                  tagline: 'A guided transformational experience.',
                  description: 'Describe the learning journey and outcomes.',
                  detailedOverview: ['Module 1', 'Module 2'],
                  image: 'https://images.unsplash.com/photo-1517841905240-472988c2477c?auto=format&fit=crop&w=800&q=80',
                  date: '2026-11-15',
                  displayDate: '15 Nov 2026',
                  startTime: '18:30',
                  endTime: '20:30',
                  duration: '2 hours',
                  location: 'Online Zoom',
                  isOnline: true,
                  capacity: 25,
                  registeredCount: 0,
                  price: 4999,
                  instructor: 'Falgun Thakkr',
                  instructorBio: 'Guided by ritual wisdom and practical insight.',
                  highlights: ['Personal guidance', 'Practical tools'],
                  curriculum: [{ phase: '1', title: 'Foundation', desc: 'Learn the core system.' }],
                  active: true,
                })}
                className="rounded-full bg-[#101827] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#F7F3EA] hover:bg-[#182236] cursor-pointer"
              >
                + Add
              </button>
              <button
                type="button"
                onClick={() => onToggleMinimize?.(true)}
                title="Minimize Editor"
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/70 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Minimize Editor"
              >
                <Minus className="w-4 h-4" />
              </button>
              {onExitEditorMode && (
                <button
                  type="button"
                  onClick={onExitEditorMode}
                  title="Close & Exit Editor Mode"
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  aria-label="Close & Exit Editor"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {draftWorkshop ? (
            <div className="space-y-3 text-xs text-[#101827]">
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Title</span>
                  <input
                    value={draftWorkshop.title}
                    onChange={(e) => setDraftWorkshop((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                    className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
                  />
                </label>

                {/* Category Selection */}
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Discipline / Category</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Numerology', 'Vastu', 'Meditation'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setDraftWorkshop(prev => prev ? { ...prev, category: cat } : prev)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          (draftWorkshop.category || 'Meditation') === cat
                            ? 'bg-[#101827] text-[#F7F3EA] border-[#101827] shadow-xs'
                            : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#A6833D]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </label>

                {/* Format (Live Zoom vs In-Person) & Location */}
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Format & Sanctuary Location</span>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => setDraftWorkshop(prev => prev ? { ...prev, isOnline: true, location: 'Online Zoom' } : prev)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        draftWorkshop.isOnline
                          ? 'bg-[#163A36] text-[#F7F1E6] border-[#163A36] shadow-xs'
                          : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#163A36]'
                      }`}
                    >
                      Live Zoom (Online)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftWorkshop(prev => prev ? { ...prev, isOnline: false, location: prev.location === 'Online Zoom' ? 'Sanctuary Office, Ahmedabad' : prev.location } : prev)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        !draftWorkshop.isOnline
                          ? 'bg-[#C56A45] text-white border-[#C56A45] shadow-xs'
                          : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#C56A45]'
                      }`}
                    >
                      In-Person (Sanctuary)
                    </button>
                  </div>
                  <input
                    value={draftWorkshop.location || ''}
                    onChange={(e) => setDraftWorkshop((prev) => prev ? { ...prev, location: e.target.value } : prev)}
                    placeholder={draftWorkshop.isOnline ? 'e.g. Live Zoom Interactive' : 'e.g. 206 Jalaram Complex, Ahmedabad'}
                    className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 text-xs focus:border-[#C8A45D] focus:outline-none"
                  />
                </label>

                {/* Pricing Structure */}
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Pricing Structure</span>
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setDraftWorkshop(prev => prev ? { ...prev, isFree: false, price: prev.price && prev.price > 0 ? prev.price : 4999 } : prev)}
                      className={`py-1.5 px-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        !draftWorkshop.isFree && draftWorkshop.price !== null && draftWorkshop.price !== undefined && draftWorkshop.price > 0
                          ? 'bg-[#101827] text-[#F7F3EA] border-[#101827] shadow-xs'
                          : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#A6833D]'
                      }`}
                    >
                      Paid (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftWorkshop(prev => prev ? { ...prev, isFree: true, price: 0 } : prev)}
                      className={`py-1.5 px-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        draftWorkshop.isFree
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-emerald-700'
                      }`}
                    >
                      Free Offering
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftWorkshop(prev => prev ? { ...prev, isFree: false, price: null } : prev)}
                      className={`py-1.5 px-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        !draftWorkshop.isFree && (draftWorkshop.price === null || draftWorkshop.price === undefined || draftWorkshop.price === 0)
                          ? 'bg-[#8F4829] text-white border-[#8F4829] shadow-xs'
                          : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#8F4829]'
                      }`}
                    >
                      Hide (No Price)
                    </button>
                  </div>
                  {!draftWorkshop.isFree && draftWorkshop.price !== null && draftWorkshop.price !== undefined && (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        placeholder="Enter amount in ₹ (e.g. 4999)"
                        value={draftWorkshop.price ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          setDraftWorkshop((prev) => prev ? { ...prev, price: val } : prev);
                        }}
                        className="w-full rounded-lg border border-[#D9D2C3] bg-white pl-7 pr-3 py-2 text-xs focus:border-[#C8A45D] focus:outline-none"
                      />
                    </div>
                  )}
                  {draftWorkshop.isFree && (
                    <p className="text-[10px] text-emerald-800 bg-emerald-50 rounded-lg p-2 font-medium">
                      ✓ Marked as a sacred <b>Free Offering</b> to seekers.
                    </p>
                  )}
                  {!draftWorkshop.isFree && (draftWorkshop.price === null || draftWorkshop.price === undefined || draftWorkshop.price === 0) && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 rounded-lg p-2 font-medium">
                      ✓ No amount or 'Free' badge will be shown. Cohort renders cleanly without price tag.
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Workshop Status</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { val: 'OPEN', label: 'Open / Live', activeClass: 'bg-emerald-700 text-white border-emerald-700' },
                      { val: 'COMING_SOON', label: 'Coming Soon', activeClass: 'bg-amber-600 text-white border-amber-600' },
                      { val: 'SOLD_OUT', label: 'Sold Out', activeClass: 'bg-rose-700 text-white border-rose-700' },
                    ] as const).map(({ val, label, activeClass }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDraftWorkshop(prev => prev ? { ...prev, status: val } : prev)}
                        className={`py-1.5 px-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          (draftWorkshop.status || 'OPEN') === val
                            ? `${activeClass} shadow-xs`
                            : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#A6833D]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Seat Capacity & Remaining</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-gray-500 block mb-0.5">Total Seats</span>
                      <input
                        type="number"
                        min={1}
                        value={draftWorkshop.capacity ?? 25}
                        onChange={(e) => setDraftWorkshop(prev => prev ? { ...prev, capacity: Number(e.target.value) } : prev)}
                        className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-1.5 text-xs focus:border-[#C8A45D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block mb-0.5">Seats Booked</span>
                      <input
                        type="number"
                        min={0}
                        value={draftWorkshop.registeredCount ?? 0}
                        onChange={(e) => setDraftWorkshop(prev => prev ? { ...prev, registeredCount: Number(e.target.value) } : prev)}
                        className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-1.5 text-xs focus:border-[#C8A45D] focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-[9px] text-gray-500">
                    Remaining: <strong className="text-[#101827]">{Math.max(0, (draftWorkshop.capacity ?? 25) - (draftWorkshop.registeredCount ?? 0))}</strong> seats
                  </p>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Date</span>
                  <input
                    type="date"
                    value={draftWorkshop.date}
                    onChange={(e) => setDraftWorkshop((prev) => prev ? { ...prev, date: e.target.value } : prev)}
                    className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Image URL</span>
                  <input
                    value={draftWorkshop.image}
                    onChange={(e) => setDraftWorkshop((prev) => prev ? { ...prev, image: e.target.value } : prev)}
                    className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Or choose from computer</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleWorkshopImageUpload(e.target.files?.[0])}
                    className="block w-full rounded-lg border border-[#D9D2C3] bg-white px-2 py-2 text-[10px] text-[#101827] file:mr-2 file:rounded-md file:border-0 file:bg-[#101827] file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-[#F7F3EA]"
                  />
                  {draftWorkshop.image && (
                    <img
                      src={draftWorkshop.image}
                      alt="Workshop preview"
                      className="mt-2 h-20 w-full rounded-lg border border-[#D9D2C3] bg-[#EDE8DE] object-contain"
                    />
                  )}
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Description</span>
                  <textarea
                    rows={4}
                    value={draftWorkshop.description}
                    onChange={(e) => setDraftWorkshop((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                    className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveWorkshop}
                  disabled={saveState === 'saving'}
                  className="flex-1 rounded-xl bg-[#101827] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F7F3EA] disabled:cursor-wait disabled:opacity-60"
                >
                  {saveState === 'saving' ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setDraftWorkshop(null)}
                  className="rounded-xl border border-[#D9D2C3] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#101827]"
                >
                  Cancel
                </button>
              </div>

              {saveMessage && (
                <p className={`max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-[10px] leading-relaxed ${saveState === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {saveMessage}
                </p>
              )}

              <button
                type="button"
                onClick={() => deleteWorkshop(draftWorkshop.id)}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-red-700"
              >
                Delete workshop
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {workshops.slice(0, 5).map((workshop) => (
                <button
                  key={workshop.id}
                  type="button"
                  onClick={() => setDraftWorkshop(workshop)}
                  className="flex w-full items-center justify-between rounded-xl border border-[#D9D2C3] bg-white px-3 py-2 text-left text-xs"
                >
                  <span className="font-medium text-[#101827]">{workshop.title}</span>
                  <span className="text-[#A6833D]">₹{(workshop.price || 0).toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-[#101827] text-[#F7F3EA] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,164,93,0.15)_0%,_rgba(16,24,39,1)_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#182236] border border-[#C8A45D]/40 text-[#DFC38A] text-xs font-bold uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5 text-[#C8A45D]" />
            <span>Interactive Sacred Cohorts</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-[#F7F3EA] font-light">
            Live Wisdom Circles & Masterclasses
          </h1>
          <p className="text-sm sm:text-base text-[#D9D2C3]/80 max-w-2xl mx-auto leading-relaxed font-sans">
            Intimate group masterclasses led by Falgun Thakkr. Learn directly through practical diagnostic case studies, guided pranayama, and real spatial blueprints.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {(['ALL', 'Numerology', 'Vastu', 'Meditation'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#101827] text-[#F7F3EA] shadow-md ring-2 ring-[#C8A45D]'
                  : 'bg-white border border-[#D9D2C3] text-[#101827] hover:border-[#C8A45D]'
              }`}
            >
              {cat === 'ALL' ? 'All Wisdom Circles' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Workshops Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-96 rounded-2xl bg-[#EDE8DE] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#D9D2C3] p-8 max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-[#C8A45D] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-serif font-bold text-[#101827]">
              No cohorts currently scheduled in this category
            </h3>
            <p className="text-xs text-[#101827]/70 mt-1 mb-6">
              New dates are announced on the 1st of every month. You can also request a private 1-on-1 consultation.
            </p>
            <button
              onClick={() => setCategoryFilter('ALL')}
              className="px-6 py-2.5 rounded-full bg-[#101827] text-[#F7F3EA] text-xs font-bold uppercase tracking-wider"
            >
              View All Circles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filtered.map(workshop => {
              const seatsLeft = (workshop.capacity || 25) - (workshop.registeredCount || 0);
              const isComingSoon = workshop.status === 'COMING_SOON' || (workshop as any).isComingSoon || (workshop.title || '').toLowerCase().includes('coming soon');
              const isSoldOut = workshop.status === 'SOLD_OUT' || (!isComingSoon && seatsLeft <= 0);

              return (
                <div
                  key={workshop.id}
                  className="rounded-2xl bg-white border border-[#D9D2C3] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Banner */}
                    <div
                      className="relative min-h-56 max-h-[28rem] overflow-hidden bg-[#182236] flex items-center justify-center cursor-pointer"
                      onClick={() => setActiveModalWorkshop(workshop)}
                    >
                      <img
                        src={workshop.image}
                        alt={workshop.title}
                        className="block h-auto max-h-[28rem] w-auto max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101827]/80 via-transparent to-transparent" />

                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#101827]/90 text-[#DFC38A] border border-[#C8A45D]/40 backdrop-blur-sm">
                          {workshop.category || (workshop.title.includes('Numerology') ? 'Numerology' : workshop.title.includes('Vastu') ? 'Vastu' : 'Meditation')}
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        {isComingSoon && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                            Coming Soon
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#101827] shadow-sm">
                          {workshop.isOnline ? 'Live Zoom HD' : 'In-Person Studio'}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                        {isComingSoon ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                            <Clock className="w-3 h-3" />
                            <span>Curating Soon</span>
                          </span>
                        ) : isSoldOut ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300 bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-500/40">
                            <span>Sold Out</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
                            <Users className="w-3.5 h-3.5" />
                            <span>{seatsLeft} seats remaining</span>
                          </span>
                        )}
                        <span className="text-sm font-serif font-bold text-[#DFC38A]">
                          {isComingSoon
                            ? 'Announcing Soon'
                            : workshop.isFree
                              ? 'Free Offering'
                              : (workshop.price !== null && workshop.price !== undefined && workshop.price > 0)
                                ? `₹${workshop.price.toLocaleString('en-IN')}`
                                : ''}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3 text-xs text-[#101827]/65">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C8A45D]" />
                          <span>{workshop.displayDate || workshop.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C8A45D]" />
                          <span>{workshop.startTime || workshop.duration}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-serif font-bold text-[#101827] leading-snug group-hover:text-[#A6833D] transition-colors">
                        {workshop.title}
                      </h3>

                      <p className="text-xs text-[#101827]/70 font-sans leading-relaxed">
                        {workshop.description}
                      </p>

                      {/* Syllabus Bullets */}
                      {workshop.curriculum && (
                        <div className="pt-2 border-t border-[#D9D2C3]/60 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#A6833D] block">
                            Key Masterclass Modules
                          </span>
                          {workshop.curriculum.slice(0, 3).map((mod: any, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-[#101827]/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C8A45D] shrink-0" />
                              <span className="truncate">
                                {typeof mod === 'string' ? mod : (mod.title || mod.phase || mod.desc || '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="p-6 pt-0">
                    {isComingSoon ? (
                      <a
                        href={`https://wa.me/916359666315?text=${encodeURIComponent(`🙏 Namaste Falgun ji, I saw your upcoming workshop "${workshop.title}" on the website. Please notify me as soon as registrations open!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 rounded-xl bg-[#163A36] text-[#F7F1E6] text-xs font-bold tracking-[0.16em] uppercase hover:bg-[#0E2623] flex items-center justify-center gap-2 transition-colors shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#DFC38A]" />
                        <span>Notify Me on WhatsApp</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => setActiveModalWorkshop(workshop)}
                        disabled={isSoldOut}
                        className="w-full py-3.5 rounded-xl bg-[#101827] text-[#F7F3EA] text-xs font-bold tracking-[0.16em] uppercase hover:bg-[#182236] flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer shadow-md group-hover:bg-[#182236]"
                      >
                        <span>{!isSoldOut ? 'Reserve Sacred Seat' : 'Sold Out'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C8A45D]" />
                      </button>
                    )}
                    {editorMode && (
                      <button
                        type="button"
                        onClick={() => setDraftWorkshop(workshop)}
                        className="mt-2 w-full rounded-xl border border-[#D9D2C3] bg-[#FAF7F0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#101827]"
                      >
                        Edit workshop
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Registration Modal */}
      <AnimatePresence>
        {activeModalWorkshop && (
          <div id="workshop-registration-modal" className="fixed inset-0 z-50 bg-[#101827]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F7F3EA] text-[#101827] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#D9D2C3] overflow-hidden my-8"
            >
              {/* Header */}
              <div className="bg-[#101827] text-[#F7F3EA] p-6 flex items-center justify-between border-b border-[#C8A45D]/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C8A45D]/20 border border-[#C8A45D] flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#C8A45D]" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#F7F3EA]">
                      Workshop Registration
                    </h3>
                    <p className="text-xs text-[#D9D2C3]/70 font-sans">
                      {activeModalWorkshop.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="p-1.5 text-[#D9D2C3]/70 hover:text-white rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8">
                {registeredSuccess ? (
                  <div className="text-center py-4 space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 mx-auto flex items-center justify-center text-emerald-700 shadow-sm">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase text-[#A6833D]">
                        Registration Confirmed
                      </span>
                      <h3 className="text-2xl font-serif font-bold text-[#101827] mt-1">
                        Welcome to the Circle, {registeredSuccess.name}
                      </h3>
                      <p className="text-xs text-[#101827]/70 max-w-md mx-auto mt-2 leading-relaxed">
                        Your seat in <strong>{activeModalWorkshop.title}</strong> is reserved. Joining instructions and masterclass preparation materials have been sent to your email.
                      </p>
                    </div>

                    {/* Voucher */}
                    <div className="p-4 rounded-xl bg-white border border-[#D9D2C3] shadow-sm text-left space-y-2 text-xs">
                      <div className="flex justify-between pb-2 border-b border-[#D9D2C3]">
                        <span className="text-gray-500">Booking Ref:</span>
                        <span className="font-mono font-bold text-[#101827]">
                          {registeredSuccess.id.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date & Time:</span>
                        <span className="font-semibold text-[#101827]">
                          {activeModalWorkshop.displayDate || activeModalWorkshop.date} at {activeModalWorkshop.startTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Format:</span>
                        <span className="font-semibold text-[#101827]">
                          {activeModalWorkshop.isOnline ? 'Zoom HD Interactive' : 'In-Person Studio'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Investment:</span>
                        <span className="font-bold text-[#101827]">
                          {activeModalWorkshop.isFree
                            ? 'Free Offering'
                            : (activeModalWorkshop.price !== null && activeModalWorkshop.price !== undefined && activeModalWorkshop.price > 0)
                              ? `₹${(activeModalWorkshop.price * registeredSuccess.seats).toLocaleString('en-IN')}`
                              : 'Complimentary'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={closeModal}
                      className="px-8 py-3 rounded-full bg-[#101827] text-[#F7F3EA] text-xs font-bold tracking-widest uppercase hover:bg-[#182236]"
                    >
                      Done
                    </button>
                  </div>
                ) : isComingSoonWorkshop(activeModalWorkshop) ? (
                  <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
                    <div className="space-y-5">
                      <div className="flex min-h-[280px] max-h-[520px] items-center justify-center overflow-hidden rounded-2xl border border-[#D9D2C3] bg-[#182236] p-2">
                        <img
                          src={activeModalWorkshop.image}
                          alt={activeModalWorkshop.title}
                          className="block h-auto max-h-[500px] w-auto max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500 text-white shadow-xs">
                            Coming Soon
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A6833D]">
                            {activeModalWorkshop.isOnline ? 'Live online workshop' : 'In-person workshop'}
                          </span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-[#101827]">
                          {activeModalWorkshop.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#101827]/75">
                          {activeModalWorkshop.description}
                        </p>
                      </div>

                      {activeModalWorkshop.curriculum?.length > 0 && (
                        <div className="rounded-xl border border-[#D9D2C3] bg-white p-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A6833D]">What you will explore</span>
                          <div className="mt-2 space-y-2 text-xs text-[#101827]/75">
                            {activeModalWorkshop.curriculum.map((module, index) => (
                              <p key={`${module.title}-${index}`}>
                                <span className="font-bold text-[#101827]">{module.title || module.phase}:</span> {module.desc}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coming Soon Notice Panel (No booking allowed) */}
                    <div className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white p-6 sm:p-8 shadow-sm">
                      <div className="space-y-5 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center text-amber-700 shadow-sm">
                          <Lock className="w-8 h-8" />
                        </div>

                        <div>
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full">
                            Sacred Cohort Curating
                          </span>
                          <h3 className="text-2xl font-serif font-bold text-[#101827] mt-3">
                            Registrations Opening Soon
                          </h3>
                          <p className="text-xs text-[#101827]/75 mt-2 leading-relaxed">
                            This wisdom circle is currently being scheduled and prepared by <strong>Falgun Thakkr</strong>. Official dates, curriculum syllabus, and seat tuitions will be announced shortly.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-amber-200 text-left text-xs space-y-2 shadow-xs">
                          <div className="flex items-center gap-2 text-amber-900 font-bold">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Early Access & Priority Notification</span>
                          </div>
                          <p className="text-gray-600 text-[11px] leading-relaxed">
                            Since seats in every sacred cohort are strictly limited, you can request early priority notification directly with our sanctuary desk on WhatsApp.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-100 text-[11px] text-amber-900">
                          🔒 Direct online bookings are paused until cohort schedule and pricing are officially released.
                        </div>
                      </div>

                      <div className="pt-6 space-y-3">
                        <a
                          href={`https://wa.me/916359666315?text=${encodeURIComponent(`🙏 Namaste Falgun ji, I saw your upcoming workshop "${activeModalWorkshop.title}" on the website. Please notify me as soon as registrations open!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 rounded-xl bg-[#163A36] text-[#F7F1E6] hover:bg-[#0E2623] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          <MessageCircle className="w-4 h-4 text-[#DFC38A]" />
                          <span>Get Notified on WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={closeModal}
                          className="w-full py-2.5 rounded-xl border border-[#D9D2C3] bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          Close Preview
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
                    <div className="space-y-5">
                      <div className="flex min-h-[280px] max-h-[520px] items-center justify-center overflow-hidden rounded-2xl border border-[#D9D2C3] bg-[#182236] p-2">
                        <img
                          src={activeModalWorkshop.image}
                          alt={activeModalWorkshop.title}
                          className="block h-auto max-h-[500px] w-auto max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A6833D]">
                          {activeModalWorkshop.isOnline ? 'Live online workshop' : 'In-person workshop'}
                        </span>
                        <h2 className="mt-1 text-2xl font-serif font-bold text-[#101827]">
                          {activeModalWorkshop.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#101827]/75">
                          {activeModalWorkshop.description}
                        </p>
                      </div>

                      {activeModalWorkshop.curriculum?.length > 0 && (
                        <div className="rounded-xl border border-[#D9D2C3] bg-white p-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A6833D]">What you will explore</span>
                          <div className="mt-2 space-y-2 text-xs text-[#101827]/75">
                            {activeModalWorkshop.curriculum.map((module, index) => (
                              <p key={`${module.title}-${index}`}>
                                <span className="font-bold text-[#101827]">{module.title || module.phase}:</span> {module.desc}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step 1: Seeker Details */}
                    {regStep === 'details' ? (
                      <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        {/* Summary Info */}
                        <div className="p-4 rounded-xl bg-[#EDE8DE] border border-[#D9D2C3] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-500 block">Schedule</span>
                            <span className="font-bold text-[#101827]">
                              {activeModalWorkshop.displayDate || activeModalWorkshop.date} • {activeModalWorkshop.startTime}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-500 block">Tuition per Seat</span>
                            <span className="font-bold font-serif text-[#101827] text-sm">
                              {activeModalWorkshop.isFree
                                ? 'Free Offering'
                                : (activeModalWorkshop.price !== null && activeModalWorkshop.price !== undefined && activeModalWorkshop.price > 0)
                                  ? `₹${activeModalWorkshop.price.toLocaleString('en-IN')}`
                                  : 'Open Cohort'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                            Your Full Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              required
                              placeholder="Full Name"
                              value={regName}
                              onChange={e => setRegName(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                value={regEmail}
                                onChange={e => setRegEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#101827] mb-1">
                              Phone / WhatsApp *
                            </label>
                            <div className="relative">
                              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="tel"
                                required
                                placeholder="+91 98765 43210"
                                value={regPhone}
                                onChange={e => setRegPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#101827] focus:outline-none focus:border-[#C8A45D]"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#101827]">
                              Number of Seats
                            </label>
                            {activeModalWorkshop.isFree ? (
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                Free Offering ({regSeats} {regSeats === 1 ? 'Seat' : 'Seats'})
                              </span>
                            ) : (activeModalWorkshop.price !== null && activeModalWorkshop.price !== undefined && activeModalWorkshop.price > 0) ? (
                              <span className="text-sm font-bold font-serif text-[#C56A45]">
                                Total: ₹{(activeModalWorkshop.price * regSeats).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-gray-500">
                                {regSeats} {regSeats === 1 ? 'Seat' : 'Seats'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-xl border border-[#D9D2C3] bg-white p-1 shadow-sm">
                              <button
                                type="button"
                                onClick={() => setRegSeats(prev => Math.max(1, prev - 1))}
                                disabled={regSeats <= 1}
                                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-[#101827]"
                                aria-label="Decrease seats"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-bold text-sm text-[#101827]">
                                {regSeats}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRegSeats(prev => prev + 1)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg hover:bg-gray-100 transition-colors cursor-pointer text-[#101827]"
                                aria-label="Increase seats"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-xs text-[#101827]/60">
                              {activeModalWorkshop.isFree
                                ? 'Complimentary wisdom cohort reservation.'
                                : (activeModalWorkshop.price !== null && activeModalWorkshop.price !== undefined && activeModalWorkshop.price > 0)
                                  ? `₹${activeModalWorkshop.price.toLocaleString('en-IN')} per seat`
                                  : 'Open cohort reservation (no charge).'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#101827]/70 pt-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Instant confirmation & Zoom meeting invitation link sent upon registration.</span>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-[#D9D2C3]">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-7 py-3 rounded-full bg-[#101827] text-[#F7F3EA] text-xs font-bold tracking-widest uppercase hover:bg-[#182236] transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                          >
                            {submitting ? (
                              <span>Processing...</span>
                            ) : isPaidWorkshop(activeModalWorkshop) ? (
                              <>
                                <span>Proceed to Payment • ₹{(activeModalWorkshop.price! * regSeats).toLocaleString('en-IN')}</span>
                                <ArrowRight className="w-4 h-4 text-[#C8A45D]" />
                              </>
                            ) : (
                              <>
                                <span>
                                  {activeModalWorkshop.isFree
                                    ? `Reserve ${regSeats} Free Seat${regSeats > 1 ? 's' : ''}`
                                    : `Reserve ${regSeats} Seat${regSeats > 1 ? 's' : ''}`}
                                </span>
                                <ArrowRight className="w-4 h-4 text-[#C8A45D]" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Step 2: Payment Step (for Paid Workshops) */
                      <div className="space-y-4">
                        {/* Summary Header */}
                        <div className="p-4 rounded-xl bg-[#163A36] text-[#F7F1E6] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[#DFC38A] block font-bold uppercase tracking-wider text-[10px]">
                              Total Tuition Payable
                            </span>
                            <span className="text-xl font-bold font-serif text-[#F7F1E6]">
                              ₹{(activeModalWorkshop.price! * regSeats).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-white/70 block">{regName}</span>
                            <span className="text-[#DFC38A] font-medium">{regSeats} {regSeats === 1 ? 'Seat' : 'Seats'}</span>
                          </div>
                        </div>

                        {/* Payment Method Tabs */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#101827]/70 mb-1.5">
                            Select Payment Method
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPayMethod('UPI_QR')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                payMethod === 'UPI_QR'
                                  ? 'bg-[#101827] text-white border-[#101827] shadow-sm'
                                  : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#101827]'
                              }`}
                            >
                              <QrCode className="w-4 h-4" />
                              <span>Instant UPI QR</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPayMethod('WHATSAPP')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                payMethod === 'WHATSAPP'
                                  ? 'bg-[#128C7E] text-white border-[#128C7E] shadow-sm'
                                  : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#128C7E]'
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>WhatsApp Desk</span>
                              <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Recommended
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* UPI QR View */}
                        {payMethod === 'UPI_QR' ? (
                          <div className="p-4 rounded-2xl bg-white border border-[#D9D2C3] space-y-4">
                            <div className="text-center">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 block">
                                Scan with any UPI App
                              </span>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Google Pay, PhonePe, Paytm, BHIM or Mobile Banking
                              </p>

                              {/* QR Code Container */}
                              <div className="mt-3 inline-block p-2 rounded-2xl bg-white border-2 border-[#163A36] shadow-md max-w-xs">
                                {PAYMENT_CONFIG.UPI_QR_IMAGE_URL ? (
                                  <img
                                    src={PAYMENT_CONFIG.UPI_QR_IMAGE_URL}
                                    alt="UPI QR Code"
                                    className="w-48 sm:w-56 h-auto object-contain rounded-xl mx-auto"
                                  />
                                ) : (
                                  <QRCodeSVG
                                    value={`upi://pay?pa=${PAYMENT_CONFIG.UPI_ID}&pn=${encodeURIComponent(PAYMENT_CONFIG.BUSINESS_NAME)}&am=${activeModalWorkshop.price! * regSeats}&cu=INR&tn=Workshop-${encodeURIComponent(activeModalWorkshop.title.slice(0, 20))}`}
                                    size={160}
                                    level="M"
                                  />
                                )}
                              </div>

                              {/* UPI ID copy */}
                              <div className="mt-2.5 flex items-center justify-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#101827] bg-gray-100 px-3 py-1 rounded-lg">
                                  {PAYMENT_CONFIG.UPI_ID}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(PAYMENT_CONFIG.UPI_ID);
                                    setCopiedUpi(true);
                                    setTimeout(() => setCopiedUpi(false), 2000);
                                  }}
                                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                  title="Copy UPI ID"
                                >
                                  {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                              <span className="text-[10px] text-gray-400 block mt-0.5">
                                Payee: {PAYMENT_CONFIG.BUSINESS_NAME}
                              </span>
                            </div>

                            {/* UTR Input */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#101827]">
                                12-Digit UTR / Transaction Reference ID *
                              </label>
                              <input
                                type="text"
                                required
                                value={utrNumber}
                                onChange={e => setUtrNumber(e.target.value)}
                                placeholder="e.g. 432109876543"
                                className="w-full rounded-xl border border-[#D9D2C3] bg-white px-3 py-2 text-xs font-mono focus:border-[#C8A45D] focus:outline-none"
                              />
                              <p className="text-[10px] text-gray-500">
                                Found in your UPI app payment receipt details.
                              </p>
                            </div>

                            {/* Screenshot proof (optional) */}
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#101827]">
                                  Payment Screenshot (Optional)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => screenshotInputRef.current?.click()}
                                  className="text-[10px] font-bold text-[#A6833D] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>{payScreenshot ? 'Change File' : 'Upload'}</span>
                                </button>
                              </div>
                              <input
                                ref={screenshotInputRef}
                                type="file"
                                accept="image/*"
                                onChange={e => handleScreenshotUpload(e.target.files?.[0])}
                                className="hidden"
                              />
                              {payScreenshot && (
                                <div className="mt-1 flex items-center gap-2 p-1.5 bg-emerald-50 rounded-lg text-emerald-800 text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Screenshot attached</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* WhatsApp View */
                          <div className="p-5 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] space-y-3 text-center">
                            <div className="w-12 h-12 rounded-full bg-[#25D366] text-white mx-auto flex items-center justify-center shadow-sm">
                              <MessageCircle className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">
                                Confirm & Pay via Sanctuary WhatsApp
                              </h4>
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                Clicking below will open WhatsApp with your booking details pre-filled. You can pay via direct UPI and receive your confirmed Zoom invitation link immediately.
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white border border-[#C8E6C9] text-xs text-left font-mono space-y-1">
                              <div><strong>Workshop:</strong> {activeModalWorkshop.title}</div>
                              <div><strong>Seeker:</strong> {regName} ({regPhone})</div>
                              <div><strong>Seats:</strong> {regSeats} • <strong>Total:</strong> ₹{(activeModalWorkshop.price! * regSeats).toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="pt-2 flex items-center justify-between border-t border-[#D9D2C3]">
                          <button
                            type="button"
                            onClick={() => setRegStep('details')}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black cursor-pointer"
                          >
                            ← Back to Details
                          </button>
                          <button
                            type="button"
                            onClick={handleRegisterSubmit}
                            disabled={submitting}
                            className={`px-7 py-3 rounded-full text-white text-xs font-bold tracking-widest uppercase transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer ${
                              payMethod === 'WHATSAPP' ? 'bg-[#128C7E] hover:bg-[#075E54]' : 'bg-[#101827] hover:bg-[#182236]'
                            }`}
                          >
                            {submitting ? (
                              <span>Confirming...</span>
                            ) : payMethod === 'WHATSAPP' ? (
                              <>
                                <MessageCircle className="w-4 h-4" />
                                <span>Pay & Confirm on WhatsApp</span>
                              </>
                            ) : (
                              <>
                                <span>Submit UTR & Confirm Seat</span>
                                <ArrowRight className="w-4 h-4 text-[#C8A45D]" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
