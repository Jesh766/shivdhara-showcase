import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  ShieldCheck,
  Users,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ArrowLeft,
  Check,
  Clock,
  ExternalLink,
  Copy,
  Image as ImageIcon,
  X,
  MessageCircle,
  Activity,
  BarChart3,
  MousePointerClick,
  Timer,
  Mail,
  Phone,
  FileText,
  User,
  MapPin,
  Sparkles,
  CheckCheck,
  Trash2,
  Search,
  Compass,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Package,
  Plus,
  Pencil,
  Tag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Consultation, Order, Workshop } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getStoredAnalytics, AnalyticsData } from '../../lib/analytics';
import { SHIV_DHARA_LOGO } from '../../lib/assets';
import { getAdminToken } from '../../lib/auth';

interface AdminPortalProps {
  onNavigateHome: () => void;
  onOpenEditor: () => void;
  onExitEditorMode: () => void;
  isEditorMode: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigateHome, onOpenEditor, onExitEditorMode, isEditorMode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  
  // Default to registered users tab first
  const [activeTab, setActiveTab] = useState<
    'users' | 'consultations' | 'orders' | 'carts' | 'analytics' | 'contacts' | 'handoffs' | 'workshops' | 'products'
  >('users');

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCarts, setActiveCarts] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [handoffs, setHandoffs] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [workshopRegistrations, setWorkshopRegistrations] = useState<any[]>([]);
  const [updatingWorkshopId, setUpdatingWorkshopId] = useState<string | null>(null);
  const [workshopFilter, setWorkshopFilter] = useState<'ALL' | 'OPEN' | 'COMING_SOON' | 'SOLD_OUT'>('ALL');
  const [editingCapacity, setEditingCapacity] = useState<{ [id: string]: { capacity: number; registeredCount: number } }>({});
  const [contacts, setContacts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>(getStoredAnalytics());

  // Products state
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', shortDescription: '', category: 'bracelets',
    price: '', isFree: false, noPrice: false,
    images: '', stock: '10', active: true, featured: false,
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedSeekerHistory, setSelectedSeekerHistory] = useState<any | null>(null);
  const [consultationFilter, setConsultationFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'COMPLETED'>('ALL');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  // Master Availability & Offline Booking Management
  const [slotAdminDate, setSlotAdminDate] = useState(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toISOString().split('T')[0];
  });
  const [slotData, setSlotData] = useState<{
    allSlots: string[];
    bookedSlots: string[];
    manualBlockedSlots: string[];
    unavailableSlots: string[];
    availableSlots: string[];
  }>({
    allSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'],
    bookedSlots: [],
    manualBlockedSlots: [],
    unavailableSlots: [],
    availableSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'],
  });
  const [slotLoading, setSlotLoading] = useState(false);
  const [togglingSlot, setTogglingSlot] = useState<string | null>(null);
  const [blockModalSlot, setBlockModalSlot] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('Relative / Client booked via Phone Call');
  const [blockClientName, setBlockClientName] = useState('');
  const [blockClientPhone, setBlockClientPhone] = useState('');

  const { showToast } = useToast();

  const isFakeSeed = (id: string, name?: string) => {
    if (!id) return false;
    if (id.includes('seed')) return true;
    if (
      name === 'Priya Sharma' ||
      name === 'Rohan Deshpande' ||
      name === 'Ananya Verma' ||
      name === 'Kabir Singhania'
    )
      return true;
    return false;
  };

  // Check tab session (strictly per-tab so opening in a new tab requires login again!)
  useEffect(() => {
    localStorage.removeItem('shiv_dhara_admin_token'); // Clean legacy cross-tab storage
    const tabSession = sessionStorage.getItem('shiv_dhara_admin_session');
    if (tabSession) {
      setIsAuthenticated(true);
      loadAllData();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPasscode = passcode.trim();

    if (!cleanPasscode) {
      showToast('Passcode Required', 'Please enter the admin passcode.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        headers: {
          'x-admin-token': cleanPasscode,
        },
      });

      if (res.status === 401) {
        showToast('Invalid Passcode', 'Access denied. Please check your admin passcode.', 'error');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const message =
          res.status === 429
            ? 'Too many attempts. Please wait before trying again.'
            : res.status === 503
              ? 'Admin authentication is not configured on the server. Please contact the site administrator.'
              : `The server could not verify your login (HTTP ${res.status}). Please try again later or contact the site administrator.`;
        showToast('Admin Login Unavailable', message, 'error');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('shiv_dhara_admin_session', cleanPasscode);
      setIsAuthenticated(true);
      showToast('Admin Authenticated', 'Welcome to SHIV DHARA Master Operations Suite', 'success');
      loadAllData();
    } catch {
      showToast('Connection Error', 'Failed to authenticate with server.', 'error');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('shiv_dhara_admin_session');
    localStorage.removeItem('shiv_dhara_admin_token');
    setIsAuthenticated(false);
    setPasscode('');
    showToast('Admin Session Ended', 'You have securely exited the Admin Portal.', 'info');
    onNavigateHome();
  };

  const loadAllData = async () => {
    setLoading(true);

    // Refresh live analytics
    setAnalytics(getStoredAnalytics());

    try {
      // 1. Fetch live consolidated cloud data from Vercel serverless / GitHub cloud store
      let res = await fetch('/api/admin', {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
      }).catch(() => null);

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          if (Array.isArray(data.registeredUsers)) {
            setRegisteredUsers(data.registeredUsers);
          }
          if (Array.isArray(data.consultations)) {
            setConsultations(data.consultations);
          }
          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
          if (Array.isArray(data.activeCarts)) {
            setActiveCarts(data.activeCarts);
          }
          if (Array.isArray(data.humanRequests)) {
            setHandoffs(data.humanRequests);
          }
          if (Array.isArray(data.contactSubmissions)) {
            setContacts(data.contactSubmissions);
          }
          if (Array.isArray(data.workshops)) {
            setWorkshops(data.workshops);
          }
          if (Array.isArray(data.workshopRegistrations)) {
            setWorkshopRegistrations(data.workshopRegistrations);
          }
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin] Live overview fetch fallback to local:', err);
    }

    // 2. Fallback to local storage if API is temporarily unreachable
    let localConsultations: Consultation[] = [];
    let localContacts: any[] = [];
    let localOrders: Order[] = [];
    let localUsers: any[] = [];

    try {
      const raw = JSON.parse(localStorage.getItem('shiv_dhara_consultations') || '[]');
      localConsultations = raw.filter((c: Consultation) => !isFakeSeed(c.id, c.name));
    } catch {}

    try {
      localContacts = JSON.parse(localStorage.getItem('shiv_dhara_contacts') || '[]');
    } catch {}

    try {
      localUsers = JSON.parse(localStorage.getItem('shiv_dhara_registered_users') || '[]');
    } catch {}

    try {
      const rawOrders = JSON.parse(localStorage.getItem('shiv_dhara_orders') || '[]');
      localOrders = rawOrders.filter((o: Order) => !isFakeSeed(o.id, o.customerName));
    } catch {}

    let localCarts: any[] = [];
    try {
      localCarts = JSON.parse(localStorage.getItem('shiv_dhara_active_carts') || '[]');
    } catch {}

    setConsultations(localConsultations);
    setOrders(localOrders);
    setActiveCarts(localCarts);
    setContacts(localContacts);

    const userMap = new Map<string, any>();
    localUsers.forEach((lu: any) => {
      if (lu && lu.email) userMap.set(lu.email.toLowerCase(), lu);
    });

    try {
      const rawAccounts = JSON.parse(localStorage.getItem('shiv_dhara_registered_accounts') || '[]');
      rawAccounts.forEach((acc: any) => {
        if (acc && acc.email && !userMap.has(acc.email.toLowerCase())) {
          const { password: _, ...safeAcc } = acc;
          userMap.set(acc.email.toLowerCase(), safeAcc);
        }
      });
    } catch {}

    try {
      const activeAuth = JSON.parse(localStorage.getItem('shiv_dhara_customer_auth_v1') || 'null');
      if (activeAuth && activeAuth.email) {
        userMap.set(activeAuth.email.toLowerCase(), activeAuth);
      }
    } catch {}

    setRegisteredUsers(Array.from(userMap.values()));
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      const interval = setInterval(loadAllData, 12000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Load products when products tab becomes active
  const loadAdminProducts = async () => {
    setProductLoading(true);
    try {
      const res = await fetch('/api/editor/products', {
        headers: { 'x-admin-token': getAdminToken() },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminProducts(data.products || []);
      }
    } catch (err) {
      console.error('[Admin] Failed to load products:', err);
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'products') {
      loadAdminProducts();
    }
  }, [isAuthenticated, activeTab]);

  const loadSlotAvailability = async (targetDate: string) => {
    setSlotLoading(true);
    try {
      const res = await fetch(`/api/consultations?date=${targetDate}`);
      if (res.ok) {
        const data = await res.json();
        setSlotData({
          allSlots: data.allSlots || ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'],
          bookedSlots: data.bookedSlots || [],
          manualBlockedSlots: data.manualBlockedSlots || [],
          unavailableSlots: data.unavailableSlots || [],
          availableSlots: data.availableSlots || [],
        });
      }
    } catch (err) {
      console.error('Failed to load slots', err);
    } finally {
      setSlotLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'consultations') {
      loadSlotAvailability(slotAdminDate);
    }
  }, [slotAdminDate, activeTab, isAuthenticated]);

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockModalSlot) return;
    setTogglingSlot(blockModalSlot);

    try {
      const res = await fetch('/api/consultations/toggle-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
        body: JSON.stringify({
          date: slotAdminDate,
          time: blockModalSlot,
          action: 'BLOCK',
          reason: blockReason.trim() || 'Booked offline via call/WhatsApp',
          clientName: blockClientName.trim() || 'Offline Booking (Call)',
          clientPhone: blockClientPhone.trim(),
        }),
      });

      if (res.ok) {
        showToast('Slot Blocked', `Slot ${blockModalSlot} on ${slotAdminDate} is now marked unavailable.`, 'success');
        setBlockModalSlot(null);
        setBlockClientName('');
        setBlockClientPhone('');
        loadSlotAvailability(slotAdminDate);
        loadAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('Error', err.error || 'Failed to block slot', 'error');
      }
    } catch {
      showToast('Error', 'Connection failed while updating slot.', 'error');
    } finally {
      setTogglingSlot(null);
    }
  };

  const handleUnblockSlot = async (slotTime: string) => {
    setTogglingSlot(slotTime);
    try {
      const res = await fetch('/api/consultations/toggle-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
        body: JSON.stringify({
          date: slotAdminDate,
          time: slotTime,
          action: 'UNBLOCK',
        }),
      });

      if (res.ok) {
        showToast('Slot Available', `Slot ${slotTime} on ${slotAdminDate} is now open for booking.`, 'success');
        loadSlotAvailability(slotAdminDate);
        loadAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('Error', err.error || 'Failed to release slot', 'error');
      }
    } catch {
      showToast('Error', 'Connection failed while releasing slot.', 'error');
    } finally {
      setTogglingSlot(null);
    }
  };

  const handleVerifyOrderPayment = async (orderId: string) => {
    setVerifyingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
      });

      if (res.ok) {
        showToast('Payment Verified', `Order ${orderId} has been confirmed & marked as PAID.`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'PAYMENT_VERIFIED' } : o))
        );
        try {
          const local = JSON.parse(localStorage.getItem('shiv_dhara_orders') || '[]');
          const updated = local.map((o: Order) =>
            o.id === orderId ? { ...o, paymentStatus: 'PAYMENT_VERIFIED' } : o
          );
          localStorage.setItem('shiv_dhara_orders', JSON.stringify(updated));
        } catch {}
      } else {
        showToast('Update Failed', 'Could not verify payment status.', 'error');
      }
    } catch (err: any) {
      showToast('Network Error', err.message || 'Failed to update order.', 'error');
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const handleUpdateConsultationStatus = async (
    consultationId: string,
    newStatus: 'CONFIRMED' | 'PENDING' | 'PENDING_APPROVAL' | 'COMPLETED' | 'CANCELLED'
  ) => {
    try {
      const updated = consultations.map((c) => (c.id === consultationId ? { ...c, status: newStatus } : c));
      setConsultations(updated);
      localStorage.setItem('shiv_dhara_consultations', JSON.stringify(updated));

      // Persist to serverless store
      await fetch('/api/consultations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
        body: JSON.stringify({ id: consultationId, status: newStatus }),
      }).catch((e) => console.warn('Could not sync consultation status to cloud:', e));

      showToast('Status Updated', `Consultation marked as ${newStatus}`, 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update consultation status', 'error');
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this consultation record?')) return;
    try {
      setConsultations((prev) => prev.filter((c) => c.id !== id));
      const local = JSON.parse(localStorage.getItem('shiv_dhara_consultations') || '[]');
      localStorage.setItem('shiv_dhara_consultations', JSON.stringify(local.filter((c: any) => c.id !== id)));
      fetch(`/api/consultations/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': getAdminToken() },
      }).catch(() => null);
      showToast('Consultation Removed', 'The record was deleted.', 'info');
    } catch {}
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this order record?')) return;
    try {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      const local = JSON.parse(localStorage.getItem('shiv_dhara_orders') || '[]');
      localStorage.setItem('shiv_dhara_orders', JSON.stringify(local.filter((o: any) => o.id !== id)));
      fetch(`/api/admin/order/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': getAdminToken() },
      }).catch(() => null);
      showToast('Order Removed', 'The order record was deleted.', 'info');
    } catch {}
  };

  const handleDeleteCart = async (id: string) => {
    if (!window.confirm('Delete this active cart entry?')) return;
    try {
      setActiveCarts((prev) => prev.filter((c) => c.id !== id));
      const local = JSON.parse(localStorage.getItem('shiv_dhara_active_carts') || '[]');
      localStorage.setItem('shiv_dhara_active_carts', JSON.stringify(local.filter((c: any) => c.id !== id)));
      fetch(`/api/admin/carts/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': getAdminToken() },
      }).catch(() => null);
      showToast('Cart Entry Removed', 'Record deleted.', 'info');
    } catch {}
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!window.confirm(`Delete customer account for ${email}?`)) return;
    try {
      setRegisteredUsers((prev) => prev.filter((u) => u.id !== id && u.email !== email));
      const local = JSON.parse(localStorage.getItem('shiv_dhara_registered_users') || '[]');
      localStorage.setItem(
        'shiv_dhara_registered_users',
        JSON.stringify(local.filter((u: any) => u.id !== id && u.email !== email))
      );
      fetch(`/api/admin/users/${id || email}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': getAdminToken() },
      }).catch(() => null);
      showToast('Customer Removed', 'Customer record deleted from directory.', 'info');
    } catch {}
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Delete this contact inquiry?')) return;
    try {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      const local = JSON.parse(localStorage.getItem('shiv_dhara_contacts') || '[]');
      localStorage.setItem('shiv_dhara_contacts', JSON.stringify(local.filter((c: any) => c.id !== id)));
      showToast('Inquiry Deleted', 'Message deleted from inbox.', 'info');
    } catch {}
  };

  const handleUpdateWorkshopStatus = async (workshop: Workshop, newStatus: 'OPEN' | 'COMING_SOON' | 'SOLD_OUT') => {
    setUpdatingWorkshopId(workshop.id);
    try {
      const res = await fetch('/api/workshops', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
        body: JSON.stringify({
          action: 'UPDATE_WORKSHOP',
          workshopId: workshop.id,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error('Failed to update workshop status');
      
      setWorkshops(prev => prev.map(w => w.id === workshop.id ? { ...w, status: newStatus, isComingSoon: newStatus === 'COMING_SOON', isSoldOut: newStatus === 'SOLD_OUT' } : w));
      showToast('Status Updated', `Workshop marked as ${newStatus.replace('_', ' ')}.`, 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not update status', 'error');
    } finally {
      setUpdatingWorkshopId(null);
    }
  };

  const handleSaveWorkshopCapacity = async (workshop: Workshop, capacity: number, registeredCount: number) => {
    setUpdatingWorkshopId(workshop.id);
    try {
      const res = await fetch('/api/workshops', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
        body: JSON.stringify({
          action: 'UPDATE_WORKSHOP',
          workshopId: workshop.id,
          capacity,
          registeredCount,
        }),
      });

      if (!res.ok) throw new Error('Failed to update capacity');

      setWorkshops(prev => prev.map(w => w.id === workshop.id ? { ...w, capacity, registeredCount } : w));
      showToast('Capacity Saved', `Seats set to ${capacity} total, ${registeredCount} booked (${Math.max(0, capacity - registeredCount)} remaining).`, 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Could not save capacity', 'error');
    } finally {
      setUpdatingWorkshopId(null);
    }
  };

  const handleUpdateRegistrationStatus = async (registrationId: string, paymentStatus: string) => {
    try {
      const res = await fetch('/api/workshops', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
        body: JSON.stringify({
          action: 'UPDATE_REGISTRATION',
          registrationId,
          paymentStatus,
        }),
      });

      if (!res.ok) throw new Error('Failed to update registration payment status');

      setWorkshopRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, paymentStatus } : r));
      showToast('Registration Updated', `Payment status changed to ${paymentStatus}.`, 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not update registration', 'error');
    }
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E1E1C] text-[#F7F1E6] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(230,181,90,0.12)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C56A45]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#E6B55A]/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-md w-full bg-[#142B28]/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-[#E6B55A]/30 shadow-2xl space-y-7 relative z-10"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white p-2.5 mx-auto border-2 border-[#E6B55A] shadow-xl flex items-center justify-center">
              <img src={SHIV_DHARA_LOGO} alt="SHIV DHARA" className="h-full w-full object-contain" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#E6B55A] font-bold block">
                Executive Command Suite
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#F7F1E6]">Master Operations Desk</h2>
            </div>
            <p className="text-xs text-[#E6D5B8]/80 leading-relaxed font-sans">
              Enter master passcode to view live registered seekers, consultation bookings, order receipts, active carts, and search analytics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#E6B55A] font-bold">
                Admin Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter your admin passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0B1B19] border border-[#E6B55A]/40 text-sm text-[#F7F1E6] placeholder-gray-500 focus:outline-none focus:border-[#E6B55A] focus:ring-2 focus:ring-[#E6B55A]/20 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C56A45] via-[#D47E5B] to-[#E6B55A] text-[#0E2623] text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:shadow-[#E6B55A]/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Authenticate & Enter</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </form>

          <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-gray-400 border-t border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Encrypted Sanctuary Operations</span>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-gray-400 hover:text-[#E6B55A] transition-colors cursor-pointer"
            >
              ← Return to Public Sanctuary Site
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const minutesSpent = Math.floor((analytics.totalTimeSpentSeconds || 0) / 60);

  const filteredConsultations = consultations.filter((c) => {
    if (consultationFilter === 'ALL') return true;
    if (consultationFilter === 'PENDING') return c.status === 'PENDING' || c.status === 'PENDING_APPROVAL';
    return c.status === consultationFilter;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'VERIFIED') return o.paymentStatus === 'PAYMENT_VERIFIED';
    if (orderFilter === 'PENDING') return o.paymentStatus !== 'PAYMENT_VERIFIED';
    return true;
  });

  // Product helpers
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', shortDescription: '', category: 'bracelets', price: '', isFree: false, noPrice: false, images: '', stock: '10', active: true, featured: false });
    setShowProductForm(true);
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '',
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      category: p.category || 'bracelets',
      price: p.price != null ? String(p.price) : '',
      isFree: Boolean(p.isFree),
      noPrice: p.price == null && !p.isFree,
      images: (p.images || []).join(', '),
      stock: String(p.stock ?? 10),
      active: p.active !== false,
      featured: Boolean(p.featured),
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) { showToast('Required', 'Product name is required', 'error'); return; }
    setSavingProduct(true);
    try {
      const payload: any = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        shortDescription: productForm.shortDescription.trim(),
        category: productForm.category,
        isFree: productForm.isFree,
        price: productForm.noPrice ? null : (productForm.isFree ? 0 : (productForm.price !== '' ? Number(productForm.price) : null)),
        stock: Number(productForm.stock) || 10,
        active: productForm.active,
        featured: productForm.featured,
        images: productForm.images.split(',').map((s: string) => s.trim()).filter(Boolean),
      };
      if (editingProduct) payload.id = editingProduct.id;

      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/editor/products/${editingProduct.id}` : '/api/editor/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Save failed');
      showToast('Saved!', `Product "${payload.name}" ${editingProduct ? 'updated' : 'added'} successfully`, 'success');
      setShowProductForm(false);
      await loadAdminProducts();
    } catch (err: any) {
      showToast('Error', err.message || 'Could not save product', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (p: any) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeletingProductId(p.id);
    try {
      const res = await fetch(`/api/editor/products/${p.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': getAdminToken() },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed');
      showToast('Deleted', `"${p.name}" removed`, 'success');
      await loadAdminProducts();
    } catch (err: any) {
      showToast('Error', err.message || 'Delete failed', 'error');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleToggleProductActive = async (p: any) => {
    try {
      const res = await fetch(`/api/editor/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
        body: JSON.stringify({ ...p, active: !p.active }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Toggle failed');
      setAdminProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: !p.active } : x));
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // Vertical Navigation Item Config with Users as First!
  const navItems = [
    { id: 'users', label: '👥 Signed-in Seekers', count: registeredUsers.length, icon: Users },
    { id: 'consultations', label: '📅 Consultations', count: consultations.length, icon: Calendar },
    { id: 'orders', label: '🛍️ Boutique Orders', count: orders.length, icon: ShoppingBag },
    { id: 'carts', label: '🛒 Active Carts', count: activeCarts.length, icon: ShoppingCart },
    { id: 'analytics', label: '📊 Activity & Searches', count: analytics.searchQueries?.length || 0, icon: BarChart3 },
    { id: 'contacts', label: '✉️ Contact Inquiries', count: contacts.length, icon: Mail },
    { id: 'handoffs', label: '🤖 Seeker AI Handoffs', count: handoffs.length, icon: Send },
    { id: 'workshops', label: '🎓 Cohort Workshops', count: workshops.length, icon: Users },
    { id: 'products', label: '📦 Products & Boutique', count: adminProducts.length, icon: Package },
  ];

  return (
    <div id="admin-portal" className="min-h-screen bg-[#F7F3EA] text-[#163A36] pt-28 sm:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Executive Header Banner */}
        <div className="bg-gradient-to-r from-[#0E2623] via-[#163A36] to-[#0E2623] text-[#F7F1E6] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E6B55A]/30 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#E6B55A]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white p-2 border-2 border-[#E6B55A] shadow-lg flex items-center justify-center shrink-0">
                <img src={SHIV_DHARA_LOGO} alt="SHIV DHARA" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E6B55A] font-bold">
                    Executive Sanctuary Desk
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Connected</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F7F1E6] mt-0.5">
                  SHIV DHARA Command Suite
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Microsoft Clarity Quick Action */}
              <a
                href="https://clarity.microsoft.com/projects/view/y8huil1hon/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-[#F7F1E6] flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#E6B55A]" />
                <span>Open Clarity Replays</span>
                <ExternalLink className="w-3 h-3 text-gray-300" />
              </a>

              <button
                onClick={loadAllData}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-[#E6B55A] hover:bg-[#d9a84d] text-[#0E2623] text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Live Sync</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold border border-red-400/50 transition-all flex items-center gap-2 shadow-md cursor-pointer hover:scale-[1.02]"
                title="Securely log out and lock the admin portal"
              >
                <Lock className="w-3.5 h-3.5 text-red-200" />
                <span>Leave &amp; Lock Admin</span>
              </button>

              <button
                onClick={onNavigateHome}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F7F1E6] text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                View Live Site ↗
              </button>

              <button
                type="button"
                onClick={isEditorMode ? onExitEditorMode : onOpenEditor}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                  isEditorMode
                    ? 'bg-emerald-400 text-[#0E2623] border-emerald-300 hover:bg-emerald-300'
                    : 'bg-[#C56A45] text-white border-[#E6B55A]/70 hover:bg-[#D47E5B] hover:scale-[1.02]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isEditorMode ? 'Editor Active · Exit' : 'Open Live Editor'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Metric Intelligence Row (7 KPIs) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] shadow-sm space-y-1 hover:border-[#C56A45]/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Seekers</span>
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-blue-800">
                {registeredUsers.length}
              </span>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Directory</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] shadow-sm space-y-1 hover:border-[#C56A45]/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C56A45]" />
              <span>Consultations</span>
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-[#C56A45]">
                {consultations.length}
              </span>
              <span className="text-[10px] text-[#C56A45] font-bold bg-amber-50 px-1.5 py-0.5 rounded">Bookings</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] shadow-sm space-y-1 hover:border-[#C56A45]/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Orders</span>
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-emerald-800">
                {orders.length}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Boutique</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] shadow-sm space-y-1 hover:border-[#C56A45]/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
              <span>Active Carts</span>
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-amber-800">
                {activeCarts.length}
              </span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Recovery</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] shadow-sm space-y-1 hover:border-[#C56A45]/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-purple-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>Inquiries</span>
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-purple-800">
                {contacts.length}
              </span>
              <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded">Emails</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] shadow-sm space-y-1 hover:border-[#C56A45]/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#C56A45]" />
              <span>Total Visits</span>
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-[#163A36]">
                {analytics.totalVisits || 1}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Live</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] shadow-sm space-y-1 hover:border-[#C56A45]/50 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-[#C56A45]" />
              <span>Time Spent</span>
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-[#163A36]">
                {minutesSpent > 0 ? `${minutesSpent}m` : `${analytics.totalTimeSpentSeconds || 0}s`}
              </span>
              <span className="text-[10px] text-gray-400">Total</span>
            </div>
          </div>
        </div>

        {/* 2-COLUMN EXECUTIVE WORKSPACE: Left Vertical Nav + Right Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT VERTICAL NAVIGATION SIDEBAR (3 COLS) */}
          <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-[#E6D5B8] shadow-lg space-y-2 sticky top-28">
            <div className="px-3 py-2 border-b border-[#E6D5B8] mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">
                Operation Modules
              </span>
              <h3 className="font-serif font-bold text-sm text-[#163A36]">Master Navigation</h3>
            </div>

            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#163A36] text-[#F7F1E6] shadow-md ring-1 ring-[#E6B55A]/50 translate-x-1'
                        : 'text-[#163A36] hover:bg-[#FAF4EA] hover:text-[#C56A45]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E6B55A]' : 'text-gray-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        isActive
                          ? 'bg-[#E6B55A] text-[#0E2623]'
                          : 'bg-[#FAF4EA] text-gray-600 border border-[#E6D5B8]'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Clarity Widget at bottom of sidebar */}
            <div className="pt-3 border-t border-[#E6D5B8] mt-4">
              <a
                href="https://clarity.microsoft.com/projects/view/y8huil1hon/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-[#FAF4EA] hover:bg-[#f3ead7] border border-[#E6D5B8] text-xs font-bold text-[#163A36] flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#C56A45] group-hover:rotate-45 transition-transform" />
                  <span>Clarity Analytics</span>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full mt-2.5 p-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-700 flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>Exit / Leave Admin</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          </div>

          {/* RIGHT MASTER CONTENT AREA (9 COLS) */}
          <div className="lg:col-span-9 bg-white rounded-3xl border border-[#E6D5B8] shadow-xl overflow-hidden p-6 sm:p-8">
            
            {/* MODULE 1: SIGNED-IN SEEKERS & REGISTERED CUSTOMERS (NOW FIRST!) */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E6D5B8] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#163A36]">
                      👥 Registered & Signed-in Customers ({registeredUsers.length})
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Unified customer identity with exact first registration, last visit timestamps, login frequency, and saved carts
                    </p>
                  </div>
                </div>

                {registeredUsers.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <User className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500">No customer accounts registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF4EA] text-[#163A36] uppercase tracking-wider font-bold border-b border-[#E6D5B8]">
                        <tr>
                          <th className="p-3.5 rounded-l-xl">Customer Profile</th>
                          <th className="p-3.5">First Joined (Day, Date, Time)</th>
                          <th className="p-3.5">Last Active (Day, Date, Time)</th>
                          <th className="p-3.5">Visit Count</th>
                          <th className="p-3.5">Saved Cart Items</th>
                          <th className="p-3.5 text-right rounded-r-xl">Outreach & Journey</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6D5B8]/60">
                        {registeredUsers.map((u) => {
                          const cleanPhone = (u.phone || '').replace(/[^0-9]/g, '');
                          const whatsappUrl = `https://wa.me/${cleanPhone || '916359666315'}?text=${encodeURIComponent(
                            `Namaste ${u.name}, welcome back to SHIV DHARA. How may Falgun Thakkr assist your journey today?`
                          )}`;

                          // Retrieve user's saved cart items if any
                          let userSavedCart: any[] = [];
                          try {
                            const rawCart = localStorage.getItem(`shiv_dhara_user_cart_${u.email.toLowerCase()}`);
                            if (rawCart) userSavedCart = JSON.parse(rawCart);
                          } catch {}

                          const cartTotal = userSavedCart.reduce(
                            (acc, it) => acc + (it.selectedVariant?.price || it.product?.price || 0) * (it.quantity || 1),
                            0
                          );

                          // Formatted timestamps
                          const firstJoined =
                            u.firstJoinedFormatted ||
                            (u.createdAt
                              ? `${new Date(u.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date(u.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                              : 'Recent Seeker');

                          const lastVisit =
                            u.lastLoginFormatted ||
                            (u.lastLoginAt
                              ? `${new Date(u.lastLoginAt).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date(u.lastLoginAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                              : firstJoined);

                          return (
                            <tr key={u.id || u.email} className="hover:bg-[#FAF4EA]/50 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#163A36] text-[#F7F1E6] flex items-center justify-center font-bold text-xs uppercase shadow-sm border border-[#E6B55A]/40 shrink-0">
                                    {u.avatar ? (
                                      <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      u.name?.charAt(0) || 'U'
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-sm text-[#163A36] block">{u.name}</span>
                                    <span className="text-[11px] text-gray-600 block">{u.email}</span>
                                    {u.phone && <span className="text-[10px] text-[#C56A45] font-mono">{u.phone}</span>}
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5 text-gray-700 font-sans">
                                <span className="font-semibold text-[#163A36] block">{firstJoined}</span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  Method: {u.authProvider === 'google' ? 'Google OAuth' : 'Email/Password'}
                                </span>
                              </td>

                              <td className="p-3.5 text-gray-700 font-sans">
                                <span className="font-semibold text-emerald-800 block">{lastVisit}</span>
                                <span className="text-[10px] text-emerald-600 font-bold">● Active Customer</span>
                              </td>

                              <td className="p-3.5">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                                  {u.loginCount || 1} {u.loginCount === 1 ? 'Visit' : 'Visits'}
                                </span>
                              </td>

                              <td className="p-3.5">
                                {userSavedCart.length > 0 ? (
                                  <div className="space-y-0.5">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 inline-block">
                                      {userSavedCart.length} {userSavedCart.length === 1 ? 'Item' : 'Items'} in Cart
                                    </span>
                                    <div className="text-[11px] font-mono font-bold text-[#163A36]">
                                      ₹{cartTotal.toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-[11px]">Cart Empty</span>
                                )}
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSeekerHistory({ user: u, cart: userSavedCart, total: cartTotal })}
                                    className="px-2.5 py-1.5 rounded-xl bg-[#163A36] hover:bg-[#0E2623] text-[#F7F1E6] text-[11px] font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3 text-[#E6B55A]" />
                                    <span>Timeline</span>
                                  </button>

                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                    title="Delete customer record"
                                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MODULE 2: CONSULTATIONS */}
            {activeTab === 'consultations' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[#E6D5B8]">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#163A36]">
                      Client Consultation Appointments ({consultations.length})
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Appointments booked across Numerology, Vastu Spatial Audits, and Meditation
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setConsultationFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                          consultationFilter === f
                            ? 'bg-[#163A36] text-[#F7F1E6] shadow-sm'
                            : 'bg-[#FAF4EA] border border-[#E6D5B8] text-gray-600 hover:text-black'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SLOT CONTROLLER & OFFLINE BOOKING MANAGER */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FFFDF9] to-[#FAF6EE] border border-[#E6B55A]/50 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 pb-3 border-b border-[#E6D5B8]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#163A36] text-[#E6B55A]">
                          <Clock className="w-4 h-4" />
                        </span>
                        <h4 className="font-serif font-bold text-base text-[#163A36]">
                          Slot Availability & Offline Call Booking Controller
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600">
                        Select any date to see real-time slots. Mark slots "Unavailable" when booked via phone call or relatives, or release them back to online seekers.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-white border border-[#E6D5B8] px-3 py-1.5 rounded-xl shadow-xs">
                        <Calendar className="w-3.5 h-3.5 text-[#C56A45]" />
                        <input
                          type="date"
                          value={slotAdminDate}
                          onChange={(e) => setSlotAdminDate(e.target.value)}
                          className="text-xs font-semibold text-[#163A36] outline-none bg-transparent cursor-pointer"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setSlotAdminDate(today);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E6D5B8] text-[10px] font-bold text-[#163A36] hover:bg-[#FAF4EA] cursor-pointer"
                      >
                        Today
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const tmrw = new Date();
                          tmrw.setDate(tmrw.getDate() + 1);
                          setSlotAdminDate(tmrw.toISOString().split('T')[0]);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E6D5B8] text-[10px] font-bold text-[#163A36] hover:bg-[#FAF4EA] cursor-pointer"
                      >
                        Tomorrow
                      </button>

                      <button
                        type="button"
                        onClick={() => loadSlotAvailability(slotAdminDate)}
                        disabled={slotLoading}
                        className="p-1.5 rounded-lg bg-white border border-[#E6D5B8] text-[#163A36] hover:bg-[#FAF4EA] cursor-pointer"
                        title="Refresh slots"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${slotLoading ? 'animate-spin text-[#C56A45]' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Slot Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slotData.allSlots.map((slot) => {
                      const isManualBlocked = slotData.manualBlockedSlots?.includes(slot);
                      const isBookedOnline = slotData.bookedSlots?.includes(slot) && !isManualBlocked;
                      const isBusy = togglingSlot === slot;

                      return (
                        <div
                          key={slot}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                            isManualBlocked
                              ? 'bg-amber-50/70 border-amber-300'
                              : isBookedOnline
                                ? 'bg-red-50/70 border-red-300'
                                : 'bg-white border-[#E6D5B8] hover:border-emerald-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[#163A36]">{slot}</span>
                            {isManualBlocked ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                                🟠 Offline / Call
                              </span>
                            ) : isBookedOnline ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-200 text-red-900 border border-red-300">
                                🔴 Booked Online
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Available
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                            {isManualBlocked ? (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleUnblockSlot(slot)}
                                className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-500 text-emerald-800 text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {isBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                <span>Make Available</span>
                              </button>
                            ) : isBookedOnline ? (
                              <div className="text-[10px] text-gray-500 italic py-1 truncate">
                                Reserved by Seeker Online
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => {
                                  setBlockModalSlot(slot);
                                  setBlockReason('Relative / Client booked via Phone Call');
                                }}
                                className="w-full py-1.5 px-3 rounded-lg bg-[#163A36] hover:bg-[#204B46] text-[#F7F1E6] text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Block Slot (Call/Offline)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MODAL: Block Slot Dialog */}
                {blockModalSlot && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[#FAF6EE] border border-[#E6D5B8] rounded-2xl w-full max-w-md p-6 shadow-2xl text-[#163A36] space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E6D5B8]">
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#163A36]">
                            Mark Slot Unavailable
                          </h4>
                          <p className="text-xs text-gray-600">
                            {blockModalSlot} on {slotAdminDate}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBlockModalSlot(null)}
                          className="p-1 rounded-lg hover:bg-white text-gray-500 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleBlockSubmit} className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                            Relative / Client Name (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ramesh Patel (Relative)"
                            value={blockClientName}
                            onChange={(e) => setBlockClientName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6D5B8] outline-none focus:border-[#C56A45]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                            Phone Number (Optional)
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={blockClientPhone}
                            onChange={(e) => setBlockClientPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6D5B8] outline-none focus:border-[#C56A45]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                            Reason / Booking Method *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Relative booked via Phone Call"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6D5B8] outline-none focus:border-[#C56A45]"
                          />
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setBlockModalSlot(null)}
                            className="px-4 py-2 rounded-xl border border-[#E6D5B8] bg-white text-gray-600 font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={togglingSlot === blockModalSlot}
                            className="px-4 py-2 rounded-xl bg-[#163A36] hover:bg-[#204B46] text-[#F7F1E6] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            {togglingSlot === blockModalSlot ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <span>Confirm & Block Slot</span>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {filteredConsultations.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500 font-medium">No consultations match this filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF4EA] text-[#163A36] uppercase tracking-wider font-bold border-b border-[#E6D5B8]">
                        <tr>
                          <th className="p-3.5 rounded-l-xl">Client Profile</th>
                          <th className="p-3.5">Discipline & Tier</th>
                          <th className="p-3.5">Scheduled Slot</th>
                          <th className="p-3.5">Amount</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right rounded-r-xl">Action & WhatsApp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6D5B8]/60">
                        {filteredConsultations.map((c) => {
                          const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
                          const isPending = c.status === 'PENDING' || c.status === 'PENDING_APPROVAL';
                          const serviceLabel = c.service || c.serviceName || 'Sacred Consultation';
                          const slotLabel = c.date && c.time ? `${c.date} at ${c.time}` : c.slotTime || 'Requested Slot';
                          const priceLabel = (c.price || 0).toLocaleString('en-IN');

                          let whatsappMsg = '';
                          if (isPending) {
                            whatsappMsg = `Namaste ${c.name}, this is Falgun Thakkr from SHIV DHARA.

We have received and reviewed your consultation request for ${serviceLabel} on ${slotLabel}.

Your requested slot is APPROVED! To finalize and confirm your appointment, please complete the consultation payment of ₹${priceLabel}.

Payment Details (UPI):
UPI ID: falgunthakkar84-1@okicici (Falgun Thakkr)

Please share your transaction screenshot / UTR here once done, and we will send your private Zoom HD meeting link. Looking forward to our session!`;
                          } else {
                            whatsappMsg = `Namaste ${c.name}, this is Falgun Thakkr from SHIV DHARA confirming your upcoming ${serviceLabel} scheduled for ${slotLabel}. How may we assist your preparation today?`;
                          }

                          const whatsappUrl = `https://wa.me/${cleanPhone || '916359666315'}?text=${encodeURIComponent(whatsappMsg)}`;

                          return (
                            <tr key={c.id} className="hover:bg-[#FAF4EA]/50 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-[#163A36] text-sm">{c.name}</div>
                                <div className="flex items-center gap-1 text-gray-600 text-xs mt-0.5">
                                  <Phone className="w-3 h-3 text-[#C56A45]" />
                                  <span>{c.phone || 'Phone not provided'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                                  <Mail className="w-3 h-3 text-[#C56A45]" />
                                  <span>{c.email}</span>
                                </div>
                                {c.location && (
                                  <div className="flex items-center gap-1 text-emerald-900 text-[10px] font-semibold mt-1 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md w-fit">
                                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>{c.location}</span>
                                  </div>
                                )}
                              </td>

                              <td className="p-3.5 font-medium text-[#163A36]">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 inline-block mb-1">
                                  {serviceLabel}
                                </span>
                                <div className="text-[11px] text-gray-500">{c.tier || c.type || 'Standard'} Tier</div>
                              </td>

                              <td className="p-3.5 text-gray-700">
                                <div className="font-semibold text-[#163A36]">{slotLabel}</div>
                                <div className="text-[10px] text-gray-400 font-mono">Booked: {new Date(c.createdAt).toLocaleDateString()}</div>
                              </td>

                              <td className="p-3.5 font-mono font-bold text-[#163A36] text-sm">
                                ₹{c.price?.toLocaleString('en-IN') || 0}
                              </td>

                              <td className="p-3.5">
                                <select
                                  value={c.status}
                                  onChange={(e) =>
                                    handleUpdateConsultationStatus(c.id, e.target.value as any)
                                  }
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase border cursor-pointer ${
                                    c.status === 'CONFIRMED'
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : c.status === 'COMPLETED'
                                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                                      : c.status === 'CANCELLED'
                                      ? 'bg-red-100 text-red-900 border-red-300'
                                      : 'bg-amber-100 text-amber-900 border-amber-300'
                                  }`}
                                >
                                  <option value="PENDING_APPROVAL">Pending Approval</option>
                                  <option value="PENDING">Pending Payment</option>
                                  <option value="CONFIRMED">Confirmed</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="CANCELLED">Cancelled</option>
                                </select>
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isPending && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateConsultationStatus(c.id, 'CONFIRMED')}
                                      title="Approve slot and mark consultation as confirmed"
                                      className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                  )}
                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={isPending ? 'Open WhatsApp to send approval & UPI payment details' : 'Open WhatsApp chat'}
                                    className={`px-3 py-1.5 rounded-xl text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer ${
                                      isPending ? 'bg-[#25D366] hover:bg-[#20bd5a] ring-1 ring-emerald-400' : 'bg-[#25D366] hover:bg-[#20bd5a]'
                                    }`}
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>{isPending ? 'Approve on WhatsApp' : 'WhatsApp'}</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteConsultation(c.id)}
                                    title="Delete consultation record"
                                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MODULE 3: BOUTIQUE ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[#E6D5B8]">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#163A36]">
                      Boutique Orders ({orders.length})
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Gemstone bracelets, energised yantras, malas, and sacred objects
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(['ALL', 'PENDING', 'VERIFIED'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setOrderFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                          orderFilter === f
                            ? 'bg-[#163A36] text-[#F7F1E6] shadow-sm'
                            : 'bg-[#FAF4EA] border border-[#E6D5B8] text-gray-600 hover:text-black'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500 font-medium">No orders recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF4EA] text-[#163A36] uppercase tracking-wider font-bold border-b border-[#E6D5B8]">
                        <tr>
                          <th className="p-3.5 rounded-l-xl">Order Ref</th>
                          <th className="p-3.5">Customer</th>
                          <th className="p-3.5">Items</th>
                          <th className="p-3.5">Shipping Address</th>
                          <th className="p-3.5">Total</th>
                          <th className="p-3.5">Payment</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right rounded-r-xl">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6D5B8]/60">
                        {filteredOrders.map((o) => {
                          const isPending = o.paymentStatus === 'PAYMENT_VERIFICATION_PENDING';
                          const isVerified = o.paymentStatus === 'PAYMENT_VERIFIED';

                          return (
                            <tr key={o.id} className="hover:bg-[#FAF4EA]/50 transition-colors">
                              <td className="p-3.5 font-mono font-bold text-[#163A36]">
                                {o.orderNumber || o.id}
                                <span className="block text-[10px] text-gray-400 font-sans font-normal">
                                  {new Date(o.createdAt).toLocaleDateString()}
                                </span>
                              </td>

                              <td className="p-3.5">
                                <div className="font-bold text-[#163A36]">{o.customerName}</div>
                                <div className="text-gray-600">{o.phone}</div>
                                <div className="text-gray-400 text-[11px]">{o.email}</div>
                              </td>

                              <td className="p-3.5">
                                {o.items.map((it, idx) => (
                                  <div key={idx} className="truncate max-w-xs text-gray-800">
                                    • {it.productName} (x{it.quantity})
                                    {it.variantName && <span className="text-gray-500"> [{it.variantName}]</span>}
                                  </div>
                                ))}
                              </td>

                              <td className="p-3.5 text-gray-600 max-w-xs">
                                <div>{o.address}</div>
                                <div className="text-[11px] text-gray-500 font-medium">
                                  {o.city}, {o.state} - {o.pincode}
                                </div>
                              </td>

                              <td className="p-3.5 font-bold font-mono text-[#163A36] text-sm">
                                ₹{o.total.toLocaleString('en-IN')}
                              </td>

                              <td className="p-3.5">
                                <div className="font-medium text-[#163A36]">
                                  {o.paymentMethod === 'UPI_QR' ? 'UPI (QR Code)' : 'WhatsApp Order'}
                                </div>
                                {o.utr && (
                                  <div className="mt-1 font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900 font-bold">
                                    UTR: {o.utr}
                                  </div>
                                )}
                                {o.paymentScreenshot && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage(o.paymentScreenshot!)}
                                    className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#C56A45] hover:underline cursor-pointer"
                                  >
                                    <ImageIcon className="w-3 h-3" />
                                    <span>View Receipt</span>
                                  </button>
                                )}
                              </td>

                              <td className="p-3.5">
                                {isPending && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                    Pending Verification
                                  </span>
                                )}
                                {isVerified && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    Verified & Paid
                                  </span>
                                )}
                                {!isPending && !isVerified && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                                    {o.paymentStatus || 'Not Started'}
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isPending || o.paymentStatus !== 'PAYMENT_VERIFIED' ? (
                                    <button
                                      onClick={() => handleVerifyOrderPayment(o.id)}
                                      disabled={verifyingOrderId === o.id}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                    >
                                      <CheckCheck className="w-3.5 h-3.5" />
                                      <span>Verify</span>
                                    </button>
                                  ) : (
                                    <span className="text-emerald-700 font-bold inline-flex items-center gap-1 text-xs">
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Verified</span>
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(o.id)}
                                    title="Delete order"
                                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MODULE 4: ACTIVE & ABANDONED CARTS */}
            {activeTab === 'carts' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E6D5B8]">
                  <h3 className="text-xl font-serif font-bold text-[#163A36]">
                    🛒 Active & Abandoned Carts ({activeCarts.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live abandoned cart recovery desk with customer contact details and 1-click WhatsApp follow-ups
                  </p>
                </div>

                {activeCarts.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500">No active carts at this moment.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF4EA] text-[#163A36] uppercase tracking-wider font-bold border-b border-[#E6D5B8]">
                        <tr>
                          <th className="p-3.5 rounded-l-xl">Customer Details</th>
                          <th className="p-3.5">Cart Items</th>
                          <th className="p-3.5">Total Value</th>
                          <th className="p-3.5">Added Time</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right rounded-r-xl">Recovery Outreach</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6D5B8]/60">
                        {activeCarts.map((cart) => {
                          const cleanPhone = (cart.phone || '').replace(/[^0-9]/g, '');
                          const firstItemName = cart.items?.[0]?.productName || 'Sacred Gemstone';
                          const whatsappMsg = `Namaste ${cart.customerName || 'Seeker'}, we noticed you selected the energized ${firstItemName} in your cart at SHIV DHARA. Would you like any guidance on sizing, energized consecration, or completing your order?`;
                          const whatsappUrl = `https://wa.me/${cleanPhone || '916359666315'}?text=${encodeURIComponent(whatsappMsg)}`;

                          return (
                            <tr key={cart.id} className="hover:bg-[#FAF4EA]/50 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-[#163A36] text-sm">
                                  {cart.customerName || 'Guest Seeker'}
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 font-medium mt-0.5">
                                  <Phone className="w-3 h-3 text-[#C56A45]" />
                                  <span>{cart.phone || 'Phone not provided yet'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                                  <Mail className="w-3 h-3 text-[#C56A45]" />
                                  <span>{cart.email || 'Email not provided'}</span>
                                </div>
                              </td>

                              <td className="p-3.5 max-w-sm">
                                <div className="space-y-1">
                                  {(cart.items || []).map((it: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      {it.productImage && (
                                        <img
                                          src={it.productImage}
                                          alt={it.productName}
                                          className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                                        />
                                      )}
                                      <div>
                                        <span className="font-semibold text-gray-900 block truncate max-w-[200px]">
                                          {it.productName}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                          Qty: {it.quantity} {it.variantName ? `(${it.variantName})` : ''} • ₹{it.price?.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>

                              <td className="p-3.5 font-bold font-mono text-[#163A36] text-sm">
                                ₹{(cart.total || 0).toLocaleString('en-IN')}
                              </td>

                              <td className="p-3.5 text-gray-500">
                                <span className="font-medium text-[#163A36] block">
                                  {new Date(cart.addedAt || Date.now()).toLocaleDateString()}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {new Date(cart.addedAt || Date.now()).toLocaleTimeString()}
                                </span>
                              </td>

                              <td className="p-3.5">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                  {cart.status || 'IN_CART'}
                                </span>
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp Follow-up</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCart(cart.id)}
                                    title="Delete cart entry"
                                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MODULE 5: USER ACTIVITY & SEARCH INTENT */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="pb-4 border-b border-[#E6D5B8] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#163A36]">
                      📊 Seeker Engagement & Live Search Intent
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Real-time visitor heatmaps, product search inquiries, AI questions, and page distributions
                    </p>
                  </div>

                  <a
                    href="https://clarity.microsoft.com/projects/view/y8huil1hon/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#163A36] text-[#F7F1E6] text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#0E2623] cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#E6B55A]" />
                    <span>Open Microsoft Clarity Dashboard ↗</span>
                  </a>
                </div>

                {/* SEARCH INTENT LOG */}
                <div className="bg-[#FAF4EA] p-6 rounded-2xl border border-[#E6D5B8] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-[#C56A45]" />
                      <h4 className="font-serif font-bold text-base text-[#163A36]">
                        🔍 What Visitors Are Searching For (Live Intent Log)
                      </h4>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {analytics.searchQueries?.length || 0} Recent Queries
                    </span>
                  </div>

                  {!analytics.searchQueries || analytics.searchQueries.length === 0 ? (
                    <p className="text-xs text-gray-500 py-6 text-center">
                      No search queries recorded yet. As visitors search in Products or ask Dhara AI, their search terms will appear here in real-time.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {analytics.searchQueries.map((sq, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3.5 rounded-xl border border-[#E6D5B8] shadow-sm space-y-1 hover:border-[#C56A45] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                              {sq.category || 'Store Search'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(sq.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="font-bold text-sm text-[#163A36] truncate">
                            "{sq.query}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page Views & Button Heatmap Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#FAF4EA] p-6 rounded-2xl border border-[#E6D5B8] space-y-4">
                    <h4 className="font-serif font-bold text-base text-[#163A36] flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-[#C56A45]" />
                      <span>Top Button Clicks & CTAs</span>
                    </h4>
                    <div className="space-y-2.5">
                      {Object.entries(analytics.buttonClicks || {}).map(([btn, count]) => (
                        <div key={btn} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E6D5B8]">
                          <span className="text-xs font-bold text-[#163A36]">{btn}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                            {count} clicks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#FAF4EA] p-6 rounded-2xl border border-[#E6D5B8] space-y-4">
                    <h4 className="font-serif font-bold text-base text-[#163A36] flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#C56A45]" />
                      <span>Page / Tab Visits Distribution</span>
                    </h4>
                    <div className="space-y-2.5">
                      {Object.entries(analytics.tabViews || {}).map(([page, count]) => (
                        <div key={page} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E6D5B8]">
                          <span className="text-xs font-bold text-[#163A36]">{page === '/' ? 'Home Sanctuary' : page}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-bold">
                            {count} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 6: CONTACT & EMAIL INQUIRIES */}
            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E6D5B8]">
                  <h3 className="text-xl font-serif font-bold text-[#163A36]">
                    ✉️ Contact Messages & Inquiries ({contacts.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Client inquiries delivered directly via EmailJS to shivdhara.occult@gmail.com
                  </p>
                </div>

                {contacts.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <Mail className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500">No contact messages or email inquiries recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((c, idx) => {
                      const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
                      const mailtoUrl = `mailto:${c.email}?subject=${encodeURIComponent(`Re: ${c.service || 'SHIV DHARA Inquiry'}`)}&body=${encodeURIComponent(`Namaste ${c.name},\n\nThank you for contacting SHIV DHARA regarding ${c.service || 'your inquiry'}.\n\n`)}`;
                      const whatsappUrl = `https://wa.me/${cleanPhone || '916359666315'}?text=${encodeURIComponent(`Namaste ${c.name}, thank you for reaching out to SHIV DHARA regarding "${c.service || 'your inquiry'}". How may Falgun Thakkr assist you today?`)}`;

                      return (
                        <div
                          key={c.id || idx}
                          className="bg-white p-6 rounded-2xl border border-[#E6D5B8] shadow-sm space-y-4 hover:border-[#C56A45]/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-[#163A36] text-[#F7F1E6] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                  {c.name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-[#163A36]">{c.name}</h4>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {new Date(c.createdAt || Date.now()).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-1.5">
                                <span className="flex items-center gap-1 font-medium text-[#163A36]">
                                  <Mail className="w-3.5 h-3.5 text-[#C56A45]" />
                                  <a href={`mailto:${c.email}`} className="hover:underline">
                                    {c.email}
                                  </a>
                                </span>
                                {c.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 text-[#C56A45]" />
                                    <span>{c.phone}</span>
                                  </span>
                                )}
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                  {c.service || 'General Inquiry'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 sm:pt-0">
                              <a
                                href={mailtoUrl}
                                className="px-3.5 py-2 rounded-xl bg-[#163A36] hover:bg-[#0E2623] text-[#F7F1E6] text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5 text-[#E6B55A]" />
                                <span>Reply Email</span>
                              </a>

                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => handleDeleteContact(c.id)}
                                title="Delete inquiry"
                                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-[#FAF4EA] p-4 rounded-xl border border-[#E6D5B8]/80 text-xs text-[#2B211E] leading-relaxed font-sans">
                            <span className="font-bold text-[10px] uppercase text-[#A85C3B] block mb-1">
                              Message Content:
                            </span>
                            <p className="whitespace-pre-wrap">{c.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 7: DHARA AI HANDOFFS */}
            {activeTab === 'handoffs' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E6D5B8]">
                  <h3 className="text-xl font-serif font-bold text-[#163A36]">
                    Dhara AI Concierge Direct Callback Requests ({handoffs.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Visitors who interacted with Dhara AI and requested a direct consultation callback
                  </p>
                </div>

                {handoffs.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <Send className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500">No AI concierge callback requests yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {handoffs.map((h, idx) => (
                      <div key={h.id || idx} className="bg-white p-5 rounded-2xl border border-[#E6D5B8] space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-[#163A36]">{h.customerName}</h4>
                            <div className="text-xs text-gray-600 flex items-center gap-3 mt-1">
                              <span>Phone: {h.phone || 'N/A'}</span>
                              <span>Email: {h.email || 'N/A'}</span>
                              <span className="text-[#C56A45] font-semibold">Reason: {h.reason}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 bg-[#FAF4EA] p-3 rounded-xl border border-[#E6D5B8]">
                          Context: {h.conversationSummary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 8: WORKSHOPS & MASTERCLASS COHORTS */}
            {activeTab === 'workshops' && (
              <div className="space-y-8">
                {/* Header & Quick Stats */}
                <div className="pb-4 border-b border-[#E6D5B8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#163A36]">
                      Masterclass & Cohort Control ({workshops.length})
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Real-time seat capacity, coming-soon gates, and registered seeker confirmations
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadAllData}
                      className="px-3 py-1.5 rounded-xl border border-[#D9D2C3] bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                      <span>Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenEditor}
                      className="px-3.5 py-1.5 rounded-xl bg-[#163A36] text-[#F7F1E6] hover:bg-[#0E2623] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                    >
                      <span>+ Create / Edit in Visual Editor</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#FAF4EA] p-4 rounded-2xl border border-[#E6D5B8]">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Cohorts</span>
                    <span className="text-2xl font-serif font-bold text-[#163A36] mt-1 block">{workshops.length}</span>
                  </div>
                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Open for Booking</span>
                    <span className="text-2xl font-serif font-bold text-emerald-800 mt-1 block">
                      {workshops.filter(w => w.status !== 'COMING_SOON' && !w.isComingSoon && w.status !== 'SOLD_OUT').length}
                    </span>
                  </div>
                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Coming Soon (Curating)</span>
                    <span className="text-2xl font-serif font-bold text-amber-800 mt-1 block">
                      {workshops.filter(w => w.status === 'COMING_SOON' || w.isComingSoon || (w.title || '').toLowerCase().includes('coming soon')).length}
                    </span>
                  </div>
                  <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
                    <span className="text-[10px] uppercase font-bold text-purple-800 block">Total Registrations</span>
                    <span className="text-2xl font-serif font-bold text-purple-800 mt-1 block">
                      {workshopRegistrations.length}
                    </span>
                  </div>
                </div>

                {/* Section 1: Workshop Cohorts Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-serif font-bold text-[#163A36]">
                      Cohorts & Seat Availability Control
                    </h4>
                    <span className="text-xs text-gray-500">
                      Toggle statuses and update seat limits in 1-click
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workshops.map((w) => {
                      const capacity = editingCapacity[w.id]?.capacity ?? (w.capacity || 25);
                      const registeredCount = editingCapacity[w.id]?.registeredCount ?? (w.registeredCount || 0);
                      const seatsRemaining = Math.max(0, capacity - registeredCount);
                      const isComingSoon = w.status === 'COMING_SOON' || w.isComingSoon || (w.title || '').toLowerCase().includes('coming soon');
                      const isSoldOut = w.status === 'SOLD_OUT';
                      const isUpdating = updatingWorkshopId === w.id;

                      const pctBooked = Math.min(100, Math.round((registeredCount / (capacity || 1)) * 100));

                      return (
                        <div key={w.id} className="bg-[#FAF4EA] p-5 rounded-2xl border border-[#E6D5B8] space-y-4 relative">
                          {/* Top Row: Title + Category */}
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#163A36] text-[#F7F1E6]">
                                  {w.category || 'Wisdom Cohort'}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {w.isOnline ? '🌐 Live Zoom' : '🏛️ Sanctuary Office'}
                                </span>
                              </div>
                              <h4 className="font-serif font-bold text-base text-[#163A36] leading-snug">
                                {w.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {w.displayDate || w.date} • {w.startTime || w.duration}
                              </p>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {isComingSoon ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                  Coming Soon
                                </span>
                              ) : isSoldOut ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
                                  Sold Out
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                                  Open
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Pricing details */}
                          <div className="text-xs bg-white p-2.5 rounded-xl border border-[#E6D5B8] flex items-center justify-between">
                            <span className="text-gray-500">Tuition per seat:</span>
                            <span className="font-bold text-[#163A36]">
                              {w.isFree
                                ? 'Free Sacred Offering'
                                : (w.price !== null && w.price !== undefined && w.price > 0)
                                  ? `₹${w.price.toLocaleString('en-IN')}`
                                  : 'No Price Tag (Open Cohort)'}
                            </span>
                          </div>

                          {/* Status Switcher Buttons */}
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-1.5">
                              Cohort Registration Gate
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateWorkshopStatus(w, 'OPEN')}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                  !isComingSoon && !isSoldOut
                                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                    : 'bg-white border-[#D9D2C3] text-gray-700 hover:border-emerald-600'
                                }`}
                              >
                                ✓ Open
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateWorkshopStatus(w, 'COMING_SOON')}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                  isComingSoon
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                    : 'bg-white border-[#D9D2C3] text-gray-700 hover:border-amber-600'
                                }`}
                              >
                                🔒 Coming Soon
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateWorkshopStatus(w, 'SOLD_OUT')}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                  isSoldOut
                                    ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                                    : 'bg-white border-[#D9D2C3] text-gray-700 hover:border-rose-600'
                                }`}
                              >
                                ✕ Sold Out
                              </button>
                            </div>
                            {isComingSoon && (
                              <p className="mt-1 text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                                🔒 Bookings are blocked for seekers on the website until you switch this to "Open".
                              </p>
                            )}
                          </div>

                          {/* Seat Capacity & Remaining Editor */}
                          <div className="bg-white p-3 rounded-xl border border-[#E6D5B8] space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#163A36]">Seat Capacity & Remaining</span>
                              <span className={`font-bold ${seatsRemaining < 5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {seatsRemaining} / {capacity} seats remaining
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  pctBooked >= 100 ? 'bg-rose-600' : pctBooked >= 80 ? 'bg-amber-500' : 'bg-emerald-600'
                                }`}
                                style={{ width: `${pctBooked}%` }}
                              />
                            </div>

                            {/* Inline Edit Inputs */}
                            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                              <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-0.5">
                                  Total Capacity
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={capacity}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setEditingCapacity(prev => ({
                                      ...prev,
                                      [w.id]: { capacity: val, registeredCount: prev[w.id]?.registeredCount ?? (w.registeredCount || 0) }
                                    }));
                                  }}
                                  className="w-full rounded-lg border border-[#D9D2C3] bg-white px-2 py-1.5 text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-0.5">
                                  Booked Seats
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={registeredCount}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setEditingCapacity(prev => ({
                                      ...prev,
                                      [w.id]: { capacity: prev[w.id]?.capacity ?? (w.capacity || 25), registeredCount: val }
                                    }));
                                  }}
                                  className="w-full rounded-lg border border-[#D9D2C3] bg-white px-2 py-1.5 text-xs font-mono"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleSaveWorkshopCapacity(w, capacity, registeredCount)}
                              className="w-full py-1.5 rounded-lg bg-[#163A36] text-[#F7F1E6] hover:bg-[#0E2623] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isUpdating ? 'Saving Seats...' : 'Save Seat Capacity'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Workshop Registrations & Payment Tracking */}
                <div className="space-y-4 pt-4 border-t border-[#E6D5B8]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-base font-serif font-bold text-[#163A36]">
                        Registered Seekers & Payment Proofs ({workshopRegistrations.length})
                      </h4>
                      <p className="text-xs text-gray-500">
                        Seekers who enrolled online or through WhatsApp
                      </p>
                    </div>
                  </div>

                  {workshopRegistrations.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-[#E6D5B8] text-center text-xs text-gray-500 space-y-2">
                      <Sparkles className="w-6 h-6 text-[#DFC38A] mx-auto" />
                      <p>No workshop registrations recorded yet. Once seekers register, their full payment details and UTR will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {workshopRegistrations.map((reg, idx) => {
                        const isPaid = reg.totalAmount > 0 && reg.paymentMethod !== 'FREE';
                        const isConfirmed = reg.paymentStatus === 'CONFIRMED';
                        const isPending = reg.paymentStatus === 'VERIFICATION_PENDING' || reg.paymentStatus === 'WHATSAPP_PENDING' || reg.paymentStatus === 'PENDING';

                        return (
                          <div
                            key={reg.id || idx}
                            className={`p-5 rounded-2xl border transition-all ${
                              isConfirmed
                                ? 'bg-white border-[#E6D5B8]'
                                : 'bg-amber-50/50 border-amber-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6D5B8]/60">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-serif font-bold text-sm text-[#163A36]">
                                    {reg.name}
                                  </h5>
                                  <span className="text-[10px] font-mono text-gray-400">
                                    #{reg.id?.slice(-8) || `REG-${idx + 1}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600 mt-1 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                    <a href={`tel:${reg.phone}`} className="hover:underline">{reg.phone}</a>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{reg.email}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isConfirmed
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}>
                                  {isConfirmed ? '✓ Confirmed' : reg.paymentStatus?.replace('_', ' ') || 'Pending'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {new Date(reg.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            {/* Details Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Workshop Cohort</span>
                                <span className="font-semibold text-[#163A36]">{reg.workshopTitle}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Reserved Seats & Investment</span>
                                <span className="font-bold text-[#163A36]">
                                  {reg.seats} {reg.seats === 1 ? 'Seat' : 'Seats'} • {reg.totalAmount > 0 ? `₹${Number(reg.totalAmount).toLocaleString('en-IN')}` : 'Free Offering'}
                                </span>
                                <span className="text-[10px] text-gray-500 block">Method: {reg.paymentMethod}</span>
                              </div>

                              {/* UTR / Screenshot details */}
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold block">UTR Reference</span>
                                {reg.utr ? (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono font-bold text-xs bg-gray-100 px-2 py-0.5 rounded text-[#163A36]">
                                      {reg.utr}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(reg.utr);
                                        showToast('Copied', 'UTR copied to clipboard', 'info');
                                      }}
                                      className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">No UTR provided</span>
                                )}

                                {reg.paymentScreenshot && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage(reg.paymentScreenshot)}
                                    className="mt-1 text-[10px] font-bold text-[#C56A45] hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View Receipt Proof</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Actions Row */}
                            <div className="mt-3 pt-3 border-t border-[#E6D5B8]/50 flex items-center justify-between flex-wrap gap-2">
                              <a
                                href={`https://wa.me/${(reg.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`🙏 Namaste ${reg.name}, this is Falgun Thakkr from SHIV DHARA regarding your seat in "${reg.workshopTitle}".`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Message on WhatsApp</span>
                              </a>

                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRegistrationStatus(reg.id, 'CONFIRMED')}
                                  className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify & Confirm Seat</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODULE 9: PRODUCTS & BOUTIQUE MANAGER */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="pb-4 border-b border-[#E6D5B8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#163A36]">Products & Boutique ({adminProducts.length})</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Add, edit, deactivate, and manage pricing for all shop products</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={loadAdminProducts}
                      disabled={productLoading}
                      className="px-3 py-2 rounded-xl border border-[#E6D5B8] bg-white text-xs font-bold text-[#163A36] flex items-center gap-2 hover:bg-[#FAF4EA] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${productLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={openAddProduct}
                      className="px-4 py-2 rounded-xl bg-[#163A36] hover:bg-[#0E2623] text-[#F7F1E6] text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>
                </div>

                {/* Add / Edit Form */}
                {showProductForm && (
                  <div className="bg-[#FAF4EA] rounded-2xl border border-[#E6D5B8] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-[#163A36] text-base">
                        {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
                      </h4>
                      <button type="button" onClick={() => setShowProductForm(false)} className="p-1.5 rounded-full hover:bg-[#E6D5B8] cursor-pointer">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Product Name *</label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Ruby Bracelet for Number 1"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E6D5B8] bg-white text-sm text-[#163A36] focus:outline-none focus:border-[#C56A45]"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Category</label>
                        <select
                          value={productForm.category}
                          onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E6D5B8] bg-white text-sm text-[#163A36] focus:outline-none focus:border-[#C56A45] cursor-pointer"
                        >
                          <option value="bracelets">Bracelets</option>
                          <option value="malas">Malas</option>
                          <option value="pendants">Pendants</option>
                          <option value="rings">Rings</option>
                          <option value="crystals">Crystals</option>
                          <option value="books">Books</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Stock Quantity</label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.stock}
                          onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E6D5B8] bg-white text-sm text-[#163A36] focus:outline-none focus:border-[#C56A45]"
                        />
                      </div>

                      {/* Pricing Options */}
                      <div className="sm:col-span-2 space-y-3">
                        <label className="text-[10px] uppercase font-bold text-gray-500 block">Pricing</label>
                        <div className="flex flex-wrap gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="pricingMode"
                              checked={!productForm.isFree && !productForm.noPrice}
                              onChange={() => setProductForm(f => ({ ...f, isFree: false, noPrice: false }))}
                              className="accent-[#C56A45]"
                            />
                            <span className="text-xs font-medium text-[#163A36]">Paid (enter amount)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="pricingMode"
                              checked={productForm.isFree}
                              onChange={() => setProductForm(f => ({ ...f, isFree: true, noPrice: false, price: '' }))}
                              className="accent-[#C56A45]"
                            />
                            <span className="text-xs font-medium text-[#163A36]">Free</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="pricingMode"
                              checked={productForm.noPrice}
                              onChange={() => setProductForm(f => ({ ...f, isFree: false, noPrice: true, price: '' }))}
                              className="accent-[#C56A45]"
                            />
                            <span className="text-xs font-medium text-[#163A36]">No price shown</span>
                          </label>
                        </div>
                        {!productForm.isFree && !productForm.noPrice && (
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 2499"
                            value={productForm.price}
                            onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#E6D5B8] bg-white text-sm text-[#163A36] focus:outline-none focus:border-[#C56A45]"
                          />
                        )}
                      </div>

                      {/* Short Description */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Short Description (shown in listing)</label>
                        <input
                          type="text"
                          value={productForm.shortDescription}
                          onChange={e => setProductForm(f => ({ ...f, shortDescription: e.target.value }))}
                          placeholder="One-line tagline for the product card"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E6D5B8] bg-white text-sm text-[#163A36] focus:outline-none focus:border-[#C56A45]"
                        />
                      </div>

                      {/* Full Description */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Full Description</label>
                        <textarea
                          value={productForm.description}
                          onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                          rows={3}
                          placeholder="Detailed product description..."
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E6D5B8] bg-white text-sm text-[#163A36] focus:outline-none focus:border-[#C56A45] resize-none"
                        />
                      </div>

                      {/* Image URLs */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Image URLs (comma-separated)</label>
                        <input
                          type="text"
                          value={productForm.images}
                          onChange={e => setProductForm(f => ({ ...f, images: e.target.value }))}
                          placeholder="https://... , https://..."
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E6D5B8] bg-white text-sm text-[#163A36] focus:outline-none focus:border-[#C56A45]"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Leave blank to use default product image. Use direct image links (Unsplash, Cloudinary, etc.)</p>
                      </div>

                      {/* Toggles */}
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={productForm.active} onChange={e => setProductForm(f => ({ ...f, active: e.target.checked }))} className="accent-[#163A36] w-4 h-4" />
                          <span className="text-xs font-medium text-[#163A36]">Active (visible in shop)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm(f => ({ ...f, featured: e.target.checked }))} className="accent-[#C56A45] w-4 h-4" />
                          <span className="text-xs font-medium text-[#163A36]">Featured on homepage</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveProduct}
                        disabled={savingProduct}
                        className="px-5 py-2.5 rounded-xl bg-[#163A36] hover:bg-[#0E2623] text-[#F7F1E6] text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {savingProduct ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#E6B55A]" />}
                        {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
                      </button>
                      <button type="button" onClick={() => setShowProductForm(false)} className="px-5 py-2.5 rounded-xl border border-[#E6D5B8] text-xs font-bold text-[#163A36] hover:bg-[#FAF4EA] cursor-pointer transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Product List */}
                {productLoading ? (
                  <div className="flex items-center justify-center py-16 text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Loading products...</span>
                  </div>
                ) : adminProducts.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 space-y-2">
                    <Package className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm">No custom products added yet. Click <strong>Add Product</strong> above.</p>
                    <p className="text-xs">Default catalog products are always visible in the shop.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminProducts.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${p.active !== false ? 'border-[#E6D5B8] bg-white' : 'border-gray-200 bg-gray-50 opacity-60'}`}
                      >
                        {/* Image */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E6D5B8] shrink-0 bg-[#FAF4EA] flex items-center justify-center">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-300" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-[#163A36] truncate">{p.name}</span>
                            {p.featured && <span className="px-2 py-0.5 bg-[#E6B55A]/20 text-[#8B6914] text-[10px] font-bold rounded-full">★ Featured</span>}
                            {p.active === false && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">Hidden</span>}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                            <span className="capitalize">{p.category || 'General'}</span>
                            <span>Stock: {p.stock ?? '—'}</span>
                            <span className="font-semibold text-[#163A36]">
                              {p.isFree ? 'Free' : p.price != null ? `₹${p.price.toLocaleString('en-IN')}` : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleProductActive(p)}
                            title={p.active !== false ? 'Hide product' : 'Show product'}
                            className="p-2 rounded-xl border border-[#E6D5B8] hover:bg-[#FAF4EA] text-[#163A36] cursor-pointer transition-all"
                          >
                            {p.active !== false ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditProduct(p)}
                            className="p-2 rounded-xl border border-[#E6D5B8] hover:bg-[#FAF4EA] text-[#163A36] cursor-pointer transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            disabled={deletingProductId === p.id}
                            className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer transition-all disabled:opacity-50"
                          >
                            {deletingProductId === p.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Image Preview Modal for Order Receipts */}
      <AnimatePresence>
        {previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-4 rounded-3xl max-w-xl w-full border border-gray-200 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h4 className="text-sm font-bold text-gray-900 mb-3">UPI Payment Receipt Proof</h4>
              <img
                src={previewImage}
                alt="Payment Receipt"
                className="w-full max-h-[70vh] object-contain rounded-2xl border border-gray-200"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seeker Journey & Historical Sessions Timeline Modal */}
      <AnimatePresence>
        {selectedSeekerHistory && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedSeekerHistory(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#FAF6EE] text-[#163A36] max-w-2xl w-full rounded-[2.5rem] border border-[#E6D5B8] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0E2623] to-[#163A36] text-[#F7F1E6] p-6 flex items-center justify-between border-b border-[#E6B55A]/30">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white p-1 border-2 border-[#E6B55A] flex items-center justify-center font-bold text-sm shadow-md">
                    {selectedSeekerHistory.user?.avatar ? (
                      <img
                        src={selectedSeekerHistory.user.avatar}
                        alt="Avatar"
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      selectedSeekerHistory.user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E6B55A] font-bold block">
                      Seeker Historical Journey
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#F7F1E6]">
                      {selectedSeekerHistory.user?.name}
                    </h3>
                    <p className="text-xs text-gray-300 font-sans">{selectedSeekerHistory.user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSeekerHistory(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Profile Intelligence Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-400">First Registered</span>
                    <div className="font-bold text-xs text-[#163A36]">
                      {selectedSeekerHistory.user?.firstJoinedFormatted || 'Initial Registration'}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-400">Last Active Visit</span>
                    <div className="font-bold text-xs text-emerald-800">
                      {selectedSeekerHistory.user?.lastLoginFormatted || 'Active Today'}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E6D5B8] space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-400">Total Visits</span>
                    <div className="font-mono font-bold text-base text-[#C56A45]">
                      {selectedSeekerHistory.user?.loginCount || 1} Logins
                    </div>
                  </div>
                </div>

                {/* Currently Saved Cart in Account */}
                <div className="bg-white p-5 rounded-2xl border border-[#E6D5B8] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-[#C56A45]" />
                      <h4 className="font-serif font-bold text-sm text-[#163A36]">
                        Products Currently Saved in Customer's Cart
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#163A36]">
                      ₹{(selectedSeekerHistory.total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {(!selectedSeekerHistory.cart || selectedSeekerHistory.cart.length === 0) ? (
                    <p className="text-xs text-gray-500 italic py-2">
                      No items currently saved in this seeker's account cart.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSeekerHistory.cart.map((it: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-[#FAF6EE] p-3 rounded-xl border border-[#E6D5B8]"
                        >
                          <div className="flex items-center gap-3">
                            {it.product?.images?.[0] && (
                              <img
                                src={it.product.images[0]}
                                alt={it.product.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                              />
                            )}
                            <div>
                              <span className="font-bold text-xs text-[#163A36] block">{it.product?.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">
                                Qty: {it.quantity} {it.selectedVariant?.name ? `• ${it.selectedVariant.name}` : ''}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold font-mono text-[#163A36]">
                            ₹{((it.selectedVariant?.price || it.product?.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Session Timeline History */}
                <div className="bg-white p-5 rounded-2xl border border-[#E6D5B8] space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C56A45]" />
                    <h4 className="font-serif font-bold text-sm text-[#163A36]">
                      Historical Logins & Visits Timeline
                    </h4>
                  </div>

                  {(!selectedSeekerHistory.user?.loginSessions || selectedSeekerHistory.user.loginSessions.length === 0) ? (
                    <div className="text-xs text-gray-600 bg-[#FAF6EE] p-3 rounded-xl border border-[#E6D5B8]">
                      • Initial Visit & Registration: {selectedSeekerHistory.user?.firstJoinedFormatted || 'Recorded'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSeekerHistory.user.loginSessions.map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-[#FAF6EE] p-3 rounded-xl border border-[#E6D5B8] text-xs font-sans"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-bold text-[#163A36]">{s.formattedDay}, {s.formattedDate}</span>
                            <span className="text-gray-500 font-mono">at {s.formattedTime}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                            {s.action || 'Sign In'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Outreach CTAs */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <a
                    href={`mailto:${selectedSeekerHistory.user?.email}?subject=Namaste from Falgun Thakkr | SHIV DHARA`}
                    className="px-4 py-2.5 rounded-xl bg-[#163A36] hover:bg-[#0E2623] text-[#F7F1E6] text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#E6B55A]" />
                    <span>Send Email Message</span>
                  </a>

                  <a
                    href={`https://wa.me/${(selectedSeekerHistory.user?.phone || '916359666315').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Namaste ${selectedSeekerHistory.user?.name}, this is Falgun Thakkr from SHIV DHARA. How may we assist your journey today?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
