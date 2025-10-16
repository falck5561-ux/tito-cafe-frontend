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

        {/* --- MODIFICACIÓN 1: El botón ahora apunta a un 'offcanvas' --- */}
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

        {/* --- MODIFICACIÓN 2: Usamos la estructura Offcanvas en lugar de 'collapse' --- */}
        <div
          className="offcanvas offcanvas-end text-bg-dark"
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
            {/* La lista de enlaces (ul) ahora va aquí adentro */}
            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3 align-items-center">
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

              <li className="my-3"><hr className="dropdown-divider" /></li>

              {/* Contenedor para los botones de tema y sesión */}
              <li className="nav-item d-flex align-items-center mt-2 mt-lg-0">
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
      </div>
    </nav>
  );
}

export default Navbar;