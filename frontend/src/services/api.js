import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // or your backend URL
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');  // your key name
    if (token) {
        config.headers.Authorization = `Token ${token}`; // DRF token auth format
    }
    return config;
});

export default api;
