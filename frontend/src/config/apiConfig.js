// src/config/apiConfig.js
const API_BASE_URL = 'http://localhost:8000'; // or use env vars later

const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/api/login/`,
    LOGOUT: `${API_BASE_URL}/api/logout/`,
    // add more endpoints later
};

export default API_ENDPOINTS;
