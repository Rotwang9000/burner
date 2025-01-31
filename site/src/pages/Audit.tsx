import {
  Box,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Divider,
} from '@chakra-ui/react';

export const Audit = () => {
  const securityFeatures = [
    {
      category: 'Access Control',
      features: [
        { name: 'Owner Controls', severity: 'PASS', details: 'Limited privileged functions with ownership transfer capability' },
        { name: 'Operator System', severity: 'PASS', details: 'Multi-operator support with maximum limit of 5 operators' },
        { name: 'Role Management', severity: 'PASS', details: 'Clear separation between owner and operator privileges' },
      ]
    },
    {
      category: 'Price Protection',
      features: [
        { name: 'Price Feed Validation', severity: 'PASS', details: 'Chainlink oracle integration with freshness checks' },
        { name: 'Price Impact Limits', severity: 'PASS', details: 'Maximum 10% price impact per trade' },
        { name: 'Price Update Delay', severity: 'PASS', details: 'Minimum 15 second delay between price updates' },
      ]
    },
    {
      category: 'Attack Prevention',
      features: [
        { name: 'Reentrancy Guard', severity: 'PASS', details: 'All state-changing functions protected against reentrancy' },
        { name: 'Flash Loan Protection', severity: 'PASS', details: 'Minimum blocks between trades requirement' },
        { name: 'Front-running Protection', severity: 'INFO', details: 'Basic slippage controls implemented' },
      ]
    },
    {
      category: 'Emergency Controls',
      features: [
        { name: 'Circuit Breaker', severity: 'PASS', details: 'Pause functionality for emergency situations' },
        { name: 'Emergency Withdrawal', severity: 'PASS', details: 'Protected withdrawal mechanism with time delay' },
        { name: 'Symbol Deactivation', severity: 'PASS', details: 'Ability to disable compromised price feeds' },
      ]
    },
    {
      category: 'Economic Design',
      features: [
        { name: 'Supply Controls', severity: 'PASS', details: 'Min/max supply limits with controlled mint/burn' },
        { name: 'Reserve Ratio', severity: 'PASS', details: 'Maximum 5% of reserves per trade' },
        { name: 'Tax Management', severity: 'INFO', details: 'Separate tracking of collected taxes' },
      ]
    }
  ];

  const knownLimitations = [
    'Price feed manipulation risk if Chainlink oracle is compromised',
    'Potential temporary price impact during large trades',
    'Block time dependency for trade frequency limits',
    'Gas costs may be higher during high network congestion',
    'Market dynamics could affect rebase effectiveness'
  ];

  return (
    <Box maxW="1200px" mx="auto" py={8} px={4}>
      <VStack spacing={8} align="stretch">
        {/* System Description */}
        <Box bg="blue.900" p={6} borderRadius="lg">
          <Heading size="md" mb={4}>About The Elastic Token System</Heading>
          <Text mb={4}>
            This is an experimental elastic supply token system that automatically adjusts its supply based on price feeds from Chainlink oracles. The goal is to maintain price stability while providing trading opportunities through automated supply adjustments.
          </Text>
          
          <Heading size="sm" mb={2}>Key Features:</Heading>
          <VStack align="stretch" spacing={2} mb={4}>
            <Text>• Automatic supply rebasing based on price movements</Text>
            <Text>• Multi-token support with individual price feeds</Text>
            <Text>• Decentralized price data from Chainlink oracles</Text>
            <Text>• Protected trading mechanisms with slippage control</Text>
            <Text>• Emergency safeguards and circuit breakers</Text>
          </VStack>

          <Heading size="sm" mb={2}>How It Works:</Heading>
          <Text mb={4}>
            When prices move up or down, the contract automatically adjusts token supply through mint/burn operations. This creates an elastic supply that responds to market conditions. All operations are secured by multiple layers of protection including reentrancy guards, flash loan prevention, and careful access controls.
          </Text>

          <Alert status="info" variant="subtle">
            <AlertIcon />
            <Box>
              <AlertTitle>Target Users</AlertTitle>
              <AlertDescription>
                This system is designed for traders and holders who want exposure to price movements while maintaining some degree of stability through supply adjustments. It's particularly suitable for creating synthetic versions of volatile assets.
              </AlertDescription>
            </Box>
          </Alert>
        </Box>

        {/* Disclaimer Alert */}
        <Alert
          status="warning"
          variant="solid"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          p={6}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            IMPORTANT DISCLAIMER
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            This audit report is for informational purposes only. Using this contract involves significant risks including potential loss of all funds. By using this contract, you acknowledge that you understand and accept all risks. Always conduct your own research.
          </AlertDescription>
        </Alert>

        <Heading size="lg">Security Audit Report</Heading>
        
        <Text>
          Last Updated: {new Date().toLocaleDateString()}
        </Text>

        <Divider />

        {/* Security Features */}
        <Heading size="md">Security Analysis</Heading>
        
        <Accordion allowMultiple>
          {securityFeatures.map((category, idx) => (
            <AccordionItem key={idx}>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">{category.category}</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Feature</Th>
                      <Th>Status</Th>
                      <Th>Details</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {category.features.map((feature, fidx) => (
                      <Tr key={fidx}>
                        <Td>{feature.name}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              feature.severity === 'PASS' ? 'green' :
                              feature.severity === 'INFO' ? 'blue' : 'yellow'
                            }
                          >
                            {feature.severity}
                          </Badge>
                        </Td>
                        <Td>{feature.details}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <Divider />

        {/* Known Limitations */}
        <Heading size="md">Known Limitations</Heading>
        <Box bg="gray.700" p={4} borderRadius="md">
          <VStack align="stretch" spacing={2}>
            {knownLimitations.map((limitation, idx) => (
              <Text key={idx}>• {limitation}</Text>
            ))}
          </VStack>
        </Box>

        {/* Additional Security Information */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Security Best Practices</AlertTitle>
            <AlertDescription>
              The contract implements industry standard security patterns including:
              <Box mt={2}>
                • Reentrancy guards on all state-modifying functions<br/>
                • Checks-Effects-Interactions pattern<br/>
                • Secure math operations<br/>
                • Emergency pause functionality<br/>
                • Time-delayed administrative actions
              </Box>
            </AlertDescription>
          </Box>
        </Alert>

        {/* External Audit Links */}
        <Box>
          <Heading size="sm" mb={4}>External Security Resources</Heading>
          <VStack align="stretch" spacing={2}>
            <Link href="https://docs.openzeppelin.com/contracts/4.x/" isExternal color="blue.400">
              OpenZeppelin Security Patterns
            </Link>
            <Link href="https://chainlink.com/security" isExternal color="blue.400">
              Chainlink Security Practices
            </Link>
            <Link href="https://consensys.github.io/smart-contract-best-practices/" isExternal color="blue.400">
              ConsenSys Smart Contract Best Practices
            </Link>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};
