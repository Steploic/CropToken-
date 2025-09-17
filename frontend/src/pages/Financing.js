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
