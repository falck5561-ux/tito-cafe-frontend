// Archivo: src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Este componente recibe como "hijo" a la página que queremos proteger
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Si no hay un usuario logueado, redirige a la página de login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Si hay un usuario, muestra la página protegida
  return children;
};

export default ProtectedRoute;