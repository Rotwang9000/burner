export interface TokenMetadata {
  id: number;  // Changed from string to number
  symbol: string;
  isActive: boolean;
  lastPrice: string;
  reserveBalance: string;
}
