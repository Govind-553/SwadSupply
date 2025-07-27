// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify-token',
    GET_USER_ROLE: '/auth/get-user-role',
    REFRESH_TOKEN: '/auth/refresh-token'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    GET_ROLE: (uid) => `/users/${uid}/role`,
    SET_ROLE: (uid) => `/users/${uid}/role`
  },
  VENDORS: {
    NEARBY_SUPPLIERS: '/vendors/nearby-suppliers',
    SEARCH_PRODUCTS: '/vendors/products/search',
    CREATE_ORDER: '/vendors/orders',
    GET_ORDERS: '/vendors/orders',
    GET_ORDER: (id) => `/vendors/orders/${id}`,
    CANCEL_ORDER: (id) => `/vendors/orders/${id}/cancel`,
    CREATE_GROUP_ORDER: '/vendors/group-orders',
    JOIN_GROUP_ORDER: (id) => `/vendors/group-orders/${id}/join`
  },
  SUPPLIERS: {
    GET_PRODUCTS: '/suppliers/products',
    CREATE_PRODUCT: '/suppliers/products',
    UPDATE_PRODUCT: (id) => `/suppliers/products/${id}`,
    DELETE_PRODUCT: (id) => `/suppliers/products/${id}`,
    GET_ORDERS: '/suppliers/orders',
    UPDATE_ORDER_STATUS: (id) => `/suppliers/orders/${id}/status`,
    GET_ANALYTICS: '/suppliers/analytics'
  },
  PRODUCTS: {
    LIST: '/products',
    GET: (id) => `/products/${id}`,
    SEARCH: '/products/search',
    BY_CATEGORY: (category) => `/products/category/${category}`,
    BY_SUPPLIER: (supplierId) => `/products/supplier/${supplierId}`
  },
  ORDERS: {
    CREATE: '/orders',
    GET: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    TRACK: (id) => `/orders/${id}/track`,
    CANCEL: (id) => `/orders/${id}/cancel`
  },
  REVIEWS: {
    CREATE: '/reviews',
    GET_BY_PRODUCT: (productId) => `/reviews/product/${productId}`,
    GET_BY_SUPPLIER: (supplierId) => `/reviews/supplier/${supplierId}`
  },
  VOICE: {
    PROCESS_ORDER: '/voice/process-order',
    TEXT_TO_SPEECH: '/voice/text-to-speech'
  },
  MANDI: {
    PRICES: '/mandi/prices',
    PRICE_HISTORY: (item) => `/mandi/prices/${item}/history`
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    ORDERS: '/analytics/orders',
    REVENUE: '/analytics/revenue',
    PRODUCTS: '/analytics/products'
  }
};

// User Roles
export const USER_ROLES = {
  VENDOR: 'vendor',
  SUPPLIER: 'supplier',
  ADMIN: 'admin'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#f59e0b',
  [ORDER_STATUS.CONFIRMED]: '#3b82f6',
  [ORDER_STATUS.PREPARING]: '#8b5cf6',
  [ORDER_STATUS.SHIPPED]: '#06b6d4',
  [ORDER_STATUS.DELIVERED]: '#10b981',
  [ORDER_STATUS.CANCELLED]: '#ef4444'
};

export const ORDER_STATUS_ICONS = {
  [ORDER_STATUS.PENDING]: '⏳',
  [ORDER_STATUS.CONFIRMED]: '✅',
  [ORDER_STATUS.PREPARING]: '👨‍🍳',
  [ORDER_STATUS.SHIPPED]: '🚚',
  [ORDER_STATUS.DELIVERED]: '📦',
  [ORDER_STATUS.CANCELLED]: '❌'
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  VEGETABLES: 'vegetables',
  FRUITS: 'fruits',
  SPICES: 'spices',
  GRAINS: 'grains',
  OILS: 'oils',
  DAIRY: 'dairy',
  MEAT: 'meat',
  SEAFOOD: 'seafood',
  BEVERAGES: 'beverages',
  SNACKS: 'snacks',
  CONDIMENTS: 'condiments',
  OTHERS: 'others'
};

