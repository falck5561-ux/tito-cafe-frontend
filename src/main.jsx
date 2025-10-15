import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CartProvider } from './context/CartContext.jsx'; // 1. IMPORTAR EL CARTPROVIDER
import axios from 'axios';

// Establecemos la URL base para todas las peticiones
axios.defaults.baseURL = 'https://tito-cafe-backend.onrender.com';

// Configuramos Axios para que envíe el token en cada petición
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <CartProvider> {/* 2. ENVOLVER LA APP CON EL CARRITO */}
          <App />
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);