/**
 * Dynamically loads the Razorpay checkout script and opens the payment popup.
 * @param {Object} options - Razorpay checkout options
 * @returns {Promise<Object>} - Resolves with payment response or rejects on failure
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay payment popup.
 * @param {Object} params
 * @param {string} params.key - Razorpay key_id
 * @param {string} params.orderId - Razorpay order ID
 * @param {number} params.amount - Amount in paise
 * @param {string} params.currency - Currency code (INR)
 * @param {string} params.name - App/shop name
 * @param {string} params.description - Payment description
 * @param {string} params.customerName - Prefill customer name
 * @param {string} params.customerPhone - Prefill customer phone
 * @param {Function} params.onSuccess - Called with payment response on success
 * @param {Function} params.onFailure - Called on payment failure/dismiss
 */
export function openRazorpayCheckout({
  key,
  orderId,
  amount,
  currency = 'INR',
  name = 'SmartKhata',
  description = 'Balance Payment',
  customerName = '',
  customerPhone = '',
  onSuccess,
  onFailure,
}) {
  const options = {
    key,
    amount,
    currency,
    name,
    description,
    order_id: orderId,
    prefill: {
      name: customerName,
      contact: customerPhone,
    },
    theme: {
      color: '#4f46e5',
    },
    modal: {
      ondismiss: () => {
        if (onFailure) onFailure('Payment cancelled by user');
      },
    },
    handler: (response) => {
      if (onSuccess) onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    if (onFailure) onFailure(response.error?.description || 'Payment failed');
  });
  rzp.open();
}
