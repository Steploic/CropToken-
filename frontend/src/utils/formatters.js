/**
 * Format HBAR amounts for display
 */
export const formatHBAR = (amount, decimals = 3) => {
  if (!amount) return '0.000';
  const num = parseFloat(amount);
  return num.toFixed(decimals);
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Format addresses for display
 */
export const formatAddress = (address, chars = 6) => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

/**
 * Format dates for display
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time ago
 */
export const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;
  
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (!value) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Format crop emoji by type
 */
export const getCropEmoji = (cropType) => {
  const crop = CROP_TYPES.find(c => c.value === cropType?.toLowerCase());
  return crop?.emoji || '🌾';
};

/**
 * Format crop color by type
 */
export const getCropColor = (cropType) => {
  const crop = CROP_TYPES.find(c => c.value === cropType?.toLowerCase());
  return crop?.color || '#228B22';
};

/**
 * Validate HBAR amount
 */
export const validateHBARAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000;
};

/**
 * Validate quantity
 */
export const validateQuantity = (quantity, max) => {
  const num = parseInt(quantity);
  return !isNaN(num) && num > 0 && num <= max;
};
