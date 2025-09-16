# 🌾 CropToken - Tokenizing Africa's Agriculture

[![Hedera](https://img.shields.io/badge/Built%20on-Hedera-blue)](https://hedera.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Hedera%20Africa-Hackathon%202025-orange)](https://hedera.com)

## 🎯 Vision

Democratizing agricultural finance across Africa by tokenizing crop assets and creating a transparent, decentralized marketplace that directly connects smallholder farmers with global buyers.

## ⚡ Key Features

- 🌱 **Crop Tokenization**: Convert future harvests into tradeable digital assets
- 🏪 **Decentralized Marketplace**: Direct farmer-to-buyer trading
- 💰 **Crowdfunded Farming**: Community-powered agricultural financing
- 📍 **Supply Chain Tracking**: Farm-to-fork traceability
- 📱 **Mobile-First**: Optimized for African mobile users

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Hedera Testnet account
- MetaMask or HashPack wallet

### Installation
```bash
git clone https://github.com/yourusername/croptoken.git
cd croptoken

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# Setup environment
cp .env.example .env
# Edit .env with your Hedera credentials

# Deploy contracts
npx hardhat run scripts/deploy.js --network hedera-testnet

# Start frontend
cd frontend && npm start

# Start backend (new terminal)
cd backend && npm start
