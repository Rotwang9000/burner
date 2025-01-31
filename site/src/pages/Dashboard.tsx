import { Box, Grid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, SimpleGrid, Button, useToast } from '@chakra-ui/react';
import { useWeb3Context } from '../context/Web3Context';
import { useState, useEffect } from 'react';
import { formatEther, formatUnits } from 'ethers';

const Dashboard = () => {
  const { contract, tokenFunctions } = useWeb3Context();
  const [tokenData, setTokenData] = useState({
    totalSupply: '0',
    price: '0',
    marketCap: '0',
    lastRebase: '0'
  });
  const [isRebasing, setIsRebasing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (contract) {
        try {
          const supply = await contract.totalSupply();
          const price = await contract.getSymbolPrice("ETH");
          
          setTokenData({
            totalSupply: formatEther(supply),
            price: formatUnits(price, 8),
            marketCap: (Number(formatEther(supply)) * Number(formatUnits(price, 8))).toFixed(2),
            lastRebase: '0'
          });
        } catch (error) {
          console.error("Error fetching token data:", error);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [contract]);

  const handleRebase = async () => {
    if (!tokenFunctions) return;
    
    try {
      setIsRebasing(true);
      await tokenFunctions.rebase();
      toast({
        title: "Rebase successful",
        status: "success",
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "Rebase failed",
        description: error?.message || "An unknown error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsRebasing(false);
    }
  };

  return (
    <Box maxW="1200px" mx="auto" mt={8}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Total Supply</StatLabel>
          <StatNumber>{Number(tokenData.totalSupply).toLocaleString()}</StatNumber>
          <StatHelpText>EGROW</StatHelpText>
        </Stat>

        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Price</StatLabel>
          <StatNumber>${Number(tokenData.price).toFixed(6)}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            23.36%
          </StatHelpText>
        </Stat>

        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Market Cap</StatLabel>
          <StatNumber>${Number(tokenData.marketCap).toLocaleString()}</StatNumber>
        </Stat>

        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Last Rebase</StatLabel>
          <StatNumber>{tokenData.lastRebase}</StatNumber>
          <StatHelpText>minutes ago</StatHelpText>
        </Stat>
      </SimpleGrid>
      <Button
        mt={4}
        colorScheme="purple"
        onClick={handleRebase}
        isLoading={isRebasing}
      >
        Trigger Rebase
      </Button>
    </Box>
  );
};

export default Dashboard;