export const PRODUCT_CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.VEGETABLES]: 'Vegetables',
  [PRODUCT_CATEGORIES.FRUITS]: 'Fruits',
  [PRODUCT_CATEGORIES.SPICES]: 'Spices',
  [PRODUCT_CATEGORIES.GRAINS]: 'Grains & Cereals',
  [PRODUCT_CATEGORIES.OILS]: 'Oils & Fats',
  [PRODUCT_CATEGORIES.DAIRY]: 'Dairy Products',
  [PRODUCT_CATEGORIES.MEAT]: 'Meat & Poultry',
  [PRODUCT_CATEGORIES.SEAFOOD]: 'Seafood',
  [PRODUCT_CATEGORIES.BEVERAGES]: 'Beverages',
  [PRODUCT_CATEGORIES.SNACKS]: 'Snacks',
  [PRODUCT_CATEGORIES.CONDIMENTS]: 'Condiments & Sauces',
  [PRODUCT_CATEGORIES.OTHERS]: 'Others'
};

export const PRODUCT_CATEGORY_ICONS = {
  [PRODUCT_CATEGORIES.VEGETABLES]: '🥬',
  [PRODUCT_CATEGORIES.FRUITS]: '🍎',
  [PRODUCT_CATEGORIES.SPICES]: '🌶️',
  [PRODUCT_CATEGORIES.GRAINS]: '🌾',
  [PRODUCT_CATEGORIES.OILS]: '🫒',
  [PRODUCT_CATEGORIES.DAIRY]: '🥛',
  [PRODUCT_CATEGORIES.MEAT]: '🥩',
  [PRODUCT_CATEGORIES.SEAFOOD]: '🐟',
  [PRODUCT_CATEGORIES.BEVERAGES]: '🥤',
  [PRODUCT_CATEGORIES.SNACKS]: '🍿',
  [PRODUCT_CATEGORIES.CONDIMENTS]: '🍯',
  [PRODUCT_CATEGORIES.OTHERS]: '📦'
};

// Measurement Units
export const MEASUREMENT_UNITS = {
  KILOGRAM: 'kg',
  GRAM: 'gram',
  LITER: 'liter',
  MILLILITER: 'ml',
  PIECE: 'piece',
  DOZEN: 'dozen',
  PACKET: 'packet',
  BOX: 'box',
  BAG: 'bag',
  BOTTLE: 'bottle',
  CAN: 'can',
  JAR: 'jar'
};

export const MEASUREMENT_UNIT_LABELS = {
  [MEASUREMENT_UNITS.KILOGRAM]: 'Kilogram (kg)',
  [MEASUREMENT_UNITS.GRAM]: 'Gram (g)',
  [MEASUREMENT_UNITS.LITER]: 'Liter (L)',
  [MEASUREMENT_UNITS.MILLILITER]: 'Milliliter (ml)',
  [MEASUREMENT_UNITS.PIECE]: 'Piece',
  [MEASUREMENT_UNITS.DOZEN]: 'Dozen',
  [MEASUREMENT_UNITS.PACKET]: 'Packet',
  [MEASUREMENT_UNITS.BOX]: 'Box',
  [MEASUREMENT_UNITS.BAG]: 'Bag',
  [MEASUREMENT_UNITS.BOTTLE]: 'Bottle',
  [MEASUREMENT_UNITS.CAN]: 'Can',
  [MEASUREMENT_UNITS.JAR]: 'Jar'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: 'cod',
  UPI: 'upi',
  CARD: 'card',
  NET_BANKING: 'netbanking',
  WALLET: 'wallet',
  CREDIT: 'credit'
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH_ON_DELIVERY]: 'Cash on Delivery',
  [PAYMENT_METHODS.UPI]: 'UPI Payment',
  [PAYMENT_METHODS.CARD]: 'Credit/Debit Card',
  [PAYMENT_METHODS.NET_BANKING]: 'Net Banking',
  [PAYMENT_METHODS.WALLET]: 'Digital Wallet',
  [PAYMENT_METHODS.CREDIT]: 'Credit Account'
};

