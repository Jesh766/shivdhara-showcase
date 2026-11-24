import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { ScrollProgress } from './components/common/ScrollProgress';
import { AmbientGlowCursor } from './components/common/AmbientGlowCursor';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ConsultationModal } from './components/booking/ConsultationModal';
import { DharaChatbot } from './components/ai/DharaChatbot';
import { useLenis } from './lib/lenis';
import { initClarity, trackPageView, trackEvent } from './lib/analytics';
import { EasterEgg } from './components/common/EasterEgg';
import { CookieConsent } from './components/common/CookieConsent';
import { SlidersHorizontal, Minus, X } from 'lucide-react';

// Pages
import { HomePage } from './components/pages/HomePage';

// Lazy-loaded secondary pages for bundle code-splitting
const NumerologyPage = React.lazy(() => import('./components/pages/NumerologyPage').then((m) => ({ default: m.NumerologyPage })));
const VastuPage = React.lazy(() => import('./components/pages/VastuPage').then((m) => ({ default: m.VastuPage })));
const MeditationPage = React.lazy(() => import('./components/pages/MeditationPage').then((m) => ({ default: m.MeditationPage })));
const WorkshopsPage = React.lazy(() => import('./components/pages/WorkshopsPage').then((m) => ({ default: m.WorkshopsPage })));
const ProductsPage = React.lazy(() => import('./components/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const CheckoutPage = React.lazy(() => import('./components/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const BlogPage = React.lazy(() => import('./components/pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const ContactPage = React.lazy(() => import('./components/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const FaqPage = React.lazy(() => import('./components/pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const LegalPages = React.lazy(() => import('./components/pages/LegalPages').then((m) => ({ default: m.LegalPages })));
const AdminPortal = React.lazy(() => import('./components/pages/AdminPortal').then((m) => ({ default: m.AdminPortal })));

import { Workshop, Product, SiteSettings } from './types';
import { getAdminToken } from './lib/auth';
import { PAYMENT_CONFIG } from './lib/paymentConfig';

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-[#F7F1E6] flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-[#163A36] border-t-[#E6B55A] rounded-full animate-spin" />
      <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#163A36]/70">
        Loading Sanctum...
      </span>
    </div>
  </div>
);

const defaultSiteSettings: SiteSettings = {
  brandName: 'SHIV DHARA',
  heroTitle: 'Align Your Numbers. Align Your Space. Align Within.',
  heroSubtitle: 'A grounded synthesis of ancient sciences, harmonious spatial architecture, and conscious stillness guided by Falgun Thakkr.',
  whatsappNumber: PAYMENT_CONFIG.WHATSAPP_ORDER_NUMBER,
  upiId: PAYMENT_CONFIG.UPI_ID,
  contactEmail: 'contact@shivdhara.co.in',
  contactPhone: '+91 63596 66315',
  footerText: 'Align Your Numbers. Align Your Space. Align Within.',
};

export function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== '/') {
        window.history.replaceState({}, '', hash);
        return hash;
      }
      return window.location.pathname || '/';
    }
    return '/';
  });
  const legalTabMap: Record<string, 'privacy' | 'terms' | 'shipping' | 'refund' | 'cookies'> = {
  privacy: 'privacy',
  cookies: 'cookies',
  terms: 'terms',
  shipping: 'shipping',
  refund: 'refund',
};

const legalTab = (() => {
  if (!currentPath.startsWith('/legal')) return 'privacy';

  const query = currentPath.split('?')[1];
  const params = new URLSearchParams(query);
  const tab = params.get('tab') || 'privacy';

  return legalTabMap[tab] || 'privacy';
})();
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationInitialService, setConsultationInitialService] = useState<string | undefined>(undefined);

  const handleOpenConsultation = (serviceName?: string) => {
    setConsultationInitialService(serviceName);
    setIsConsultationOpen(true);
  };
  const [selectedWorkshopForModal, setSelectedWorkshopForModal] = useState<Workshop | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [editorMode, setEditorMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('shiv_dhara_editor_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Global editor minimize state — persists across ALL page navigation and reloads
  const [editorMinimized, setEditorMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('shiv_dhara_editor_minimized') === 'true';
    } catch {
      return false;
    }
  });

  const handleSetEditorMinimized = (minimized: boolean) => {
    setEditorMinimized(minimized);
    try {
      localStorage.setItem('shiv_dhara_editor_minimized', String(minimized));
    } catch {}
  };

  // Initialize Lenis smooth scroll and GSAP integration
  useLenis();

  useEffect(() => {
    const token = getAdminToken();
    fetch('/api/editor/site-settings', {
      headers: {
        'x-admin-token': token,
      },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.siteSettings) {
          setSiteSettings(data.siteSettings);
        }
      })
      .catch(() => undefined);
  }, []);

  // Initialize Microsoft Clarity Analytics on mount
  useEffect(() => {
    initClarity();
  }, []);

  // Scroll to top, update document title, canonical, and meta tags on path change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackPageView(currentPath);

    const pageTitles: Record<string, string> = {
      '/': 'SHIV DHARA — Numerology, Vastu Shastra, Astrology & Meditation | By Falgun Thakkr',
      '/numerology': 'Numerology, Planetary Frequency & Astrology Blueprint | SHIV DHARA',
      '/vastu': 'Spatial Vastu Vidya & Architecture (Non-Destructive) | SHIV DHARA',
      '/meditation': 'Conscious Meditation & Pranic Breath Sanctuary | SHIV DHARA',
      '/workshops': 'Upcoming Immersive Masterclasses & Cohorts | SHIV DHARA',
      '/products': 'Energized Gemstone Crystal Bracelets & Boutique | SHIV DHARA',
      '/checkout': 'Secure Checkout | SHIV DHARA',
      '/blog': 'Wisdom Journal & Reflections | SHIV DHARA',
      '/contact': 'Contact & Private Consultation with Falgun Thakkr | SHIV DHARA',
      '/faq': 'Frequently Asked Questions | SHIV DHARA',
      '/legal': 'Legal & Ethics Policies | SHIV DHARA',
      '/admin': 'Master Administration Portal | SHIV DHARA',
    };

    const pageDescriptions: Record<string, string> = {
      '/': 'Align Your Numbers. Align Your Space. Align Within. Bespoke Numerology, non-destructive Vastu Shastra, Astrology guidance, mindful meditation cohorts, and handcrafted gemstone crystal bracelets with Falgun Thakkr.',
      '/numerology': 'Discover your life path, destiny vibrations, and planetary astrology alignment with comprehensive bespoke Vedic numerology consultations by Falgun Thakkr.',
      '/vastu': 'Transform your living and workspaces with authentic, non-destructive Vastu Shastra principles. Balance the 16 cardinal zones and 5 sacred elements without demolition.',
      '/meditation': 'Immerse yourself in authentic Vedic breathwork, deep Dhyana, and guided inner stillness. Private and cohort meditation sanctuaries guided by Falgun Thakkr.',
      '/workshops': 'Interactive masterclasses and intensive cohort certifications in sacred Vastu architecture, planetary numerology, astrology, and pranayama.',
      '/products': 'Curated collection of authentic, consecrated semi-precious gemstone crystal bracelets (Sunstone, Citrine, Clear Quartz, Rose Quartz, Amethyst) attuned to your numerology frequencies.',
      '/checkout': 'Secure cart and direct consultation confirmation with Shiv Dhara.',
      '/blog': 'Sacred wisdom journal exploring non-destructive Vastu, planetary vibrations, cosmic astrology cycles, and conscious mindfulness.',
      '/contact': 'Book a private bespoke consultation with Falgun Thakkr for Numerology, Vastu audits, Astrology, or Meditation journeys.',
      '/faq': 'Answers to frequently asked questions about Vastu without demolition, numerology reports, meditation cohorts, and consecrated gemstones.',
      '/legal': 'Ethics, privacy, terms of consultation, shipping policies, and client sanctity guidelines of Shiv Dhara.',
      '/admin': 'Administration and configuration portal for Shiv Dhara.',
    };

    const baseTitle = pageTitles[currentPath] || 'SHIV DHARA — By Falgun Thakkr';
    const baseDesc = pageDescriptions[currentPath] || pageDescriptions['/'];
    const currentUrl = `https://www.shivdhara.co.in${currentPath === '/' ? '' : currentPath}`;

    document.title = baseTitle;

    // Disallow admin portal from indexing; allow public routes
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (currentPath === '/admin') {
      if (robotsMeta) robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else {
      if (robotsMeta) robotsMeta.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', baseDesc);

    // Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentUrl);
    }

    // Update OG Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', baseTitle);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', baseDesc);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', currentUrl);
  }, [currentPath]);

  // Handle browser popstate / back button
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      const path = hash || window.location.pathname || '/';
      setCurrentPath(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    // Redirect legacy /about links to the consolidated home page
    const resolvedPath = path === '/about' ? '/' : path;
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', resolvedPath);
    }
    setCurrentPath(resolvedPath);
  };

  const handleSelectWorkshop = (workshop: Workshop) => {
    setSelectedWorkshopForModal(workshop);
    navigate('/workshops');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductForModal(product);
    navigate('/products');
  };

  const handleOpenEditorMode = () => {
    try {
      localStorage.setItem('shiv_dhara_editor_mode', 'true');
      localStorage.setItem('shiv_dhara_editor_minimized', 'false');
    } catch {}
    setEditorMode(true);
    setEditorMinimized(false);
    navigate('/');
  };

  const handleExitEditorMode = () => {
    try {
      localStorage.removeItem('shiv_dhara_editor_mode');
      localStorage.removeItem('shiv_dhara_editor_minimized');
    } catch {}
    setEditorMode(false);
    setEditorMinimized(false);
    navigate('/admin');
  };

  const getEditorLabel = () => {
    if (currentPath === '/') return 'Home Editor';
    if (currentPath === '/products') return 'Products Editor';
    if (currentPath === '/workshops') return 'Workshops Editor';
    if (currentPath === '/numerology') return 'Numerology Page';
    if (currentPath === '/vastu') return 'Vastu Page';
    if (currentPath === '/meditation') return 'Meditation Page';
    if (currentPath === '/checkout') return 'Checkout Page';
    if (currentPath === '/blog') return 'Blog Editor';
    if (currentPath === '/contact') return 'Contact Page';
    if (currentPath === '/faq') return 'FAQ Page';
    return 'Site Editor';
  };

  return (
    <div className="min-h-screen bg-[#FAF4EA] text-[#2B211E] flex flex-col font-sans selection:bg-[#A85C3B]/25 selection:text-[#2B211E] w-full max-w-full overflow-x-hidden">
      {/* Editorial Scroll Progress Line */}
      <ScrollProgress />

      {/* Ambient Mouse Glow for Desktop — also feeds the shared pointer tracker
          that the hero particle field reads for cursor repulsion */}
      <AmbientGlowCursor />

      {/* Global Navbar (hidden on admin portal for clean focus) */}
      {currentPath !== '/admin' && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenConsultation={() => handleOpenConsultation()}
        />
      )}

      {/* Page Routing */}
      <main className="flex-1">
        <React.Suspense fallback={<PageLoadingFallback />}>
          {currentPath === '/' && (
            <HomePage
              onNavigate={navigate}
              onOpenConsultation={handleOpenConsultation}
              onSelectWorkshop={handleSelectWorkshop}
              onSelectProduct={handleSelectProduct}
              siteSettings={siteSettings}
              editorMode={editorMode}
              isMinimized={editorMinimized}
              onToggleMinimize={handleSetEditorMinimized}
              onExitEditorMode={handleExitEditorMode}
              onUpdateSiteSettings={setSiteSettings}
            />
          )}

          {currentPath === '/numerology' && (
            <NumerologyPage
              onNavigate={navigate}
              onOpenConsultation={handleOpenConsultation}
            />
          )}

          {currentPath === '/vastu' && (
            <VastuPage
              onNavigate={navigate}
              onOpenConsultation={handleOpenConsultation}
            />
          )}

          {currentPath === '/meditation' && (
            <MeditationPage
              onNavigate={navigate}
              onOpenConsultation={handleOpenConsultation}
            />
          )}

          {currentPath === '/workshops' && (
            <WorkshopsPage
              onOpenConsultation={handleOpenConsultation}
              selectedWorkshopInitial={selectedWorkshopForModal}
              editorMode={editorMode}
              isMinimized={editorMinimized}
              onToggleMinimize={handleSetEditorMinimized}
              onExitEditorMode={handleExitEditorMode}
              onUpdateSiteSettings={setSiteSettings}
            />
          )}

          {currentPath === '/products' && (
            <ProductsPage
              onNavigateToCheckout={() => navigate('/checkout')}
              selectedProductInitial={selectedProductForModal}
              editorMode={editorMode}
              isMinimized={editorMinimized}
              onToggleMinimize={handleSetEditorMinimized}
              onExitEditorMode={handleExitEditorMode}
              onUpdateSiteSettings={setSiteSettings}
            />
          )}

          {currentPath === '/checkout' && (
            <CheckoutPage
              onNavigateToProducts={() => navigate('/products')}
              onNavigateToHome={() => navigate('/')}
            />
          )}

          {currentPath === '/blog' && (
            <BlogPage
              onOpenConsultation={handleOpenConsultation}
            />
          )}

          {currentPath === '/contact' && (
            <ContactPage />
          )}

          {currentPath === '/faq' && (
            <FaqPage
              onOpenConsultation={handleOpenConsultation}
            />
          )}

          {currentPath.startsWith('/legal') && (
            <LegalPages initialTab={legalTab} />
          )}

          {currentPath === '/admin' && (
            <AdminPortal
              onNavigateHome={() => navigate('/')}
              onOpenEditor={handleOpenEditorMode}
              onExitEditorMode={handleExitEditorMode}
              isEditorMode={editorMode}
            />
          )}
        </React.Suspense>
      </main>

      {/* ===================================================================
          GLOBAL EDITOR MINIMIZE PILL — Rendered at App level so it persists
          across ALL page navigation when editor mode is active & minimized.
         =================================================================== */}
      {editorMode && editorMinimized && currentPath !== '/admin' && (
        <button
          type="button"
          onClick={() => handleSetEditorMinimized(false)}
          className="fixed bottom-24 right-4 z-[60] flex items-center gap-2 rounded-full bg-[#163A36] text-[#F7F1E6] px-4 py-2.5 shadow-2xl border border-[#E6B55A]/60 hover:bg-[#0E2623] cursor-pointer transition-all sm:bottom-24 sm:right-6 group"
          title={`Expand ${getEditorLabel()}`}
          aria-label="Expand Live Editor"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#E6B55A] group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-serif font-bold tracking-wide">{getEditorLabel()}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* ===================================================================
          UNIVERSAL SITE EDITOR OVERLAY (for secondary pages: Numerology, Vastu, etc.)
         =================================================================== */}
      {editorMode && !editorMinimized && currentPath !== '/' && currentPath !== '/products' && currentPath !== '/workshops' && currentPath !== '/admin' && (
        <div className="fixed left-3 right-3 top-20 z-[60] max-h-[calc(100vh-6rem)] w-auto overflow-y-auto rounded-2xl border border-[#D9D2C3] bg-[#FFFDF9]/95 p-4 shadow-2xl backdrop-blur-md sm:left-auto sm:right-4 sm:top-24 sm:max-h-[calc(100vh-7rem)] sm:w-[350px]">
          <div className="mb-3 flex items-center justify-between border-b border-[#D9D2C3]/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A6833D]">Live Editor</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetEditorMinimized(true)}
                title="Minimize Editor"
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/70 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Minimize Editor"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleExitEditorMode}
                title="Close & Exit Editor Mode"
                className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                aria-label="Close & Exit Editor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#101827]">
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
              <span className="font-bold block">Viewing: {getEditorLabel()}</span>
              <p className="text-[10px] text-amber-800 leading-relaxed">
                Jump to edit specific content sections or adjust brand settings below.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Edit Specific Sections:</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-2 py-2 rounded-lg bg-[#FAF7F0] hover:bg-[#E6D5B8] border border-[#D9D2C3] font-bold text-[11px] text-[#163A36] text-center cursor-pointer transition-colors"
                >
                  🏠 Home
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="px-2 py-2 rounded-lg bg-[#FAF7F0] hover:bg-[#E6D5B8] border border-[#D9D2C3] font-bold text-[11px] text-[#163A36] text-center cursor-pointer transition-colors"
                >
                  🛍️ Products
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/workshops')}
                  className="px-2 py-2 rounded-lg bg-[#FAF7F0] hover:bg-[#E6D5B8] border border-[#D9D2C3] font-bold text-[11px] text-[#163A36] text-center cursor-pointer transition-colors"
                >
                  🎓 Workshops
                </button>
              </div>
            </div>

            <label className="block pt-2 border-t border-gray-100">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Brand Name</span>
              <input
                value={siteSettings.brandName}
                onChange={(e) => setSiteSettings((prev) => ({ ...prev, brandName: e.target.value }))}
                className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Footer Text</span>
              <input
                value={siteSettings.footerText}
                onChange={(e) => setSiteSettings((prev) => ({ ...prev, footerText: e.target.value }))}
                className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
              />
            </label>

            <button
              type="button"
              onClick={async () => {
                const token = getAdminToken();
                try {
                  const res = await fetch('/api/editor/site-settings', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-admin-token': token,
                    },
                    body: JSON.stringify({ siteSettings }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.siteSettings) setSiteSettings(data.siteSettings);
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              className="mt-3 w-full rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#101827] hover:bg-[#182236] text-[#F7F3EA] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Save Site Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Global Footer (hidden on admin portal) */}
      {currentPath !== '/admin' && (
        <Footer
          onNavigate={navigate}
          onOpenConsultation={() => handleOpenConsultation()}
          siteSettings={siteSettings}
        />
      )}

      {/* Global Consultation Booking Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => {
          setIsConsultationOpen(false);
          setConsultationInitialService(undefined);
        }}
        initialService={consultationInitialService}
      />

      {/* Global Slide-over Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => navigate('/checkout')}
        onNavigateToProducts={() => navigate('/products')}
      />

      {/* Global Floating AI Assistant Dhara */}
      <DharaChatbot
        currentPage={currentPath}
        onOpenConsultation={() => setIsConsultationOpen(true)}
        onNavigate={navigate}
      />

      {/* Global Floating WhatsApp Direct CTA */}
      <WhatsAppButton />

      {/* Global Toast Notification Container */}
      <ToastContainer />

      {/* Global Customer Auth Modal */}
      <AuthModal />

      {/* Sitewide easter egg — type "shiv" anywhere */}
      <EasterEgg />

      {/* Global Privacy & Cookie Consent Banner */}
      <CookieConsent onNavigateToLegal={(tab) => navigate(`/legal?tab=${tab}`)} />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;