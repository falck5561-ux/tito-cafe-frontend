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

        {/* --- Botón Hamburguesa (solo visible en móvil) --- */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navContent" 
          aria-controls="navContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* --- Contenido Colapsable (menú) --- */}
        <div className="collapse navbar-collapse" id="navContent">
          {/* ms-auto empuja los enlaces a la derecha en PC */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Inicio</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/combos">Combos</NavLink>
            </li>
            
            {user?.rol === 'Cliente' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/hacer-un-pedido">Mi Pedido</NavLink>
              </li>
            )}

            {(user?.rol === 'Empleado' || user?.rol === 'Jefe') && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/pos">Punto de Venta</NavLink>
              </li>
            )}
            
            {user?.rol === 'Jefe' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">Admin</NavLink>
              </li>
            )}

            {/* Separador visual que solo aparece en el menú desplegado de móvil */}
            <li className="d-lg-none my-2"><hr className="dropdown-divider" /></li>

            {/* Botones de Tema y Sesión */}
            <li className="nav-item d-flex align-items-center mt-2 mt-lg-0 ms-lg-3">
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
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
