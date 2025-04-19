/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Entry point for rendering the React app.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components";
import "../styles/index.css"; // <-- This is now correct ✅

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong in the multiverse.</h1>;
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

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
