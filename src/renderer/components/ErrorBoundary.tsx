import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-8">
          <h2 className="mb-2 text-lg font-semibold text-destructive">
            Something went wrong
          </h2>
          <p className="mb-4 max-w-md text-center text-sm text-muted-foreground">
            {this.state.error.message}
          </p>
          <Button onClick={this.handleRetry} variant="outline">
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
