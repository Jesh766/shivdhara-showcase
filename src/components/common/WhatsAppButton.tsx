import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+916359666315';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    'Namaste! I would like to inquire about SHIV DHARA consultations, workshops, and numerology products.'
  )}`;

  return (
    <a
      id="floating-whatsapp-btn"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-40 flex items-center gap-2.5 bg-[#25D366] text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:bg-[#20bd5a] hover:scale-105 transition-all duration-300 group"
      aria-label="Chat on WhatsApp with SHIV DHARA Team"
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
      </div>
      <span className="text-xs font-semibold tracking-wider uppercase font-sans hidden sm:inline-block pr-1">
        WhatsApp Team
      </span>
    </a>
  );
};
