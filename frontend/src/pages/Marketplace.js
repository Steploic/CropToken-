
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Marketplace = ({ account, contracts, provider }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    if (contracts.marketplace) {
      loadMarketplaceData();
    }
  }, [contracts]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Mock marketplace data for demo
      const mockListings = [
        {
          id: 0,
          cropType: 'Maize',
          seller: '0x1234...5678',
          location: 'Douala, Cameroon',
          availableKg: 1000,
          pricePerKg: '0.001',
          quality: 'Grade A',
          harvestDate: '2025-12-15',
          image: '/crops/maize.jpg',
          verified: true
        },
        {
          id: 1,
          cropType: 'Cocoa',
          seller: '0xabcd...efgh',
          location: 'Yaoundé, Cameroon',
          availableKg: 500,
          pricePerKg: '0.005',
          quality: 'Premium',
          harvestDate: '2025-11-30',
          image: '/crops/cocoa.jpg',
          verified: true
        },
        {
          id: 2,
          cropType: 'Coffee',
          seller: '0x9876...5432',
          location: 'Bamenda, Cameroon',
          availableKg: 300,
          pricePerKg: '0.008',
          quality: 'Organic',
          harvestDate: '2026-01-20',
          image: '/crops/coffee.jpg',
          verified: false
        }
      ];

      setListings(mockListings);
    } catch (error) {
      console.error('Error loading marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTokens = async (listing, quantity) => {
    if (!contracts.marketplace || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const totalPrice = ethers.utils.parseEther((listing.pricePerKg * quantity).toString());
      
      const tx = await contracts.marketplace.buyTokens(listing.id, quantity, {
        value: totalPrice
      });
      
      await tx.wait();
      alert('Purchase successful!');
      loadMarketplaceData();
      
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const filteredListings = listings
    .filter(listing => selectedCrop === 'all' || listing.cropType.toLowerCase() === selectedCrop)
    .sort((a, b) => {
      if (sortBy === 'price') return parseFloat(a.pricePerKg) - parseFloat(b.pricePerKg);
      if (sortBy === 'quantity') return b.availableKg - a.availableKg;
      return 0;
    });

  const CropCard = ({ listing }) => {
    const [buyQuantity, setBuyQuantity] = useState(1);

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
        {/* Crop Image */}
        <div className="h-48 bg-gradient-to-br from-crop-green to-crop-gold flex items-center justify-center">
          <span className="text-6xl">
            {listing.cropType === 'Maize' && '🌽'}
            {listing.cropType === 'Cocoa' && '🍫'}
            {listing.cropType === 'Coffee' && '☕'}
            {listing.cropType === 'Cassava' && '🥔'}
          </span>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900">{listing.cropType}</h3>
            {listing.verified ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                ✓ Verified
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                Pending
              </span>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-gray-600 text-sm">📍 {listing.location}</p>
            <p className="text-gray-600 text-sm">👤 {listing.seller}</p>
            <p className="text-gray-600 text-sm">📅 Harvest: {listing.harvestDate}</p>
            <p className="text-gray-600 text-sm">⭐ Quality: {listing.quality}</p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-crop-green">{listing.pricePerKg} HBAR</p>
              <p className="text-gray-500 text-sm">per kg</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{listing.availableKg} kg</p>
              <p className="text-gray-500 text-sm">available</p>
            </div>
          </div>

          {/* Purchase Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-3 mb-3">
              <label className="text-sm font-medium text-gray-700">Quantity (kg):</label>
              <input
                type="number"
                min="1"
                max={listing.availableKg}
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:ring-crop-green focus:border-crop-green"
              />
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="font-bold text-crop-green">
                {(listing.pricePerKg * buyQuantity).toFixed(3)} HBAR
              </span>
            </div>

            <button
              onClick={() => handleBuyTokens(listing, buyQuantity)}
              disabled={!account || !listing.verified}
              className="w-full bg-crop-green hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {!account ? 'Connect Wallet' : !listing.verified ? 'Awaiting Verification' : 'Buy Tokens'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🏪 Crop Marketplace</h1>
        <p className="text-gray-600">Trade tokenized agricultural commodities directly with farmers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
            >
              <option value="all">All Crops</option>
              <option value="maize">Maize</option>
              <option value="cocoa">Cocoa</option>
              <option value="coffee">Coffee</option>
              <option value="cassava">Cassava</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
            >
              <option value="price">Price (Low to High)</option>
              <option value="quantity">Quantity (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crop-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <CropCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {filteredListings.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No crops found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later for new listings.</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
