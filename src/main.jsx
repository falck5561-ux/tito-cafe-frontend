import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeProvider.jsx';
import { CartProvider } from './context/CartContext.jsx'; 
import axios from 'axios';

// Establecemos la URL base para todas las peticiones
axios.defaults.baseURL = 'https://tito-cafe-backend.onrender.com';

// **LÍNEA AÑADIDA PARA SOLUCIONAR CORS/AUTH EN PETICIONES GET**
// Esto asegura que Axios incluya las credenciales (cookies/autorización)
// en las peticiones entre dominios, lo cual es vital en Render.
axios.defaults.withCredentials = true;

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
        <CartProvider>
          <App />
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
