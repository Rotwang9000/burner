import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { parseEther, formatEther, formatUnits } from 'ethers';

const Stake = () => {
  const { contract, account } = useWeb3Context();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('ETH');
  const [position, setPosition] = useState<any>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchPosition = async () => {
      if (contract && account) {
        try {
          const pos = await contract.getPositionInfo(account);
          setPosition({
            ethAmount: formatEther(pos.ethAmount),
            entryPrice: formatUnits(pos.entryPrice, 8),
            // ...other position data...
          });
        } catch (error) {
          console.error("Error fetching position:", error);
        }
      }
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 30000);
    return () => clearInterval(interval);
  }, [contract, account]);

  const handleStake = async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      const tx = await contract.openLongPosition(
        symbol,
        { value: parseEther(amount) }
      );
      await tx.wait();
      
      toast({
        title: "Position opened successfully",
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Transaction failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      const tx = await contract.closeLongPosition();
      await tx.wait();
      
      toast({
        title: "Position closed successfully",
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" mt={8}>
      <VStack spacing={6} bg="gray.800" p={6} borderRadius="lg">
        {position ? (
          <>
            <Stat>
              <StatLabel>Current Position</StatLabel>
              <StatNumber>{position.ethAmount} ETH</StatNumber>
              <StatHelpText>Entry Price: ${position.entryPrice}</StatHelpText>
            </Stat>
            <Button
              colorScheme="red"
              onClick={handleUnstake}
              isLoading={loading}
              width="100%"
            >
              Close Position
            </Button>
          </>
        ) : (
          <>
            <Select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              bg="gray.700"
            >
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
            </Select>

            <Input
              placeholder="Amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              bg="gray.700"
            />

            <Button
              colorScheme="blue"
              onClick={handleStake}
              isLoading={loading}
              width="100%"
            >
              Open Long Position
            </Button>
          </>
        )}

        {!account && (
          <Text color="red.300">Please connect your wallet first</Text>
        )}
      </VStack>
    </Box>
  );
};

export default Stake;
