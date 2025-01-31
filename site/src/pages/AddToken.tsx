import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  useToast,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { isAddress } from 'ethers';

const AddToken = () => {
  const { contract, account } = useWeb3Context();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    priceFeed: '',
  });
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !account) return;

    if (!isAddress(formData.priceFeed)) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid oracle address",
        status: "error",
        duration: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.addSymbol(
        formData.symbol,
        formData.priceFeed
      );
      await tx.wait();

      toast({
        title: "Token Added Successfully",
        status: "success",
        duration: 5000,
      });
      
      // Reset form
      setFormData({
        symbol: '',
        priceFeed: '',
      });
    } catch (error) {
      toast({
        title: "Failed to add token",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
		<Box maxW="600px" mx="auto" mt={8}>
			<VStack
				as="form"
				onSubmit={handleSubmit}
				spacing={6}
				bg="gray.800"
				p={6}
				borderRadius="lg">
				<FormControl isRequired>
					<FormLabel>Token Symbol</FormLabel>
					<Input
						name="symbol"
						value={formData.symbol}
						onChange={handleChange}
						placeholder="BTC"
						bg="gray.700"
					/>
					<FormHelperText>
						Short identifier for the token (e.g. BTC, ETH)
					</FormHelperText>
				</FormControl>

				<FormControl isRequired>
					<FormLabel>Price Feed Address</FormLabel>
					<Input
						name="priceFeed"
						value={formData.priceFeed}
						onChange={handleChange}
						placeholder="0x..."
						bg="gray.700"
					/>
					<FormHelperText>
						Chainlink{" "}
						<a
							href="https://docs.chain.link/data-feeds/price-feeds/addresses?network=arbitrum"
							rel="noreferrer"
							target="_blank">
							{" "}
							price feed contract address
						</a>
					</FormHelperText>
				</FormControl>

				<Button
					type="submit"
					colorScheme="blue"
					isLoading={loading}
					width="100%"
					isDisabled={!account}>
					Add Token
				</Button>

				{!account && (
					<Text color="red.300">Please connect your wallet first</Text>
				)}
			</VStack>
		</Box>
	);
};

export default AddToken;
