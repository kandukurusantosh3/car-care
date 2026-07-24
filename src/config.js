// src/config.js - Shared configuration for API base url

export const API_BASE_URL = window.Capacitor 
  ? 'https://eng-manchester-indicator-contributions.trycloudflare.com/api'
  : (window.location.port === '3000' ? '/api' : `${window.location.origin}/api`);
