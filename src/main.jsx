import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CartProvider } from './context/CartContext.jsx'; // <-- Se importa CartProvider
import { InstallPwaProvider } from './context/InstallPwaContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

// Establecemos la URL base para todas las peticiones
axios.defaults.baseURL = 'https://tito-cafe-backend.onrender.com'; // (O usa import.meta.env.VITE_API_URL)

// Solución CORS/Auth
axios.defaults.withCredentials = true;

// === INICIO TAREA 2 ===
// Enviamos la etiqueta de la tienda en todas las peticiones
axios.defaults.headers.common['X-Tienda-Id'] = import.meta.env.VITE_APP_TIENDA_ID;
// === FIN TAREA 2 ===

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


const GOOGLE_CLIENT_ID = "410811838547-ltq555co1hve1m8c891u6olhf4on7nrd.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <InstallPwaProvider>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider> {/* <-- ABRIMOS CartProvider */}
              <App />
            </CartProvider> {/* <-- CERRAMOS CartProvider (Este era el error) */}
          </ThemeProvider>
        </AuthProvider>
      </InstallPwaProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);