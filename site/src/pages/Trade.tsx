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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { parseEther, MaxUint256 } from 'ethers';
import PriceSimulator from '../components/PriceSimulator';
import UserBalance from '../components/UserBalance';
import PriceChart from '../components/PriceChart';

const Trade = () => {
  const { contract, account, tokenFunctions } = useWeb3Context();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('ETH');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [supportedTokens, setSupportedTokens] = useState<string[]>([]);
  const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTx, setPendingTx] = useState<{
    type: 'buy' | 'sell';
    amount: string;
    symbol: string;
  } | null>(null);
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
      const minTokensOut = calculateMinTokensOut(amount);
      
      const tx = await contract.buyTokens(
        symbol,
        minTokensOut,
        { value: parseEther(amount) }
      );
      
      toast({
        title: "Transaction Submitted",
        description: "Please wait for confirmation",
        status: "info"
      });

      await tx.wait();
      
      toast({
        title: "Purchase successful",
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      handleTransactionError(error);
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleSell = async () => {
    if (!contract || !account || !amount) return;
    
    try {
      setLoading(true);
      const minEthOut = calculateMinTokensOut(amount);
      
      const tx = await contract.sellTokens(
        symbol,
        parseEther(amount),
        minEthOut
      );

      toast({
        title: "Transaction Submitted",
        description: "Please wait for confirmation",
        status: "info"
      });

      await tx.wait();
      
      toast({
        title: "Sale successful",
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      handleTransactionError(error);
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
          <Heading size="md" mb={4}>What It Is</Heading>
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
          <Select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            bg="gray.700"
          >
            {supportedTokens.map((token) => (
              <option key={token} value={token}>{token}</option>
            ))}
          </Select>

          <Input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            bg="gray.700"
          />

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
              Buy
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
              Sell
            </Button>
          </HStack>

          <HStack width="100%">
            <Text>Slippage Tolerance: {slippage}%</Text>
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

          {needsApproval && (
            <Button
              colorScheme="yellow"
              onClick={handleApprove}
              isLoading={loading}
              width="100%"
            >
              Approve Token
            </Button>
          )}

          {!account && (
            <Alert status="warning">
              <AlertIcon />
              Please connect your wallet first
            </Alert>
          )}
        </VStack>

        <Divider />

        {/* Price Simulator */}
        <PriceSimulator contract={contract} symbol={symbol} />
      </VStack>

      <ConfirmationModal />
    </Box>
  );
};

export default Trade;