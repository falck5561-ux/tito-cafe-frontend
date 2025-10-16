import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

// Para no repetir código, creamos un componente con los enlaces principales del menú.
const MenuLinks = () => {
  const { user } = useContext(AuthContext);
  return (
    <>
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
    </>
  );
};

// Componente para los botones de usuario (Login/Logout/Tema)
const UserControls = ({ isMobile = false }) => {
  const { user, logout } = useContext(AuthContext);
  const buttonClass = isMobile ? "" : "ms-3";

  return (
    <>
      <ThemeToggleButton />
      {user ? (
        <button onClick={logout} className={`btn btn-outline-secondary ${buttonClass}`}>
          Cerrar Sesión
        </button>
      ) : (
        <Link to="/login" className={`btn btn-primary ${buttonClass}`}>
          Login
        </Link>
      )}
    </>
  );
};


function Navbar() {
  return (
    <nav className="navbar fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span>Tito Café</span>
        </Link>

        {/* --- MENÚ DE ESCRITORIO --- */}
        {/* Se muestra solo en pantallas grandes (d-none lo oculta en móvil) */}
        <div className="d-none d-lg-flex align-items-center">
          <ul className="navbar-nav flex-row">
            <MenuLinks />
          </ul>
          <div className="ms-lg-3">
             <UserControls />
          </div>
        </div>

        {/* --- BOTÓN PARA MENÚ MÓVIL --- */}
        {/* Se muestra solo en pantallas pequeñas (d-lg-none lo oculta en PC) */}
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* --- CONTENIDO DEL MENÚ LATERAL (OFFCANVAS) --- */}
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
              <MenuLinks />
            </ul>
            <div className="offcanvas-footer mt-auto">
              <UserControls isMobile={true} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;