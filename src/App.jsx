// Archivo: src/App.jsx (Versión Final, Completa y Refactorizada)

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importación de Componentes
import Navbar from './components/Navbar'; // <-- Importamos el Navbar externo
import ProtectedRoute from './components/ProtectedRoute';

// Importación de las Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';
import ClientePage from './pages/ClientePage';
import CanjearPage from './pages/CanjearPage';
import CombosPage from './pages/CombosPage'; // <-- 1. IMPORTA LA NUEVA PÁGINA DE COMBOS

function App() {
  return (
    <BrowserRouter>
      <Navbar /> {/* <-- Usamos el componente Navbar */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* El contenedor principal se mueve aquí para aplicar a todas las páginas */}
      <div className="container mt-4">
        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/combos" element={<CombosPage />} /> {/* <-- 2. AÑADE LA NUEVA RUTA */}

          {/* --- Rutas Protegidas --- */}
          <Route path="/admin" element={<ProtectedRoute roles={['Jefe']}><AdminPage /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute roles={['Empleado', 'Jefe']}><PosPage /></ProtectedRoute>} />
          <Route path="/cliente" element={<ProtectedRoute roles={['Cliente']}><ClientePage /></ProtectedRoute>} />
          <Route path="/canjear" element={<ProtectedRoute roles={['Empleado', 'Jefe']}><CanjearPage /></ProtectedRoute>} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;