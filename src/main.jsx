import React from 'react';
import ReactDOM from 'react-dom/client';
import AppCore from './components/AppCore.jsx';
import './tailwind.css';

// Mount the root React component into the #root DOM node
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppCore />
  </React.StrictMode>
);

// No explicit export; this is the application
