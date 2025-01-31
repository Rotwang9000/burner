import { Box, Flex, Button, Text, useColorModeValue } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useWeb3Context } from '../context/Web3Context';

const Navbar = () => {
  const { account, connect, disconnect } = useWeb3Context();

  return (
    <Box bg={useColorModeValue('gray.800', 'gray.900')} px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="blue.400"
            as={Link}
            to="/"
          >
            Elastic Token
          </Text>
          <Flex ml={8} gap={4}>
            <Text color="white" as={Link} to="/trade">Trade</Text>
            <Text color="white" as={Link} to="/stake">Stake</Text>
            <Text color="white" as={Link} to="/add-token">Add Token</Text>
          </Flex>
        </Flex>
        <Button
          onClick={account ? disconnect : connect}
          colorScheme={account ? 'red' : 'blue'}
        >
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </Button>
      </Flex>
    </Box>
  );
};

export default Navbar;
