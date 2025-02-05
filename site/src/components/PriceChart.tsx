import { Box, Heading, useColorModeValue } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';
import { formatUnits } from 'ethers';

interface PriceChartProps {
  contract: any | null;
  tokenId: number;  // Change from symbol to tokenId
}

const PriceChart: React.FC<PriceChartProps> = ({ contract, tokenId }) => {
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!contract || !tokenId) return;
      
      try {
        // Get symbol from symbolHash
        const symbolHash = await contract.supportedSymbols(tokenId - 1); // Adjust for 0-based index
        const data = await contract.symbolData(symbolHash);
        
        // For demo purposes - you should implement actual price history tracking
        const mockData = Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() - (23-i) * 3600000).toLocaleTimeString(),
          price: Number(formatUnits(data.lastPrice, 8)) * (1 + (Math.random() * 0.1 - 0.05)) // ±5% variation
        }));
        setPriceHistory(mockData);
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    };

    fetchPriceHistory();
    const interval = setInterval(fetchPriceHistory, 60000);
    return () => clearInterval(interval);
  }, [contract, tokenId]);

  return (
    <Box bg="gray.800" p={6} borderRadius="lg" w="100%">
      <Heading size="md" mb={4}>Price History (24h)</Heading>
      <Box height="300px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceHistory}>
            <XAxis 
              dataKey="time" 
              tick={{ fill: 'white' }}
            />
            <YAxis 
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
              tick={{ fill: 'white' }}
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3182ce"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default PriceChart;
