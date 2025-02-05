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
import { useState, useEffect, useCallback } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { parseEther, MaxUint256, formatEther, formatUnits } from 'ethers';
import PriceSimulator from '../components/PriceSimulator';
import UserBalance from '../components/UserBalance';
import PriceChart from '../components/PriceChart';
import { TokenMetadata } from '../types/token';

interface ReserveInfo {
  available: string;
  total: string;
}

const Trade = () => {
  const { contract, account, tokenFunctions } = useWeb3Context();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [supportedTokens, setSupportedTokens] = useState<TokenMetadata[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number>(0);
  const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTx, setPendingTx] = useState<{
    type: 'buy' | 'sell';
    amount: string;
    tokenId: number;
  } | null>(null);
  const [reserves, setReserves] = useState<ReserveInfo>({
    available: '0',
    total: '0'
  });
  const toast = useToast();

  const getCurrentTokenSymbol = useCallback(() => {
    const token = supportedTokens.find(t => t.id === selectedTokenId);
    return token?.symbol || '';
  }, [selectedTokenId, supportedTokens]);

  const currentSymbol = getCurrentTokenSymbol();

  useEffect(() => {
    const fetchSupportedTokens = async () => {
      if (!contract) return;
      
      try {
        const count = await contract.getSupportedSymbolsCount();
        const tokens: TokenMetadata[] = [];
        
        for (let i = 0; i < Number(count); i++) {
          const symbolHash = await contract.supportedSymbols(i);
          const data = await contract.symbolData(symbolHash);
          if (!data.active) continue;
          
          tokens.push({
            id: Number(data.id),  // Convert to number immediately
            symbol: data.symbol,
            isActive: data.active,
            lastPrice: formatUnits(data.lastPrice, 8),
            reserveBalance: formatEther(data.reserveBalance)
          });
        }
        
        setSupportedTokens(tokens);
        if (tokens.length > 0) {
          setSelectedTokenId(Number(tokens[0].id));
        }
      } catch (error) {
        console.error("Error fetching supported tokens:", error);
      }
    };

    fetchSupportedTokens();
  }, [contract]);

  useEffect(() => {
    const checkAllowance = async () => {
      if (!account || !contract || !selectedTokenId) return;
      
      try {
        const contractAddress = await contract.getAddress();
        const symbolHash = await contract.supportedSymbols(selectedTokenId - 1);
        const allowance = await contract.allowance(symbolHash, account, contractAddress);
        setNeedsApproval(allowance <= BigInt(0));
      } catch (error) {
        console.error("Error checking allowance:", error);
        setNeedsApproval(true);
      }
    };

    checkAllowance();
  }, [account, contract, selectedTokenId]);

  useEffect(() => {
    const fetchReserves = async () => {
      if (!contract || !selectedTokenId) return;
      try {
        const symbolHash = await contract.supportedSymbols(selectedTokenId - 1); // Adjust for 0-based index
        const data = await contract.symbolData(symbolHash);
        
        // For now, available and total are the same since we don't have locked liquidity
        const reserveBalance = formatEther(data.reserveBalance);
        setReserves({
          available: reserveBalance,
          total: reserveBalance
        });
      } catch (error) {
        console.error("Error fetching reserves:", error);
        setReserves({
          available: '0',
          total: '0'
        });
      }
    };

    fetchReserves();
    const interval = setInterval(fetchReserves, 30000);
    return () => clearInterval(interval);
  }, [contract, selectedTokenId]);

  const handleApprove = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const contractAddress = await contract.getAddress();
      const symbolHash = await contract.supportedSymbols(selectedTokenId - 1);
      
      // Call approve with symbolHash
      const tx = await contract.approve(
        symbolHash,
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

  const calculateMinTokensOut = (amount: string, selectedToken: TokenMetadata) => {
    // Convert buy amount to token amount using price ratio
    const buyAmountWei = parseEther(amount);
    const tokenPrice = Number(selectedToken.lastPrice);
    const expectedTokens = Number(buyAmountWei) / tokenPrice;
    const minTokens = expectedTokens * (1 - slippage/100);
    return BigInt(Math.floor(minTokens));
  };

  const handleBuy = async () => {
    if (!contract || !account || !amount) return;
    
    try {
      setLoading(true);
      setShowConfirmation(false);

      const buyAmount = parseEther(amount);
      // Fix comparison by using number type directly
      const token = supportedTokens.find(t => t.id === selectedTokenId);
      if (!token) throw new Error("Token not found");
      
      const minTokensOut = calculateMinTokensOut(amount, token);
      
      const tx = await contract.buyTokensByIndex(
        selectedTokenId,
        minTokensOut,
        {
          value: buyAmount,
          gasLimit: 500000n
        }
      );

      toast({
        title: "Transaction Sent",
        description: `Buying e${currentSymbol} with ${amount} ETH...`,
        status: "info"
      });

      await tx.wait();
      
      // Fix: Get fresh symbol data for reserves
      const symbolHash = await contract.supportedSymbols(selectedTokenId - 1);
      const data = await contract.symbolData(symbolHash);
      setReserves({
        available: formatEther(data.reserveBalance),
        total: formatEther(data.reserveBalance)
      });

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
        description: error instanceof Error ? error.message : "Transaction failed. Please check gas and amount.",
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
      setShowConfirmation(false);

      // Get symbolHash first
      const symbolHash = await contract.supportedSymbols(selectedTokenId - 1);
      const balance = await contract.balanceOf(symbolHash, account);
      const sellAmount = parseEther(amount);
      
      if (balance < sellAmount) {
        throw new Error(`Insufficient balance. You have ${formatEther(balance)} e${currentSymbol}`);
      }

      const tx = await contract.sellTokensByIndex(
        selectedTokenId,
        sellAmount,
        { gasLimit: 500000 }
      );

      toast({
        title: "Transaction Sent",
        description: `Selling ${amount} e${currentSymbol}...`,
        status: "info"
      });

      await tx.wait();

      // Fix: Get fresh symbol data for reserves
      const symbolHash = await contract.supportedSymbols(selectedTokenId - 1);
      const data = await contract.symbolData(symbolHash);
      setReserves({
        available: formatEther(data.reserveBalance),
        total: formatEther(data.reserveBalance)
      });

      setAmount('');
      setPendingTx(null);

      toast({
        title: "Sale Complete",
        status: "success"
      });

    } catch (error) {
      console.error("Sell error:", error);
      // Enhance error reporting
      const errorMessage = error instanceof Error ? 
        error.message : 
        "Transaction failed. Symbol: " + currentSymbol;
      
      toast({
        title: "Error",
        description: errorMessage,
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
            <Text>
              {pendingTx?.type === 'buy' 
                ? `Buy e${currentSymbol} tokens with ${pendingTx?.amount} ETH`
                : `Sell ${pendingTx?.amount} e${currentSymbol} tokens for ETH`}
            </Text>
            <Text fontSize="sm" color="gray.500">
              These tokens track the price of {currentSymbol}
            </Text>
            <Text>Slippage Tolerance: {slippage}%</Text>
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
							fontSize="sm">
							elastic.lol →
						</Text>
					</Flex>
					<Text fontSize="sm">
						This interface demonstrates a rebase-based token system. The token
						supply rebases automatically, meaning token balances adjust to
						maintain a target price.
					</Text>

					<Heading size="md" mt={4} mb={2}>
						How It Works
					</Heading>
					<Text fontSize="sm">
						The contract uses Chainlink oracles for price data. When a rebase
						occurs, every holder’s balance scales proportionally.
					</Text>

					<Heading size="md" mb={4}>
						How to Trade
					</Heading>
					<OrderedList spacing={3}>
						<ListItem>
							Connect your wallet using the button in the top right
						</ListItem>
						<ListItem>
							Select the token you want to trade from the dropdown
						</ListItem>
						<ListItem>Enter the amount you want to buy or sell</ListItem>
						<ListItem>
							If this is your first time, you'll need to approve the token
						</ListItem>
						<ListItem>
							Click Buy to purchase tokens with ETH, or Sell to convert back to
							ETH
						</ListItem>
					</OrderedList>

					<Alert status="info" mt={4}>
						<AlertIcon />
						Trading incurs a small fee used for rebase rewards
					</Alert>
				</Box>

				<UserBalance tokenId={selectedTokenId} />

				<PriceChart contract={contract} tokenId={selectedTokenId} />

				<Divider />

				{/* Trading Panel */}
				<VStack spacing={6} bg="gray.800" p={6} borderRadius="lg" w="100%">
					<Box width="100%">
						<Text mb={2} fontSize="sm" color="gray.400">
							Select Price Feed to Track
						</Text>
						<Select
							value={selectedTokenId}
							onChange={(e) => setSelectedTokenId(Number(e.target.value))}
							bg="gray.700"
							placeholder="Select token to track">
							{supportedTokens.map((token) => (
								<option key={token.id} value={token.id}>
									e{token.symbol} (Tracks {token.symbol} Price)
								</option>
							))}
						</Select>
					</Box>

					<Box width="100%">
						<Text mb={2} fontSize="sm" color="gray.400">
							{pendingTx?.type === "sell"
								? "Amount of e" + currentSymbol + " to Sell"
								: "ETH Amount to Spend"}
						</Text>
						<Input
							placeholder={`Enter amount in ${
								pendingTx?.type === "sell" ? "e" + currentSymbol : "ETH"
							}`}
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							type="number"
							bg="gray.700"
						/>
						{amount && (
							<Text fontSize="xs" color="gray.400" mt={1}>
								{pendingTx?.type === "sell"
									? `Selling ${amount} e${currentSymbol} for ETH`
									: `Buying e${currentSymbol} tokens with ${amount} ETH`}
							</Text>
						)}
					</Box>

					<Box width="100%">
						<Text mb={2} fontSize="sm" color="gray.400">
							Slippage Protection
						</Text>
						<HStack width="100%">
							<Text fontSize="sm">Tolerance: {slippage}%</Text>
							<Slider
								value={slippage}
								onChange={setSlippage}
								min={0.1}
								max={5}
								step={0.1}
								width="200px">
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
								setPendingTx({ type: "buy", amount, tokenId: selectedTokenId });
								setShowConfirmation(true);
							}}
							isLoading={loading}
							width="50%"
							isDisabled={!account || !amount || needsApproval}>
							Buy e{currentSymbol}
						</Button>
						<Button
							colorScheme="red"
							onClick={() => {
								setPendingTx({
									type: "sell",
									amount,
									tokenId: selectedTokenId,
								});
								setShowConfirmation(true);
							}}
							isLoading={loading}
							width="50%"
							isDisabled={!account || !amount}>
							Sell e{currentSymbol}
						</Button>
					</HStack>

					{needsApproval && (
						<Box width="100%">
							<Text mb={2} fontSize="sm" color="gray.400">
								First Time Setup Required
							</Text>
							<Button
								colorScheme="yellow"
								onClick={handleApprove}
								isLoading={loading}
								width="100%">
								Approve e{currentSymbol} for Trading
							</Button>
						</Box>
					)}

					{!account && (
						<Alert status="warning">
							<AlertIcon />
							Please connect your wallet to start trading
						</Alert>
					)}

					{reserves.available !== "0" && (
						<Alert status="info">
							<AlertIcon />
							<VStack align="start" spacing={1}>
								<Text fontWeight="bold">
									e{currentSymbol} Trading Pool Information
								</Text>
								<Text fontSize="sm">
									Available Liquidity: {reserves.available} ETH
								</Text>
								<Text fontSize="sm">Total Pool Size: {reserves.total} ETH</Text>
								<Text fontSize="xs" color="gray.300">
									Trading e{currentSymbol} tokens that track {currentSymbol}{" "}
									price
								</Text>
							</VStack>
						</Alert>
					)}
				</VStack>

				<Divider />

				{/* System Description */}
				<Box w="100%" bg="gray.700" p={6} borderRadius="lg">
					<Heading size="md" mb={4}>
						About EGROW Token System
					</Heading>
					<VStack align="stretch" spacing={4}>
						<Text fontSize="sm">
							EGROW (Elastic Growth Token) is a multi-asset elastic supply token
							system that creates synthetic versions of various assets. Each
							supported token creates a virtual trading pair against ETH using
							Chainlink price feeds.
						</Text>

						<Box>
							<Text fontSize="sm" fontWeight="bold" mb={2}>
								How it works:
							</Text>
							<VStack align="stretch" spacing={2}>
								<Text fontSize="sm">
									• You buy EGROW tokens with ETH for your chosen asset pair
								</Text>
								<Text fontSize="sm">
									• The token supply adjusts automatically based on price
									movements
								</Text>
								<Text fontSize="sm">
									• Each trading pair has its own dedicated liquidity pool
								</Text>
								<Text fontSize="sm">
									• Prices are sourced from Chainlink's decentralized oracles
								</Text>
								<Text fontSize="sm">
									• You can close your position any time by selling back to ETH
								</Text>
							</VStack>
						</Box>

						<Alert status="info" variant="subtle">
							<AlertIcon />
							<VStack align="start">
								<Text fontSize="sm" fontWeight="bold">
									Why ETH pairs?
								</Text>
								<Text fontSize="sm">
									ETH is used as the base currency because it's the native token
									for transactions. This makes it easier to handle deposits,
									withdrawals, and maintain separate liquidity pools for each
									tracked asset.
								</Text>
							</VStack>
						</Alert>
					</VStack>
				</Box>

				{/* Price Simulator */}
				<PriceSimulator contract={contract} symbol={currentSymbol} />
			</VStack>

			<ConfirmationModal />

			<Alert status="info" mt={4}>
				<AlertIcon />
				<VStack align="start">
					<Text fontWeight="bold">Trading Guide</Text>
					<Text>• Buy tokens to go long - profit when price goes up</Text>
					<Text>• Sell tokens without owning them to go short - profit when price goes down</Text>
					<Text>Example: Sell eBTC now to profit from future BTC price decreases</Text>
				</VStack>
			</Alert>
		</Box>
	);
};

export default Trade;