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

export const generateWhatsAppMessage = (name, balance, shopName, template) => {
  return (template || 'Namaste {name}! Aapka {amount} rupaye ka udhaar baaki hai. - {shopName}')
    .replace('{name}', name)
    .replace('{amount}', Math.abs(balance).toFixed(0))
    .replace('{shopName}', shopName || 'Our Shop');
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) return formatDate(date);
  if (diffDay > 1) return `${diffDay} days ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffHour > 1) return `${diffHour} hours ago`;
  if (diffHour === 1) return '1 hour ago';
  if (diffMin > 1) return `${diffMin} minutes ago`;
  if (diffMin === 1) return '1 minute ago';
  return 'Just now';
};

export const getDaysSince = (date) => {
  const now = new Date();
  const d = new Date(date);
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
};
