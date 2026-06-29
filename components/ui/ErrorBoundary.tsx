'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    if (typeof console !== 'undefined') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '48px',
            fontWeight: '300',
            color: 'var(--ink-muted)',
            marginBottom: '12px',
          }}>☠</div>
          <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Segment Failed</h2>
          <p style={{
            fontSize: '11px',
            color: 'var(--ink-muted)',
            fontFamily: 'var(--font-mono), monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px',
          }}>
            {this.state.error?.message || 'A component failed to render.'}
          </p>
          <button
            onClick={this.handleReset}
            className="btn-rust"
            style={{ padding: '8px 24px', cursor: 'pointer' }}
          >
            RETRY SEGMENT
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
