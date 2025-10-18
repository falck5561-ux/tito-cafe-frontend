import React, { useContext, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';


// --- COMPONENTE DE ENLACES DEL MENÚ ---
const MenuLinks = ({ onLinkClick }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔧 Nuevo handler: cierra el menú y luego navega
  const handleClick = (e, to) => {
    e.preventDefault(); // evita la navegación inmediata
    if (onLinkClick) onLinkClick(); // cierra el offcanvas
    setTimeout(() => navigate(to), 250); // navega tras el cierre (animación dura ~200ms)
  };

  return (
    <>
      <li className="nav-item">
        <NavLink className="nav-link" to="/" onClick={(e) => handleClick(e, "/")}>
          Inicio
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className="nav-link" to="/combos" onClick={(e) => handleClick(e, "/combos")}>
          Combos
        </NavLink>
      </li>

      {user?.rol === 'Cliente' && (
        <li className="nav-item">
          <NavLink className="nav-link" to="/hacer-un-pedido" onClick={(e) => handleClick(e, "/hacer-un-pedido")}>
            Mi Pedido
          </NavLink>
        </li>
      )}

      {user?.rol === 'Jefe' && (
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin" onClick={(e) => handleClick(e, "/admin")}>
            Admin
          </NavLink>
        </li>
      )}
    </>
  );
};


// --- COMPONENTE DE CONTROLES DE USUARIO (modo oscuro y logout) ---
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


// --- NAVBAR PRINCIPAL ---
function Navbar() {
  const offcanvasRef = useRef(null);

  // ✅ Cierra el menú programáticamente
  const handleCloseOffcanvas = () => {
    const closeButton = offcanvasRef.current?.querySelector('[data-bs-dismiss="offcanvas"]');
    if (closeButton) closeButton.click();
  };

  return (
    <nav className="navbar fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span>Tito Café</span>
        </Link>

        {/* --- MENÚ DE ESCRITORIO --- */}
        <div className="d-none d-lg-flex align-items-center">
          <ul className="navbar-nav flex-row">
            <MenuLinks /> {/* En escritorio no necesita cerrar el offcanvas */}
          </ul>
          <div className="ms-lg-3">
            <UserControls />
          </div>
        </div>

        {/* --- BOTÓN DEL MENÚ MÓVIL --- */}
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

        {/* --- CONTENIDO DEL MENÚ MÓVIL (OFFCANVAS) --- */}
        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          ref={offcanvasRef}
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
              {/* ✅ Ahora los enlaces cierran el menú y navegan correctamente */}
              <MenuLinks onLinkClick={handleCloseOffcanvas} />
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
