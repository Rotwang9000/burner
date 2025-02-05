import { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  VStack,
  Text,
  Spinner,
  HStack,
  Badge,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useWeb3Context } from '../context/Web3Context';
import { formatEther, formatUnits } from 'ethers';
import { TokenMetadata } from '../types/token';

interface TokenStats extends TokenMetadata {
  priceChange24h: string;
  totalSupply: string;
  holders: number;
  trades24h: number;
}

const Stats = () => {
  const { contract } = useWeb3Context();
  const [stats, setStats] = useState<TokenStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLiquidity, setTotalLiquidity] = useState('0');
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!contract) return;
      
      try {
        const count = await contract.getSupportedSymbolsCount();
        const tokenStats: TokenStats[] = [];
        let totalLiq = BigInt(0);
        
        for (let i = 0; i < Number(count); i++) {
          const symbolHash = await contract.supportedSymbols(i);
          const data = await contract.symbolData(symbolHash);
          const stats = await contract.symbolStats(symbolHash);
          const currentHour = Math.floor(Date.now() / 3600000);
          const trades = await contract.tradesPerHour(symbolHash, currentHour);
          
          tokenStats.push({
            id: data.id.toString(),
            symbol: data.symbol,
            isActive: data.active,
            lastPrice: formatUnits(data.lastPrice, 8),
            reserveBalance: formatEther(data.reserveBalance),
            priceChange24h: formatUnits(stats.price24hAgo || 0, 4),
            totalSupply: formatEther(stats.totalSupply),
            holders: Number(stats.holders),
            trades24h: Number(trades), // Use current hour trades
          });
          
          totalLiq += data.reserveBalance;
        }
        
        setStats(tokenStats);
        setTotalLiquidity(formatEther(totalLiq));
        
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [contract]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" mt={8} p={4}>
      <VStack spacing={8} align="stretch">
        {/* Overview Stats */}
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          <GridItem>
            <Stat bg="blue.900" p={4} borderRadius="lg">
              <StatLabel>Total Liquidity</StatLabel>
              <StatNumber>{Number(totalLiquidity).toFixed(2)} ETH</StatNumber>
              <StatHelpText>Across all pools</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat bg="blue.900" p={4} borderRadius="lg">
              <StatLabel>Supported Assets</StatLabel>
              <StatNumber>{stats.length}</StatNumber>
              <StatHelpText>Active price feeds</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat bg="blue.900" p={4} borderRadius="lg">
              <StatLabel>Average Liquidity</StatLabel>
              <StatNumber>
                {stats.length > 0 
                  ? (Number(totalLiquidity) / stats.length).toFixed(2) 
                  : '0'} ETH
              </StatNumber>
              <StatHelpText>Per pool</StatHelpText>
            </Stat>
          </GridItem>
        </Grid>

        {/* Tokens Table */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Symbol</Th>
                <Th>Price</Th>
                <Th isNumeric>Liquidity (ETH)</Th>
                <Th isNumeric>24h Change</Th>
                <Th isNumeric>Total Supply</Th>
                <Th isNumeric>Holders</Th>
                <Th isNumeric>24h Trades</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stats.map((token) => (
                <Tr key={token.symbol}>
                  <Td>
                    <HStack>
                      <Text>e{token.symbol}</Text>
                      <Badge colorScheme="green">Active</Badge>
                    </HStack>
                  </Td>
                  <Td>${Number(token.lastPrice).toFixed(2)}</Td>
                  <Td isNumeric>{Number(token.reserveBalance).toFixed(4)}</Td>
                  <Td isNumeric color={Number(token.priceChange24h) >= 0 ? "green.400" : "red.400"}>
                    {Number(token.priceChange24h)}%
                  </Td>
                  <Td isNumeric>{token.totalSupply}</Td>
                  <Td isNumeric>{token.holders}</Td>
                  <Td isNumeric>{token.trades24h}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          Data updates every 30 seconds. Some metrics require contract support.
        </Text>
      </VStack>
    </Box>
  );
};

export default Stats;