// Delivery Time Slots
export const DELIVERY_TIME_SLOTS = {
  MORNING: '6:00 AM - 12:00 PM',
  AFTERNOON: '12:00 PM - 6:00 PM',
  EVENING: '6:00 PM - 10:00 PM',
  ANYTIME: 'Anytime'
};

// Trust Score Levels
export const TRUST_SCORE_LEVELS = {
  EXCELLENT: { min: 90, label: 'Excellent', color: '#10b981' },
  VERY_GOOD: { min: 80, label: 'Very Good', color: '#22c55e' },
  GOOD: { min: 60, label: 'Good', color: '#f59e0b' },
  FAIR: { min: 40, label: 'Fair', color: '#f97316' },
  POOR: { min: 0, label: 'Needs Improvement', color: '#ef4444' }
};

// Badge Types
export const BADGE_TYPES = {
  PREMIUM: { type: 'premium', label: 'Premium Supplier', icon: '👑', color: '#fbbf24' },
  TRUSTED: { type: 'trusted', label: 'Trusted Supplier', icon: '✅', color: '#10b981' },
  PUNCTUAL: { type: 'punctual', label: 'Always On Time', icon: '⏰', color: '#3b82f6' },
  QUALITY: { type: 'quality', label: 'Quality Assured', icon: '⭐', color: '#f59e0b' },
  EXPERIENCED: { type: 'experienced', label: 'Experienced', icon: '🏆', color: '#8b5cf6' },
  HIGH_VOLUME: { type: 'volume', label: 'High Volume', icon: '📦', color: '#06b6d4' },
  ECO_FRIENDLY: { type: 'eco', label: 'Eco Friendly', icon: '🌱', color: '#22c55e' },
  LOCAL: { type: 'local', label: 'Local Supplier', icon: '📍', color: '#f97316' }
};

