import { Box, Text, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, Skeleton } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { formatEther } from 'ethers';

interface UserBalanceProps {
  tokenId: number;
}

const UserBalance: React.FC<UserBalanceProps> = ({ tokenId }) => {
  const { contract, account, provider } = useWeb3Context();
  const [balance, setBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!contract || !account || !provider || !tokenId) return;
      try {
        setIsLoading(true);
        const symbolHash = await contract.supportedSymbols(tokenId - 1);
        const tokenBalance = await contract.balanceOf(symbolHash, account);
        const ethBal = await provider.getBalance(account);
        const data = await contract.symbolData(symbolHash);
        
        setBalance(formatEther(tokenBalance));
        setEthBalance(formatEther(ethBal));
        setSymbol(data.symbol);
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [contract, account, provider, tokenId]);

  if (!account) return null;

  return (
    <Box w="100%" bg="blue.900" p={6} borderRadius="lg">
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
              {Number(balance).toFixed(4)} {symbol}
            </Skeleton>
          </StatNumber>
          <StatHelpText>
            Elastic {symbol} Tokens
          </StatHelpText>
        </Stat>
      </StatGroup>
    </Box>
  );
};

export default UserBalance;
