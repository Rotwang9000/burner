import React from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <VStack spacing={4} p={8} align="center">
          <Text>Something went wrong</Text>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </VStack>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
