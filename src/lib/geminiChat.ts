/**
 * SHIV DHARA AI Concierge Service
 * All AI inference routes strictly through backend /api/chat.
 * Client-side API key usage has been completely removed for security.
 * If the network or backend is unreachable, it seamlessly falls back to the local sacred knowledge engine.
 */

const SHIV_DHARA_SYSTEM_PROMPT = `You are SHIV DHARA, the official AI assistant for SHIV DHARA by Falgun Thakkr.
SHIV DHARA is a premier modern spiritual consultancy, educational platform, and sacred boutique.

SOURCE OF TRUTH — SHIV DHARA SACRED SANCTUARY:

1. FOUNDER & PHILOSOPHY:
- Founder: Falgun Thakkr (also known as Falgun Thakkar).
- Approach: Grounded, authentic, respectful, and free of fear-mongering or fatalism. Combines ancient wisdom with modern clarity.

2. CORE DISCIPLINES & CONSULTATIONS:
- Numerology (Sankhya Shastra): Explores the 9 primordial vibrations (1 to 9) linked to cosmic planetary energies.
  * Moolank (Birth Number): Day of the month reduced to 1-9 (baseline nature, instinct).
  * Bhagyank (Destiny Number): Full birth date sum reduced to 1-9 (life trajectory, purpose).
  * Namank (Name Number): Vibrational resonance of full name.
  * Numerology Consultation: "Numerology Blueprint" — ₹3,499 (60 Mins, Online Video/In-Person).
- Vastu Shastra (Vastu Vidya): 100% Non-destructive spatial energy alignment for homes, apartments, and commercial offices.
  * Harmonizes the 8 directions (North: Kuber/Water, NE: Ishan/Water&Spirit, East: Surya/Fire&Air, SE: Agni/Fire, South: Yama/Earth&Fire, SW: Nairutya/Earth&Stability, West: Varuna/Air&Space, NW: Vayu/Air) with the 5 Elements (Pancha Mahabhutas).
  * Uses lighting, elemental zoning, sacred geometry, and color remedies WITHOUT structural demolition.
  * Vastu Consultation: "Vastu Spatial Energy Audit" — ₹7,499 (90 Mins + Blueprint report, Online Video Walkthrough or On-Site).
- Meditation & Conscious Breathing:
  * "Shiv Dhara" practice: Diaphragmatic 4-4-6 breath rhythm (Inhale 4s, Hold 4s, Exhale 6s) to activate the vagus nerve and soothe the sympathetic nervous system.
  * Nada sound resonance, OM harmonic centering, witnessing awareness (Sakshi Bhava).
  * Meditation Consultation: "Inner Stillness Meditation & Breath 1-on-1" — ₹2,199 (45 Mins, Online Video).
- Master Alignment Consultation:
  * "Master Alignment (Numerology + Vastu + Meditation)" — ₹10,999 (2 Hours comprehensive synthesis).

3. UPCOMING LIVE WORKSHOPS:
- "The Language of Numbers: Numerology Masterclass": ₹4,999 | 2 Days (8 Hours) | Live Zoom HD + 30-Day Recording + Workbook | Instructor: Falgun Thakkr.
- "Vastu for Modern Spaces: Energy Harmony & Abundance": ₹5,999 | 2 Days (8 Hours) | Interactive Live Session + Mumbai Studio Seats + Floorplan Audit Template.
- "Shiv Dhara: The Art of Inner Stillness & Conscious Breathing": ₹3,499 | 2 Morning Sessions (6 Hours) | Online Live Sanctuary + 4 High-Fidelity Guided Audio Tracks.

4. HANDCRAFTED BOUTIQUE PRODUCTS:
- Surya Radiant Numerology Bracelet (Number 1): ₹2,499 | Natural Golden Pyrite, Sunstone, Golden Tiger Eye.
- Brihaspati Wisdom Numerology Bracelet (Number 3): ₹2,699 | Natural Citrine, Yellow Aventurine, Sandalwood.
- Budha Harmonizer Numerology Bracelet (Number 5): ₹2,399 | Natural Canadian Green Jade, Green Aventurine, Fluorite.
- Shukra Harmony & Grace Numerology Bracelet (Number 6): ₹2,599 | Madagascar Rose Quartz, Selenite, High-clarity Quartz.
- Shani Grounding & Mastery Numerology Bracelet (Number 8): ₹2,799 | Blue Tiger Eye, Black Obsidian, Dark Amethyst.
- Panchamukhi Sacred Rudraksha Meditation Mala (108 Beads): ₹3,499 | 108 authentic hand-knotted 5-Mukhi Nepali Rudraksha beads.
- Free shipping across India on orders over ₹1,999 (₹150 shipping below ₹1,999).

5. APPROVED PAYMENT & ORDERING:
- NO RAZORPAY. Never mention Razorpay.
- WhatsApp Ordering: Direct WhatsApp message to +91 6359666315.
- UPI QR Payment: Scan UPI QR code (UPI ID: shivdhara@upi), pay via any UPI app (GPay, PhonePe, Paytm, BHIM), and enter UTR.

6. TONE & IDENTITY:
- You are SHIV DHARA, the official AI assistant of SHIV DHARA by Falgun Thakkr.
- Tone: Serene, respectful, grounded, articulate, and welcoming.
- Keep answers structured, concise, and beautifully readable.`;

