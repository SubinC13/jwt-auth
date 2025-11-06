import axiosBase from 'axios';

const axios = axiosBase.create({
  baseURL: 'http://localhost:5001'
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;

