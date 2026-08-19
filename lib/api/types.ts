export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
};

export type Customer = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
};

export type Address = {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: string;
  isDefault: boolean;
};

export type AddressInput = Omit<Address, "id" | "userId">;

export type AuthenticatedCartItem = {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId: number;
  variantDetails: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  stockAvailable: number;
};

export type CartSummary = {
  items: AuthenticatedCartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  totalItems: number;
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  variantDetails: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
  size: string;
};

export type OrderSummary = {
  id: number;
  orderNumber: string;
  status: string;
  publicStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  couponCode: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber: string;
  courierName: string;
  timeline: Array<Record<string, unknown>>;
};

export type ReturnEligibility = {
  eligible: boolean;
  returnDeadline: string;
  serverTime: string;
  msRemaining: number;
  returnStatus: string;
};

export type CheckoutPreview = {
  items: AuthenticatedCartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  addressId: number;
  status: string;
};

export type PaymentOrder = CheckoutPreview & {
  paymentRequired: boolean;
  orderId?: number;
  orderNumber?: string;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  amount: number;
  currency: string;
};
