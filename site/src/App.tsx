import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Stake from './pages/Stake';
import AddToken from './pages/AddToken';
import { Web3Provider } from './context/Web3Context';
import theme from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import { Audit } from './pages/Audit';
import Stats from './pages/Stats';

function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <Web3Provider>
          <Router>
            <Box minH="100vh" bg="gray.900">
              <Navbar />
              <Box p={4}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/trade" element={<Trade />} />
                  <Route path="/stake" element={<Stake />} />
                  <Route path="/add-token" element={<AddToken />} />
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/stats" element={<Stats />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </Web3Provider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;
