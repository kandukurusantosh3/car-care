import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = window.location.port === '3000'
  ? 'http://localhost:7082/api'
  : `${window.location.origin}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Vehicle form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/bookings/vehicles`, { headers: getAuthHeader() }),
        axios.get(`${API_BASE_URL}/bookings`, { headers: getAuthHeader() })
      ]);
      setVehicles(vehiclesRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!make || !model || !year || !licensePlate) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings/vehicles`, {
        make,
        model,
        year,
        license_plate: licensePlate
      }, {
        headers: getAuthHeader()
      });
      setVehicles([...vehicles, response.data.vehicle]);
      setMake('');
      setModel('');
      setYear('');
      setLicensePlate('');
      setShowAddForm(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add vehicle');
    }
  };

  const handleQuickBook = (category) => {
    navigate('/explore', { state: { category } });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Hero Welcome Banner */}
      <div style={{ padding: '10px 0' }}>
        <h2 className="title-gradient" style={{ fontSize: '32px', margin: '0 0 8px 0' }}>
          {user ? `Welcome back, ${user.name}!` : 'Professional Car Care Portal'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
          {user 
            ? 'Manage your fleet, book detailing services, and track vehicle repairs in real-time.' 
            : 'Register your vehicle, discover local service centers, and get real-time tracking.'}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid-3">
        {/* Column 1: Garage Manager */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>🚗 My Garage</h3>
            {user && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-secondary"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
              >
                {showAddForm ? 'Cancel' : '+ Add'}
              </button>
            )}
          </div>

          {showAddForm ? (
            <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                className="form-input" 
                placeholder="Make (e.g. Land Rover)" 
                value={make} 
                onChange={(e) => setMake(e.target.value)} 
                required 
              />
              <input 
                className="form-input" 
                placeholder="Model (e.g. Defender)" 
                value={model} 
                onChange={(e) => setModel(e.target.value)} 
                required 
              />
              <input 
                className="form-input" 
                placeholder="Year (e.g. 2023)" 
                type="number" 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                required 
              />
              <input 
                className="form-input" 
                placeholder="License Plate" 
                value={licensePlate} 
                onChange={(e) => setLicensePlate(e.target.value)} 
                required 
              />
              <button type="submit" className="btn-glow" style={{ padding: '10px' }}>Save Vehicle</button>
            </form>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user ? (
                vehicles.length > 0 ? (
                  vehicles.map(v => (
                    <div key={v._id || v.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{v.make} {v.model}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>Year: {v.year}</span>
                        <span style={{ color: 'var(--accent)' }}>{v.license_plate}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    No vehicles registered yet. Add one to start booking services.
                  </div>
                )
              ) : (
                <>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px 0' }}>
                    🔒 Log in to manage your private garage. Below are sample vehicles:
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: 0.6 }}>
                    <div style={{ fontWeight: '600' }}>🚗 Land Rover Defender</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Year: 2022 • Plate: LX-992-K</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: 0.6 }}>
                    <div style={{ fontWeight: '600' }}>🚙 Force Gurkha</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Year: 2023 • Plate: GA-02-X9</div>
                  </div>
                  <button onClick={() => navigate('/auth')} className="btn-glow" style={{ marginTop: 'auto' }}>Log In / Register</button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Column 2: Quick Booking Shortcuts */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
          <h3>✨ Services</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            Select a service category below to instantly search local service centers offering the best rates.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <button 
              onClick={() => handleQuickBook('Car Repair')}
              className="btn-secondary"
              style={{ 
                justifyContent: 'flex-start', 
                padding: '16px', 
                gap: '15px',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                background: 'rgba(244, 63, 94, 0.02)',
                transition: 'all 0.25s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.border = '1px solid var(--accent-tertiary)';
                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(244, 63, 94, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.border = '1px solid rgba(244, 63, 94, 0.2)';
                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.02)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '20px', textShadow: '0 0 10px rgba(244,63,94,0.5)' }}>🔧</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>Car Repairs</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Diagnostics, oil changes, engine tuning</div>
              </div>
            </button>

            <button 
              onClick={() => handleQuickBook('Car Wash')}
              className="btn-secondary"
              style={{ 
                justifyContent: 'flex-start', 
                padding: '16px', 
                gap: '15px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                background: 'rgba(59, 130, 246, 0.02)',
                transition: 'all 0.25s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.border = '1px solid var(--accent)';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.02)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '20px', textShadow: '0 0 10px rgba(59,130,246,0.5)' }}>✨</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>Express Car Wash</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Eco steam, pressure wash, vacuuming</div>
              </div>
            </button>

            <button 
              onClick={() => handleQuickBook('Car Detailing')}
              className="btn-secondary"
              style={{ 
                justifyContent: 'flex-start', 
                padding: '16px', 
                gap: '15px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                background: 'rgba(16, 185, 129, 0.02)',
                transition: 'all 0.25s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.border = '1px solid var(--accent-secondary)';
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.border = '1px solid rgba(16, 185, 129, 0.2)';
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.02)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '20px', textShadow: '0 0 10px rgba(16,185,129,0.5)' }}>💎</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>Detailing & Ceramic Coating</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deep compounding, leather treatment, 9H protection</div>
              </div>
            </button>
          </div>
        </div>

        {/* Column 3: Recent Bookings / Appointments */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
          <h3>📅 Appointment Queue</h3>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user ? (
              bookings.length > 0 ? (
                bookings.slice(0, 3).map(b => (
                  <div key={b._id || b.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{b.center_name}</div>
                      <span className={`badge ${
                        b.status === 'Completed' ? 'badge-success' : 
                        b.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                      }`} style={{ fontSize: '9px' }}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {b.vehicle.make} {b.vehicle.model} • {b.scheduled_date} at {b.scheduled_time}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '13px' }}>${b.total_price}</span>
                      <button 
                        onClick={() => navigate('/tracking', { state: { booking: b } })}
                        className="btn-secondary"
                        style={{ width: 'auto', padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                      >
                        Track Service →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No service appointments scheduled. Select a service to get started!
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                🔒 Log in to view your upcoming service bookings.
              </div>
            )}
          </div>

          <button onClick={() => navigate('/explore')} className="btn-glow" style={{ marginTop: 'auto' }}>
            Book New Service
          </button>
        </div>
      </div>
    </div>
  );
}
