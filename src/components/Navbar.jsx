import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

// ✅ CORRECCIÓN 1: El componente ahora acepta una prop 'isMobile'
// Le pasaremos 'true' solo cuando estemos en el menú lateral.
const MenuLinks = ({ isMobile = false }) => {
  const { user } = useContext(AuthContext);

  // Un objeto que solo se añadirá a los NavLink si 'isMobile' es true.
  // Este atributo le dice a Bootstrap que cierre el offcanvas.
  const mobileProps = isMobile ? { 'data-bs-dismiss': 'offcanvas' } : {};

  return (
    <>
      <li className="nav-item">
        {/* ✅ CORRECCIÓN 2: Se añaden las props móviles al enlace */}
        <NavLink className="nav-link" to="/" {...mobileProps}>Inicio</NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/combos" {...mobileProps}>Combos</NavLink>
      </li>
      {user?.rol === 'Cliente' && (
        <li className="nav-item">
          <NavLink className="nav-link" to="/hacer-un-pedido" {...mobileProps}>Mi Pedido</NavLink>
        </li>
      )}
      {user?.rol === 'Jefe' && (
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin" {...mobileProps}>Admin</NavLink>
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
        <div className="d-none d-lg-flex align-items-center">
          <ul className="navbar-nav flex-row">
            {/* Aquí no pasamos 'isMobile', por lo que los enlaces no cerrarán nada */}
            <MenuLinks />
          </ul>
          <div className="ms-lg-3">
             <UserControls />
          </div>
        </div>

        {/* --- BOTÓN PARA MENÚ MÓVIL --- */}
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
              {/* ✅ CORRECCIÓN 3: Le pasamos 'isMobile={true}' a los enlaces del menú lateral */}
              <MenuLinks isMobile={true} />
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
