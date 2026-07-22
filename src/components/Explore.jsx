import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = window.location.port === '3000'
  ? 'http://localhost:7082/api'
  : `${window.location.origin}/api`;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [centers, setCenters] = useState([]);
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking process states
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [pickupOption, setPickupOption] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // New Vehicle form states
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleError, setVehicleError] = useState('');

  const categories = ['All', 'Car Repair', 'Car Wash', 'Car Detailing', 'Denting & Painting'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchCenters();
    fetchServices();
    if (token) {
      fetchVehicles();
    }
  }, []);

  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
    }
  }, [location.state]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/centers`);
      // Ensure it's imported
      setCenters(response.data);
    } catch (err) {
      setError('Could not load service centers. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/centers/services`);
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/vehicles`, {
        headers: getAuthHeader()
      });
      setVehicles(response.data);
      if (response.data.length > 0) {
        setSelectedVehicle(response.data[0]._id || response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      }
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setVehicleError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings/vehicles`, {
        make,
        model,
        year,
        license_plate: licensePlate
      }, {
        headers: getAuthHeader()
      });
      
      const newVehicle = response.data.vehicle;
      setVehicles([...vehicles, newVehicle]);
      setSelectedVehicle(newVehicle._id || newVehicle.id);
      setShowAddVehicle(false);
      
      // Reset form
      setMake('');
      setModel('');
      setYear('');
      setLicensePlate('');
    } catch (err) {
      setVehicleError(err.response?.data?.error || 'Failed to add vehicle.');
    }
  };

  const handleServiceToggle = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedVehicle) {
      setError('Please add or select a vehicle first.');
      return;
    }
    if (selectedServices.length === 0) {
      setError('Please select at least one service.');
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      setError('Please pick a date and time.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const payload = {
        center_id: selectedCenter._id || selectedCenter.id,
        vehicle_id: selectedVehicle,
        service_ids: selectedServices,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        pickup_option: pickupOption
      };

      await axios.post(`${API_BASE_URL}/bookings`, payload, {
        headers: getAuthHeader()
      });

      setBookingSuccess(true);
      setTimeout(() => {
        // Reset states
        setSelectedCenter(null);
        setSelectedServices([]);
        setScheduledDate('');
        setScheduledTime('');
        setPickupOption(false);
        setBookingSuccess(false);
        // Redirect to tracking tab
        navigate('/tracking');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Filter centers based on active category tab
  const filteredCenters = activeCategory === 'All' 
    ? centers 
    : centers.filter(center => 
        center.services?.some(s => s.toLowerCase().includes(activeCategory.toLowerCase()))
      );

  // Filter services that belong to selected center categories
  const filteredServices = selectedCenter 
    ? services.filter(srv => 
        selectedCenter.services?.some(cat => srv.category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(srv.category.toLowerCase()))
      )
    : [];

  const calculateTotal = () => {
    let total = 0;
    selectedServices.forEach(srvId => {
      const srv = services.find(s => (s._id || s.id) === srvId);
      if (srv) total += srv.price;
    });
    if (pickupOption) total += 15.00;
    return total.toFixed(2);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading service centers...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 className="title-gradient" style={{ fontSize: '32px', margin: '0 0 4px 0' }}>Explore Service Centers</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Find premium car care workshops and book diagnostics, washing, and detailing services.</p>
      </div>

      {bookingSuccess ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ color: 'var(--success)', margin: '0 0 10px 0', fontSize: '28px' }}>Booking Confirmed!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '400px' }}>
            Your appointment has been successfully booked. Redirecting to your live tracker...
          </p>
        </div>
      ) : (
        <div className="layout-sidebar-main">
          {/* SIDEBAR: Controls / Summary */}
          <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
            {!selectedCenter ? (
              // Navigation / Filter mode
              <div>
                <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Categories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{cat === 'All' ? '🌐 All Categories' : cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Checkout / Booking mode
              <div>
                <button 
                  className="btn-secondary" 
                  onClick={() => { setSelectedCenter(null); setSelectedServices([]); }} 
                  style={{ marginBottom: '20px', padding: '8px 12px', fontSize: '13px' }}
                >
                  ← Change Center
                </button>

                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Booking Details</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  Selected: <strong style={{ color: 'var(--text-main)' }}>{selectedCenter.name}</strong>
                </div>

                {!isLoggedIn ? (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Log in to configure vehicles and book appointments.</p>
                    <button className="btn-glow" onClick={() => navigate('/auth')}>Log In / Register</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Vehicle select */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Vehicle
                      </label>
                      {!showAddVehicle ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {vehicles.length > 0 ? (
                            <select 
                              className="form-input" 
                              value={selectedVehicle} 
                              onChange={(e) => setSelectedVehicle(e.target.value)}
                            >
                              {vehicles.map(v => (
                                <option key={v._id || v.id} value={v._id || v.id}>
                                  🚗 {v.make} {v.model} ({v.license_plate})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>No vehicles registered.</p>
                          )}
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={() => setShowAddVehicle(true)}
                            style={{ padding: '6px', fontSize: '12px' }}
                          >
                            + Add Vehicle
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {vehicleError && <p style={{ color: 'var(--danger)', fontSize: '11px', margin: 0 }}>{vehicleError}</p>}
                          <input type="text" className="form-input" placeholder="Make" value={make} onChange={e => setMake(e.target.value)} required style={{ padding: '8px' }} />
                          <input type="text" className="form-input" placeholder="Model" value={model} onChange={e => setModel(e.target.value)} required style={{ padding: '8px' }} />
                          <input type="number" className="form-input" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} required style={{ padding: '8px' }} />
                          <input type="text" className="form-input" placeholder="License Plate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required style={{ padding: '8px' }} />
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button type="submit" className="btn-glow" style={{ padding: '6px', fontSize: '12px' }}>Save</button>
                            <button type="button" className="btn-secondary" onClick={() => setShowAddVehicle(false)} style={{ padding: '6px', fontSize: '12px' }}>Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Schedule */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Schedule
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input type="date" className="form-input" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} required />
                        <input type="time" className="form-input" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} required />
                      </div>
                    </div>

                    {/* Valet */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>Valet Pickup</div>
                        <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Flat +$15.00 charge</small>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={pickupOption} 
                        onChange={(e) => setPickupOption(e.target.checked)} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Total Summary */}
                    <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', padding: '14px', borderRadius: '8px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                        <span>Selected Services:</span>
                        <span>{selectedServices.length}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600' }}>Total Price:</span>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent)' }}>${calculateTotal()}</span>
                      </div>
                    </div>

                    {error && <p style={{ color: 'var(--danger)', fontSize: '12px', margin: 0 }}>⚠️ {error}</p>}

                    <button 
                      className="btn-glow" 
                      onClick={handleBookAppointment}
                      disabled={bookingLoading || selectedServices.length === 0}
                      style={{ padding: '12px' }}
                    >
                      {bookingLoading ? 'Processing Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MAIN COLUMN: Centers Grid or Center Detail Services */}
          <div style={{ flex: 1 }}>
            {!selectedCenter ? (
              // Show centers grid
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                  {filteredCenters.map(center => (
                    <div key={center._id || center.id} className="glass-card glass-card-hover" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                      {center.image && (
                        <img 
                          src={center.image} 
                          alt={center.name} 
                          style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                        />
                      )}
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{center.name}</h3>
                          <span className="rating-badge" style={{ whiteSpace: 'nowrap' }}>★ {center.rating?.toFixed(1) || '5.0'}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px 0' }}>📍 {center.address}</p>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                          {center.services?.map(s => (
                            <span key={s} className="badge badge-info" style={{ fontSize: '10px' }}>{s}</span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>⏱ {center.operating_hours || '08:00 AM - 06:00 PM'}</span>
                          <button 
                            className="btn-glow" 
                            onClick={() => setSelectedCenter(center)}
                            style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                          >
                            Book Services
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredCenters.length === 0 && !loading && (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    No service centers found matching this filter category.
                  </div>
                )}
              </div>
            ) : (
              // Show details and service list selection
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px' }}>
                  {selectedCenter.image && (
                    <img 
                      src={selectedCenter.image} 
                      alt={selectedCenter.name} 
                      style={{ width: '220px', height: '140px', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h2 style={{ margin: 0 }}>{selectedCenter.name}</h2>
                      <span className="rating-badge" style={{ fontSize: '13px' }}>★ {selectedCenter.rating?.toFixed(1)} ({selectedCenter.reviews_count} reviews)</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 8px 0' }}>📍 {selectedCenter.address}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 8px 0' }}>📞 Phone: {selectedCenter.phone}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>⏱ Hours: {selectedCenter.operating_hours}</p>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Select Services</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {filteredServices.map(srv => {
                      const srvId = srv._id || srv.id;
                      const isChecked = selectedServices.includes(srvId);
                      
                      let accentColor = 'var(--accent)';
                      let accentBgColor = 'rgba(59, 130, 246, 0.04)';
                      let accentGlowColor = 'rgba(59, 130, 246, 0.1)';
                      
                      if (srv.category === 'Car Repair') {
                        accentColor = 'var(--accent-tertiary)'; // Red
                        accentBgColor = 'rgba(244, 63, 94, 0.04)';
                        accentGlowColor = 'rgba(244, 63, 94, 0.15)';
                      } else if (srv.category === 'Car Detailing' || srv.category === 'Denting & Painting') {
                        accentColor = 'var(--accent-secondary)'; // Green
                        accentBgColor = 'rgba(16, 185, 129, 0.04)';
                        accentGlowColor = 'rgba(16, 185, 129, 0.15)';
                      }
                      
                      return (
                        <div 
                          key={srvId} 
                          onClick={() => handleServiceToggle(srvId)}
                          className="glass-card glass-card-hover"
                          style={{ 
                            padding: '20px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            border: `1px solid ${isChecked ? accentColor : 'var(--border-color)'}`,
                            background: isChecked ? accentBgColor : 'var(--bg-card)',
                            boxShadow: isChecked ? `0 0 15px ${accentGlowColor}` : 'none',
                            cursor: 'pointer',
                            minHeight: '140px',
                            margin: 0
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div style={{ fontWeight: '750', fontSize: '15px', color: 'var(--text-main)' }}>{srv.name}</div>
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => {}} // handled by click
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '32px' }}>
                            {srv.description}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted-dark)' }}>⏱ {srv.estimated_time || '2 hours'}</span>
                            <span style={{ fontWeight: '800', color: 'var(--accent)', fontSize: '16px' }}>${srv.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
