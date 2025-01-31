import { Box, Spinner, VStack } from '@chakra-ui/react';
import LogoIcon from '../assets/logo';

const Loading = () => (
  <VStack spacing={4} justify="center" align="center" minH="200px">
    <Box animation="pulse 2s infinite">
      <LogoIcon size={64} />
    </Box>
    <Spinner size="xl" color="blue.500" />
  </VStack>
);

export default Loading;
