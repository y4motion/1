import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService(error, errorInfo) {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    
    fetch(`${backendUrl}/api/log/error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(console.error);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#0a0a0a'
        }}>
          <div className="glass-strong" style={{
            maxWidth: '600px',
            padding: '3rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💥</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something went wrong</h1>
            <p style={{ opacity: 0.8, marginBottom: '2rem', lineHeight: 1.6 }}>
              We're sorry for the inconvenience. The error has been logged and we'll look into it.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                textAlign: 'left',
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px',
                margin: '2rem 0',
                cursor: 'pointer'
              }}>
                <summary style={{ fontWeight: '600', marginBottom: '1rem' }}>
                  Error Details (Dev Only)
                </summary>
                <pre style={{ 
                  fontSize: '0.75rem', 
                  overflow: 'auto', 
                  whiteSpace: 'pre-wrap',
                  color: '#ff6b6b'
                }}>
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre style={{ 
                    fontSize: '0.75rem', 
                    overflow: 'auto', 
                    whiteSpace: 'pre-wrap',
                    marginTop: '1rem',
                    color: '#ffa94d'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  background: '#a855f7',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#9333ea';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#a855f7';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Try Again
              </button>
              
              <a
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
