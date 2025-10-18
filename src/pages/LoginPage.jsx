// Archivo: src/pages/LoginPage.jsx
import React, { useState, useContext, useEffect } from 'react'; // <-- 1. Importar useEffect
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext); // <-- 2. Obtener 'user' del contexto
  const navigate = useNavigate();

  // --- 3. NUEVA LÓGICA DE REDIRECCIÓN ---
  useEffect(() => {
    // Si el 'user' ya existe en el contexto, significa que el usuario está logueado
    if (user) {
      // Damos una pequeña notificación
      toast('Ya tienes una sesión activa.', { icon: 'ℹ️' });

      // Redirigir basado en el rol (la misma lógica de handleSubmit)
      switch (user.rol) {
        case 'Jefe':
          navigate('/admin');
          break;
        case 'Empleado':
          navigate('/pos');
          break;
        case 'Cliente':
          navigate('/'); // Esta es la ruta principal (corregida en el paso anterior)
          break;
        default:
          navigate('/');
      }
    }
  }, [user, navigate]); // Este efecto se ejecuta si 'user' o 'navigate' cambian
  // --- FIN DE LA NUEVA LÓGICA ---


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const loggedInUser = await login(email, password);
      
      if (loggedInUser) {
        toast.success('¡Bienvenido a Tito Café!');

        // Esta lógica de redirección se ejecuta DESPUÉS de un login exitoso
        switch (loggedInUser.rol) {
          case 'Jefe':
            navigate('/admin');
            break;
          case 'Empleado':
            navigate('/pos');
            break;
          case 'Cliente':
            navigate('/'); // Correcto
            break;
          default:
            navigate('/');
        }
      } else {
        setError('Email o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Ocurrió un error. Inténtelo de nuevo.');
      console.error("Error en login:", err);
    }
  };

  // --- 4. RENDER CONDICIONAL ---
  // Si el usuario ya está logueado, mostramos un 'cargando' en lugar del formulario
  // mientras el useEffect lo redirige. Esto evita el "parpadeo".
  if (user) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Redirigiendo...</span>
        </div>
        <p className="mt-3">Ya has iniciado sesión. Redirigiendo...</p>
      </div>
    );
  }

  // Si el usuario NO está logueado (user es null), muestra el formulario de login
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

          <p className="mt-3 text-center">
            ¿No tienes una cuenta? <Link to="/register">Crea una aquí</Link>
          </p>
          
        </div>
      </div>
    </div>
  );
}

export default LoginPage;