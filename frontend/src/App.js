import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Main Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Financing from './pages/Financing';
import MyFarm from './pages/MyFarm';

// Hooks
import useHashConnect from './hooks/useHashConnect';

// Utils
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from './utils/constants';

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

  // Contract addresses based on network
  const contracts = CONTRACT_ADDRESSES[network] || CONTRACT_ADDRESSES.testnet;

  // Contract interaction helpers
  const contractHelpers = {
    // CropTokenFactory functions
    tokenizeCrop: async (cropType, expectedYield, harvestDate, location, ipfsHash, pricePerKg) => {
      try {
        return await executeContract(
          contracts.cropFactory,
          'tokenizeCrop',
          [cropType, expectedYield, harvestDate, location, ipfsHash, pricePerKg]
        );
      } catch (error) {
        console.error('Tokenize crop failed:', error);
        throw error;
      }
    },

    // Marketplace functions
    createListing: async (cropId, pricePerToken, tokensToSell) => {
      try {
        return await executeContract(
          contracts.marketplace,
          'createListing',
          [cropId, pricePerToken, tokensToSell]
        );
      } catch (error) {
        console.error('Create listing failed:', error);
        throw error;
      }
    },

    buyTokens: async (listingId, quantity, totalPrice) => {
      try {
        return await executeContract(
          contracts.marketplace,
          'buyTokens',
          [listingId, quantity],
          totalPrice
        );
      } catch (error) {
        console.error('Buy tokens failed:', error);
        throw error;
      }
    },

    // Financing functions
    createCampaign: async (targetAmount, expectedReturn, deadline, description) => {
      try {
        return await executeContract(
          contracts.financing,
          'createCampaign',
          [targetAmount, expectedReturn, deadline, description]
        );
      } catch (error) {
        console.error('Create campaign failed:', error);
        throw error;
      }
    },

    investInCampaign: async (campaignId, investmentAmount) => {
      try {
        return await executeContract(
          contracts.financing,
          'invest',
          [campaignId],
          investmentAmount
        );
      } catch (error) {
        console.error('Investment failed:', error);
        throw error;
      }
    },

    // Query functions
    getCrop: async (cropId) => {
      try {
        return await queryContract(
          contracts.cropFactory,
          'crops',
          [cropId]
        );
      } catch (error) {
        console.error('Get crop failed:', error);
        throw error;
      }
    },

    getActiveCampaigns: async () => {
      try {
        return await queryContract(
          contracts.financing,
          'getActiveCampaigns',
          []
        );
      } catch (error) {
        console.error('Get campaigns failed:', error);
        throw error;
      }
    },

    getFarmerCrops: async (farmerAddress) => {
      try {
        return await queryContract(
          contracts.cropFactory,
          'getFarmerCrops',
          [farmerAddress || account] // Use current account if no address provided
        );
      } catch (error) {
        console.error('Get farmer crops failed:', error);
        throw error;
      }
    },

    // Additional query functions
    getListings: async () => {
      try {
        return await queryContract(
          contracts.marketplace,
          'getActiveListings',
          []
        );
      } catch (error) {
        console.error('Get listings failed:', error);
        throw error;
      }
    },

    getCampaign: async (campaignId) => {
      try {
        return await queryContract(
          contracts.financing,
          'campaigns',
          [campaignId]
        );
      } catch (error) {
        console.error('Get campaign failed:', error);
        throw error;
      }
    }
  };

  return (
    <ErrorBoundary>
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
          
          <main className="container mx-auto px-4 py-8 max-w-7xl">
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
              <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
                network === 'mainnet' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-500 text-black'
              }`}>
                {network === 'mainnet' ? '🟢 Mainnet' : '🟡 Testnet'}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-orange-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">🌾</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">CropToken</h3>
                      <p className="text-xs text-gray-500">Hedera Africa 2025</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Democratizing agricultural finance across Africa through blockchain tokenization.
                    Built on Hedera for ultra-low fees and instant transactions.
                  </p>
                  <div className="flex space-x-4">
                    <a href="https://github.com/yourusername/croptoken" target="_blank" rel="noopener noreferrer" 
                       className="text-gray-400 hover:text-gray-600 transition-colors">
                      <span className="sr-only">GitHub</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="https://twitter.com/CropTokenAfrica" target="_blank" rel="noopener noreferrer" 
                       className="text-gray-400 hover:text-gray-600 transition-colors">
                      <span className="sr-only">Twitter</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Platform</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="/marketplace" className="hover:text-green-600 transition-colors">Marketplace</a></li>
                    <li><a href="/financing" className="hover:text-green-600 transition-colors">Financing</a></li>
                    <li><a href="/my-farm" className="hover:text-green-600 transition-colors">My Farm</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Resources</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="https://docs.hedera.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">Hedera Docs</a></li>
                    <li><a href="https://github.com/yourusername/croptoken" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">Documentation</a></li>
                    <li><a href="https://hashscan.io" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">Explorer</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-8 mt-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-sm text-gray-500">
                    © 2025 CropToken. Built for Hedera Africa Hackathon 2025.
                  </p>
                  <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <span className="text-xs text-gray-400">Powered by</span>
                    <img src="/hedera-logo.png" alt="Hedera" className="h-4" />
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
