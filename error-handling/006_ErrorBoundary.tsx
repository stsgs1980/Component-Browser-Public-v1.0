'use client';

import { memo } from 'react';
import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

export interface ErrorBoundaryTheme {
  background: string;
  text: string;
  subtext: string;
  iconColor: string;
  buttonBg: string;
  buttonText: string;
}

export const DARK_THEME: ErrorBoundaryTheme = {
  background: '#1e1e2e',
  text: '#cdd6f4',
  subtext: '#6c7086',
  iconColor: '#f38ba8',
  buttonBg: '#313244',
  buttonText: '#cdd6f4',
};

export const LIGHT_THEME: ErrorBoundaryTheme = {
  background: '#ffffff',
  text: '#1e293b',
  subtext: '#64748b',
  iconColor: '#ef4444',
  buttonBg: '#f1f5f9',
  buttonText: '#1e293b',
};

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  theme?: ErrorBoundaryTheme;
  title?: string;
  retryLabel?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ─── Component ────────────────────────────────────────────────────────

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const theme = this.props.theme || DARK_THEME;
      const Icon = this.props.icon || AlertCircle;

      return (
        <div className="flex flex-col items-center justify-center h-full p-8" style={{ backgroundColor: theme.background }}>
          <Icon className="w-16 h-16 mb-4" style={{ color: theme.iconColor }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>
            {this.props.title || 'Something went wrong'}
          </h2>
          <p className="text-sm mb-4 text-center max-w-md" style={{ color: theme.subtext }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded transition-colors"
            style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
          >
            <RefreshCw className="w-4 h-4" />
            {this.props.retryLabel || 'Try again'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
