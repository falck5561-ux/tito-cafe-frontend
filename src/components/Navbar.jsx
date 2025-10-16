import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span>Tito Café</span>
        </Link>

        {/* Este div agrupa los enlaces de navegación y los botones de la derecha */}
        {/* Usamos 'ms-auto' para empujar todo a la derecha y 'align-items-center' para centrar verticalmente */}
        <div className="d-flex align-items-center ms-auto">
          
          {/* --- ENLACES DE NAVEGACIÓN PRINCIPALES --- */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Inicio</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/combos">Combos</NavLink>
            </li>
            
            {/* --- ENLACES CONDICIONALES POR ROL --- */}

            {/* Para Clientes: Muestra "Mi Pedido" */}
            {user?.rol === 'Cliente' && (
              <li className="nav-item">
                {/* CORRECCIÓN: Apunta a la ruta principal del cliente */}
                <NavLink className="nav-link" to="/hacer-un-pedido">Mi Pedido</NavLink>
              </li>
            )}

            {/* Para Empleados y Jefes: Muestra "Punto de Venta" */}
            {(user?.rol === 'Empleado' || user?.rol === 'Jefe') && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/pos">Punto de Venta</NavLink>
              </li>
            )}
            
            {/* Solo para Jefes: Muestra "Admin" */}
            {user?.rol === 'Jefe' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">Admin</NavLink>
              </li>
            )}
          </ul>

          {/* --- BOTONES DE TEMA Y SESIÓN --- */}
          <div className="d-flex align-items-center ms-lg-4">
            <ThemeToggleButton />
            {user ? (
              <button onClick={logout} className="btn btn-outline-secondary ms-3">
                Cerrar Sesión
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary ms-3">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;