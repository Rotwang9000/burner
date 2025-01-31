export interface NetworkInfo {
  id: number;
  name: string;
  rpcUrl: string;
  currency: string;
  explorerUrl: string;
  logo: string;
}

export const SUPPORTED_NETWORKS: { [key: string]: NetworkInfo } = {
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    currency: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    logo: '/arbitrum.svg'
  },
  arbitrumSepolia: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.arbiscan.io',
    logo: '/arbitrum.svg'
  }
};

export const DEFAULT_NETWORK = 'arbitrumSepolia';