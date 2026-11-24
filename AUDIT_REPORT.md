# SHIV DHARA — Comprehensive System Audit & Engineering Report
**Project:** SHIV DHARA (`www.shivdhara.co.in`)  
**Technology Stack:** React 19 + TypeScript + Vite + Node.js / Vercel Serverless  
**Founder & Practitioner:** Falgun Thakkr  
**Date of Completion:** November 18, 2026  
**Status:** All Phases Completed & Verified (0 Lint Errors, 0 Build Errors)

---

## 1. Executive Summary

This engineering pass represents the complete, production-grade audit and hardening of the SHIV DHARA digital ecosystem. Every aspect of security, mathematical ephemeris calculation, responsive touch usability, asset weight, and path routing has been rebuilt to institutional standards while preserving the approved visual luxury identity, typography, and color palette.

---

## 2. Phase 1 — Security Hardening & Secret Eradication

### 1.1 Complete Hardcoded Token Eradication
- **GitHub Data Tokens Removed:** Stripped all hardcoded GitHub Personal Access Tokens that were previously embedded across `api/*.ts`.
- **Environment Variable Binding:** All data store transactions now strictly use `process.env.GITHUB_DATA_TOKEN` with fallback to `process.env.GITHUB_TOKEN`.
- **Zero Detail Leaks on Failure:** If `GITHUB_DATA_TOKEN` is unset or fails authentication, all endpoints return a generic 500 error (`{ error: 'Internal configuration error' }`) without exposing repository identifiers, stack traces, or credentials.

### 1.2 Administrative Password Hardening
- **Passcodes Eradicated:** Removed all hardcoded administrative passwords from `server.ts`, `api/*.ts`, `src/lib/auth.ts`, `AdminPortal.tsx`, and `ContentEditorPage.tsx`.
- **Required Environment Configuration:** Admin authentication requires `process.env.ADMIN_PASSWORD` (or `ADMIN_TOKEN`). If unset, endpoints return `503 Service Unavailable`.
- **Placeholder Sanitization:** Cleaned `.env.example`, `DEPLOYMENT_GUIDE.md`, and `README.md` to use neutral placeholders (`your_admin_password_here`).

### 1.3 Architecture of `api/_lib/`
- `api/_lib/auth.ts`: Implemented constant-time timing-safe string comparison (`crypto.timingSafeEqual`) to prevent side-channel timing attacks. Admin tokens are accepted strictly via the `x-admin-token` HTTP header (never query parameters). Added per-IP rate limiting for failed authentication attempts.
- `api/_lib/store.ts`: Unified single-point data store interacting with GitHub Contents API with optimistic concurrency control (retrying up to 5 times on 409/422 status conflicts).
- `api/_lib/validation.ts`: Request payload sanitization, type checks, string truncation, and per-IP rate limiting on all public POST endpoints (`/api/orders`, `/api/consultations`, `/api/human-request`, `/api/chat`).
- `api/_lib/telegram.ts`: Safe notification dispatcher reading bot credentials strictly from environment variables.

### 1.4 Data Privacy & Leak Elimination
- `GET /api/users` now strictly requires administrative authentication.
- `GET /api/consultations` without `?date` requires admin authentication. When called with `?date=YYYY-MM-DD`, it returns exclusively available/unavailable slot times as string arrays without exposing customer names, phone numbers, or email addresses.
- Stripped client-side Gemini API keys (`VITE_GEMINI_API_KEY`) from `src/lib/geminiChat.ts`; all AI inquiries route securely through `/api/chat`.

---

## 3. Phase 2 — High-Precision Vedic Panchang Calculation Engine