/**
 * Intelligent sacred offline fallback responder
 */
export function getShivDharaOfflineReply(query: string, currentPage: string = '/'): string {
  const lower = query.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|namaste|pranam|greetings|good morning|good evening)/i.test(lower)) {
    return `Namaste! Welcome to **SHIV DHARA by Falgun Thakkr**.\n\nI am **Shiv Dhara**, your AI guide. I can assist you with:\n- **Numerology** (Moolank, Bhagyank, and gemstone bracelets)\n- **Vastu Shastra** (Non-destructive spatial harmony audits)\n- **Meditation** (Our signature 4-4-6 breath rhythm)\n- **Consultations & Live Workshops** with Falgun Thakkr\n- **Handcrafted Spiritual Bracelets & Rudraksha Malas**\n\nHow may I illuminate your journey today?`;
  }

  // Falgun Thakkr / Founder
  if (
    lower.includes('falgun') ||
    lower.includes('founder') ||
    lower.includes('thakkar') ||
    lower.includes('thakkr') ||
    lower.includes('who are you') ||
    lower.includes('who made')
  ) {
    return `**Falgun Thakkr** is the visionary founder and lead mentor behind **SHIV DHARA**.\n\nHe guides individuals, families, and enterprise leaders through a grounded synthesis of **Numerology (Sankhya Shastra)**, **Non-Destructive Vastu Shastra**, and **Conscious Breath Meditation**.\n\nHis approach is rooted in authentic ancient wisdom, completely free from superstition or fear-based dogmas. You can book a 1-on-1 private consultation with Falgun Thakkr or join his upcoming live masterclasses!`;
  }

  // Numerology
  if (
    lower.includes('numerology') ||
    lower.includes('moolank') ||
    lower.includes('bhagyank') ||
    lower.includes('namank') ||
    lower.includes('number')
  ) {
    return `**Numerology (Sankhya Shastra) at SHIV DHARA**:\n\nNumbers are cosmic vibrational frequencies governed by celestial energies:\n- **Moolank (Birth Number)**: The single-digit sum of your birth day (1–31) reflecting your core personality and natural instincts.\n- **Bhagyank (Destiny Number)**: The reduced sum of your entire date of birth (DD/MM/YYYY), revealing your life's path and lessons.\n- **Namank (Name Number)**: The sound resonance of your full name.\n\n✨ **Offerings**:\n- **Numerology Blueprint Consultation**: ₹3,499 (60-minute deep dive with Falgun Thakkr)\n- **Numerology Masterclass (Live Workshop)**: ₹4,999 (2-day interactive certification)\n- **Handcrafted Planetary Bracelets**: Aligned with Numbers 1, 3, 5, 6, and 8 (from ₹2,399).\n\nWould you like me to help you find your Moolank or book a blueprint session?`;
  }

  // Vastu
  if (
    lower.includes('vastu') ||
    lower.includes('direction') ||
    lower.includes('house') ||
    lower.includes('home') ||
    lower.includes('office') ||
    lower.includes('compass') ||
    lower.includes('north') ||
    lower.includes('east')
  ) {
    return `**Vastu Shastra at SHIV DHARA**:\n\nFalgun Thakkr practices **100% Non-Destructive Vastu**, aligning your space with the 5 sacred elements (Pancha Mahabhutas) and 8 directional vortexes without any structural demolition:\n- **North (Kuber/Water)**: Career opportunities and financial liquidity.\n- **Northeast (Ishan/Water-Spirit)**: Pure intuition, meditation, and mental clarity.\n- **East (Surya/Air-Fire)**: Social connection, health, and morning prana.\n- **Southeast (Agni/Fire)**: Kitchen, cash flow, and metabolic vitality.\n- **South (Yama/Fire-Earth)**: Deep delta sleep and structural stability.\n- **Southwest (Nairutya/Earth)**: Mastery, stability, and wealth retention.\n- **West (Varuna/Space)**: Commercial gains, learning, and fulfillment.\n- **Northwest (Vayu/Air)**: Movement, guests, finished goods, and supportive relationships.\n\n🏡 **Vastu Spatial Energy Audit**: ₹7,499 (90-minute on-site or video audit + detailed remedy blueprint).`;
  }

  // Meditation & Breath
  if (
    lower.includes('meditation') ||
    lower.includes('breath') ||
    lower.includes('pranayama') ||
    lower.includes('stillness') ||
    lower.includes('stress') ||
    lower.includes('peace')
  ) {
    return `**Shiv Dhara Conscious Breathwork & Meditation**:\n\nOur foundational practice centers on the **4-4-6 Sacred Breath Rhythm**:\n1. **Inhale** gently into the diaphragm for 4 counts\n2. **Hold** softly in still witnessing awareness for 4 counts\n3. **Exhale** slowly and completely for 6 counts\n\nThis extended exhale naturally stimulates the vagus nerve, calming the nervous system and shifting from flight-or-fight to grounded parasympathetic stillness.\n\n✨ **Session**: *Inner Stillness 1-on-1 Meditation* with Falgun Thakkr — ₹2,199 (45 Mins).`;
  }

  // Workshops
  if (
    lower.includes('workshop') ||
    lower.includes('masterclass') ||
    lower.includes('class') ||
    lower.includes('course') ||
    lower.includes('learn')
  ) {
    return `**Upcoming Live Workshops with Falgun Thakkr**:\n\n1. **The Language of Numbers: Numerology Masterclass**\n   - ₹4,999 | 2 Days (8 Hours) | Live Zoom HD + 30-Day Recording & Workbook\n\n2. **Vastu for Modern Spaces: Energy Harmony & Abundance**\n   - ₹5,999 | 2 Days (8 Hours) | Live Session + Mumbai Studio Seats + Floorplan Audit Template\n\n3. **Shiv Dhara: The Art of Inner Stillness & Conscious Breathing**\n   - ₹3,499 | 2 Morning Sessions (6 Hours) | Online Live Sanctuary + 4 Audio Tracks\n\nSeats are kept intimate to ensure individual interaction. You can register directly from the Workshops section!`;
  }

  // Products / Bracelets / Mala / Price / Shop
  if (
    lower.includes('bracelet') ||
    lower.includes('mala') ||
    lower.includes('product') ||
    lower.includes('shop') ||
    lower.includes('price') ||
    lower.includes('buy') ||
    lower.includes('rudraksha') ||
    lower.includes('gemstone')
  ) {
    return `**Handcrafted Sacred Objects at SHIV DHARA**:\n\n- **Surya Radiant Bracelet (Number 1)**: ₹2,499 — Natural Golden Pyrite, Sunstone & Tiger Eye\n- **Brihaspati Wisdom Bracelet (Number 3)**: ₹2,699 — Citrine, Yellow Aventurine & Sandalwood\n- **Budha Harmonizer Bracelet (Number 5)**: ₹2,399 — Canadian Green Jade, Aventurine & Fluorite\n- **Shukra Harmony Bracelet (Number 6)**: ₹2,599 — Rose Quartz, Selenite & Pure Quartz\n- **Shani Grounding Bracelet (Number 8)**: ₹2,799 — Blue Tiger Eye, Obsidian & Amethyst\n- **Panchamukhi Sacred 108 Rudraksha Mala**: ₹3,499 — Authentic 5-Mukhi Nepali Rudraksha with silk tassel\n\n✨ All pieces are energized with sacred mantras. **Free pan-India delivery** on orders over ₹1,999!`;
  }

  // Payment / Order / UPI / WhatsApp
  if (
    lower.includes('pay') ||
    lower.includes('order') ||
    lower.includes('upi') ||
    lower.includes('whatsapp') ||
    lower.includes('shipping') ||
    lower.includes('delivery')
  ) {
    return `**Payment & Ordering at SHIV DHARA**:\n\nWe provide two seamless, secure ways to order:\n1. **Direct WhatsApp**: Tap the floating WhatsApp button or message our team at **+91 6359666315**.\n2. **UPI QR Payment**: Scan our official UPI QR code (**shivdhara@upi**) in any app (Google Pay, PhonePe, Paytm, BHIM), then submit your transaction UTR.\n\n📦 *Shipping*: Dispatched within 24-48 business hours with tracked delivery across India.`;
  }

  // Booking / Consultation
  if (
    lower.includes('book') ||
    lower.includes('consult') ||
    lower.includes('appointment') ||
    lower.includes('fees') ||
    lower.includes('cost')
  ) {
    return `**1-on-1 Consultations with Falgun Thakkr**:\n\n- **Numerology Blueprint (60 Mins)**: ₹3,499\n- **Vastu Spatial Energy Audit (90 Mins)**: ₹7,499\n- **Inner Stillness Breath & Meditation (45 Mins)**: ₹2,199\n- **Master Alignment (Numerology + Vastu + Meditation - 2 Hours)**: ₹10,999\n\nClick **"Book Consultation"** on the top navigation bar or message **+91 6359666315** on WhatsApp to reserve your slot!`;
  }

  // Human handoff / Contact
  if (
    lower.includes('human') ||
    lower.includes('contact') ||
    lower.includes('phone') ||
    lower.includes('call') ||
    lower.includes('talk') ||
    lower.includes('person') ||
    lower.includes('team')
  ) {
    return `We would be honored to speak with you directly! 🙏\n\n- **Direct WhatsApp / Call**: +91 6359666315\n- **Email**: contact@shivdhara.com\n\nYou can also click the **"Connect with Falgun Thakkr / Team"** button below to leave your contact details, and our sanctuary coordinators will reach out to you promptly.`;
  }

  // Default context-aware fallback
  return `Namaste! At **SHIV DHARA by Falgun Thakkr**, we harmonize life through ancient sciences and modern clarity.\n\nI can help you with:\n1. **Personal Numerology Calculations & Blueprints**\n2. **Non-Destructive Vastu Spatial Audits**\n3. **Shiv Dhara 4-4-6 Breath & Meditation**\n4. **Upcoming Masterclasses with Falgun Thakkr**\n5. **Handcrafted Planetary Bracelets & Rudraksha Malas**\n\nWhat would you like to explore today?`;
}

/**
 * Main AI Query Dispatcher — Calls only backend /api/chat.
 * Client-side API keys are completely eliminated.
 */
export async function getShivDharaAiResponse(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  currentPage: string = '/'
): Promise<string> {
  const text = message.trim();
  if (!text) return 'Namaste. How may I assist you today?';

  // 1. Try Backend /api/chat
  try {
    const apiRes = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        conversationHistory: history,
        currentPage,
      }),
    });

    const contentType = apiRes.headers.get('content-type') || '';
    if (apiRes.ok && contentType.includes('application/json')) {
      const data = await apiRes.json();
      if (data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        return data.reply.trim();
      }
    }
  } catch {
    // Backend API not reachable -> continue to intelligent offline knowledge fallback
  }

  // 2. Sacred Built-in Knowledge Engine (Zero latency, 100% reliable)
  return getShivDharaOfflineReply(text, currentPage);
}
