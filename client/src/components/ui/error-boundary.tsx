import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
    
    // Here you would typically send to a logging service
    // logErrorToService(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md border-destructive/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An error occurred in this part of the application.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="text-sm text-muted-foreground mb-3">
                <p className="font-medium text-foreground">Error details:</p>
                <div className="mt-1 p-2 bg-muted/50 rounded-md overflow-auto max-h-[200px]">
                  <p className="font-mono text-xs">{this.state.error?.toString()}</p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button onClick={this.handleReset} variant="outline" className="mr-2">
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;