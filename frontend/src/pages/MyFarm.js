import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const MyFarm = ({ account, contracts, provider }) => {
  const [crops, setCrops] = useState([]);
  const [showTokenizeForm, setShowTokenizeForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newCrop, setNewCrop] = useState({
    cropType: '',
    expectedYield: '',
    harvestDate: '',
    location: '',
    pricePerKg: '',
    description: ''
  });

  useEffect(() => {
    if (contracts.cropFactory && account) {
      loadFarmerData();
    }
  }, [contracts, account]);

  const loadFarmerData = async () => {
    try {
      setLoading(true);
      
      // Mock farmer's crops data
      const mockCrops = [
        {
          id: 0,
          cropType: 'Maize',
          expectedYield: 1000,
          plantingDate: '2025-06-15',
          harvestDate: '2025-12-15',
          location: 'Douala, Cameroon',
          pricePerKg: '0.001',
          status: 'Growing',
          verified: true,
          tokensIssued: 1000,
          tokensSold: 0,
          description: 'High-yield hybrid maize variety'
        },
        {
          id: 1,
          cropType: 'Cocoa',
          expectedYield: 500,
          plantingDate: '2025-01-20',
          harvestDate: '2025-11-30',
          location: 'Douala, Cameroon',
          pricePerKg: '0.005',
          status: 'Ready',
          verified: true,
          tokensIssued: 500,
          tokensSold: 200,
          description: 'Organic cocoa beans, fair trade certified'
        }
      ];

      setCrops(mockCrops);
    } catch (error) {
      console.error('Error loading farmer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenizeCrop = async (e) => {
    e.preventDefault();
    
    if (!contracts.cropFactory || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const harvestTimestamp = Math.floor(new Date(newCrop.harvestDate).getTime() / 1000);
      const pricePerKgWei = ethers.utils.parseEther(newCrop.pricePerKg);

      const tx = await contracts.cropFactory.tokenizeCrop(
        newCrop.cropType,
        parseInt(newCrop.expectedYield),
        harvestTimestamp,
        newCrop.location,
        `QmIPFSHash${Date.now()}`, // Mock IPFS hash
        pricePerKgWei
      );

      await tx.wait();
      alert('Crop tokenized successfully!');
      setShowTokenizeForm(false);
      setNewCrop({
        cropType: '',
        expectedYield: '',
        harvestDate: '',
        location: '',
        pricePerKg: '',
        description: ''
      });
      loadFarmerData();

    } catch (error) {
      console.error('Tokenization failed:', error);
      alert('Tokenization failed. Please try again.');
    }
  };

  const CropCard = ({ crop }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Planted': return 'bg-blue-100 text-blue-800';
        case 'Growing': return 'bg-yellow-100 text-yellow-800';
        case 'Ready': return 'bg-green-100 text-green-800';
        case 'Harvested': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const soldPercentage = (crop.tokensSold / crop.tokensIssued) * 100;

    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">
              {crop.cropType === 'Maize' && '🌽'}
              {crop.cropType === 'Cocoa' && '🍫'}
              {crop.cropType === 'Coffee' && '☕'}
              {crop.cropType === 'Cassava' && '🥔'}
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{crop.cropType}</h3>
              <p className="text-gray-600 text-sm">Crop ID: {crop.id}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
              {crop.status}
            </span>
            {crop.verified && (
              <div className="mt-1">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  ✓ Verified
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <p className="text-gray-600 text-sm">📍 {crop.location}</p>
          <p className="text-gray-600 text-sm">🌱 Planted: {crop.plantingDate}</p>
          <p className="text-gray-600 text-sm">🚜 Harvest: {crop.harvestDate}</p>
          <p className="text-gray-600 text-sm">📝 {crop.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-lg font-bold text-crop-green">{crop.expectedYield} kg</p>
            <p className="text-gray-500 text-sm">Expected Yield</p>
          </div>
          <div>
            <p className="text-lg font-bold text-crop-gold">{crop.pricePerKg} HBAR</p>
            <p className="text-gray-500 text-sm">Price per kg</p>
          </div>
        </div>

        {/* Token Sales Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Tokens Sold</span>
            <span className="font-medium">{crop.tokensSold}/{crop.tokensIssued} ({soldPercentage.toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-crop-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${soldPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-700">Revenue Generated</span>
            <span className="text-lg font-bold text-green-800">
              {(crop.tokensSold * parseFloat(crop.pricePerKg)).toFixed(3)} HBAR
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-6">🚜</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 text-center max-w-md">
          Connect your wallet to view your farm, tokenize crops, and manage your agricultural assets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">🚜 My Farm</h1>
            <p className="text-gray-600">Manage your tokenized crops and track your farming business</p>
          </div>
          <button
            onClick={() => setShowTokenizeForm(true)}
            className="bg-crop-green hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Tokenize Crop
          </button>
        </div>
      </div>

      {/* Farm Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Crops</p>
              <p className="text-2xl font-bold text-crop-green mt-1">{crops.length}</p>
            </div>
            <span className="text-3xl">🌾</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-crop-gold mt-1">
                {crops.reduce((sum, crop) => sum + (crop.tokensSold * parseFloat(crop.pricePerKg)), 0).toFixed(2)} HBAR
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tokens Sold</p>
              <p className="text-2xl font-bold text-crop-orange mt-1">
                {crops.reduce((sum, crop) => sum + crop.tokensSold, 0)}
              </p>
            </div>
            <span className="text-3xl">🎯</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Verified Crops</p>
              <p className="text-2xl font-bold text-crop-blue mt-1">
                {crops.filter(crop => crop.verified).length}
              </p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </div>
      </div>

      {/* Tokenize Crop Modal */}
      {showTokenizeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Tokenize New Crop</h3>
                <button
                  onClick={() => setShowTokenizeForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTokenizeCrop} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Type
                  </label>
                  <select
                    required
                    value={newCrop.cropType}
                    onChange={(e) => setNewCrop({...newCrop, cropType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                  >
                    <option value="">Select crop type</option>
                    <option value="maize">Maize</option>
                    <option value="cocoa">Cocoa</option>
                    <option value="coffee">Coffee</option>
                    <option value="cassava">Cassava</option>
                    <option value="rice">Rice</option>
                    <option value="yam">Yam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Yield (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCrop.expectedYield}
                    onChange={(e) => setNewCrop({...newCrop, expectedYield: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    required
                    value={newCrop.harvestDate}
                    onChange={(e) => setNewCrop({...newCrop, harvestDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Location
                  </label>
                  <input
                    type="text"
                    required
                    value={newCrop.location}
                    onChange={(e) => setNewCrop({...newCrop, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                    placeholder="Douala, Cameroon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per kg (HBAR)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    value={newCrop.pricePerKg}
                    onChange={(e) => setNewCrop({...newCrop, pricePerKg: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                    placeholder="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newCrop.description}
                    onChange={(e) => setNewCrop({...newCrop, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                    placeholder="Describe your crop variety, farming methods, etc..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTokenizeForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-crop-green hover:bg-green-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Tokenize Crop
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Crops Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crop-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your farm...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <CropCard key={crop.id} crop={crop} />
          ))}
        </div>
      )}

      {crops.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No crops yet</h3>
          <p className="text-gray-600 mb-6">Start by tokenizing your first crop to join the marketplace.</p>
          <button
            onClick={() => setShowTokenizeForm(true)}
            className="bg-crop-green hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Tokenize Your First Crop
          </button>
        </div>
      )}
    </div>
  );
};

export default MyFarm;
