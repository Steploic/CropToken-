/**
 * Safely get item from localStorage
 */
export const getStoredItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage
 */
export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
    return false;
  }
};

/**
 * Safely remove item from localStorage
 */
export const removeStoredItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
    return false;
  }
};

/**
 * Clear all app-related localStorage
 */
export const clearAppStorage = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('croptoken-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing app storage:', error);
    return false;
  }
};

// Specific storage keys
export const STORAGE_KEYS = {
  WALLET_CONNECTION: 'croptoken-wallet-connection',
  USER_PREFERENCES: 'croptoken-user-preferences',
  RECENT_ACTIVITY: 'croptoken-recent-activity',
  DRAFT_CROPS: 'croptoken-draft-crops',
  FAVORITES: 'croptoken-favorites'
};
