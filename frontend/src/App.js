import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Financing from './pages/Financing';
import MyFarm from './pages/MyFarm';

// Contract ABIs and addresses
import CropTokenFactoryABI from './contracts/CropTokenFactory.json';
import CropMarketplaceABI from './contracts/CropMarketplace.json';
import CropFinancingABI from './contracts/CropFinancing.json';

const CONTRACT_ADDRESSES = {
  cropFactory: process.env.REACT_APP_CROP_FACTORY_ADDRESS,
  marketplace: process.env.REACT_APP_MARKETPLACE_ADDRESS,
  financing: process.env.REACT_APP_FINANCING_ADDRESS
};

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or HashPack wallet!');
      return;
    }

    try {
      setIsLoading(true);
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = web3Provider.getSigner();

      // Initialize contracts
      const cropFactory = new ethers.Contract(
        CONTRACT_ADDRESSES.cropFactory,
        CropTokenFactoryABI.abi,
        signer
      );

      const marketplace = new ethers.Contract(
        CONTRACT_ADDRESSES.marketplace,
        CropMarketplaceABI.abi,
        signer
      );

      const financing = new ethers.Contract(
        CONTRACT_ADDRESSES.financing,
        CropFinancingABI.abi,
        signer
      );

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setContracts({ cropFactory, marketplace, financing });

    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setProvider(null);
    setContracts({});
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
        <Navbar 
          account={account}
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
                  contracts={contracts}
                  provider={provider}
                />
              } 
            />
            <Route 
              path="/marketplace" 
              element={
                <Marketplace 
                  account={account}
                  contracts={contracts}
                  provider={provider}
                />
              } 
            />
            <Route 
              path="/financing" 
              element={
                <Financing 
                  account={account}
                  contracts={contracts}
                  provider={provider}
                />
              } 
            />
            <Route 
              path="/my-farm" 
              element={
                <MyFarm 
                  account={account}
                  contracts={contracts}
                  provider={provider}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
