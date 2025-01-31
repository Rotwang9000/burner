import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner, Contract, formatEther, parseEther } from 'ethers';
import { useToast } from '@chakra-ui/react';
import ElasticTokenJSON from '../abis/ElasticToken.json';
import { ELASTIC_TOKEN_ADDRESS } from "../constants/addresses";
import { SUPPORTED_NETWORKS, NETWORK_DETAILS } from '../constants/networks';
const ElasticTokenABI = ElasticTokenJSON.abi;

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  error: string | null;
  chainId: number | null;
  ensureSupportedNetwork: () => Promise<boolean>;
  tokenFunctions: {
    getBalance: (address: string) => Promise<string>;
    getAllowance: (owner: string, spender: string) => Promise<string>;
    approve: (spender: string, amount: string) => Promise<void>;
    getSymbolInfo: (symbol: string) => Promise<any>;
    rebase: () => Promise<void>;
  } | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  contract: null,
  connect: async () => {},
  disconnect: () => {},
  isLoading: false,
  error: null,
  chainId: null,
  ensureSupportedNetwork: async () => false,
  tokenFunctions: null,
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const toast = useToast();

  const ensureSupportedNetwork = useCallback(async () => {
    if (!provider) return false;
    
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
  
    if (!Object.values(SUPPORTED_NETWORKS).includes(currentChainId)) {
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed');
        }
        
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_DETAILS[SUPPORTED_NETWORKS.ARBITRUM_GOERLI]]
        });
        
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_DETAILS[SUPPORTED_NETWORKS.ARBITRUM_GOERLI].chainId }]
        });
        
        return true;
      } catch (err) {
        setError('Please switch to Arbitrum network');
        toast({
          title: "Network Error",
          description: "Please switch to Arbitrum network",
          status: "error"
        });
        return false;
      }
    }
    return true;
  }, [provider, toast, setError]);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await browserProvider.getSigner();
      const contractAddress = ELASTIC_TOKEN_ADDRESS;

      // Replace with your deployed contract address
      const elasticToken = new Contract(
        contractAddress,
        ElasticTokenABI,
        newSigner
      );

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(newSigner);
      setContract(elasticToken);

      const network = await browserProvider.getNetwork();
      setChainId(Number(network.chainId));
      
      if (!await ensureSupportedNetwork()) {
        return;
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : 'Failed to connect',
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  }, [ensureSupportedNetwork, toast]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
  }, []);

  const tokenFunctions = contract ? {
    getBalance: async (address: string) => {
      const balance = await contract.balanceOf(address);
      return formatEther(balance);
    },
    getAllowance: async (owner: string, spender: string) => {
      return contract.allowanceOf(owner, spender);
    },
    approve: async (spender: string, amount: string) => {
      const tx = await contract.approve(spender, parseEther(amount));
      await tx.wait();
    },
    getSymbolInfo: async (symbol: string) => {
      return contract.getSymbolInfo(symbol);
    },
    rebase: async () => {
      const tx = await contract.rebaseSupply();
      await tx.wait();
    }
  } : null;

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        contract,
        connect,
        disconnect,
        isLoading,
        error,
        chainId,
        ensureSupportedNetwork,
        tokenFunctions
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3Context = () => useContext(Web3Context);