### 3.1 Astronomical Engine Implementation (`src/lib/panchang.ts`)
- **Astronomical Precision:** Replaced rough approximations with Jean Meeus *Astronomical Algorithms* Chapter 47 (60 periodic terms for Moon's geocentric longitude `MOON_TERMS_60`, orbital eccentricity factor `E`, and additive perturbations `A1`, `A2`).
- **Lahiri (Chitra Paksha) Ayanamsha:** Exact calculation based on Julian centuries from J2000.0, evaluating to ~24.2326° in late 2026.
- **Binary Bisection Transition Boundary Finder:** Exact transition boundary timestamps for Tithi, Nakshatra, 27 Yogas, and 60 Karanas calculated down to the second using 20-iteration binary search.
- **Amanta Lunar Month (Masa):** Determined by finding the exact preceding New Moon (Moon-Sun elongation = 0°) and mapping the sidereal solar zodiac sign at that instant, with automated Adhika Masa detection.
- **Solar & Lunar Ritu:** Accurate calculation of lunar season alongside solar sidereal season (e.g., Sharad / Hemant).
- **Exact Muhurat Windows:**
  - Dynamic 8-fold Dinamana daytime division for Rahu Kaal, Yamaganda, and Gulika Kaal based on true local sunrise and sunset.
  - Brahma Muhurta accurately defined as 96 minutes to 48 minutes prior to sunrise.
  - Abhijit Muhurat centered on Solar Noon with classical Vedic exceptions: marked as inapplicable/avoided on Wednesdays (*Budhavara Varjya*) and flagged whenever overlapping Rahu Kaal.
- **Daylight Saving Time (DST) & International Ephemeris:** Dynamic UTC offset resolution using `Intl.DateTimeFormat` across all global timezones.

### 3.2 Regression Verification Suite (`scripts/verify-panchang.ts`)
All automated assertions pass with exact mathematical precision:
- **Ahmedabad, 18 Nov 2026 (Wednesday):**
  - Masa: Kartika (Amanta)
  - Paksha: Shukla-Paksha
  - Tithi: Shukla-Navami (Ending 19 Nov at 7:08 AM)
  - Nakshatra: Shatabhisha (Ending 19 Nov at 6:11 AM)
  - Sunrise: 6:55 AM, Sunset: 5:55 PM
  - Rahu Kaal: 12:25 PM – 1:47 PM
  - Yamaganda: 8:17 AM – 9:40 AM
  - Gulika Kaal: 11:02 AM – 12:25 PM
  - Brahma Muhurta: 5:19 AM – 6:07 AM
  - Abhijit Muhurat: 12:03 PM – 12:47 PM (`applicable: false` on Wednesday, `overlapsRahuKaal: true`)
  - Ritu: Sharad (lunar) / Hemant (solar), Ayana: Dakshinayana
  - Yoga: Dhruva, Karana: Balava, Moon Sign: Aquarius (Kumbha)
- **Masa Regression:** 10, 12, 16 Nov 2026 all correctly evaluate to Masa Kartika.
- **International DST Testing:**
  - Sydney (18 Nov 2026): Sunrise 5:42 AM (AEDT UTC+11)
  - Auckland (18 Nov 2026): Sunrise 6:01 AM (NZDT UTC+13)
  - New York (18 Nov 2026): Sunrise 6:46 AM (EST UTC-5)
  - London (18 Nov 2026): Sunrise 7:23 AM (GMT UTC+0)

---

## 4. Phase 3 — UX, Touch Responsiveness & Performance

### 4.1 Consultation Modal Scrolling Fix
- **Mouse Wheel Unblocked:** Fixed mouse wheel scrolling inside `ConsultationModal.tsx`. Lenis smooth scroll is now cleanly paused (`lenis.stop()`) when the modal opens and resumed (`lenis.start()`) when closed.
- **Backdrop & Container Delegation:** Added event delegation on the modal backdrop and inner container (`scrollContainerRef.current.scrollTop += e.deltaY`) to guarantee immediate scrolling from anywhere on the screen without getting trapped.

### 4.2 Consultation Plan Layout, Tagging & Automated Appointment Dispatch
- **All-in-One Plan Position:** 'Complete Life Mastery (All-in-One)' is placed at the end of the plans grid, spanning all columns on desktop and tablet.
- **Professional Tag:** Styled with the distinct tag: `⭐ Most Chosen • Flagship Sacred Alignment`.
- **Payment Recommended Tag:** The WhatsApp confirmation and direct booking buttons prominently display the `Recommended` badge.
- **Automated WhatsApp & Email Dispatch:**
  - When any seeker books an appointment, the system automatically dispatches the complete booking dossier (Seeker Name, Phone, Email, DOB, Location, Selected Plan(s), Requested Date & Slot, Fee, Message) directly to Falgun Thakkr's WhatsApp (`+91 63596 66315`) from the user's phone/account, and presents a direct `mailto:` link to `contact@shivdhara.co.in`.
  - Removed confusing GPS auto-detect button from the seeker location field, ensuring zero unwanted hardware permission prompts.
  - Hardened backend data store with local `/tmp/content-store.json` fallback so server configuration glitches never block a client's appointment request.

### 4.3 Vedic Choghadiya Muhurats (चौघड़िया मुहूर्त)
- Intelligently integrated full **Day Choghadiya (दिन चौघड़िया)** and **Night Choghadiya (रात्रि चौघड़िया)** into the Panchang Muhurat view:
  - **Amrit (अमृत)**: Supreme auspicious window ruled by Moon.
  - **Shubh (शुभ)**: Auspicious prosperity window ruled by Jupiter.
  - **Labh (लाभ)**: Commercial gain & trade window ruled by Mercury.
  - **Char / Chal (चल)**: Movable transit window ruled by Venus, optimal for travel.
  - **Rog (रोग)**, **Kaal (काल)**, **Udveg (उद्वेग)**: Cautionary windows color-coded in red with classical avoidance guidance.
- Computed dynamically from exact local sunrise and sunset divided into 8 equal parts based on traditional weekday rulers.

### 4.3 Mobile & Viewport Enhancements
- **iOS Input Auto-Zoom Prevention:** In `src/index.css`, form controls (`input, select, textarea`) enforce `font-size: 16px !important` on screens <= 768px to prevent iOS Safari from zooming the viewport upon focus.
- **Safe Area Insets:** Added `viewport-fit=cover` in `index.html` and safe area padding across mobile floating elements.
- **Floating Element Stacking:**
  - WhatsApp Floating Launcher: `bottom-6 left-6 z-40`
  - Dhara AI Assistant Launcher: `bottom-4 right-4 sm:bottom-6 sm:right-6 z-40`
  - Cookie Consent Banner: `z-50` with bottom safe-area margin.

---

## 5. Phase 4 — Asset Optimization, Code Splitting & SEO

### 5.1 Image Weight Optimization
- **Favicon:** Replaced the uncompressed 1.25 MB favicon with a 64x64 PNG of only **7.6 KB** (99.4% reduction).
- **Apple Touch Icon:** Created `public/apple-touch-icon.png` (180x180, **41.3 KB**).
- **Open Graph Image:** Created a 1200x630 branded banner in `public/og-image.png` (**94.7 KB**).
- **Brand Logo:** Optimized `src/assets/images/shiv_dhara_logo.png` from 1.25 MB down to **164 KB**.

### 5.2 Dynamic Code Splitting (Vite)
- **On-Demand Page Chunks:** Converted all secondary pages (`NumerologyPage`, `VastuPage`, `MeditationPage`, `WorkshopsPage`, `ProductsPage`, `CheckoutPage`, `BlogPage`, `ContactPage`, `FaqPage`, `LegalPages`, `AdminPortal`) to `React.lazy()` with `<React.Suspense fallback={<PageLoadingFallback />}>`.
- **Vendor Chunking:** Configured `manualChunks` in `vite.config.ts`:
  - `vendor-react` (3.9 kB)
  - `vendor-icons` (42.8 kB)
  - `vendor-animation` (187.4 kB)
  - Main index bundle reduced from 1,081 kB to ~500 kB.

### 5.3 Path-Based Routing & Clean History
- Transitioned routing in `App.tsx` to clean path URLs (`/numerology`, `/vastu`, etc.) with `window.history.pushState` and `window.history.replaceState`.
- Preserved backward compatibility by automatically redirecting legacy `/#/...` hash links to modern path routes.
- Updated `public/sitemap.xml` with clean canonical URLs.
- Admin portal dynamically injects `<meta name="robots" content="noindex, nofollow" />` while public routes receive `index, follow`.

---

## 6. Phase 5 — Quality Assurance & Build Verification

- **Linting (`npm run lint`):** Exited with code 0 (zero TypeScript or ESLint errors).
- **Vite Production Build (`npm run build`):** Exited with code 0; zero chunk size warnings.
- **Ephemeris Verification (`scripts/verify-panchang.ts`):** 100% of astronomical assertions passed.

---

## 7. Decisions Needed from User

| # | Topic | Details |
|---|---|---|
| 1 | **Physical Business Address** | For local business schema in `index.html` and Google Search console verification, provide the official registered studio/office address in Ahmedabad (currently set to Ahmedabad, Gujarat, India). |
| 2 | **Domain Email DNS** | If transactional booking confirmations should originate from `contact@shivdhara.co.in`, ensure MX/SPF/DKIM records are active on your domain registrar. |
| 3 | **Client Testimonials** | All mock seed testimonials with `isDemoData: true` are filtered out. If you wish to publish new verified client testimonials, you can add them via the Master Admin Portal (`/admin`). |
