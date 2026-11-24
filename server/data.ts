import { Product, Workshop, BlogPost, Testimonial, Consultation } from '../src/types';
import { INITIAL_PRODUCTS } from '../api/initialCatalog';

export const initialProducts: Product[] = INITIAL_PRODUCTS as Product[];

export const initialWorkshops: Workshop[] = [
  {
    id: 'ws-numerology',
    title: 'The Language of Numbers: Numerology Masterclass',
    slug: 'numerology-masterclass',
    tagline: 'Unlock the archetypal patterns of your birth date, life path, and personal cycles.',
    description: 'An immersive 2-day live workshop guided personally by Falgun Thakkar. Move beyond generic horoscopes into the classical esoteric science of numbers (Sankhya Shastra), discovering your core vibrational strengths, karmic cycles, and practical alignment techniques.',
    detailedOverview: [
      'Understanding the 9 primordial archetypes from 1 (Sun) to 9 (Mars)',
      'Calculating Moolank (Birth Number), Bhagyank (Destiny Number), and Namank (Name Number)',
      'Grid analysis (Lo Shu Grid) and missing element harmonization',
      'Personal year cycles and choosing opportune timings for significant transitions',
      'Selecting complementary spiritual accessories and daily practices'
    ],
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    date: '2026-09-19',
    displayDate: 'September 19 – 20, 2026',
    startTime: '10:00 AM IST',
    endTime: '2:00 PM IST',
    duration: '2 Days (8 Hours Total)',
    location: 'Interactive Live Session (Zoom HD) + Recording Access',
    isOnline: true,
    capacity: 35,
    registeredCount: 28,
    price: 4999,
    instructor: 'Falgun Thakkar',
    instructorBio: 'Founder of SHIV DHARA with years of dedicated inquiry into classical Sankhya Shastra, Vastu Vidya, and mindfulness traditions. Falgun teaches with modern clarity, zero fear-mongering, and actionable spiritual depth.',
    highlights: [
      'Comprehensive PDF Workbook & Personal Numerology Chart Template',
      'Live Q&A with Falgun Thakkar for your specific chart questions',
      '30-day recording access and private community discussion',
      'Complimentary consultation voucher (₹1,000 credit)'
    ],
    curriculum: [
      { phase: 'Day 1 — Module 1', title: 'Foundations of Sankhya Shastra', desc: 'The 9 planetary vibrations, calculation methodologies, and avoiding common reduction mistakes.' },
      { phase: 'Day 1 — Module 2', title: 'The Triad: Birth, Destiny, and Name Resonance', desc: 'Synthesizing your primary numbers into a cohesive personal blueprint.' },
      { phase: 'Day 2 — Module 3', title: 'The Energy Grid & Remedies without Fear', desc: 'Balancing elemental gaps using colors, spatial adjustments, and mindfulness.' },
      { phase: 'Day 2 — Module 4', title: 'Personal Year Cycles & Applied Action', desc: 'Navigating multi-year life waves with calm strategic awareness.' }
    ],
    active: true
  },
  {
    id: 'ws-vastu-living',
    title: 'Vastu for Modern Spaces: Energy Harmony & Abundance',
    slug: 'vastu-for-modern-spaces',
    tagline: 'Practical spatial alignment for contemporary apartments, homes, and workspaces.',
    description: 'Discover how the 8 cardinal and inter-cardinal directions interact with the 5 universal elements (Pancha Mahabhutas). Learn non-destructive remedies, optimal functional placements, and how to create an environment that nurtures calm, vitality, and prosperity.',
    detailedOverview: [
      'The Vastu Purusha Mandala decoded for modern architectural layouts',
      'The 8 Cardinal Directions: North (Kuber), NE (Ishan), East (Surya), SE (Agni), South (Yama), SW (Nairutya), West (Varuna), NW (Vayu)',
      'Rectifying directional imbalances without structural demolition',
      'Creating high-vibration home meditation corners and focused study/work desks',
      'Vastu for sleep quality, emotional peace, and harmonious family living'
    ],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-10',
    displayDate: 'October 10 – 11, 2026',
    startTime: '11:00 AM IST',
    endTime: '3:00 PM IST',
    duration: '2 Days (8 Hours Total)',
    location: 'Interactive Live Session + Optional Mumbai Studio In-Person Seats',
    isOnline: true,
    capacity: 30,
    registeredCount: 22,
    price: 5999,
    instructor: 'Falgun Thakkar',
    instructorBio: 'Spatial energy consultant and founder of SHIV DHARA. Falgun bridges ancient Vastu principles with modern interior aesthetics to create tranquil, purposeful spaces.',
    highlights: [
      'Step-by-step Home Blueprint Audit Template',
      'Directional Compass & Elemental Color Guide',
      'Case studies of modern apartment rectifications',
      'Direct feedback on one floorplan submission'
    ],
    curriculum: [
      { phase: 'Day 1 — Module 1', title: 'The 5 Elements & The Living Grid', desc: 'Understanding space, air, fire, water, and earth in residential environments.' },
      { phase: 'Day 1 — Module 2', title: 'Key Zones: Entrance, Kitchen, Master Bedroom', desc: 'Optimal orientation for core living zones and restorative sleep.' },
      { phase: 'Day 2 — Module 3', title: 'Non-Destructive Energy Rectification', desc: 'Using light, sacred geometry, metals, plants, and mirrors effectively.' },
      { phase: 'Day 2 — Module 4', title: 'Commercial & Workspace Vastu', desc: 'Enhancing productivity, customer welcoming energy, and financial clarity.' }
    ],
    active: true
  },
  {
    id: 'ws-shiva-stillness',
    title: 'Shiv Dhara: The Art of Inner Stillness & Conscious Breathing',
    slug: 'shiv-dhara-inner-stillness-meditation',
    tagline: 'A weekend immersive retreat into diaphragmatic pranayama, mantra resonance, and deep silence.',
    description: 'Step away from digital overstimulation into a sanctuary of profound calm. Guided by Falgun Thakkar, this weekend immersion introduces structured breathwork, sound resonance (Nada), and contemplative awareness to soothe the nervous system.',
    detailedOverview: [
      'Somatic breath control and calming the sympathetic nervous system',
      'Nada sound resonance and OM harmonic centering',
      'Dissolving habitual thought loops through witnessing awareness (Sakshi Bhava)',
      'Establishing an enduring 20-minute daily meditation ritual'
    ],
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-24',
    displayDate: 'October 24 – 25, 2026',
    startTime: '7:00 AM IST',
    endTime: '10:00 AM IST',
    duration: '2 Morning Sessions (6 Hours Total)',
    location: 'Online Live Meditation Sanctuary + Guided Audio Pack',
    isOnline: true,
    capacity: 50,
    registeredCount: 39,
    price: 3499,
    instructor: 'Falgun Thakkar',
    instructorBio: 'Longtime practitioner of Himalayan and traditional meditation techniques, dedicated to making timeless contemplative practices accessible to contemporary seekers.',
    highlights: [
      '4 High-Fidelity Guided Meditation Audio Tracks (Flac/MP3)',
      'Daily 21-Day Mindfulness Integration Roadmap',
      'Breathing journal and sleep optimization protocol'
    ],
    curriculum: [
      { phase: 'Day 1 — Morning', title: 'The Breath as an Anchor', desc: 'Pranayama fundamentals, posture alignment, and physical relaxation.' },
      { phase: 'Day 1 — Deepening', title: 'Stillness Beyond Noise', desc: 'Transcending internal chatter with gentle mindfulness inquiry.' },
      { phase: 'Day 2 — Morning', title: 'Nada Yoga & Sound Resonance', desc: 'Tuning internal frequencies with primordial sound vibration.' },
      { phase: 'Day 2 — Integration', title: 'Living in Alignment', desc: 'Carrying centered calm into intense workdays and relationships.' }
    ],
    active: true
  }
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The Architecture of Birth Numbers: Understanding Your Core Vibration',
    slug: 'architecture-of-birth-numbers-core-vibration',
    excerpt: 'How Sankhya Shastra looks at the exact day of your birth not as a fatalistic prophecy, but as a symbolic blueprint of inherent strengths and inclinations.',
    content: `Numerology, in its authentic classical tradition, is not a crystal ball of rigid fortune-telling. At SHIV DHARA, we approach Sankhya Shastra (the science of numbers) as a contemplative mirror.

### The Significance of Moolank (Birth Number)
Your Birth Number (calculated by reducing the day of the month you were born to a single digit from 1 to 9) indicates your initial behavioral baseline and instinctive response to the world.

- **Number 1 (Sun):** Natural initiator, driven by clarity, authority, and creative self-expression.
- **Number 2 (Moon):** Intuitive, receptive, prioritizing emotional connection and diplomacy.
- **Number 3 (Jupiter):** Expansive, philosophical, natural communicator and seeker of truth.
- **Number 4 (Rahu):** Structural thinker, unconventional visionary, capable of profound deep focus.
- **Number 5 (Mercury):** Adaptable, curious, dynamic traveler and analytical communicator.
- **Number 6 (Venus):** Aesthetic harmonizer, compassionate caregiver, creating beauty and warmth.
- **Number 7 (Ketu):** Inward investigator, introspective researcher, valuing quiet contemplation.
- **Number 8 (Saturn):** Resilient builder, pragmatic strategist, mastering patience and justice.
- **Number 9 (Mars):** Compassionate warrior, purposeful humanitarian, energetic and brave.

### Moving From Fatalism to Conscious Action
Knowing your core number allows you to recognize when you are operating in its luminous aspect (e.g., leadership for 1, diplomacy for 2) versus its shadow (e.g., obstinacy or hyper-sensitivity). Through tailored mindfulness and environmental alignment, you cultivate intentional living.`,
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    author: 'Falgun Thakkar',
    authorRole: 'Founder, SHIV DHARA',
    category: 'Numerology',
    readTime: '5 min read',
    published: true,
    publishedAt: '2026-08-10'
  },
  {
    id: 'blog-2',
    title: 'The Vastu Purusha Mandala: Harmonizing Space with the 5 Elements',
    slug: 'vastu-purusha-mandala-5-elements-space-harmony',
    excerpt: 'Discover the ancient Indian spatial grid and how balanced directional flow fosters restorative sleep, mental clarity, and domestic tranquility.',
    content: `Every physical dwelling is an energetic vessel. In traditional Indian architecture and Vastu Vidya, a space is not merely four walls and a roof; it is an organic ecosystem shaped by the interaction of solar paths, magnetic fields, and the 5 primordial elements (Pancha Mahabhutas).

### The Northeast (Ishan) — Water & Spirit
The Northeast corner receives the gentle morning ultraviolet rays. In classical Vastu, this is the zone of pure consciousness, intuition, and mental clarity. Keeping this quadrant uncluttered, light, and ideally suited for meditation or reflection helps anchor peace throughout the home.

### The Southeast (Agni) — Fire & Transformation
Governed by the fire element, the Southeast supports digestion, energetic drive, and enthusiasm. Placing the kitchen or heating apparatus in this quadrant honors its transformative nature.

### The Southwest (Nairutya) — Earth & Stability
The heaviest, most grounded corner of any structure is the Southwest. It represents stability, master leadership, and long-term grounding. Placing the primary bedroom or heavy furnishings here provides grounding support for the heads of household.

### Practical Modern Advice
You do not need to tear down walls to bring harmony into an apartment. Subtle shifts in lighting, color palette, plant placement, and intentional spatial zoning can revitalize stale energy and create a peaceful sanctuary.`,
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    author: 'Falgun Thakkar',
    authorRole: 'Founder, SHIV DHARA',
    category: 'Vastu',
    readTime: '6 min read',
    published: true,
    publishedAt: '2026-08-14'
  },
  {
    id: 'blog-3',
    title: 'Returning to Stillness: The Power of Diaphragmatic Breath',
    slug: 'returning-to-stillness-power-of-diaphragmatic-breath',
    excerpt: 'Why conscious breathing is the single most accessible bridge between involuntary stress reflexes and deep, serene neurological calm.',
    content: `In our fast-paced modern world, the breath is often the first physiological function to become shallow, erratic, and constrained. When we breathe rapidly into our upper chest, we inadvertently signal to our brain that we are under threat.

### The Physiology of Stillness
When you consciously engage the diaphragm—allowing the abdomen to gently expand on the inhale and soften on the exhale—the vagus nerve sends immediate calming signals to the heart and nervous system.

### A Simple 3-Step Daily Practice (Shiv Dhara Alignment)
1. **Inhale (4 Seconds):** Breathe smoothly through the nose, drawing vitality into the lower belly.
2. **Hold (4 Seconds):** Rest in the natural stillness between the breaths without straining.
3. **Exhale (6 Seconds):** Release slowly and completely, letting go of accumulated tension.

Practicing this rhythm for even 7 minutes each morning cultivates an unshakable inner center that stays with you throughout your day.`,
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    author: 'Falgun Thakkar',
    authorRole: 'Founder, SHIV DHARA',
    category: 'Meditation',
    readTime: '4 min read',
    published: true,
    publishedAt: '2026-08-16'
  }
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Aarav Mehta',
    location: 'Mumbai, India',
    testimonial: 'Falgunji’s numerology consultation gave me tremendous clarity during a major career transition. His calm, logical, and deeply authentic perspective was refreshing—no fear, just profound insight.',
    service: 'Numerology Consultation',
    rating: 5,
    isDemoData: true,
    approved: true,
    createdAt: '2026-07-15'
  },
  {
    id: 'test-2',
    name: 'Sunita Rao',
    location: 'Bengaluru, India',
    testimonial: 'We applied Falgun’s non-invasive Vastu recommendations for our new apartment. The shift in atmosphere was noticeable within days—the living room feels vastly more open, peaceful, and welcoming.',
    service: 'Home Vastu Audit',
    rating: 5,
    isDemoData: true,
    approved: true,
    createdAt: '2026-07-28'
  },
  {
    id: 'test-3',
    name: 'Vikramaditya S.',
    location: 'Dubai, UAE',
    testimonial: 'The Surya Radiant bracelet is exquisite. The weight of the natural pyrite and sunstone is substantial, and the workmanship is unmistakably premium. It feels like a meaningful daily anchor.',
    service: 'Numerology Bracelet (Number 1)',
    rating: 5,
    isDemoData: true,
    approved: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'test-4',
    name: 'Pooja Deshmukh',
    location: 'Pune, India',
    testimonial: 'The Shiv Dhara meditation workshop was transformative. Falgun Thakkar demystified pranayama and helped me build a consistent morning practice that has fundamentally changed my stress levels.',
    service: 'Meditation Workshop',
    rating: 5,
    isDemoData: true,
    approved: true,
    createdAt: '2026-08-09'
  }
];

