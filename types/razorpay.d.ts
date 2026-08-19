type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void; escape?: boolean; confirm_close?: boolean };
  handler: (response: RazorpaySuccess) => void | Promise<void>;
};

interface Window {
  Razorpay?: new (options: RazorpayOptions) => {
    open: () => void;
    on: (event: string, handler: (response: unknown) => void) => void;
  };
}
