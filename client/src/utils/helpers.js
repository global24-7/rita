export const formatPrice = (price, currency = 'GH₵') => {
  return `${currency}${Number(price).toFixed(2)}`;
};

export const calculateDiscount = (price, discountPercent) => {
  if (!discountPercent || discountPercent <= 0) return price;
  return Math.round(price - (price * discountPercent / 100));
};

export const generateWhatsAppLink = (phone = '059217747', message = '') => {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('233') ? cleanPhone : `233${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
};

export const generateOrderWhatsAppMessage = (order) => {
  const items = order.items
    .map((item) => `• ${item.name} (Size: ${item.size}) x${item.qty} — GH₵${(item.priceAtOrder * item.qty).toFixed(2)}`)
    .join('\n');

  return (
    `🛒 *New Order from Rita Jeans*\n\n` +
    `*Name:* ${order.customerName}\n` +
    `*Phone:* ${order.phone}\n` +
    `*Delivery:* ${order.deliveryLocation}${order.deliveryAddress ? ' — ' + order.deliveryAddress : ''}\n\n` +
    `*Items:*\n${items}\n\n` +
    `*Subtotal:* GH₵${order.subtotal.toFixed(2)}\n` +
    `*Delivery:* GH₵${order.deliveryFee.toFixed(2)}\n` +
    `*Total:* GH₵${order.total.toFixed(2)}`
  );
};

export const generateShareLink = (productId, productName) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/product/${productId}`;
};

export const shareProduct = async (product) => {
  const url = generateShareLink(product._id, product.name);
  const text = `Check out ${product.name} at Rita Jeans! Only GH₵${calculateDiscount(product.price, product.discountPercent)}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: product.name, text, url });
      return true;
    } catch (e) {
      // User cancelled or error
    }
  }
  // Fallback: WhatsApp share
  window.open(generateWhatsAppLink('', `${text}\n${url}`), '_blank');
  return true;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-jeans.svg';
  if (imagePath.startsWith('http')) return imagePath;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return `${apiUrl}${imagePath}`;
};

export const getReferralCode = () => {
  return localStorage.getItem('referralCode') || null;
};

export const setReferralFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    localStorage.setItem('referralCode', ref);
  }
};
