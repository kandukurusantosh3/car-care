// src/config.js - Shared configuration for API base url

export const API_BASE_URL = window.Capacitor 
  ? 'https://car-care-4jpk.onrender.com/api'
  : (window.location.port === '3000' ? '/api' : 'https://car-care-4jpk.onrender.com/api');
