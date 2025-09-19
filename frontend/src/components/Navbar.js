import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ account, isConnected, network, onConnectWallet, onDisconnectWallet, isLoading }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-crop-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-crop-green to-crop-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌾</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CropToken</h1>
                <p className="text-xs text-gray-500">Hedera Africa 2025</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-crop-green text-white' 
                  : 'text-gray-600 hover:text-crop-green hover:bg-green-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/marketplace') 
                  ? 'bg-crop-green text-white' 
                  : 'text-gray-600 hover:text-crop-green hover:bg-green-50'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/financing"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/financing') 
                  ? 'bg-crop-green text-white' 
                  : 'text-gray-600 hover:text-crop-green hover:bg-green-50'
              }`}
            >
              Financing
            </Link>
            <Link
              to="/my-farm"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/my-farm') 
                  ? 'bg-crop-green text-white' 
                  : 'text-gray-600 hover:text-crop-green hover:bg-green-50'
              }`}
            >
              My Farm
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                {/* Network Badge */}
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  network === 'mainnet' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {network}
                </div>
                
                {/* Account Address */}
                <div className="bg-green-50 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-crop-green">
                    {formatAddress(account)}
                  </span>
                </div>
                
                {/* Disconnect Button */}
                <button
                  onClick={onDisconnectWallet}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={onConnectWallet}
                disabled={isLoading}
                className="bg-gradient-to-r from-crop-green to-crop-gold hover:from-green-600 hover:to-yellow-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>Connect HashPack</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-crop-green text-white' 
                  : 'text-gray-600 hover:text-crop-green hover:bg-green-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/marketplace') 
                  ? 'bg-crop-green text-white' 
                  : 'text-gray-600 hover:text-crop-green hover:bg-green-50'
              }`}
            >
              Market
            </Link>
            <Link
              to="/financing"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/financing') 
                  ? 'bg-crop-green text-white' 
                  : 'text-gray-600 hover:text-crop-green hover:bg-green-50'
              }`}
            >
              Finance
            </Link>
            <Link
              to="/my-farm"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/my-farm') 
                  ? 'bg-crop-green text-white' 
                  : 'text-gray-600 hover:text-crop-green hover:bg-green-50'
              }`}
            >
              Farm
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
