import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src="/icon.png" alt="Tito Café Logo" width="30" height="30" className="d-inline-block align-text-top me-2" />
          Tito Café
        </Link>

        <div className="d-flex align-items-center">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            
            {/* --- ENLACES PÚBLICOS Y PARA TODOS LOS USUARIOS --- */}
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Inicio</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/combos">Combos de Tito</NavLink>
            </li>

            {/* --- ENLACES CONDICIONALES POR ROL --- */}

            {/* Si el usuario es Jefe (Admin) */}
            {user?.rol === 'Jefe' && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/admin">Admin</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/pos">Punto de Venta</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/canjear">Canjear Cupón</NavLink></li>
              </>
            )}

            {/* Si el usuario es Empleado */}
            {user?.rol === 'Empleado' && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/pos">Punto de Venta</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/canjear">Canjear Cupón</NavLink></li>
              </>
            )}
            
            {/* Si el usuario es Cliente */}
            {user?.rol === 'Cliente' && (
               <li className="nav-item"><NavLink className="nav-link" to="/cliente">Mi Pedido</NavLink></li>
            )}
          </ul>

          <div className="d-flex align-items-center ms-3">
            <ThemeToggleButton />
            {user ? (
              <div className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>
                  Cerrar Sesión ({user.rol})
                </button>
              </div>
            ) : (
              <li className="nav-item" style={{ listStyle: 'none' }}>
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;