export const initialFAQs = [
  {
    category: 'Numerology',
    question: 'How is Numerology different from Western or Chaldean numerology?',
    answer: 'Numerology (Sankhya Shastra) links numbers directly to the 9 planetary energies (Navagrahas) of Indian cosmology. It emphasizes the balance between your Birth Number (Moolank), Destiny Number (Bhagyank), and Name Number (Namank), treating numbers as energetic archetypes rather than fatalistic prophecies.'
  },
  {
    category: 'Vastu',
    question: 'Does Vastu consultation require breaking walls or demolition?',
    answer: 'At SHIV DHARA, Falgun Thakkar specializes in non-destructive spatial harmonizations. In 95%+ of cases, energy flow can be effectively balanced through elemental re-zoning, lighting, color therapy, placement shifts, sacred geometry, and natural remedies without structural demolition.'
  },
  {
    category: 'Products',
    question: 'How do I choose the right Numerology Bracelet?',
    answer: 'You can choose based on your Birth Number (the single-digit reduction of the day of the month you were born) or consult Dhara, our AI assistant, to determine your number. Each bracelet is handcrafted with natural grade-A gemstones traditionally resonant with specific archetypes.'
  },
  {
    category: 'Consultations',
    question: 'Are online consultations as effective as in-person visits?',
    answer: 'Yes. Online video consultations are conducted with high precision. For Numerology and Meditation, online is 100% equivalent. For Vastu, clients provide accurate floor plans, directional compass readings, and video walk-throughs which Falgun analyzes meticulously.'
  },
  {
    category: 'Workshops',
    question: 'Do I need prior spiritual or meditation experience to attend a workshop?',
    answer: 'Not at all. All SHIV DHARA workshops are structured from ground principles. Beginners find the instruction clear and accessible, while experienced seekers appreciate the depth of classical nuances.'
  }
];
