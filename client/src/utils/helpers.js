export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));

export const formatTime = (date) =>
  new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));

export const generateWhatsAppLink = (phone, name, balance, shopName, template) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const message = (template || 'Namaste {name}! Aapka {amount} rupaye ka udhaar baaki hai. - {shopName}')
    .replace('{name}', name)
    .replace('{amount}', Math.abs(balance).toFixed(0))
    .replace('{shopName}', shopName || 'Our Shop');
  return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
};
