import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://automated-attendance-system-backend.vercel.app/api', // Set your backend URL here
  withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