// Language Support
export const SUPPORTED_LANGUAGES = {
  HINDI: { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
  ENGLISH: { code: 'en-IN', name: 'English', flag: '🇬🇧' },
  BENGALI: { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳' },
  TAMIL: { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
  TELUGU: { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
  MARATHI: { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳' },
  GUJARATI: { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳' }
};

// Group Order Status
export const GROUP_ORDER_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_RECEIVED: 'payment_received',
  LOW_STOCK: 'low_stock',
  GROUP_ORDER_TARGET_REACHED: 'group_order_target_reached',
  PRICE_ALERT: 'price_alert',
  NEW_REVIEW: 'new_review'
};

// File Upload Limits
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'rasoilink_auth_token',
  USER_DATA: 'rasoilink_user_data',
  CART_ITEMS: 'rasoilink_cart',
  SEARCH_HISTORY: 'rasoilink_search_history',
  LANGUAGE_PREFERENCE: 'rasoilink_language',
  LOCATION_DATA: 'rasoilink_location',
  THEME_PREFERENCE: 'rasoilink_theme'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Requested resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  LOCATION_DENIED: 'Location access denied. Please enable location services.',
  MICROPHONE_DENIED: 'Microphone access denied. Please enable microphone access.',
  CAMERA_DENIED: 'Camera access denied. Please enable camera access.',
  FILE_TOO_LARGE: 'File size is too large. Please choose a smaller file.',
  INVALID_FILE_TYPE: 'Invalid file type. Please choose a valid image file.',
  CART_EMPTY: 'Your cart is empty. Add some items to proceed.',
  OUT_OF_STOCK: 'This item is currently out of stock.',
  INSUFFICIENT_STOCK: 'Insufficient stock available.',
  ORDER_NOT_FOUND: 'Order not found.',
  PRODUCT_NOT_FOUND: 'Product not found.',
  SUPPLIER_NOT_FOUND: 'Supplier not found.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_CANCELLED: 'Order cancelled successfully!',
  PRODUCT_ADDED: 'Product added successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  REVIEW_ADDED: 'Review added successfully!',
  GROUP_ORDER_CREATED: 'Group order created successfully!',
  GROUP_ORDER_JOINED: 'Joined group order successfully!'
};

// Default Values
export const DEFAULT_VALUES = {
  DELIVERY_RADIUS: 10, // km
  SEARCH_RADIUS: 25, // km
  MIN_ORDER_AMOUNT: 100, // INR
  FREE_DELIVERY_THRESHOLD: 500, // INR
  DEFAULT_DELIVERY_CHARGE: 30, // INR
  MAX_CART_ITEMS: 50,
  MAX_PRODUCT_IMAGES: 5,
  DEFAULT_PRODUCT_IMAGE: '/images/placeholder-product.jpg',
  DEFAULT_AVATAR: '/images/default-avatar.png',
  RATING_SCALE: 5,
  REVIEW_CHARACTER_LIMIT: 500,
  GROUP_ORDER_MIN_PARTICIPANTS: 2,
  GROUP_ORDER_MAX_DURATION: 72, // hours
  VOICE_RECOGNITION_TIMEOUT: 30000, // ms
  API_TIMEOUT: 30000, // ms
  CACHE_DURATION: 300000 // 5 minutes
};

// Feature Flags
export const FEATURE_FLAGS = {
  VOICE_ORDERING: true,
  GROUP_ORDERING: true,
  MANDI_PRICE_COMPARISON: true,
  REAL_TIME_TRACKING: true,
  PUSH_NOTIFICATIONS: true,
  DARK_MODE: false,
  MULTI_LANGUAGE: true,
  OFFLINE_MODE: false,
  VIDEO_CALLS: false,
  CRYPTOCURRENCY_PAYMENT: false
};

// App Metadata
export const APP_METADATA = {
  NAME: 'RasoiLink',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-Powered Raw Material Sourcing for Street Food Vendors',
  AUTHOR: 'RasoiLink Team',
  EMAIL: 'support@rasoilink.com',
  WEBSITE: 'https://rasoilink.com',
  SUPPORT_PHONE: '+91-9876543210',
  PRIVACY_POLICY: 'https://rasoilink.com/privacy',
  TERMS_OF_SERVICE: 'https://rasoilink.com/terms',
  SOCIAL_MEDIA: {
    FACEBOOK: 'https://facebook.com/rasoilink',
    TWITTER: 'https://twitter.com/rasoilink',
    INSTAGRAM: 'https://instagram.com/rasoilink',
    LINKEDIN: 'https://linkedin.com/company/rasoilink'
  }
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 28.6139, lng: 77.2090 }, // New Delhi
  DEFAULT_ZOOM: 12,
  MARKER_COLORS: {
    VENDOR: '#3b82f6',
    SUPPLIER: '#10b981',
    DELIVERY: '#f59e0b'
  },
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '© OpenStreetMap contributors'
};

export default {
  API_ENDPOINTS,
  USER_ROLES,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_ICONS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_CATEGORY_ICONS,
  MEASUREMENT_UNITS,
  MEASUREMENT_UNIT_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  DELIVERY_TIME_SLOTS,
  TRUST_SCORE_LEVELS,
  BADGE_TYPES,
  SUPPORTED_LANGUAGES,
  GROUP_ORDER_STATUS,
  NOTIFICATION_TYPES,
  FILE_UPLOAD_LIMITS,
  PAGINATION,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULT_VALUES,
  FEATURE_FLAGS,
  APP_METADATA,
  MAP_CONFIG
};