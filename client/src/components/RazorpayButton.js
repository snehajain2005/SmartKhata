import React, { useState } from 'react';
import api from '../utils/api';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Razorpay "Pay Now" button component.
 *
 * Props:
 *   customerId    - MongoDB customer ID
 *   customerName  - Customer's name (prefill)
 *   customerPhone - Customer's phone (prefill)
 *   amount        - Amount to collect (in INR)
 *   onSuccess     - Callback after successful payment + verification
 */
export default function RazorpayButton({ customerId, customerName, customerPhone, amount, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayNow = async () => {
    if (!amount || amount <= 0) {
      toast.error('No pending balance to collect');
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Create order on backend
      const { data } = await api.post('/payments/order', {
        customerId,
        amount,
      });

      if (!data.success) {
        toast.error(data.message || 'Failed to create payment order');
        setLoading(false);
        return;
      }

      const { orderId, amount: orderAmount, currency, key } = data.data;

      // 3. Open Razorpay checkout
      openRazorpayCheckout({
        key,
        orderId,
        amount: orderAmount,
        currency,
        name: user?.shopName || 'SmartKhata',
        description: `Balance payment from ${customerName}`,
        customerName,
        customerPhone,
        onSuccess: async (response) => {
          try {
            // 4. Verify payment on backend
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customerId,
              amount,
            });

            if (verifyRes.data.success) {
              toast.success('🎉 Payment successful! Balance updated.');
              onSuccess?.();
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        onFailure: (reason) => {
          if (reason !== 'Payment cancelled by user') {
            toast.error(reason || 'Payment failed');
          }
          setLoading(false);
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayNow}
      disabled={loading || !amount || amount <= 0}
      id="razorpay-pay-now-btn"
      className="flex items-center gap-2.5 bg-gradient-to-r from-[#072654] to-[#3395FF] hover:from-[#0a2d66] hover:to-[#2281e8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    >
      {loading ? (
        <>
          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {/* Razorpay-like icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
          </svg>
          <span>Pay Now</span>
        </>
      )}
    </button>
  );
}
