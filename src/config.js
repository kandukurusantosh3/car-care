// src/config.js - Shared configuration for API base url

const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  if (!hostname) {
    return 'http://10.80.81.110:7082/api';
  }
  
  // If the browser accesses the server via local network IP (e.g. 10.80.81.110)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:7082/api`;
  }
  
  // Fallback check if running inside Capacitor native webview or mobile device accessing local server
  const isCapacitor = !!window.Capacitor;
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isCapacitor || isMobileDevice) {
    return 'http://10.80.81.110:7082/api';
  }
  
  // Default for computer browser development
  return 'http://localhost:7082/api';
};

export const API_BASE_URL = getApiBaseUrl();
