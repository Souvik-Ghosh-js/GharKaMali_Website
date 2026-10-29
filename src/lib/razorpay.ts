'use client';
import { createRazorpayOrder, verifyRazorpayPayment, cancelRazorpayPayment } from './api';

declare global {
  interface Window { Razorpay?: any }
}

let scriptPromise: Promise<boolean> | null = null;
function loadCheckoutScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => { scriptPromise = null; resolve(false); };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

export type RazorpayArgs = {
  type?: 'wallet_topup' | 'booking' | 'subscription' | 'order';
  amount?: number;
  booking_id?: number;
  subscription_id?: number;
  order_id?: number;
  geofence_id?: number;
  // Combined cart: pay for several entities in one transaction.
  fulfill?: { type: 'order' | 'booking' | 'subscription'; id: number }[];
  // Spend wallet balance first; Razorpay charges only the remainder. When the
  // wallet covers everything the backend fulfills directly (no Checkout).
  use_wallet?: boolean;
};

export type RazorpayResult = { ok: boolean; cancelled?: boolean; message?: string };

// Opens Razorpay Checkout for the given target, then verifies the signature
// server-side (which fulfills the payment). Resolves once done.
export async function payWithRazorpay(args: RazorpayArgs): Promise<RazorpayResult> {
  const loaded = await loadCheckoutScript();
  if (!loaded || !window.Razorpay) {
    return { ok: false, message: 'Could not load the payment gateway. Please check your connection and try again.' };
  }

  let order: any;
  try {
    order = await createRazorpayOrder(args); // req() unwraps to the data object
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Could not start the payment.' };
  }
  // Wallet covered the whole amount — already paid and fulfilled server-side.
  if (order?.wallet_paid) {
    return { ok: true, message: `Paid ₹${order.wallet_applied} from your wallet` };
  }
  if (!order?.key_id || !order?.order_id) {
    return { ok: false, message: 'Payment is not configured. Please contact support.' };
  }

  return new Promise<RazorpayResult>((resolve) => {
    const rzp = new window.Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: order.name || 'GharKaMali',
      description: order.description || '',
      prefill: order.prefill || {},
      theme: { color: '#03411a' },
      handler: async (resp: any) => {
        try {
          await verifyRazorpayPayment({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          resolve({ ok: true });
        } catch (e: any) {
          resolve({ ok: false, message: e?.message || 'We could not verify your payment. If money was deducted it will be refunded.' });
        }
      },
      modal: {
        // User closed Checkout without paying → void the just-created order/booking/
        // subscription so it isn't left lingering in "pending". Fire-and-forget.
        ondismiss: () => {
          cancelRazorpayPayment({ razorpay_order_id: order.order_id }).catch(() => {});
          resolve({ ok: false, cancelled: true, message: 'Payment cancelled — your order was not placed' });
        },
      },
    });
    rzp.on('payment.failed', (resp: any) => resolve({ ok: false, message: resp?.error?.description || 'Payment failed' }));
    rzp.open();
  });
}
