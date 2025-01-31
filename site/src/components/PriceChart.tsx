import { Box, Heading, useColorModeValue } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';
import { formatUnits } from 'ethers';

const PriceChart = ({ contract, symbol }: { contract: any; symbol: string }) => {
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!contract) return;
      
      try {
        // This is just demo data - you'd need to implement actual price history storage
        const mockData = Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() - (23-i) * 3600000).toLocaleTimeString(),
          price: Math.random() * 0.1 + 1 // Random price between 1.0 and 1.1
        }));
        setPriceHistory(mockData);
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    };

    fetchPriceHistory();
    const interval = setInterval(fetchPriceHistory, 60000);
    return () => clearInterval(interval);
  }, [contract, symbol]);

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
