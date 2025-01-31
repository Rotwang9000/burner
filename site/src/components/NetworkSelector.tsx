import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Image,
  Text,
  HStack
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { SUPPORTED_NETWORKS } from '../constants/networks';
import { useWeb3Context } from '../context/Web3Context';

const NetworkSelector = () => {
  const { switchNetwork, currentNetwork } = useWeb3Context();

  const currentNetworkInfo = SUPPORTED_NETWORKS[currentNetwork];

  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        borderColor="gray.600"
      >
        <HStack>
          <Image 
            src={currentNetworkInfo.logo} 
            alt={currentNetworkInfo.name} 
            boxSize="20px"
          />
          <Text>{currentNetworkInfo.name}</Text>
        </HStack>
      </MenuButton>
      <MenuList bg="gray.800" borderColor="gray.600">
        {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
          <MenuItem
            key={key}
            onClick={() => switchNetwork(key)}
            bg="gray.800"
            _hover={{ bg: 'gray.700' }}
          >
            <HStack>
              <Image 
                src={network.logo} 
                alt={network.name} 
                boxSize="20px"
              />
              <Text>{network.name}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default NetworkSelector;
