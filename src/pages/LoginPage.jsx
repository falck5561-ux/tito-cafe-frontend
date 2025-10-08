// Archivo: src/pages/LoginPage.jsx (con enlace a registro)
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- LINK IMPORTADO
import AuthContext from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const loggedInUser = await login(email, password);
      
      if (loggedInUser) {
        // --- LÓGICA DE REDIRECCIÓN POR ROL ---
        switch (loggedInUser.rol) {
          case 'Jefe':
            navigate('/admin');
            break;
          case 'Empleado':
            navigate('/pos');
            break;
          case 'Cliente':
            navigate('/cliente');
            break;
          default:
            navigate('/');
        }
      } else {
        setError('Email o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Ocurrió un error. Inténtelo de nuevo.');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow-sm p-4">
          <h2 className="text-center mb-4">Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Ingresar
              </button>
            </div>
          </form>

          {/* ---- ENLACE AÑADIDO ---- */}
          <p className="mt-3 text-center">
            ¿No tienes una cuenta? <Link to="/register">Crea una aquí</Link>
          </p>
          {/* -------------------- */}
          
        </div>
      </div>
    </div>
  );
}

export default LoginPage;