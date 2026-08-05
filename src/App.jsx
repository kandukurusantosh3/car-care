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
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch(e) {}

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
          {user?.role !== 'mechanic' && (
            <Link to="/explore" className={`header-nav-item ${location.pathname === '/explore' ? 'active' : ''}`}>
              🔍 Explore Centers
            </Link>
          )}
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

      <nav className="mobile-bottom-nav">
        <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <span style={{ fontSize: '20px', marginBottom: '4px' }}>🏠</span>
          Dashboard
        </Link>
        {user?.role !== 'mechanic' && (
          <Link to="/explore" className={`bottom-nav-item ${location.pathname === '/explore' ? 'active' : ''}`}>
            <span style={{ fontSize: '20px', marginBottom: '4px' }}>🔍</span>
            Explore
          </Link>
        )}
        <Link to="/tracking" className={`bottom-nav-item ${location.pathname === '/tracking' ? 'active' : ''}`}>
          <span style={{ fontSize: '20px', marginBottom: '4px' }}>📍</span>
          Track
        </Link>
        <Link to="/auth" className={`bottom-nav-item ${location.pathname === '/auth' ? 'active' : ''}`}>
          <span style={{ fontSize: '20px', marginBottom: '4px' }}>👤</span>
          Profile
        </Link>
      </nav>
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