import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = window.location.port === '3000'
  ? 'http://localhost:7082/api'
  : `${window.location.origin}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Tracking() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update states (for mechanics/admins)
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [mechanicNotes, setMechanicNotes] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const statuses = [
    "Confirmed", 
    "Picked Up", 
    "In Garage", 
    "Work in Progress", 
    "Ready for Delivery", 
    "Completed", 
    "Cancelled"
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (token) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, []);

  // Set booking from location state (redirect from Dashboard)
  useEffect(() => {
    if (location.state?.booking) {
      setSelectedBooking(location.state.booking);
      setStatusToUpdate(location.state.booking.status);
    }
  }, [location.state, bookings]);

  // Poll for tracking details if a booking is selected
  useEffect(() => {
    let interval;
    if (selectedBooking) {
      fetchTracking(selectedBooking._id || selectedBooking.id);
      
      // Auto-refresh tracking info every 5 seconds
      interval = setInterval(() => {
        fetchTracking(selectedBooking._id || selectedBooking.id);
      }, 5000);
    } else {
      setTrackingInfo(null);
    }

    return () => clearInterval(interval);
  }, [selectedBooking]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        headers: getAuthHeader()
      });
      setBookings(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
      } else {
        setError('Could not fetch bookings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async (bookingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/${bookingId}`, {
        headers: getAuthHeader()
      });
      setTrackingInfo(response.data);
    } catch (err) {
      console.error('Error fetching tracking info:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusToUpdate) return;
    
    setUpdateLoading(true);
    try {
      const bookingId = selectedBooking._id || selectedBooking.id;
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        status: statusToUpdate,
        notes: mechanicNotes
      }, {
        headers: getAuthHeader()
      });

      // Refresh data
      await fetchBookings();
      await fetchTracking(bookingId);
      setMechanicNotes('');
      alert(`Status updated to: ${response.data.status}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 className="title-gradient">Track Services</h2>
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
          <h3>🔒 Login Required</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Please log in to track active vehicle services.</p>
          <a href="/auth" className="btn-glow" style={{ textDecoration: 'none', display: 'inline-block', boxSizing: 'border-box', textAlign: 'center', width: 'auto' }}>
            Go to Login / Profile
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading bookings...</p>
      </div>
    );
  }

  const isMechanic = user?.role === 'mechanic' || user?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 className="title-gradient" style={{ fontSize: '32px', margin: '0 0 4px 0' }}>Service Tracker</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          {isMechanic ? '📋 Booking Queue (Mechanic View)' : '🔍 Track the real-time status of your active bookings.'}
        </p>
      </div>

      <div className="layout-sidebar-main">
        {/* Left Sidebar: Bookings List */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {bookings.length > 0 ? (
              bookings.map(bk => {
                const bkId = bk._id || bk.id;
                const isSelected = selectedBooking && (selectedBooking._id || selectedBooking.id) === bkId;
                return (
                  <div 
                    key={bkId}
                    onClick={() => { setSelectedBooking(bk); setStatusToUpdate(bk.status); }}
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}`,
                      padding: '14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {bk.center_name}
                      </div>
                      <span className={`badge ${bk.status === 'Completed' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '8px' }}>
                        {bk.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted-dark)' }}>
                      🚗 {bk.vehicle?.make} {bk.vehicle?.model}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted-dark)', marginTop: '4px' }}>
                      📅 {bk.scheduled_date} at {bk.scheduled_time}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No bookings found in the queue.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Selected Booking Tracking Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedBooking ? (
            (() => {
              const statusIndex = statuses.indexOf(trackingInfo?.status || selectedBooking.status);
              return (
                <>
                  {/* Status header & progress bar */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted-dark)' }}>ID: {selectedBooking._id || selectedBooking.id}</span>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '20px' }}>{selectedBooking.center_name}</h3>
                      </div>
                      <span className="badge badge-info" style={{ fontSize: '12px', padding: '6px 16px' }}>
                        {trackingInfo?.status || selectedBooking.status}
                      </span>
                    </div>

                    {/* Progress timeline dots */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', height: '2px', background: 'rgba(255,255,255,0.06)', top: '20px', left: '30px', right: '30px', zIndex: 1 }} />
                      <div style={{ position: 'absolute', height: '2px', background: 'var(--accent)', top: '20px', left: '30px', width: `${Math.min(statusIndex * 20, 100)}%`, zIndex: 2, transition: 'width 0.4s ease' }} />
                      
                      {statuses.slice(0, 6).map((st, idx) => {
                        const isActive = idx <= statusIndex;
                        return (
                          <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }} title={st}>
                            <div style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: isActive ? 'var(--accent)' : '#1e293b',
                              border: '4px solid #0a0d14',
                              boxShadow: isActive ? '0 0 10px var(--accent)' : 'none',
                              transition: 'all 0.3s'
                            }} />
                            <span style={{ fontSize: '10px', color: isActive ? 'var(--text-main)' : 'var(--text-muted-dark)', marginTop: '8px', fontWeight: isActive ? '600' : 'normal' }}>
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid-2">
                    {/* Column 1: Details & Valet */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Valet location Updates */}
                      {trackingInfo?.driver_location && (
                        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                          <h4 style={{ margin: '0 0 12px 0' }}>📍 Valet Location Updates</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                            <div><strong>Driver Status:</strong> <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{trackingInfo.driver_location.status}</span></div>
                            <div><strong>Name:</strong> {trackingInfo.driver_name}</div>
                            <div><strong>Phone:</strong> {trackingInfo.driver_phone}</div>
                            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                              Coordinates: {trackingInfo.driver_location.lat.toFixed(5)}, {trackingInfo.driver_location.lng.toFixed(5)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Booking Summary */}
                      <div className="glass-card">
                        <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Service Details</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                          <div><strong>Vehicle:</strong> {selectedBooking.vehicle?.make} {selectedBooking.vehicle?.model} ({selectedBooking.vehicle?.license_plate})</div>
                          <div><strong>Scheduled Date & Time:</strong> {selectedBooking.scheduled_date} at {selectedBooking.scheduled_time}</div>
                          <div><strong>Pickup Service:</strong> {selectedBooking.pickup_option ? 'Yes (Driver collects car)' : 'No (Self drop-off)'}</div>
                          <div>
                            <strong>Requested Services:</strong>
                            <ul style={{ margin: '6px 0 0 18px', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {selectedBooking.services?.map(s => (
                                <li key={s.id || s.name}>{s.name} • <span style={{ color: 'var(--accent)', fontWeight: '600' }}>${s.price}</span></li>
                              ))}
                            </ul>
                          </div>
                          {selectedBooking.mechanic_notes && (
                            <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: '8px', color: 'var(--warning)' }}>
                              <strong>Workshop Notes:</strong> {selectedBooking.mechanic_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Timeline & Mechanic updates */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Timeline log */}
                      <div className="glass-card">
                        <h4 style={{ margin: '0 0 12px 0' }}>Timeline Log</h4>
                        <div className="timeline-list">
                          {(trackingInfo?.timeline || selectedBooking.timeline || []).slice().reverse().map((evt, idx) => (
                            <div key={idx} className="timeline-item active">
                              <div className="timeline-marker" />
                              <div className="timeline-time">{evt.timestamp}</div>
                              <div className="timeline-title">{evt.status}</div>
                              <div className="timeline-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{evt.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Update Panel */}
                      {isMechanic && (
                        <div className="glass-card" style={{ border: '1px solid rgba(192, 132, 252, 0.4)', background: 'rgba(192, 132, 252, 0.03)' }}>
                          <h4 style={{ margin: '0 0 12px 0', color: 'var(--accent-secondary)' }}>🛠 Mechanic Status Panel</h4>
                          <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label>Update Status</label>
                              <select 
                                className="form-input" 
                                value={statusToUpdate} 
                                onChange={(e) => setStatusToUpdate(e.target.value)}
                                required
                              >
                                <option value="">-- Choose Status --</option>
                                {statuses.map(st => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label>Add Service Notes</label>
                              <textarea 
                                className="form-input" 
                                style={{ height: '80px', resize: 'none' }}
                                placeholder="E.g., Oil changed. Tire thread inspection completed." 
                                value={mechanicNotes}
                                onChange={(e) => setMechanicNotes(e.target.value)}
                              />
                            </div>

                            <button 
                              type="submit" 
                              className="btn-glow" 
                              style={{ background: 'linear-gradient(135deg, var(--accent-secondary), #a855f7)', boxShadow: '0 4px 14px 0 var(--accent-secondary-glow)' }}
                              disabled={updateLoading}
                            >
                              {updateLoading ? 'Updating...' : 'Publish Update'}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📍</div>
              <h3>Select a Service Booking</h3>
              <p>Choose an appointment from the queue sidebar to view real-time location metrics and workshop timeline updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
