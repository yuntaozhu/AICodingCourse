import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css';
import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
