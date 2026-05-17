import React from 'react';
import '../styles/components/ErrorBoundary.scss';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__icon">⚠</div>
          <h2 className="error-boundary__title">Щось пішло не так</h2>
          <p className="error-boundary__message">
            {this.state.error?.message || 'Невідома помилка'}
          </p>
          <button
            className="error-boundary__btn"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Спробувати знову
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
