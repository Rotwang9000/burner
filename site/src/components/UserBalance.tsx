import { Box, Stat, StatLabel, StatNumber, StatGroup, Skeleton } from '@chakra-ui/react';
import { useWeb3Context } from '../context/Web3Context';
import { useState, useEffect } from 'react';
import { formatEther } from 'ethers';

const UserBalance = ({ symbol }: { symbol: string }) => {
  const { contract, account, provider } = useWeb3Context();
  const [balance, setBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!contract || !account || !provider) return;
      try {
        setIsLoading(true);
        const tokenBalance = await contract.balanceOf(account);
        const ethBal = await provider.getBalance(account);
        
        setBalance(formatEther(tokenBalance));
        setEthBalance(formatEther(ethBal));
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [contract, account, symbol]);

  if (!account) return null;

  return (
    <Box bg="gray.700" p={4} borderRadius="lg" w="100%">
      <StatGroup>
        <Stat>
          <StatLabel>Your ETH Balance</StatLabel>
          <StatNumber>
            <Skeleton isLoaded={!isLoading}>
              {Number(ethBalance).toFixed(4)} ETH
            </Skeleton>
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Your Token Balance</StatLabel>
          <StatNumber>
            <Skeleton isLoaded={!isLoading}>
              {Number(balance).toFixed(4)} EGROW
            </Skeleton>
          </StatNumber>
        </Stat>
      </StatGroup>
    </Box>
  );
};

export default UserBalance;
