import React, { useContext, useRef, useState } from 'react'; // <--- AGREGAR useState
import { Link, NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';
import { useInstallPWA } from '../context/InstallPwaContext';
import LocationModal from './LocationModal'; // <--- IMPORTAR TU ARCHIVO

// --- COMPONENTE DE ENLACES DEL MENÚ ---
// Recibimos una nueva propiedad: onLocationClick
const MenuLinks = ({ onLinkClick, onLocationClick }) => { 
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { installPrompt, handleInstall } = useInstallPWA();

  const handleClick = (e, to) => {
    e.preventDefault();
    if (onLinkClick) onLinkClick();
    setTimeout(() => navigate(to), 250);
  };
  
  // Función para manejar el click en Ubicación
  const handleLocationClick = (e) => {
    e.preventDefault();
    if (onLinkClick) onLinkClick(); // Cierra el menú móvil si está abierto
    if (onLocationClick) onLocationClick(); // Abre el modal
  };

  const handleInstallClick = () => {
    if (onLinkClick) onLinkClick();
    handleInstall();
  };

  return (
    <>
      <li className="nav-item">
        <NavLink className="nav-link" to="/" onClick={(e) => handleClick(e, "/")}>
          Inicio
        </NavLink>
      </li>
      
      <li className="nav-item">
        <NavLink className="nav-link" to="/nosotros" onClick={(e) => handleClick(e, "/nosotros")}>
          Nosotros
        </NavLink>
      </li>

      {/* --- NUEVO BOTÓN DE UBICACIÓN --- */}
      <li className="nav-item">
        <a className="nav-link" href="#" onClick={handleLocationClick} style={{ cursor: 'pointer' }}>
          Ubicación
        </a>
      </li>

      <li className="nav-item">
        <NavLink className="nav-link" to="/combos" onClick={(e) => handleClick(e, "/combos")}>
          Combos
        </NavLink>
      </li>

      {/* Menú para Clientes */}
      {user?.rol === 'Cliente' && (
        <li className="nav-item">
          <NavLink className="nav-link" to="/hacer-un-pedido" onClick={(e) => handleClick(e, "/hacer-un-pedido")}>
            Mi Pedido
          </NavLink>
        </li>
      )}

      {/* Menú para Empleados y Jefes */}
      {(user?.rol === 'Empleado' || user?.rol === 'Jefe') && (
        <li className="nav-item">
          <NavLink className="nav-link" to="/pos" onClick={(e) => handleClick(e, "/pos")}>
            Vender
          </NavLink>
        </li>
      )}

      {/* Menú exclusivo de Jefe */}
      {user?.rol === 'Jefe' && (
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin" onClick={(e) => handleClick(e, "/admin")}>
            Admin
          </NavLink>
        </li>
      )}

      {installPrompt && (
        <li className="nav-item">
          <a className="nav-link" href="#" onClick={handleInstallClick} style={{ cursor: 'pointer' }}>
            Instalar App
          </a>
        </li>
      )}
    </>
  );
};

// --- COMPONENTE DE CONTROLES DE USUARIO ---
const UserControls = ({ isMobile = false, onControlClick }) => {
  const { user, logout } = useContext(AuthContext);
  const buttonClass = isMobile ? "" : "ms-3";
  const navigate = useNavigate();

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (onControlClick) onControlClick();
    setTimeout(() => navigate('/login'), 250);
  };

  const handleLogoutClick = () => {
    if (onControlClick) onControlClick();
    setTimeout(logout, 250);
  };

  return (
    <>
      <span onClick={onControlClick}>
        <ThemeToggleButton />
      </span>
      
      {user ? (
        <button onClick={handleLogoutClick} className={`btn btn-outline-secondary ${buttonClass}`}>
          Cerrar Sesión
        </button>
      ) : (
        <a href="/login" onClick={handleLoginClick} className={`btn btn-primary ${buttonClass}`}>
          Login
        </a>
      )}
    </>
  );
};

// --- NAVBAR PRINCIPAL ---
function Navbar() {
  const offcanvasRef = useRef(null);
  
  // 1. ESTADO PARA CONTROLAR EL MODAL
  const [showLocation, setShowLocation] = useState(false); 

  const handleCloseOffcanvas = () => {
    const closeButton = offcanvasRef.current?.querySelector('[data-bs-dismiss="offcanvas"]');
    if (closeButton) closeButton.click();
  };

  return (
    <>
      <nav className="navbar navbar-light-theme navbar-dark fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <span>Tito Spot</span>
          </Link>

          {/* --- MENÚ DE ESCRITORIO --- */}
          <div className="d-none d-lg-flex align-items-center">
            <ul className="navbar-nav flex-row">
              {/* Pasamos la función para abrir el modal */}
              <MenuLinks onLocationClick={() => setShowLocation(true)} />
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
                className="btn-close" 
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>

            <div className="offcanvas-body d-flex flex-column">
              <ul className="navbar-nav flex-grow-1">
                {/* Pasamos la función también aquí para el móvil */}
                <MenuLinks 
                  onLinkClick={handleCloseOffcanvas} 
                  onLocationClick={() => setShowLocation(true)}
                />
              </ul>

              <div className="offcanvas-footer mt-auto">
                <UserControls isMobile={true} onControlClick={handleCloseOffcanvas} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. RENDERIZAR EL MODAL FUERA DEL NAV PERO DENTRO DEL COMPONENTE */}
      {/* Asumo que LocationModal recibe 'show' y 'onHide' o 'handleClose' */}
      {/* Ajusta las props según como tengas programado LocationModal.jsx */}
      {showLocation && (
        <LocationModal 
          show={showLocation} 
          handleClose={() => setShowLocation(false)} 
          onHide={() => setShowLocation(false)} 
        />
      )}
    </>
  );
}

export default Navbar;