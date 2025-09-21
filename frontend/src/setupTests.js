// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock HashConnect for testing
global.HashConnect = class MockHashConnect {
  constructor() {
    this.foundExtensionEvent = { on: jest.fn() };
    this.pairingEvent = { on: jest.fn() };
    this.disconnectionEvent = { on: jest.fn() };
  }
  
  init = jest.fn().mockResolvedValue();
  connectToLocalWallet = jest.fn().mockResolvedValue();
  disconnect = jest.fn().mockResolvedValue();
  sendTransaction = jest.fn().mockResolvedValue({ transactionId: 'mock-tx-id' });
};

// Mock Hedera SDK
global.Client = {
  forTestnet: jest.fn(() => ({
    setOperator: jest.fn(),
  })),
  forMainnet: jest.fn(() => ({
    setOperator: jest.fn(),
  })),
};

// Mock environment variables
process.env.REACT_APP_HEDERA_NETWORK = 'testnet';
process.env.REACT_APP_CROP_FACTORY_ADDRESS = '0.0.123456';
process.env.REACT_APP_MARKETPLACE_ADDRESS = '0.0.123457';
process.env.REACT_APP_FINANCING_ADDRESS = '0.0.123458';
