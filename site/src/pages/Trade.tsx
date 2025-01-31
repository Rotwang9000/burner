import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  useToast,
  Select,
  HStack,
  Alert,
  AlertIcon,
  Divider,
  OrderedList,
  ListItem,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Flex,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { parseEther, MaxUint256, formatEther } from 'ethers';
import PriceSimulator from '../components/PriceSimulator';
import UserBalance from '../components/UserBalance';
import PriceChart from '../components/PriceChart';

interface ReserveInfo {
  available: string;
  total: string;
}

const Trade = () => {
  const { contract, account, tokenFunctions } = useWeb3Context();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('BTC');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [supportedTokens, setSupportedTokens] = useState<string[]>([]);
  const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTx, setPendingTx] = useState<{
    type: 'buy' | 'sell';
    amount: string;
    symbol: string;
  } | null>(null);
  const [reserves, setReserves] = useState<ReserveInfo>({
    available: '0',
    total: '0'
  });
  const toast = useToast();

  useEffect(() => {
    const fetchSupportedTokens = async () => {
      if (!contract) return;
      
      try {
        const count = await contract.getSupportedSymbolsCount();
        const tokens: string[] = [];
        
        for (let i = 0; i < Number(count); i++) {
          const symbolHash = await contract.supportedSymbols(i);
          const symbolData = await contract.symbolData(symbolHash);
          if (symbolData.active) {
            tokens.push(symbolData.symbol);
          }
        }
        
        setSupportedTokens(tokens);
        if (tokens.length > 0) {
          setSymbol(tokens[0]);
        }
      } catch (error) {
        console.error("Error fetching supported tokens:", error);
      }
    };

    fetchSupportedTokens();
  }, [contract]);

  useEffect(() => {
    const checkAllowance = async () => {
      if (!account || !contract || !tokenFunctions) return;
      
      try {
        // Get contract address for approval check
        const contractAddress = await contract.getAddress();
        
        // Call allowance correctly matching ABI signature
        const allowance = await contract.allowance(
          account,
          contractAddress
        );

        // Compare with 0 using proper BigInt
        setNeedsApproval(allowance <= BigInt(0));
        
      } catch (error) {
        console.error("Error checking allowance:", error);
        setNeedsApproval(true);
      }
    };

    checkAllowance();
  }, [account, contract, tokenFunctions]);

  useEffect(() => {
    const fetchReserves = async () => {
      if (!contract || !symbol) return;
      try {
        // Fix: Use getSymbolInfo instead of getReserveInfo
        const info = await contract.getSymbolInfo(symbol);
        setReserves({
          available: formatEther(info.reserveBalance), // Update to match contract struct
          total: formatEther(info.reserveBalance)      // We only have total balance
        });
      } catch (error) {
        console.error("Error fetching reserves:", error);
      }
    };

    fetchReserves();
    const interval = setInterval(fetchReserves, 30000);
    return () => clearInterval(interval);
  }, [contract, symbol]);

  const handleApprove = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const contractAddress = await contract.getAddress();
      
      // Call approve matching ABI signature
      const tx = await contract.approve(
        contractAddress,
        MaxUint256
      );
      await tx.wait();
      
      setNeedsApproval(false);
    } catch (error) {
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMinTokensOut = (amount: string) => {
    const parsedAmount = parseEther(amount);
    const slippageFactor = 100 - slippage;
    return (parsedAmount * BigInt(Math.floor(slippageFactor))) / BigInt(100);
  };

  const handleBuy = async () => {
    if (!contract || !account || !amount) return;
    
    try {
      setLoading(true);
      setShowConfirmation(false); // Close modal before transaction

      const buyAmount = parseEther(amount);
      
      const txOptions = {
        value: buyAmount,
        gasLimit: BigInt(500000)
      };

      // Add delay between transactions
      const tx = await contract.buyTokens(
        symbol,
        0,  // minTokensOut
        txOptions
      );

      toast({
        title: "Transaction Sent",
        description: `Buying ${amount} ${symbol}...`,
        status: "info"
      });

      await tx.wait();

      // Clear form after successful transaction
      setAmount('');
      setPendingTx(null);

      toast({
        title: "Purchase Complete", 
        status: "success"
      });

    } catch (error) {
      console.error("Buy error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Please wait a few blocks between trades",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    if (!contract || !account || !amount) return;
    
    try {
      setLoading(true);
      setShowConfirmation(false); // Close modal before transaction

      // Check reserves first
      const symbolInfo = await contract.getSymbolInfo(symbol);
      const checkAmount = parseEther(amount);
      
      if (symbolInfo.reserveBalance < checkAmount) {
        throw new Error(`Insufficient liquidity. Maximum sell amount: ${formatEther(symbolInfo.reserveBalance)} ${symbol}`);
      }

      // 1. Get symbol data first
      if (!symbolInfo.active) {
        throw new Error("Symbol not active");
      }

      // 2. Check balance
      const balance = await contract.balanceOf(account);
      const sellAmount = parseEther(amount);
      if (balance < sellAmount) {
        throw new Error("Insufficient balance");
      }

      // 3. Approve if needed
      const contractAddress = await contract.getAddress();
      const allowance = await contract.allowance(account, contractAddress);
      if (allowance < sellAmount) {
        const approveTx = await contract.approve(contractAddress, MaxUint256);
        await approveTx.wait();
      }

      console.log("Selling tokens:", {
        symbol,
        amount: sellAmount.toString()
      });

      // 4. Execute sell
      const tx = await contract.sellTokens(
        symbol,
        sellAmount,
        { gasLimit: 500000 }
      );

      toast({
        title: "Transaction Sent",
        description: `Selling ${amount} ${symbol}...`,
        status: "info"
      });

      await tx.wait();

      toast({
        title: "Sale Complete",
        description: `Successfully sold ${amount} ${symbol}`,
        status: "success"
      });

      // Clear form after successful transaction
      setAmount('');
      setPendingTx(null);

    } catch (error) {
      console.error("Sell error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Please wait a few blocks between trades",
        status: "error"
      });
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleTransactionError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Transaction failed:', error);
    toast({
      title: "Transaction failed",
      description: errorMessage.includes('user rejected') ? 
        'Transaction was rejected' : 
        `Error: ${errorMessage}`,
      status: "error",
      duration: 5000,
    });
  };

  const ConfirmationModal = () => (
    <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm {pendingTx?.type === 'buy' ? 'Purchase' : 'Sale'}</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Text>Amount: {pendingTx?.amount} {pendingTx?.type === 'buy' ? 'ETH' : pendingTx?.symbol}</Text>
            <Text>Slippage Tolerance: {slippage}%</Text>
            <Text>Minimum Received: {calculateMinTokensOut(pendingTx?.amount || '0').toString()}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button 
            colorScheme="blue" 
            onClick={pendingTx?.type === 'buy' ? handleBuy : handleSell}
            isLoading={loading}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <Box maxW="800px" mx="auto" mt={8}>
      <VStack spacing={8}>
        {/* Instructions Panel */}
        <Box w="100%" bg="blue.900" p={6} borderRadius="lg">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">What It Is</Heading>
            <Text 
              as="a" 
              href="https://elastic.lol" 
              target="_blank" 
              rel="noopener noreferrer"
              color="blue.400"
              fontSize="sm"
            >
              elastic.lol →
            </Text>
          </Flex>
          <Text fontSize="sm">
            This interface demonstrates a rebase-based token system. 
            The token supply rebases automatically, meaning token balances 
            adjust to maintain a target price.
          </Text>

          <Heading size="md" mt={4} mb={2}>How It Works</Heading>
          <Text fontSize="sm">
            The contract uses Chainlink oracles for price data. 
            When a rebase occurs, every holder’s balance scales proportionally.
          </Text>

          <Heading size="md" mb={4}>How to Trade</Heading>
          <OrderedList spacing={3}>
            <ListItem>Connect your wallet using the button in the top right</ListItem>
            <ListItem>Select the token you want to trade from the dropdown</ListItem>
            <ListItem>Enter the amount you want to buy or sell</ListItem>
            <ListItem>If this is your first time, you'll need to approve the token</ListItem>
            <ListItem>Click Buy to purchase tokens with ETH, or Sell to convert back to ETH</ListItem>
          </OrderedList>
          
          <Alert status="info" mt={4}>
            <AlertIcon />
            Trading incurs a small fee used for rebase rewards
          </Alert>
        </Box>

        <UserBalance symbol={symbol} />
        
        <PriceChart contract={contract} symbol={symbol} />

        <Divider />

        {/* Trading Panel */}
        <VStack spacing={6} bg="gray.800" p={6} borderRadius="lg" w="100%">
          <Box width="100%">
            <Text mb={2} fontSize="sm" color="gray.400">Select Trading Pair</Text>
            <Select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              bg="gray.700"
              placeholder={`Select token to trade against ETH`}
            >
              {supportedTokens.map((token) => (
                <option key={token} value={token}>{token}/ETH</option>
              ))}
            </Select>
          </Box>

          <Box width="100%">
            <Text mb={2} fontSize="sm" color="gray.400">
              {pendingTx?.type === 'sell' ? 'Amount to Sell' : 'ETH Amount to Spend'}
            </Text>
            <Input
              placeholder={`Enter amount in ${pendingTx?.type === 'sell' ? symbol : 'ETH'}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              bg="gray.700"
            />
            {amount && (
              <Text fontSize="xs" color="gray.400" mt={1}>
                {pendingTx?.type === 'sell' 
                  ? `Selling ${amount} ${symbol} for ETH`
                  : `Buying ${symbol} with ${amount} ETH`
                }
              </Text>
            )}
          </Box>

          <Box width="100%">
            <Text mb={2} fontSize="sm" color="gray.400">Slippage Protection</Text>
            <HStack width="100%">
              <Text fontSize="sm">Tolerance: {slippage}%</Text>
              <Slider
                value={slippage}
                onChange={setSlippage}
                min={0.1}
                max={5}
                step={0.1}
                width="200px"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </HStack>
          </Box>

          <HStack spacing={4} width="100%">
            <Button
              colorScheme="green"
              onClick={() => {
                setPendingTx({ type: 'buy', amount, symbol });
                setShowConfirmation(true);
              }}
              isLoading={loading}
              width="50%"
              isDisabled={!account || !amount || needsApproval}
            >
              Buy {symbol}
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                setPendingTx({ type: 'sell', amount, symbol });
                setShowConfirmation(true);
              }}
              isLoading={loading}
              width="50%"
              isDisabled={!account || !amount}
            >
              Sell {symbol}
            </Button>
          </HStack>

          {needsApproval && (
            <Box width="100%">
              <Text mb={2} fontSize="sm" color="gray.400">First Time Setup Required</Text>
              <Button
                colorScheme="yellow"
                onClick={handleApprove}
                isLoading={loading}
                width="100%"
              >
                Approve {symbol} for Trading
              </Button>
            </Box>
          )}

          {!account && (
            <Alert status="warning">
              <AlertIcon />
              Please connect your wallet to start trading
            </Alert>
          )}

          {reserves.available !== '0' && (
            <Alert status="info">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">Trading Pool Information</Text>
                <Text fontSize="sm">Available Liquidity: {reserves.available} ETH</Text>
                <Text fontSize="xs" color="gray.300">
                  Trading {symbol}/ETH pair
                </Text>
              </VStack>
            </Alert>
          )}
        </VStack>

        <Divider />

        {/* System Description */}
        <Box w="100%" bg="gray.700" p={6} borderRadius="lg">
          <Heading size="md" mb={4}>About EGROW Token System</Heading>
          <VStack align="stretch" spacing={4}>
            <Text fontSize="sm">
              EGROW (Elastic Growth Token) is a multi-asset elastic supply token system that creates 
              synthetic versions of various assets. Each supported token creates a virtual trading 
              pair against ETH using Chainlink price feeds.
            </Text>

            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>How it works:</Text>
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm">• You buy EGROW tokens with ETH for your chosen asset pair</Text>
                <Text fontSize="sm">• The token supply adjusts automatically based on price movements</Text>
                <Text fontSize="sm">• Each trading pair has its own dedicated liquidity pool</Text>
                <Text fontSize="sm">• Prices are sourced from Chainlink's decentralized oracles</Text>
                <Text fontSize="sm">• You can close your position any time by selling back to ETH</Text>
              </VStack>
            </Box>

            <Alert status="info" variant="subtle">
              <AlertIcon />
              <VStack align="start">
                <Text fontSize="sm" fontWeight="bold">Why ETH pairs?</Text>
                <Text fontSize="sm">
                  ETH is used as the base currency because it's the native token for transactions. 
                  This makes it easier to handle deposits, withdrawals, and maintain separate 
                  liquidity pools for each tracked asset.
                </Text>
              </VStack>
            </Alert>
          </VStack>
        </Box>

        {/* Price Simulator */}
        <PriceSimulator contract={contract} symbol={symbol} />
      </VStack>

      <ConfirmationModal />
    </Box>
  );
};

export default Trade;