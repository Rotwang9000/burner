import {
  Box,
  Heading,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  VStack,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';
import { formatEther, parseEther } from 'ethers';

interface SimulationData {
  price: number;
  returns: number;
  totalStaked: number;
}

const PriceSimulator = ({ contract, symbol }: { contract: any; symbol: string }) => {
  const [priceChange, setPriceChange] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [data, setData] = useState<SimulationData[]>([]);

  useEffect(() => {
    const fetchTotalStaked = async () => {
      if (!contract) return;
      try {
        const total = await contract.totalStaked();
        setTotalStaked(Number(formatEther(total)));
      } catch (error) {
        console.error("Error fetching total staked:", error);
      }
    };

    fetchTotalStaked();
  }, [contract]);

  useEffect(() => {
    // Generate simulation data points
    const newData: SimulationData[] = [];
    for (let i = -50; i <= 50; i += 5) {
      const price = 1 + (i / 100);
      const rebaseMultiplier = Math.pow(price, 1/2); // Square root for smoother curve
      const returns = totalStaked * (rebaseMultiplier - 1);
      
      newData.push({
        price: i,
        returns: returns,
        totalStaked: totalStaked
      });
    }
    setData(newData);
  }, [totalStaked, priceChange]);

  return (
    <Box bg="gray.800" p={6} borderRadius="lg" w="100%">
      <VStack spacing={6} align="stretch">
        <Heading size="md">Price Impact Simulator</Heading>
        
        <Box height="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="price" 
                label={{ value: 'Price Change %', position: 'bottom' }}
                tick={{ fill: 'white' }}
              />
              <YAxis 
                label={{ value: 'Expected Returns ETH', angle: -90, position: 'left' }}
                tick={{ fill: 'white' }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <Box bg="gray.700" p={3} borderRadius="md">
                        <Text>Price Change: {payload[0].payload.price}%</Text>
                        <Text>Returns: {payload[0].payload.returns.toFixed(4)} ETH</Text>
                      </Box>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="returns" 
                stroke="#3182ce" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <VStack>
          <Text>Simulate Price Change</Text>
          <Slider
            min={-50}
            max={50}
            value={priceChange}
            onChange={setPriceChange}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <HStack justify="space-between" w="100%">
            <Text>-50%</Text>
            <Text>{priceChange}%</Text>
            <Text>+50%</Text>
          </HStack>
        </VStack>

        <Box>
          <Text>Current Total Staked: {totalStaked.toFixed(2)} ETH</Text>
          <Text>
            Estimated Return at {priceChange}% price change: 
            {(totalStaked * (Math.pow(1 + (priceChange/100), 1/2) - 1)).toFixed(4)} ETH
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default PriceSimulator;
