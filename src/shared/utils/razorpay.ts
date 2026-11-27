/* Minimal typings + lazy loader for Razorpay Checkout (https://checkout.razorpay.com/v1/checkout.js) */

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', cb: (response: { error: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let loading: Promise<void> | null = null;

export const loadRazorpay = (): Promise<void> => {
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error('Could not load Razorpay. Check your internet connection.'));
    };
    document.body.appendChild(script);
  });
  return loading;
};

export interface OpenCheckoutArgs {
  keyId: string;
  orderId: string;
  currency: string;
  description?: string;
  prefill?: RazorpayOptions['prefill'];
  onSuccess: (r: RazorpaySuccessResponse) => void;
  onFailure: (message: string) => void;
  onDismiss: () => void;
}

export const openRazorpayCheckout = async (args: OpenCheckoutArgs): Promise<void> => {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error('Razorpay is not available.');

  const rzp = new window.Razorpay({
    key: args.keyId,
    order_id: args.orderId, // amount is taken from the server-created order
    currency: args.currency,
    name: 'RetailLite',
    description: args.description,
    prefill: args.prefill,
    handler: args.onSuccess,
    modal: { ondismiss: args.onDismiss },
    theme: { color: '#0A6ED1' },
  });
  rzp.on('payment.failed', (res) => args.onFailure(res.error?.description || 'Payment failed.'));
  rzp.open();
};
