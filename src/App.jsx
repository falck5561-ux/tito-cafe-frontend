// Archivo: src/App.jsx (Versión Final y Completa)

import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import AuthContext from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ThemeToggleButton from './components/ThemeToggleButton';

// Importación de las páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';
import ClientePage from './pages/ClientePage';
import ProtectedRoute from './components/ProtectedRoute';
import CanjearPage from './pages/CanjearPage'; // <-- 1. IMPORTA LA NUEVA PÁGINA

// Componente para el Navbar (lo dejamos aquí como lo tenías)
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
            {/* Links específicos por rol */}
            {user?.rol === 'Jefe' && <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>}
            {user?.rol === 'Empleado' || user?.rol === 'Jefe' ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/pos">Punto de Venta</Link></li>
                {/* --- 2. AÑADE EL NUEVO LINK AQUÍ --- */}
                <li className="nav-item"><Link className="nav-link" to="/canjear">Canjear Cupón</Link></li>
              </>
            ) : null}
            {user?.rol === 'Cliente' && <li className="nav-item"><Link className="nav-link" to="/cliente">Mi Pedido</Link></li>}
            
            {/* Botón de Login/Logout */}
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
          <ThemeToggleButton />
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mt-4">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- 3. RUTAS PROTEGIDAS CORREGIDAS Y CON LA NUEVA RUTA --- */}
          <Route path="/admin" element={<ProtectedRoute roles={['Jefe']}><AdminPage /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute roles={['Empleado', 'Jefe']}><PosPage /></ProtectedRoute>} />
          <Route path="/cliente" element={<ProtectedRoute roles={['Cliente']}><ClientePage /></ProtectedRoute>} />
          <Route path="/canjear" element={<ProtectedRoute roles={['Empleado', 'Jefe']}><CanjearPage /></ProtectedRoute>} />
          
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;