/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Entry point for rendering the React app.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }
    return this.props.children;
  }
}

if (import.meta.env.MODE === 'development') {
  console.log('Running in development mode');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
