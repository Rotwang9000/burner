export const SUPPORTED_NETWORKS = {
	ARBITRUM_ONE: 42161,
	ARBITRUM_GOERLI: 421613,
	  LOCAL: 31337

};

export const NETWORK_DETAILS = {
	[SUPPORTED_NETWORKS.ARBITRUM_ONE]: {
		chainId: `0x${SUPPORTED_NETWORKS.ARBITRUM_ONE.toString(16)}`,
		chainName: 'Arbitrum One',
		nativeCurrency: {
			name: 'ETH',
			symbol: 'ETH',
			decimals: 18
		},
		rpcUrls: ['https://arb1.arbitrum.io/rpc'],
		blockExplorerUrls: ['https://arbiscan.io']
	},
	[SUPPORTED_NETWORKS.ARBITRUM_GOERLI]: {
		chainId: `0x${SUPPORTED_NETWORKS.ARBITRUM_GOERLI.toString(16)}`,
		chainName: 'Arbitrum Goerli',
		nativeCurrency: {
			name: 'ETH',
			symbol: 'ETH',
			decimals: 18
		},
		rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
		blockExplorerUrls: ['https://goerli.arbiscan.io']
	}
};