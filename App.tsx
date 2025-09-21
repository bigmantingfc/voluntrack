

import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import NewLandingPage from './components/landing/NewLandingPage'; // New Import
import OpportunityListPage from './components/opportunities/OpportunityListPage';
import OpportunityDetailPage from './components/opportunities/OpportunityDetailPage';
import AuthPage from './components/auth/AuthPage';
import ProfilePage from './components/profile/ProfilePage';
import LogHoursPage from './components/logging/LogHoursPage';
import IndividualImpactDashboardPage from './components/dashboard/IndividualImpactDashboardPage';
import CollectiveImpactDashboardPage from './components/dashboard/CollectiveImpactDashboardPage';
import SubmitOpportunityPage from './components/opportunities/SubmitOpportunityPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { useAuth } from './components/auth/AuthContext';
import EventsPage from './components/events/EventsPage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isNewLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    if (isNewLandingPage) {
      document.body.classList.add('landing-page-body-style');
      document.body.classList.remove('default-body-style');
    } else {
      document.body.classList.remove('landing-page-body-style');
      document.body.classList.add('default-body-style');
    }
    // No explicit cleanup needed here as AppContent re-evaluates on location change
  }, [isNewLandingPage]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isNewLandingPage && <Navbar isLoginPage={isLoginPage} />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<NewLandingPage />} />
          <Route path="/opportunities" element={<OpportunityListPage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/login" element={user ? <Navigate to="/profile" /> : <AuthPage />} />
          
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/log-hours" element={<ProtectedRoute><LogHoursPage /></ProtectedRoute>} />
          <Route path="/dashboard/individual" element={<ProtectedRoute><IndividualImpactDashboardPage /></ProtectedRoute>} />
          <Route path="/submit-opportunity" element={<ProtectedRoute><SubmitOpportunityPage /></ProtectedRoute>} />

          <Route path="/dashboard/collective" element={<CollectiveImpactDashboardPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isNewLandingPage && <Footer />}
    </div>
  );
}


const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;