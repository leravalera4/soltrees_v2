import React, { Component } from 'react';
interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };
  public static getDerivedStateFromError(_: Error): State {
    return {
      hasError: true
    };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }
  public render() {
    if (this.state.hasError) {
      return <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-4">Something went wrong</h1>
            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>;
    }
    return this.props.children;
  }
}