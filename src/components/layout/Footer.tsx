import React from 'react';
import { Instagram, Facebook } from 'lucide-react';
import { SHIV_DHARA_LOGO } from '../../lib/assets';
import { SiteSettings } from '../../types';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenConsultation: () => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenConsultation, siteSettings }) => {
  const whatsappNumber = siteSettings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '+916359666315';
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer
      id="main-footer"
      className="bg-[#FAF4EA] text-[#2B211E] pt-14 sm:pt-24 pb-10 sm:pb-14 border-t border-[#E6D5B8] relative overflow-hidden transition-colors-editorial"
    >
      {/* Background Subtle Geometry Watermark */}
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full border border-[#A85C3B]/10 pointer-events-none animate-spin-slow" />
      <div className="absolute -left-32 -top-32 w-80 h-80 rounded-full border border-[#D49A52]/15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 pb-10 sm:pb-16 border-b border-[#E6D5B8]">
          {/* Col 1 & 2: Brand and Vision */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white border border-[#A85C3B]/25 p-2 shadow-sm flex items-center justify-center relative shrink-0">
                <img
                  src={SHIV_DHARA_LOGO}
                  alt="SHIV DHARA Logo"
                  className="h-full w-full object-contain drop-shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-2xl font-serif tracking-[0.22em] font-bold uppercase block text-[#2B211E]">
                  {siteSettings?.brandName || 'SHIV DHARA'}
                </span>
                <span className="type-label text-[10px] text-[#A85C3B] block mt-0.5 font-semibold">
                  By Falgun Thakkr
                </span>
              </div>
            </div>

            <p className="type-body-sm text-[#2B211E]/75 max-w-md text-sm leading-relaxed">
              {siteSettings?.footerText || 'Align Your Numbers. Align Your Space. Align Within.'}
            </p>

            <div className="flex items-center gap-3.5 pt-2">
              <a
                href="https://www.instagram.com/shivdhara.occult/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E6D5B8] hover:border-[#E1306C] shadow-sm flex items-center justify-center text-[#2B211E] hover:text-[#E1306C] transition-all hover:scale-105"
                aria-label="Follow SHIV DHARA on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61596403932560"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E6D5B8] hover:border-[#1877F2] shadow-sm flex items-center justify-center text-[#2B211E] hover:text-[#1877F2] transition-all hover:scale-105"
                aria-label="Follow SHIV DHARA on Facebook"
              >
                <Facebook className="w-4 h-4 fill-current" />
              </a>
              <a
                href={`https://wa.me/${cleanNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E6D5B8] hover:border-[#25D366] shadow-sm flex items-center justify-center text-[#2B211E] hover:text-[#25D366] transition-all hover:scale-105"
                aria-label="Chat with SHIV DHARA on WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.006.579 1.93.883 2.806.883 3.181 0 5.767-2.586 5.767-5.766.001-3.18-2.585-5.766-5.767-5.766zm3.364 8.172c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.128-.521-1.637-.677-2.684-2.342-2.766-2.451-.082-.109-.661-.88-.661-1.678 0-.798.417-1.192.565-1.353.148-.161.328-.201.438-.201.11 0 .22.001.316.006.101.005.236-.039.369.281.137.33.468 1.144.509 1.228.041.084.068.182.014.292-.055.109-.082.177-.164.273-.082.096-.173.215-.247.288-.083.08-.17.167-.073.333.097.166.432.713.926 1.152.637.567 1.174.743 1.34.825.166.082.264.071.363-.042.099-.113.424-.494.537-.663.113-.169.227-.141.382-.084.156.057.986.465 1.156.55.17.085.283.127.324.198.041.071.041.41-.103.815zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.442 5.177L2 22l4.981-1.396A9.94 9.94 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.163 8.163 0 01-4.225-1.177l-.303-.18-2.964.83.824-2.903-.197-.315A8.156 8.156 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 3: Disciplines */}
          <div className="space-y-4">
            <h4 className="type-label-subtle text-[#A85C3B] block font-bold text-xs">
              Disciplines
            </h4>
            <ul className="space-y-2.5 text-sm text-[#2B211E]/80 font-sans">
              <li>
                <button
                  onClick={() => onNavigate('/numerology')}
                  className="hover:text-[#A85C3B] transition-colors cursor-pointer"
                >
                  Numerology
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/vastu')}
                  className="hover:text-[#A85C3B] transition-colors cursor-pointer"
                >
                  Spatial Vastu Vidya
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/meditation')}
                  className="hover:text-[#A85C3B] transition-colors cursor-pointer"
                >
                  Shiv Dhara Meditation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/workshops')}
                  className="hover:text-[#A85C3B] transition-colors cursor-pointer"
                >
                  Upcoming Workshops
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/products')}
                  className="hover:text-[#A85C3B] transition-colors cursor-pointer"
                >
                  Numerology Bracelets
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Navigation */}
          <div className="space-y-4">
            <h4 className="type-label-subtle text-[#A85C3B] block font-bold text-xs">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-[#2B211E]/80 font-sans">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-[#A85C3B] transition-colors cursor-pointer"
                >
                  Meet Falgun Thakkr
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/blog')}
                  className="hover:text-[#A85C3B] transition-colors cursor-pointer"
                >
                  Wisdom Journal (Blog)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-[#A85C3B] transition-colors cursor-pointer"
                >
                  Contact & Inquiries
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/faq')}
                  className="hover:text-[#A85C3B] transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenConsultation}
                  className="hover:text-[#A85C3B] transition-colors font-semibold text-[#A85C3B] cursor-pointer"
                >
                  Book Consultation ↗
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Sanctuary Office & Address */}
          <div className="space-y-4">
            <h4 className="type-label-subtle text-[#A85C3B] block font-bold text-xs">
              Sanctuary Office
            </h4>
            <div className="type-body-sm text-xs text-[#2B211E]/75 leading-relaxed font-sans space-y-1">
              <p className="font-semibold text-[#2B211E]">206, Jalaram Complex, 2nd Floor,</p>
              <p>Gita Mandir Road, Nr. S. T. Bus Stop,</p>
              <p>Lati Bazar, Ahmedabad-22 (GUJ)</p>
            </div>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#2B211E]/60">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
            <span>{new Date().getFullYear()} SHIV DHARA by Falgun Thakkr. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <button onClick={() => onNavigate('/legal?tab=privacy')} className="hover:text-[#A85C3B] transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('/legal?tab=cookies')} className="hover:text-[#A85C3B] transition-colors cursor-pointer">
              Cookies Policy
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('shivdhara:open-cookie-preferences'))}
              className="hover:text-[#A85C3B] transition-colors cursor-pointer font-medium underline underline-offset-2"
            >
              Cookie Preferences
            </button>
            <button onClick={() => onNavigate('/legal?tab=terms')} className="hover:text-[#A85C3B] transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => onNavigate('/legal?tab=shipping')} className="hover:text-[#A85C3B] transition-colors cursor-pointer">
              Shipping & Delivery
            </button>
            <button onClick={() => onNavigate('/legal?tab=refund')} className="hover:text-[#A85C3B] transition-colors cursor-pointer">
              Refund Policy
            </button>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-[#2B211E]/60">
          <a
            href="https://wa.me/919173389217"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#A85C3B] transition-colors hover:text-[#2B211E]"
          >
            Developed By JESH
          </a>
        </div>
      </div>
    </footer>
  );
};
