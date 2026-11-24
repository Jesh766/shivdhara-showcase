import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, MessageCircle, Instagram } from 'lucide-react';

interface BlogPageProps {
  onOpenConsultation: () => void;
}

export const sampleArticles: any[] = [];

export const BlogPage: React.FC<BlogPageProps> = ({ onOpenConsultation }) => {
  return (
    <div id="page-blog" className="min-h-screen bg-[#F7F3EA] text-[#101827] pt-28 sm:pt-32 pb-20">
      {/* Hero Header */}
      <section className="bg-[#101827] text-[#F7F3EA] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,164,93,0.15)_0%,_rgba(16,24,39,1)_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#182236] border border-[#C8A45D]/40 text-[#DFC38A] text-xs font-bold uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5 text-[#C8A45D]" />
            <span>Wisdom Journal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-[#F7F3EA] font-light">
            Reflections on Numbers, Space &amp; Stillness
          </h1>
          <p className="text-sm sm:text-base text-[#D9D2C3]/80 max-w-2xl mx-auto leading-relaxed font-sans">
            Essays and contemplative insights by Falgun Thakkr on navigating modern life with ancient clarity.
          </p>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-[#D9D2C3] bg-white px-8 py-14 sm:px-14 sm:py-20 text-center shadow-sm"
        >
          {/* Decorative orbs */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#C8A45D]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#A6833D]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-[#101827] border-2 border-[#C8A45D]/40 mx-auto flex items-center justify-center shadow-lg">
              <BookOpen className="w-9 h-9 text-[#DFC38A]" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#101827] border border-[#C8A45D]/30 text-[#DFC38A] text-[11px] font-bold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C8A45D]" />
              <span>Coming Soon</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#101827]">
                Sacred Wisdom Articles{' '}
                <span className="font-bold italic text-[#A6833D]">Arriving Soon</span>
              </h2>
              <p className="text-sm text-[#101827]/65 max-w-lg mx-auto leading-relaxed font-sans">
                Falgun Thakkr is carefully crafting in-depth reflections on numerology, Vastu, meditation, and conscious living. Each article will be a guided exploration — written to inspire, ground, and elevate your everyday life.
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 max-w-xs mx-auto">
              <div className="flex-1 h-px bg-[#D9D2C3]" />
              <span className="text-[10px] text-[#101827]/40 uppercase tracking-widest font-bold">Be the first to know</span>
              <div className="flex-1 h-px bg-[#D9D2C3]" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="https://wa.me/916359666315?text=🙏%20Namaste%20Falgun%20ji%2C%20I%20would%20love%20to%20be%20notified%20when%20new%20blog%20articles%20are%20published%20on%20Shiv%20Dhara!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#163A36] text-[#F7F1E6] text-xs font-bold uppercase tracking-wider hover:bg-[#0E2623] transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-[#DFC38A]" />
                <span>Notify Me on WhatsApp</span>
              </a>
              <a
                href="https://www.instagram.com/shivdhara.occult"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#D9D2C3] bg-white text-xs font-bold uppercase tracking-wider text-[#101827] hover:border-[#C8A45D] transition-all"
              >
                <Instagram className="w-4 h-4 text-[#A6833D]" />
                <span>Follow on Instagram</span>
              </a>
            </div>

            <p className="text-[11px] text-[#101827]/35 font-sans">
              In the meantime, explore our{' '}
              <button
                onClick={onOpenConsultation}
                className="underline underline-offset-2 hover:text-[#A6833D] transition-colors cursor-pointer"
              >
                personal consultations
              </button>
              {' '}for direct guidance.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
