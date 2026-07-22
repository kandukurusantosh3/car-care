import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import MobileFrame from './components/MobileFrame';
import Dashboard from './components/Dashboard';
import Explore from './components/Explore';
import Tracking from './components/Tracking';
import Auth from './components/Auth';

// A wrapper component to render the desktop navigation header and main content wrapper
function Layout({ children }) {
  const location = useLocation();

  return (
    <MobileFrame>
      <header className="desktop-header">
        <Link to="/" className="header-brand" style={{ textDecoration: 'none' }}>
          <span>🔧</span> CarCare Pro
        </Link>
        <nav className="header-nav">
          <Link to="/" className={`header-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            🏠 Dashboard
          </Link>
          <Link to="/explore" className={`header-nav-item ${location.pathname === '/explore' ? 'active' : ''}`}>
            🔍 Explore Centers
          </Link>
          <Link to="/tracking" className={`header-nav-item ${location.pathname === '/tracking' ? 'active' : ''}`}>
            📍 Track Bookings
          </Link>
          <Link to="/auth" className={`header-nav-item ${location.pathname === '/auth' ? 'active' : ''}`}>
            👤 Profile
          </Link>
        </nav>
      </header>
      
      <div className="app-content-wrapper">
        {children}
      </div>
    </MobileFrame>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/tracking" element={<Tracking />} />
          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}