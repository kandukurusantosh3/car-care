import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login API Call
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password
        });
        
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setSuccess('Logged in successfully!');
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        // Register API Call
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          name,
          email,
          phone,
          password,
          role
        });

        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setSuccess('Registered successfully!');
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSuccess('Logged out successfully.');
    // Clear forms
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  if (user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <h2 className="title-gradient" style={{ textAlign: 'center', margin: '0 0 8px 0' }}>My Profile</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>Logged in user details</p>
          
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '20px'
              }}>
                👤
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{user.name}</h3>
                <span className="badge badge-info" style={{ marginTop: '4px' }}>{user.role}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address</small>
                <div style={{ fontSize: '15px', fontWeight: '500' }}>{user.email}</div>
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone Number</small>
                <div style={{ fontSize: '15px', fontWeight: '500' }}>{user.phone}</div>
              </div>
            </div>
          </div>

          <button className="btn-secondary" onClick={handleLogout} style={{ marginTop: '20px' }}>
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 className="title-gradient" style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {isLogin ? 'Log in to track and book services' : 'Sign up to start booking professional car care'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: isLogin ? 'var(--bg-card)' : 'transparent', 
              color: isLogin ? 'var(--accent)' : 'var(--text-muted)',
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: !isLogin ? 'var(--bg-card)' : 'transparent', 
              color: !isLogin ? 'var(--accent)' : 'var(--text-muted)',
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign Up
          </button>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ padding: '12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--danger)', borderRadius: '8px', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '12px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--success)', borderRadius: '8px', fontSize: '13px' }}>
                ✓ {success}
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+1 (555) 000-0000" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Select Role</label>
                  <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="customer">🚗 Customer</option>
                    <option value="mechanic">🔧 Mechanic</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn-glow" 
              style={{ marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
