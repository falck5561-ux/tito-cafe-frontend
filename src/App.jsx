// Archivo: src/App.jsx (Actualizado con Notificaciones y Modo Oscuro)
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import AuthContext from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; // <-- 1. IMPORTA EL TOASTER
import ThemeToggleButton from './components/ThemeToggleButton'; // <-- 2. IMPORTA EL BOTÓN DE TEMA

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';
import ClientePage from './pages/ClientePage';
import ProtectedRoute from './components/ProtectedRoute';

// Componente para el Navbar
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Tito Café</Link>
        <div className="d-flex align-items-center">
          <ul className="navbar-nav">
            {user?.rol === 'Jefe' && <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>}
            {user?.rol === 'Empleado' && <li className="nav-item"><Link className="nav-link" to="/pos">POS</Link></li>}
            {user?.rol === 'Cliente' && <li className="nav-item"><Link className="nav-link" to="/cliente">Mi Pedido</Link></li>}
            
            {user ? (
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>Cerrar Sesión ({user.rol})</button>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            )}
          </ul>
          <ThemeToggleButton /> {/* <-- 3. AÑADE EL BOTÓN DE TEMA AQUÍ */}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} /> {/* <-- 4. AÑADE EL TOASTER AQUÍ */}
      <div className="container mt-4">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas Protegidas */}
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><PosPage /></ProtectedRoute>} />
          <Route path="/cliente" element={<ProtectedRoute><ClientePage /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;