import { Contract } from 'ethers';

export interface Web3ContextType {
  account: string | null;
  provider: any;
  signer: any;
  contract: Contract | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  error: string | null;
  chainId: number | null;
  ensureSupportedNetwork: () => Promise<boolean>;
  tokenFunctions: {
    getBalance: (symbolHash: string, address: string) => Promise<string>;  // Updated parameters
    getAllowance: (symbolHash: string, owner: string, spender: string) => Promise<string>;  // Updated parameters
    approve: (symbolHash: string, spender: string, amount: string) => Promise<void>;  // Updated parameters
    getSymbolInfo: (tokenId: number) => Promise<any>;
    rebase: () => Promise<void>;
  } | null;
  currentNetwork: string;
  switchNetwork: (networkKey: string) => Promise<void>;
}
