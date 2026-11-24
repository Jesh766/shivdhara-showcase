export interface SiteSettings {
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  whatsappNumber: string;
  upiId: string;
  contactEmail: string;
  contactPhone: string;
  footerText: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price?: number | null;
  compareAtPrice?: number;
  sku: string;
  stock: number;
  category: 'bracelets' | 'malas' | 'yantras' | 'accessories' | string;
  featured: boolean;
  active: boolean;
  isFree?: boolean;
  priceType?: 'paid' | 'free' | 'none';
  numerologyNumber?: number; // 1 to 9
  suitableNumbers?: number[]; // Numbers that benefit from this gemstone
  whoCanWear?: string[]; // Benefits / suitability points
  rulingPlanet?: string;
  material: string;
  beadSize?: string;
  dimensions?: string;
  careInstructions: string;
  traditionalAssociation: string;
  images: string[];
  variants?: ProductVariant[];
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  price: number;
  stock: number;
}

export interface Workshop {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  detailedOverview: string[];
  image: string;
  date: string; // e.g. "2026-09-12"
  displayDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  isOnline: boolean;
  capacity: number;
  registeredCount: number;
  price?: number | null;
  isFree?: boolean;
  priceType?: 'paid' | 'free' | 'none';
  category?: 'Numerology' | 'Vastu' | 'Meditation' | string;
  status?: 'OPEN' | 'COMING_SOON' | 'SOLD_OUT';
  isComingSoon?: boolean;
  isSoldOut?: boolean;
  instructor: string;
  instructorBio: string;
  instructorImage?: string;
  highlights: string[];
  curriculum: { phase: string; title: string; desc: string }[];
  active: boolean;
}

export interface WorkshopRegistration {
  id: string;
  workshopId: string;
  workshopTitle: string;
  name: string;
  email: string;
  phone: string;
  seats: number;
  totalAmount: number;
  paymentMethod?: 'UPI_QR' | 'WHATSAPP' | 'FREE' | string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'VERIFICATION_PENDING' | 'CONFIRMED' | string;
  registrationStatus: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED' | string;
  utr?: string;
  paymentScreenshot?: string;
  createdAt: string;
}

export interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  service:
    | 'Complete Life Mastery (All-in-One)'
    | 'Personal Numerology'
    | 'Business Name'
    | 'Name Numerology'
    | 'Marriage Compatibility'
    | 'Baby Name'
    | 'Mobile Number'
    | 'Kundali & Vastu Report'
    | string;
  services?: string[];
  location?: string;
  type: 'ONLINE_VIDEO' | 'IN_PERSON' | 'PHONE';
  date: string;
  time: string;
  duration: string;
  price: number;
  status: 'PENDING' | 'PENDING_APPROVAL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  dateOfBirth?: string;
  birthTime?: string;
  partnerDob?: string;
  mobileAuditNumber?: string;
  propertyType?: string; // For Vastu
  message?: string;
  createdAt: string;
}

export type PaymentMethod = 'WHATSAPP' | 'UPI_QR';

export type PaymentStatus =
  | 'NOT_STARTED'
  | 'PAYMENT_VERIFICATION_PENDING'
  | 'PAYMENT_VERIFIED'
  | 'PAYMENT_FAILED';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  total: number;
  variantName?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  utr?: string;
  paymentScreenshot?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorRole: string;
  category: 'Numerology' | 'Vastu' | 'Meditation' | 'Sacred Living';
  readTime: string;
  published: boolean;
  publishedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  testimonial: string;
  service: string;
  rating: number;
  isDemoData: boolean;
  approved: boolean;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  createdAt: string;
}

export interface HumanRequest {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  reason: string;
  currentPage: string;
  conversationSummary: string;
  conversationId?: string;
  status: 'NEW' | 'CONTACTED' | 'RESOLVED' | 'CLOSED';
  telegramNotified: boolean;
  notifiedAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isToolCall?: boolean;
  toolName?: string;
  toolResult?: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface NumerologyAnalysis {
  birthNumber: number; // Moolank (1-9)
  lifePathNumber: number; // Bhagyank (1-9)
  nameNumber?: number; // Namank (1-9)
  rulingPlanet: string;
  coreVibration: string;
  strengths: string[];
  growthAreas: string[];
  auspiciousColors: string[];
  auspiciousDays: string[];
  recommendedBracelets: string[];
  harmonizingDirections: string[];
  reflectiveGuidance: string;
}
