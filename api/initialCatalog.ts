export const INITIAL_PRODUCTS = [
  {
    id: 'prod-sunstone-bracelet',
    name: 'Sunstone Bracelet',
    slug: 'sunstone-bracelet',
    price: 2300,
    compareAtPrice: 2875,
    sku: 'SD-BRAC-01',
    stock: 25,
    category: 'bracelets',
    featured: true,
    active: true,
    numerologyNumber: 1,
    suitableNumbers: [1, 3, 9],
    rulingPlanet: 'Sun (Surya)',
    material: 'Natural Certified Sunstone Gemstone Beads (8mm)',
    beadSize: '8mm polished round beads',
    dimensions: 'Stretch fit for 6.5 - 7.5 inch wrists',
    description: 'Sunstone is traditionally associated with positivity, confidence, leadership and personal power. It is believed to encourage enthusiasm, independence and a positive outlook.',
    shortDescription: 'Positivity, Confidence, Leadership & Personal Power • Numbers 1, 3, 9',
    whoCanWear: [
      'People seeking confidence and motivation.',
      'Individuals looking to develop leadership qualities.',
      'People who want to overcome self-doubt.'
    ],
    careInstructions: 'Cleanse with gentle sunlight or running water. Keep away from harsh chemicals.',
    traditionalAssociation: 'Traditionally associated with solar vitality, authority, courage, and enthusiasm.',
    images: ['/bracelets/01_sun_stone.png'],
    variants: [
      { id: 'var-sun-std', productId: 'prod-sunstone-bracelet', name: 'Standard (7.5 in)', value: '7.5', price: 2300, stock: 15 },
      { id: 'var-sun-custom', productId: 'prod-sunstone-bracelet', name: 'Custom Fit (8 in)', value: '8.0', price: 2300, stock: 10 }
    ]
  },
  {
    id: 'prod-clear-quartz-bracelet',
    name: 'Clear Quartz Bracelet',
    slug: 'clear-quartz-bracelet',
    price: 2300,
    compareAtPrice: 2875,
    sku: 'SD-BRAC-02',
    stock: 30,
    category: 'bracelets',
    featured: true,
    active: true,
    numerologyNumber: 7,
    suitableNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    rulingPlanet: 'Master Healer (Crown Alignment)',
    material: 'Natural Certified Clear Quartz Crystal Beads (8mm)',
    beadSize: '8mm clear crystal beads',
    dimensions: 'Stretch fit for 6.5 - 7.5 inch wrists',
    description: 'Known as the Master Healer in crystal traditions, Clear Quartz is associated with clarity, balance and positive energy. It is traditionally believed to amplify intentions and support mental focus.',
    shortDescription: 'Master Healer, Clarity, Balance & Positive Energy • Suitable for All Numbers (1–9)',
    whoCanWear: [
      'People seeking mental clarity and concentration.',
      'Individuals looking for balance and positivity.',
      'Anyone interested in spiritual growth.'
    ],
    careInstructions: 'Cleanse in moonlight or natural spring water. Recharge on a selenite plate.',
    traditionalAssociation: 'Traditionally believed to amplify intentions and support mental focus across all spiritual traditions.',
    images: ['/bracelets/02_clear_crystal.png'],
    variants: [
      { id: 'var-cq-std', productId: 'prod-clear-quartz-bracelet', name: 'Standard (7.5 in)', value: '7.5', price: 2300, stock: 20 },
      { id: 'var-cq-custom', productId: 'prod-clear-quartz-bracelet', name: 'Custom Fit (8 in)', value: '8.0', price: 2300, stock: 10 }
    ]
  },
  {
    id: 'prod-citrine-bracelet',
    name: 'Citrine Bracelet',
    slug: 'citrine-bracelet',
    price: 2300,
    compareAtPrice: 2875,
    sku: 'SD-BRAC-03',
    stock: 25,
    category: 'bracelets',
    featured: true,
    active: true,
    numerologyNumber: 3,
    suitableNumbers: [1, 3, 5],
    rulingPlanet: 'Jupiter (Brihaspati)',
    material: 'Natural Certified Golden Citrine Gemstone Beads (8mm)',
    beadSize: '8mm round beads',
    dimensions: 'Stretch fit for 6.5 - 7.5 inch wrists',
    description: 'Citrine is popularly known as the Stone of Abundance. It is traditionally associated with prosperity, success, creativity and confidence. It is believed to encourage optimism and attract opportunities.',
    shortDescription: 'Stone of Abundance, Prosperity, Success & Creativity • Numbers 1, 3, 5',
    whoCanWear: [
      'Business owners and entrepreneurs.',
      'Students and working professionals.',
      'People seeking confidence, success and abundance.'
    ],
    careInstructions: 'Wipe with a soft damp cloth. Avoid prolonged direct midday sun.',
    traditionalAssociation: 'Traditionally associated with wisdom, joy, prosperity, and expansive growth under Brihaspati.',
    images: ['/bracelets/03_citrine.png'],
    variants: [
      { id: 'var-cit-std', productId: 'prod-citrine-bracelet', name: 'Standard (7.5 in)', value: '7.5', price: 2300, stock: 15 },
      { id: 'var-cit-custom', productId: 'prod-citrine-bracelet', name: 'Custom Fit (8 in)', value: '8.0', price: 2300, stock: 10 }
    ]
  },
  {
    id: 'prod-black-agate-bracelet',
    name: 'Black Agate Bracelet',
    slug: 'black-agate-bracelet',
    price: 2300,
    compareAtPrice: 2875,
    sku: 'SD-BRAC-04',
    stock: 25,
    category: 'bracelets',
    featured: true,
    active: true,
    numerologyNumber: 8,
    suitableNumbers: [4, 8],
    rulingPlanet: 'Saturn (Shani)',
    material: 'Natural Certified Black Agate Polished Beads (8mm)',
    beadSize: '8mm polished beads',
    dimensions: 'Stretch fit for 6.5 - 7.5 inch wrists',
    description: 'Black Agate is traditionally associated with protection, grounding and emotional stability. It is believed to help promote inner strength, courage and a sense of security.',
    shortDescription: 'Protection, Grounding, Emotional Stability & Courage • Numbers 4, 8',
    whoCanWear: [
      'People seeking emotional balance.',
      'Individuals dealing with stressful situations.',
      'People looking for grounding and stability.'
    ],
    careInstructions: 'Cleanse with sage smoke or rinse in lukewarm water. Dry thoroughly.',
    traditionalAssociation: 'Traditionally associated with resilience, discipline, emotional grounding, and shielding from negativity.',
    images: ['/bracelets/04_black_agate.png'],
    variants: [
      { id: 'var-ba-std', productId: 'prod-black-agate-bracelet', name: 'Standard (7.5 in)', value: '7.5', price: 2300, stock: 15 },
      { id: 'var-ba-custom', productId: 'prod-black-agate-bracelet', name: 'Custom Fit (8 in)', value: '8.0', price: 2300, stock: 10 }
    ]
  },
  {
    id: 'prod-green-aventurine-bracelet',
    name: 'Green Aventurine Bracelet',
    slug: 'green-aventurine-bracelet',
    price: 2300,
    compareAtPrice: 2875,
    sku: 'SD-BRAC-05',
    stock: 25,
    category: 'bracelets',
    featured: true,
    active: true,
    numerologyNumber: 5,
    suitableNumbers: [3, 5, 6],
    rulingPlanet: 'Mercury (Budha)',
    material: 'Natural Certified Green Aventurine Gemstone Beads (8mm)',
    beadSize: '8mm round beads',
    dimensions: 'Stretch fit for 6.5 - 7.5 inch wrists',
    description: 'Known as the Stone of Opportunity, Green Aventurine is traditionally associated with luck, growth, prosperity and new beginnings. It is believed to encourage confidence and optimism.',
    shortDescription: 'Stone of Opportunity, Growth, Luck & New Beginnings • Numbers 3, 5, 6',
    whoCanWear: [
      'Entrepreneurs and business professionals.',
      'People looking for new opportunities.',
      'Individuals seeking personal and financial growth.'
    ],
    careInstructions: 'Cleanse in clean water or garden soil overnight. Avoid bleach.',
    traditionalAssociation: 'Traditionally associated with Mercury for commercial acumen, luck, growth, and optimistic beginnings.',
    images: ['/bracelets/05_green_aventurine.png'],
    variants: [
      { id: 'var-ga-std', productId: 'prod-green-aventurine-bracelet', name: 'Standard (7.5 in)', value: '7.5', price: 2300, stock: 15 },
      { id: 'var-ga-custom', productId: 'prod-green-aventurine-bracelet', name: 'Custom Fit (8 in)', value: '8.0', price: 2300, stock: 10 }
    ]
  },
  {
    id: 'prod-rose-quartz-bracelet',
    name: 'Rose Quartz Bracelet',
    slug: 'rose-quartz-bracelet',
    price: 2300,
    compareAtPrice: 2875,
    sku: 'SD-BRAC-06',
    stock: 25,
    category: 'bracelets',
    featured: true,
    active: true,
    numerologyNumber: 6,
    suitableNumbers: [2, 6, 9],
    rulingPlanet: 'Venus (Shukra)',
    material: 'Natural Certified Rose Quartz Gemstone Beads (8mm)',
    beadSize: '8mm polished beads',
    dimensions: 'Stretch fit for 6.5 - 7.5 inch wrists',
    description: 'Rose Quartz is widely known as the Stone of Love. It is traditionally associated with unconditional love, compassion, harmony and emotional healing. It is believed to encourage self-love and healthy relationships.',
    shortDescription: 'Stone of Love, Compassion, Relationship Harmony & Healing • Numbers 2, 6, 9',
    whoCanWear: [
      'People seeking love and relationship harmony.',
      'Individuals looking to develop self-love.',
      'People wishing to encourage peace and emotional balance.'
    ],
    careInstructions: 'Cleanse under moonlight or rosewater mist. Store in a soft pouch.',
    traditionalAssociation: 'Traditionally associated with Venus (Shukra) for love, gentle grace, harmony, and emotional equilibrium.',
    images: ['/bracelets/06_rose_quartz.png'],
    variants: [
      { id: 'var-rq-std', productId: 'prod-rose-quartz-bracelet', name: 'Standard (7.5 in)', value: '7.5', price: 2300, stock: 15 },
      { id: 'var-rq-custom', productId: 'prod-rose-quartz-bracelet', name: 'Custom Fit (8 in)', value: '8.0', price: 2300, stock: 10 }
    ]
  },
  {
    id: 'prod-amethyst-bracelet',
    name: 'Amethyst Bracelet',
    slug: 'amethyst-bracelet',
    price: 2300,
    compareAtPrice: 2875,
    sku: 'SD-BRAC-07',
    stock: 25,
    category: 'bracelets',
    featured: true,
    active: true,
    numerologyNumber: 7,
    suitableNumbers: [2, 7, 9],
    rulingPlanet: 'Ketu & Saturn',
    material: 'Natural Certified Royal Violet Amethyst Beads (8mm)',
    beadSize: '8mm polished beads',
    dimensions: 'Stretch fit for 6.5 - 7.5 inch wrists',
    description: 'Amethyst is traditionally associated with peace, wisdom, intuition and spiritual awareness. It is believed to encourage calmness, meditation and mental clarity.',
    shortDescription: 'Peace, Wisdom, Intuition, Calmness & Mental Clarity • Numbers 2, 7, 9',
    whoCanWear: [
      'People interested in meditation and spirituality.',
      'Individuals seeking inner peace.',
      'Students and professionals looking for focus and calmness.'
    ],
    careInstructions: 'Cleanse in moonlight or with palo santo smoke. Avoid prolonged direct heat.',
    traditionalAssociation: 'Traditionally associated with meditative depth, spiritual detachment, third-eye awakening, and calmness.',
    images: ['/bracelets/07_amethyst.png'],
    variants: [
      { id: 'var-ame-std', productId: 'prod-amethyst-bracelet', name: 'Standard (7.5 in)', value: '7.5', price: 2300, stock: 15 },
      { id: 'var-ame-custom', productId: 'prod-amethyst-bracelet', name: 'Custom Fit (8 in)', value: '8.0', price: 2300, stock: 10 }
    ]
  },
  {
    id: 'prod-red-jasper-bracelet',
    name: 'Red Jasper Bracelet',
    slug: 'red-jasper-bracelet',
    price: 2300,
    compareAtPrice: 2875,
    sku: 'SD-BRAC-08',
    stock: 25,
    category: 'bracelets',
    featured: true,
    active: true,
    numerologyNumber: 9,
    suitableNumbers: [1, 4, 9],
    rulingPlanet: 'Mars (Mangal)',
    material: 'Natural Certified Terracotta Red Jasper Beads (8mm)',
    beadSize: '8mm round beads',
    dimensions: 'Stretch fit for 6.5 - 7.5 inch wrists',
    description: 'Red Jasper is traditionally known as the Stone of Strength and Endurance. It is associated with courage, determination, stability and grounding. It is believed to encourage confidence and perseverance.',
    shortDescription: 'Stone of Strength, Endurance, Courage & Determination • Numbers 1, 4, 9',
    whoCanWear: [
      'People seeking courage and determination.',
      'Individuals working towards long-term goals.',
      'People looking for stability and motivation.'
    ],
    careInstructions: 'Cleanse under warm running water or in earth soil. Very durable stone.',
    traditionalAssociation: 'Traditionally associated with Mars (Mangal) for vital physical strength, stamina, courage, and perseverance.',
    images: ['/bracelets/08_red_jasper.png'],
    variants: [
      { id: 'var-rj-std', productId: 'prod-red-jasper-bracelet', name: 'Standard (7.5 in)', value: '7.5', price: 2300, stock: 15 },
      { id: 'var-rj-custom', productId: 'prod-red-jasper-bracelet', name: 'Custom Fit (8 in)', value: '8.0', price: 2300, stock: 10 }
    ]
  }
];
