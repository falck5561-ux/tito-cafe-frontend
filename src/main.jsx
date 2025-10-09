// Archivo: src/main.jsx (Versión Final y Completa)

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import axios from 'axios'; // <-- 1. IMPORTAMOS AXIOS

// --- 2. ESTABLECEMOS LA URL BASE PARA TODAS LAS PETICIONES ---
// Esto solucionará los errores 404 en Render.
axios.defaults.baseURL = 'https://tito-cafe-backend.onrender.com';

// --- 3. CONFIGURAMOS AXIOS PARA QUE ENVÍE EL TOKEN EN CADA PETICIÓN ---
// Esto simplificará tu código en otras partes de la app.
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
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);