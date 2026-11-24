/**
 * SHIV DHARA Payment & Order Configuration
 * 
 * Configurable constants for WhatsApp Direct Order and UPI QR Payment.
 */

export const PAYMENT_CONFIG = {
  // Business WhatsApp number for customer orders (+91 6359666315)
  WHATSAPP_ORDER_NUMBER: import.meta.env.VITE_WHATSAPP_ORDER_NUMBER || '+91 6359666315',
  
  // Clean international digits for wa.me link
  WHATSAPP_LINK_NUMBER: (import.meta.env.VITE_WHATSAPP_ORDER_NUMBER || '916359666315').replace(/[^0-9]/g, '') || '916359666315',
  
  // Brand / recipient name displayed across payments
  BUSINESS_NAME: 'Falgun Thakkr',
  
  // Configured UPI ID (Official GPay Falgun Thakkr)
  UPI_ID: import.meta.env.VITE_UPI_ID || 'falgunthakkar84-1@okicici',
  
  // Official clean cropped QR square image URL
  UPI_QR_IMAGE_URL: '/payment-qr.png',
  
  // Free shipping threshold in INR
  FREE_SHIPPING_THRESHOLD: 1999,
  
  // Standard shipping fee in INR
  STANDARD_SHIPPING_FEE: 150,
};
