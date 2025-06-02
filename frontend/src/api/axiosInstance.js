/**
 * axiosInstance.js - Configures Axios for API requests.
 * Sets base URL and attaches authentication token to each request.
 */

import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://dotproduct-02kn.onrender.com/api/',
});

// Attach auth token from localStorage to every request if available
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;

