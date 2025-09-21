
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/auth/AuthContext';
import { OpportunityProvider } from './contexts/OpportunityContext';
import { LoggedHoursProvider } from './contexts/LoggedHoursContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <OpportunityProvider>
        <LoggedHoursProvider>
          <App />
        </LoggedHoursProvider>
      </OpportunityProvider>
    </AuthProvider>
  </React.StrictMode>
);
