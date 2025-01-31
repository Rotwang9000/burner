export interface TokenData {
  totalSupply: string;
  price: string;
  marketCap: string;
  lastRebase: string;
  priceChange24h?: number;
}

export interface StakePosition {
  symbol: string;
  ethAmount: string;
  entryPrice: string;
  timestamp: number;
  currentPnL: string;
}

export interface SymbolData {
  priceFeed: string;
  lastPrice: string;
  reserveBalance: string;
  active: boolean;
}
