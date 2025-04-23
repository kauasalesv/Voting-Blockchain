import axios from 'axios';

// src/api.js
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000" // Fallback
});

export default api;