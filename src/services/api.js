import axios from 'axios';

// Creamos una instancia de Axios con la URL base de tu backend
const apiClient = axios.create({
  baseURL: 'https://tito-cafe-backend.onrender.com/api'
});

// Este interceptor añade el token a TODAS las peticiones que salgan
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;