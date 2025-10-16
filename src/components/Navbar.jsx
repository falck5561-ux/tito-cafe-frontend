import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-dark fixed-top"> {/* Quitamos navbar-expand-lg para que el toggler siempre sea visible en móvil */}
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span>Tito Café</span>
        </Link>

        {/* --- Botón Toggler para el Offcanvas --- */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* --- Menú Lateral (Offcanvas) --- */}
        <div
          className="offcanvas offcanvas-end" // Le quitamos text-bg-dark para controlarlo por CSS
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menú</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            {/* Lista de enlaces principal */}
            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
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
            </ul>
            
            {/* --- MODIFICACIÓN: Contenedor para los botones al final --- */}
            <div className="offcanvas-footer mt-auto">
              <ThemeToggleButton />
              {user ? (
                <button onClick={logout} className="btn btn-outline-secondary">
                  Cerrar Sesión
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;