import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { globalErrorHandler } from '@/lib/defensive';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child
 * component tree and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
    
    // Call global error handler to report error to monitoring service
    globalErrorHandler(error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  refreshPage = (): void => {
    window.location.reload();
  };

  renderDefaultFallback = (): ReactNode => {
    const { error, errorInfo } = this.state;
    
    return (
      <Card className="p-6 max-w-3xl mx-auto my-8 bg-background border-destructive">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Something went wrong
            </h2>
            <div className="text-muted-foreground mb-4">
              <p>
                We encountered an error while rendering this page. Please try again or contact support if the problem persists.
              </p>
              
              {/* Show error details in development only */}
              {process.env.NODE_ENV !== "production" && error && (
                <div className="mt-4 p-4 bg-muted rounded text-sm font-mono overflow-auto">
                  <p className="font-medium">Error details:</p>
                  <p className="mt-1">{error.toString()}</p>
                  {errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Component Stack</summary>
                      <pre className="mt-2 text-xs overflow-auto">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={this.resetErrorBoundary}
                variant="outline"
                className="flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
              <Button
                onClick={this.refreshPage}
                variant="default"
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  render(): ReactNode {
    const { children, fallback } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      // You can render any custom fallback UI
      return fallback || this.renderDefaultFallback();
    }

    return children;
  }
}

export default ErrorBoundary;