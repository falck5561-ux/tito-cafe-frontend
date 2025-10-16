// Archivo: src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- ¡LÍNEA AÑADIDA! ---
// Importa todo el JavaScript que Bootstrap necesita para los menús, modales, etc.
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Importación de Componentes
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Importación de las Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import PosPage from './pages/PosPage';
import ClientePage from './pages/ClientePage';
import CanjearPage from './pages/CanjearPage';
import CombosPage from './pages/CombosPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* El padding-top se añade para compensar el navbar fijo (fixed-top) */}
      <div className="container pt-5 mt-4">
        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/combos" element={<CombosPage />} />

          {/* --- Rutas Protegidas --- */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={['Jefe']}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute roles={['Empleado', 'Jefe']}>
                <PosPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hacer-un-pedido" 
            element={
              <ProtectedRoute roles={['Cliente']}>
                <ClientePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/canjear" 
            element={
              <ProtectedRoute roles={['Empleado', 'Jefe']}>
                <CanjearPage />
              </ProtectedRoute>
            } 
          />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;