import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser.user);
        // --- CAMBIO: Volvemos a usar 'x-auth-token' como lo espera tu backend ---
        axios.defaults.headers.common['x-auth-token'] = token;
      } catch (error) {
        console.error("Token inválido:", error);
        logout();
      }
    } else {
      setUser(null);
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('https://tito-cafe-backend.onrender.com/api/usuarios/login', {
        email,
        password,
      });
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      const decodedUser = jwtDecode(newToken);
      return decodedUser.user;
    } catch (error) {
      console.error('Error en el login:', error.response?.data?.msg || 'Error de conexión');
      logout();
      return null;
    }
  };
  
  const register = async (nombre, email, password) => {
    try {
      const res = await axios.post('https://tito-cafe-backend.onrender.com/api/usuarios/register', {
        nombre,
        email,
        password,
      });
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      return true;
    } catch (error) {
      console.error('Error en el registro:', error.response?.data?.msg || 'Error de conexión');
      logout();
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;