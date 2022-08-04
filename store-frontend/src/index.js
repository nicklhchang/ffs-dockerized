import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import { AlertProvider } from './app-context/alertContext';
import { DashboardProvider } from './app-context/dashboardContext';
import ComposeProviders from './app-context/context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* right most in array below is most nested; need alerts for dashboardContext */}
    <ComposeProviders providers={[AlertProvider, DashboardProvider]}>
      <App />
    </ComposeProviders>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
