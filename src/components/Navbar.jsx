import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
      <div className="container">
        {/* --- CAMBIO: Se ha eliminado el <img> de aquí --- */}
        <Link className="navbar-brand" to="/">
          <span>Tito Café</span>
        </Link>

        <div className="d-flex align-items-center">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink className="nav-link" to="/">Inicio</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/combos">Combos</NavLink></li>
            
            {user?.rol === 'Jefe' && <li className="nav-item"><NavLink className="nav-link" to="/admin">Admin</NavLink></li>}
            {user?.rol === 'Cliente' && <li className="nav-item"><NavLink className="nav-link" to="/cliente">Mi Pedido</NavLink></li>}
          </ul>

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