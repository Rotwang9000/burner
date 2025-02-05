import { useState, useEffect } from 'react';
import {
  VStack, HStack, Text, Input, Button, useToast,
  NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper,
  Stat, StatLabel, StatNumber, StatHelpText,
  Table, Thead, Tbody, Tr, Th, Td,
  Select, Box, Heading, Alert, AlertIcon, OrderedList, ListItem
} from '@chakra-ui/react';
import { useWeb3Context } from '../context/Web3Context';
import { parseEther, formatEther, formatUnits } from 'ethers';

const Stake = () => {
  const { contract, account } = useWeb3Context();
  const [supportedTokens, setSupportedTokens] = useState<string[]>([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<{
    tokenSymbol: string;
    ethAmount: string;
    entryPrice: string;
    leverage: number;
    liquidationPrice: string;
    pnl: string;
  } | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchSupportedTokens = async () => {
      if (!contract) return;
      try {
        // Get supported symbols directly from contract
        const tokens: string[] = [];
        let i = 0;
        try {
          while (true) {
            const symbolHash = await contract.supportedSymbols(i);
            const symbolData = await contract.symbolData(symbolHash);
            if (symbolData.active) {
              tokens.push(symbolData.symbol);
            }
            i++;
          }
        } catch (e) {
          // Stop when we reach the end of the array
        }
        
        setSupportedTokens(tokens);
        if (tokens.length > 0) setSelectedToken(tokens[0]);
      } catch (error) {
        console.error("Error fetching supported tokens:", error);
        toast({
          title: "Error fetching tokens",
          description: "Could not load supported tokens",
          status: "error",
          duration: 5000,
        });
      }
    };

    fetchSupportedTokens();
  }, [contract]);

  useEffect(() => {
    const fetchPosition = async () => {
      if (!contract || !account || !selectedToken) return;
      try {
        const positionInfo = await contract.getPositionInfo(account);
        
        if (positionInfo && positionInfo.ethAmount > 0n) {
          setPosition({
            tokenSymbol: positionInfo.symbol_,  // Note the underscore here
            ethAmount: formatEther(positionInfo.ethAmount),
            entryPrice: formatUnits(positionInfo.entryPrice, 8),
            leverage: 1, // Contract doesn't support leverage yet
            liquidationPrice: '0', // Not implemented yet
            pnl: formatEther(positionInfo.currentPnL)  // Use the PnL from contract
          });
        }
      } catch (error) {
        if (!(error instanceof Error && error.message.includes("No position"))) {
          console.error("Error fetching position:", error);
        }
        setPosition(null);
      }
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 30000);
    return () => clearInterval(interval);
  }, [contract, account, selectedToken]);

  const handleStake = async () => {
    if (!contract || !account || !selectedToken || !amount) return;
    
    try {
      setLoading(true);
      // Get token ID from selected token symbol
      const tokenId = await contract.idBySymbol(selectedToken);
      
      // Use index-based function instead of string-based
      const tx = await contract.openLongPositionByIndex(
        tokenId,
        { 
          value: parseEther(amount),
          gasLimit: BigInt(500000)
        }
      );
      
      await tx.wait();
      
      toast({
        title: "Position opened successfully",
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("Staking error:", error);
      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch" maxW="800px" mx="auto" mt={8}>
      {/* Instructions Panel */}
      <Box w="100%" bg="blue.900" p={6} borderRadius="lg">
        <Heading size="md" mb={4}>Staking Positions</Heading>
        <Text fontSize="sm" mb={4}>
          Open long positions against token prices using ETH as collateral. 
          Earn profits when token prices increase relative to ETH.
        </Text>

        <Heading size="sm" mb={2}>Key Features:</Heading>
        <VStack align="stretch" spacing={2} mb={4}>
          <Text fontSize="sm">• No liquidation risk on basic positions</Text>
          <Text fontSize="sm">• Real-time price feed from Chainlink oracles</Text>
          <Text fontSize="sm">• Automatic PnL calculation</Text>
          <Text fontSize="sm">• Close position any time</Text>
        </VStack>

        <Heading size="sm" mb={2}>How to Start:</Heading>
        <OrderedList spacing={2} mb={4}>
          <ListItem>Select the token you want to stake against</ListItem>
          <ListItem>Enter the amount of ETH you want to stake (minimum 0.01 ETH)</ListItem>
          <ListItem>Click "Open Position" to start earning</ListItem>
          <ListItem>Monitor your position's performance</ListItem>
          <ListItem>Close position any time to collect profits</ListItem>
        </OrderedList>

        <Alert status="info" mt={4}>
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontSize="sm">
              Minimum stake requirement: 0.01 ETH
            </Text>
            <Text fontSize="xs" color="gray.300">
              The minimum stake requirement helps:
              • Ensure meaningful position sizes
              • Prevent network spam
              • Cover gas costs effectively
              • Maintain healthy liquidity pools
            </Text>
          </VStack>
        </Alert>
      </Box>

      {/* Existing staking interface */}
      <Box bg="gray.800" p={6} borderRadius="lg" w="100%">
        <VStack spacing={4} align="stretch">
            <Box>
            <VStack spacing={4} align="stretch">
              <Box>
              <Text mb={2} fontSize="sm" color="gray.400">Select Token to Stake Against</Text>
              <Select 
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                placeholder="Choose a token"
                bg="gray.700"
              >
                {supportedTokens.map(token => (
                <option key={token} value={token}>{token} /ETH</option>
                ))}
              </Select>
              </Box>
              
              <Box>
              <Text mb={2} fontSize="sm" color="gray.400">Position Size (ETH)</Text>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Min 0.01 ETH"
                bg="gray.700"
                width="100%"
              />
              </Box>
            </VStack>
            </Box>

          {/* Existing position display */}
          {position && (
            <Box>
              <Text mb={2} fontSize="sm" color="gray.400">Current Position</Text>
              <Table variant="simple">
                <Tbody>
                  <Tr>
                    <Td>Position Size</Td>
                    <Td isNumeric>{position.ethAmount} ETH</Td>
                  </Tr>
                  <Tr>
                    <Td>Entry Price</Td>
                    <Td isNumeric>${position.entryPrice}</Td>
                  </Tr>
                  <Tr>
                    <Td>Leverage</Td>
                    <Td isNumeric>{position.leverage}x</Td>
                  </Tr>
                  <Tr>
                    <Td>Liquidation Price</Td>
                    <Td isNumeric>${position.liquidationPrice}</Td>
                  </Tr>
                  <Tr>
                    <Td>PnL</Td>
                    <Td isNumeric color={Number(position.pnl) >= 0 ? "green.500" : "red.500"}>
                      {position.pnl} ETH
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          )}

          <Button
            colorScheme="blue"
            onClick={handleStake}
            isLoading={loading}
            isDisabled={!amount || !selectedToken || Number(amount) < 0.01}
          >
            Open Position
          </Button>

          {!account && (
            <Alert status="warning">
              <AlertIcon />
              Please connect your wallet to start staking
            </Alert>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default Stake;
