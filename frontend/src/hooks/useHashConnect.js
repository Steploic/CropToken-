import { useState, useEffect } from 'react';
import { HashConnect } from '@hashgraph/hedera-wallet-connect';
import { 
  Client, 
  AccountId, 
  PrivateKey,
  ContractCreateTransaction,
  ContractCallQuery,
  ContractExecuteTransaction,
  Hbar
} from '@hashgraph/sdk';

const useHashConnect = () => {
  const [hashConnect, setHashConnect] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [network, setNetwork] = useState('testnet');

  // Initialize HashConnect
  useEffect(() => {
    initHashConnect();
  }, []);

  const initHashConnect = async () => {
    try {
      const hc = new HashConnect(true); // Debug mode
      
      // App metadata
      const appMetadata = {
        name: 'CropToken',
        description: 'Tokenizing Africa\'s Agriculture on Hedera',
        icon: 'https://croptoken.io/logo.png',
        url: 'https://croptoken.io'
      };

      // Initialize with metadata
      await hc.init(appMetadata);
      
      setHashConnect(hc);

      // Set up event listeners
      hc.foundExtensionEvent.on((walletMetadata) => {
        console.log('Found wallet extension:', walletMetadata);
      });

      hc.pairingEvent.on((pairingData) => {
        console.log('Paired with wallet:', pairingData);
        setAccount(pairingData.accountIds[0]);
        setIsConnected(true);
        setNetwork(pairingData.network);
        
        // Save pairing data to localStorage
        localStorage.setItem('hashconnect-pairing', JSON.stringify(pairingData));
      });

      hc.disconnectionEvent.on(() => {
        console.log('Wallet disconnected');
        setAccount('');
        setIsConnected(false);
        localStorage.removeItem('hashconnect-pairing');
      });

      // Check for existing pairing
      const savedPairing = localStorage.getItem('hashconnect-pairing');
      if (savedPairing) {
        const pairingData = JSON.parse(savedPairing);
        setAccount(pairingData.accountIds[0]);
        setIsConnected(true);
        setNetwork(pairingData.network);
      }

    } catch (error) {
      console.error('Failed to initialize HashConnect:', error);
    }
  };

  const connectWallet = async () => {
    if (!hashConnect) {
      console.error('HashConnect not initialized');
      return;
    }

    try {
      setIsLoading(true);
      
      // Request pairing with wallet
      hashConnect.connectToLocalWallet();
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please ensure you have HashPack installed.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    if (hashConnect) {
      hashConnect.disconnect();
    }
    setAccount('');
    setIsConnected(false);
    localStorage.removeItem('hashconnect-pairing');
  };

  // Execute contract function
  const executeContract = async (contractId, functionName, params = [], payableAmount = 0) => {
    if (!hashConnect || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(300000)
        .setFunction(functionName, params);

      if (payableAmount > 0) {
        transaction.setPayableAmount(new Hbar(payableAmount));
      }

      // Request transaction signing from wallet
      const response = await hashConnect.sendTransaction(transaction);
      
      return response;
      
    } catch (error) {
      console.error('Contract execution failed:', error);
      throw error;
    }
  };

  // Query contract
  const queryContract = async (contractId, functionName, params = []) => {
    try {
      const client = network === 'mainnet' 
        ? Client.forMainnet()
        : Client.forTestnet();

      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(functionName, params);

      const result = await query.execute(client);
      return result;
      
    } catch (error) {
      console.error('Contract query failed:', error);
      throw error;
    }
  };

  return {
    hashConnect,
    account,
    isConnected,
    isLoading,
    network,
    connectWallet,
    disconnectWallet,
    executeContract,
    queryContract
  };
};

export default useHashConnect;
