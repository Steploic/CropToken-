import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Custom Hook
import useHashConnect from './hooks/useHashConnect';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Financing from './pages/Financing';
import MyFarm from './pages/MyFarm';

// Contract addresses (from deployment)
const CONTRACT_ADDRESSES = {
  cropFactory: process.env.REACT_APP_CROP_FACTORY_ADDRESS || '0.0.123456',
  marketplace: process.env.REACT_APP_MARKETPLACE_ADDRESS || '0.0.123457',
  financing: process.env.REACT_APP_FINANCING_ADDRESS || '0.0.123458'
};

function App() {
  const {
    hashConnect,
    account,
    isConnected,
    isLoading,
    network,
    connectWallet,
    disconnectWallet,
    executeContract,
    queryContract
  } = useHashConnect();

  const [contracts, setContracts] = useState(CONTRACT_ADDRESSES);

  // Contract interaction helpers
  const contractHelpers = {
    // CropTokenFactory functions
    tokenizeCrop: async (cropType, expectedYield, harvestDate, location, ipfsHash, pricePerKg) => {
      return await executeContract(
        contracts.cropFactory,
        'tokenizeCrop',
        [cropType, expectedYield, harvestDate, location, ipfsHash, pricePerKg]
      );
    },

    // Marketplace functions
    createListing: async (cropId, pricePerToken, tokensToSell) => {
      return await executeContract(
        contracts.marketplace,
        'createListing',
        [cropId, pricePerToken, tokensToSell]
      );
    },

    buyTokens: async (listingId, quantity, totalPrice) => {
      return await executeContract(
        contracts.marketplace,
        'buyTokens',
        [listingId, quantity],
        totalPrice
      );
    },

    // Financing functions
    createCampaign: async (targetAmount, expectedReturn, deadline, description) => {
      return await executeContract(
        contracts.financing,
        'createCampaign',
        [targetAmount, expectedReturn, deadline, description]
      );
    },

    investInCampaign: async (campaignId, investmentAmount) => {
      return await executeContract(
        contracts.financing,
        'invest',
        [campaignId],
        investmentAmount
      );
    },

    // Query functions
    getCrop: async (cropId) => {
      return await queryContract(
        contracts.cropFactory,
        'crops',
        [cropId]
      );
    },

    getActiveCampaigns: async () => {
      return await queryContract(
        contracts.financing,
        'getActiveCampaigns',
        []
      );
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
        <Navbar 
          account={account}
          isConnected={isConnected}
          network={network}
          onConnectWallet={connectWallet}
          onDisconnectWallet={disconnectWallet}
          isLoading={isLoading}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  account={account}
                  isConnected={isConnected}
                  contracts={contractHelpers}
                  network={network}
                />
              } 
            />
            <Route 
              path="/marketplace" 
              element={
                <Marketplace 
                  account={account}
                  isConnected={isConnected}
                  contracts={contractHelpers}
                  network={network}
                />
              } 
            />
            <Route 
              path="/financing" 
              element={
                <Financing 
                  account={account}
                  isConnected={isConnected}
                  contracts={contractHelpers}
                  network={network}
                />
              } 
            />
            <Route 
              path="/my-farm" 
              element={
                <MyFarm 
                  account={account}
                  isConnected={isConnected}
                  contracts={contractHelpers}
                  network={network}
                />
              } 
            />
          </Routes>
        </main>

        {/* Network Indicator */}
        {isConnected && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
              network === 'mainnet' 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-black'
            }`}>
              {network === 'mainnet' ? '🟢 Mainnet' : '🟡 Testnet'}
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
