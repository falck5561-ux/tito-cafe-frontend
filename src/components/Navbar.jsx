import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar fixed-top navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span>Tito Café</span>
        </Link>

        {/* Botón que abre el menú lateral */}
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

        {/* Contenido del Menú de Escritorio (Oculto en móvil) */}
        <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
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
                 {user?.rol === 'Jefe' && (
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/admin">Admin</NavLink>
                    </li>
                )}
                <li className="nav-item d-flex align-items-center ms-lg-3">
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

        {/* El Contenido del Menú Lateral (Offcanvas para móvil) */}
        <div
          className="offcanvas offcanvas-end"
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

          <div className="offcanvas-body d-flex flex-column">
            <ul className="navbar-nav flex-grow-1">
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
              {user?.rol === 'Jefe' && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin">Admin</NavLink>
                </li>
              )}
            </ul>
            
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