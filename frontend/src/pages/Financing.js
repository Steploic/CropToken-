import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Financing = ({ account, contracts, provider }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newCampaign, setNewCampaign] = useState({
    targetAmount: '',
    expectedReturn: '',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    if (contracts.financing) {
      loadFinancingData();
    }
  }, [contracts]);

  const loadFinancingData = async () => {
    try {
      setLoading(true);
      
      // Mock financing campaigns
      const mockCampaigns = [
        {
          id: 0,
          farmer: '0x1234...5678',
          farmerName: 'Amadou Diallo',
          targetAmount: '5.000',
          raisedAmount: '2.350',
          expectedReturn: 12,
          deadline: '2025-11-30',
          description: 'Maize seeds for 2025 season - expanding to 5 hectares',
          location: 'Douala, Cameroon',
          progress: 47,
          investorCount: 23,
          isActive: true
        },
        {
          id: 1,
          farmer: '0xabcd...efgh',
          farmerName: 'Marie Ngozi',
          targetAmount: '8.000',
          raisedAmount: '6.200',
          expectedReturn: 15,
          deadline: '2025-12-15',
          description: 'Organic coffee plantation expansion and processing equipment',
          location: 'Bamenda, Cameroun',
          progress: 77,
          investorCount: 31,
          isActive: true
        },
        {
          id: 2,
          farmer: '0x9876...5432',
          farmerName: 'Joseph Mbaye',
          targetAmount: '3.500',
          raisedAmount: '3.500',
          expectedReturn: 10,
          deadline: '2025-10-20',
          description: 'Cocoa farm irrigation system upgrade',
          location: 'Yaoundé, Cameroun',
          progress: 100,
          investorCount: 18,
          isActive: false
        }
      ];

      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error loading financing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    if (!contracts.financing || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const targetAmountWei = ethers.utils.parseEther(newCampaign.targetAmount);
      const deadlineTimestamp = Math.floor(new Date(newCampaign.deadline).getTime() / 1000);
      const expectedReturnBps = parseInt(newCampaign.expectedReturn) * 100; // Convert % to basis points

      const tx = await contracts.financing.createCampaign(
        targetAmountWei,
        expectedReturnBps,
        deadlineTimestamp,
        newCampaign.description
      );

      await tx.wait();
      alert('Campaign created successfully!');
      setShowCreateForm(false);
      setNewCampaign({ targetAmount: '', expectedReturn: '', deadline: '', description: '' });
      loadFinancingData();

    } catch (error) {
      console.error('Campaign creation failed:', error);
      alert('Campaign creation failed. Please try again.');
    }
  };

  const handleInvest = async (campaignId, amount) => {
    if (!contracts.financing || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const investmentAmount = ethers.utils.parseEther(amount.toString());
      
      const tx = await contracts.financing.invest(campaignId, {
        value: investmentAmount
      });

      await tx.wait();
      alert('Investment successful!');
      loadFinancingData();

    } catch (error) {
      console.error('Investment failed:', error);
      alert('Investment failed. Please try again.');
    }
  };

  const CampaignCard = ({ campaign }) => {
    const [investAmount, setInvestAmount] = useState('');
    
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{campaign.farmerName}</h3>
              <p className="text-gray-600 text-sm">📍 {campaign.location}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {campaign.isActive ? 'Active' : 'Completed'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4">{campaign.description}</p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{campaign.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-crop-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${campaign.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-crop-green">{campaign.raisedAmount} HBAR</p>
              <p className="text-gray-500 text-sm">of {campaign.targetAmount} HBAR goal</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{campaign.expectedReturn}%</p>
              <p className="text-gray-500 text-sm">Expected Return</p>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>👥 {campaign.investorCount} investors</span>
            <span>⏰ {daysLeft} days left</span>
          </div>

          {/* Investment Section */}
          {campaign.isActive && account && (
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  placeholder="0.1"
                  step="0.1"
                  min="0.1"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                />
                <span className="text-gray-600">HBAR</span>
                <button
                  onClick={() => handleInvest(campaign.id, investAmount)}
                  disabled={!investAmount || parseFloat(investAmount) <= 0}
                  className="bg-crop-gold hover:bg-yellow-500 disabled:bg-gray-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Invest
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">💰 Crop Financing</h1>
            <p className="text-gray-600">Invest in agricultural projects and support farmers</p>
          </div>
          {account && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-crop-green hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Campaign
            </button>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Create Financing Campaign</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount (HBAR)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={newCampaign.targetAmount}
                    onChange={(e) => setNewCampaign({...newCampaign, targetAmount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                    placeholder="5.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Return (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newCampaign.expectedReturn}
                    onChange={(e) => setNewCampaign({...newCampaign, expectedReturn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    required
                    value={newCampaign.deadline}
                    onChange={(e) => setNewCampaign({...newCampaign, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crop-green focus:border-crop-green"
                    placeholder="Describe your farming project and funding needs..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-crop-green hover:bg-green-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crop-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {campaigns.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600">Be the first to create a financing campaign!</p>
        </div>
      )}
    </div>
  );
};

export default Financing;
