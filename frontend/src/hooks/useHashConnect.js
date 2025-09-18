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
  const [hashConnect, setHashConnect] =
