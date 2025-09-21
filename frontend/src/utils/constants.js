export const NETWORK_CONFIG = {
  testnet: {
    name: 'Hedera Testnet',
    chainId: 296,
    rpcUrl: 'https://testnet.hashio.io/api',
    explorerUrl: 'https://hashscan.io/testnet',
  },
  mainnet: {
    name: 'Hedera Mainnet',
    chainId: 295,
    rpcUrl: 'https://mainnet.hashio.io/api',
    explorerUrl: 'https://hashscan.io/mainnet',
  }
};

export const CONTRACT_ADDRESSES = {
  testnet: {
    cropFactory: process.env.REACT_APP_CROP_FACTORY_ADDRESS || '0.0.123456',
    marketplace: process.env.REACT_APP_MARKETPLACE_ADDRESS || '0.0.123457',
    financing: process.env.REACT_APP_FINANCING_ADDRESS || '0.0.123458',
  },
  mainnet: {
    cropFactory: process.env.REACT_APP_CROP_FACTORY_MAINNET || '0.0.654321',
    marketplace: process.env.REACT_APP_MARKETPLACE_MAINNET || '0.0.654322',
    financing: process.env.REACT_APP_FINANCING_MAINNET || '0.0.654323',
  }
};

export const CROP_TYPES = [
  { value: 'maize', label: 'Maize', emoji: '🌽', color: '#FFD700' },
  { value: 'cocoa', label: 'Cocoa', emoji: '🍫', color: '#8B4513' },
  { value: 'coffee', label: 'Coffee', emoji: '☕', color: '#228B22' },
  { value: 'cassava', label: 'Cassava', emoji: '🥔', color: '#FF8C00' },
  { value: 'rice', label: 'Rice', emoji: '🌾', color: '#F0E68C' },
  { value: 'yam', label: 'Yam', emoji: '🍠', color: '#DEB887' },
  { value: 'plantain', label: 'Plantain', emoji: '🍌', color: '#FFFF99' },
  { value: 'groundnut', label: 'Groundnut', emoji: '🥜', color: '#D2691E' }
];

export const AFRICAN_LOCATIONS = [
  'Douala, Cameroon',
  'Yaoundé, Cameroon',
  'Bamenda, Cameroon',
  'Garoua, Cameroon',
  'Lagos, Nigeria',
  'Abuja, Nigeria',
  'Kano, Nigeria',
  'Nairobi, Kenya',
  'Mombasa, Kenya',
  'Accra, Ghana',
  'Kumasi, Ghana',
  'Cairo, Egypt',
  'Alexandria, Egypt',
  'Tunis, Tunisia',
  'Casablanca, Morocco',
  'Cape Town, South Africa',
  'Johannesburg, South Africa',
  'Kinshasa, DR Congo',
  'Luanda, Angola',
  'Addis Ababa, Ethiopia'
];

export const STATUS_COLORS = {
  PLANTED: 'bg-blue-100 text-blue-800',
  GROWING: 'bg-yellow-100 text-yellow-800',
  READY: 'bg-green-100 text-green-800',
  HARVESTED: 'bg-purple-100 text-purple-800',
  TRADED: 'bg-gray-100 text-gray-800'
};

export const QUALITY_GRADES = [
  'Grade A',
  'Grade B', 
  'Premium',
  'Organic',
  'Fair Trade',
  'Standard'
];
