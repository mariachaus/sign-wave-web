import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Щось пішло не так</h2>
          <p>Спробуйте оновити сторінку.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Спробувати знову
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
