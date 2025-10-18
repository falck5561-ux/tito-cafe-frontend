import React, { useContext, useRef } from 'react'; // <-- 1. Importar useRef
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

// ✅ CORRECCIÓN: El componente ahora acepta una nueva prop 'onLinkClick'
const MenuLinks = ({ onLinkClick }) => {
  const { user } = useContext(AuthContext);

  // Cada vez que se haga clic en un enlace, se llamará a la función onLinkClick
  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <>
      <li className="nav-item">
        <NavLink className="nav-link" to="/" onClick={handleClick}>Inicio</NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/combos" onClick={handleClick}>Combos</NavLink>
      </li>
      {user?.rol === 'Cliente' && (
        <li className="nav-item">
          <NavLink className="nav-link" to="/hacer-un-pedido" onClick={handleClick}>Mi Pedido</NavLink>
        </li>
      )}
      {user?.rol === 'Jefe' && (
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin" onClick={handleClick}>Admin</NavLink>
        </li>
      )}
    </>
  );
};

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
  // --- 2. Lógica para controlar el cierre del menú ---
  const offcanvasRef = useRef(null); // Referencia al div del menú lateral

  // Esta función simula un clic en el botón de cierre del menú
  const handleCloseOffcanvas = () => {
    const closeButton = offcanvasRef.current?.querySelector('[data-bs-dismiss="offcanvas"]');
    if (closeButton) {
      closeButton.click();
    }
  };
  // --- FIN DE LA NUEVA LÓGICA ---

  return (
    <nav className="navbar fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span>Tito Café</span>
        </Link>

        {/* --- MENÚ DE ESCRITORIO --- */}
        <div className="d-none d-lg-flex align-items-center">
          <ul className="navbar-nav flex-row">
            <MenuLinks /> {/* En escritorio, no necesita la función de cierre */}
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
          ref={offcanvasRef} // <-- 3. Asignamos la referencia aquí
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menú</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas" // Este botón SÍ debe tenerlo
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body d-flex flex-column">
            <ul className="navbar-nav flex-grow-1">
              {/* ✅ CORRECCIÓN 4: Pasamos la función de cierre a los enlaces del menú */}
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

