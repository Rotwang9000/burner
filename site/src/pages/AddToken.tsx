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
import { isAddress, Contract } from 'ethers';

const AddToken = () => {
  const { contract, account, provider } = useWeb3Context();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    priceFeed: '',
  });
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add validation for local development
  const validatePriceFeed = async (address: string) => {
    try {
      const MockPriceFeed = new Contract(
        address,
        [
          "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)",
          "function description() view returns (string)"
        ],
        provider
      );
      
      const [, price] = await MockPriceFeed.latestRoundData();
      const symbol = await MockPriceFeed.description();
      
      if (!price) throw new Error("Invalid price feed");
      if (!symbol) throw new Error("Invalid symbol");
      
      return true;
    } catch (error) {
      toast({
        title: "Invalid Price Feed",
        description: "Please use a valid price feed address",
        status: "error"
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !account || !provider) return;

    try {
      setLoading(true);

      // Basic validation
      if (!isAddress(formData.priceFeed)) {
        throw new Error("Invalid price feed address");
      }

      if (!(await validatePriceFeed(formData.priceFeed))) {
        return;
      }

      // Call updated contract function
      const tx = await contract.addSymbol(
        formData.priceFeed,
        { gasLimit: 400000 }
      );

      toast({
        title: "Transaction Sent",
        description: "Adding token...", 
        status: "info"
      });

      await tx.wait();

      toast({
        title: "Success",
        description: "Token added successfully",
        status: "success"
      });

      setFormData({ priceFeed: '' });

    } catch (error) {
      console.error("Add token error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error"
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
