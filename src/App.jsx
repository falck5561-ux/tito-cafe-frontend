import React, { useState, useContext, useRef, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import { X, MapPin, Navigation, Menu, Sun, Moon } from 'lucide-react';

// --- 1. MOCK DE CONTEXTOS (Para que funcione la demo) ---
const AuthContext = createContext(null);
const InstallPwaContext = createContext(null);

const AuthProvider = ({ children }) => {
  // Simulamos un usuario logueado para ver todas las opciones
  const [user, setUser] = useState({ name: 'Cliente Feliz', rol: 'Cliente' });
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};

const InstallPwaProvider = ({ children }) => {
  return <InstallPwaContext.Provider value={{ installPrompt: null, handleInstall: () => {} }}>{children}</InstallPwaContext.Provider>;
};

const useInstallPWA = () => useContext(InstallPwaContext);

// --- 2. COMPONENTES AUXILIARES ---

const ThemeToggleButton = () => {
  const [isDark, setIsDark] = useState(true);
  return (
    <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-white/10 text-yellow-400">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

// --- 3. COMPONENTE LOCATION MODAL (EL NUEVO COMPONENTE) ---
const LocationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const addressQuery = "C.+5+12,+Samulá,+24090+San+Francisco+de+Campeche,+Camp.";
  const googleMapsDirectionsLink = `https://www.google.com/maps/dir//${addressQuery}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#121212] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#1a1a1a]">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-orange-500"><MapPin size={20} fill="currentColor" /></span> 
              Ubicación
            </h3>
            <p className="text-gray-400 text-sm mt-1">C. 5 12, Samulá, Campeche</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Mapa Visual (Iframe) */}
        <div className="w-full h-[350px] bg-gray-900 relative">
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src={`https://maps.google.com/maps?width=100%25&height=600&hl=es&q=${addressQuery}&t=&z=16&ie=UTF8&iwloc=B&output=embed`}
            style={{ filter: "invert(90%) hue-rotate(180deg)" }}
            allowFullScreen
            title="Mapa de Ubicación"
          ></iframe>
        </div>

        {/* Pie del Modal */}
        <div className="p-5 bg-[#1a1a1a] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">¡Te esperamos con el mejor sabor! 🦔</p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2 text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
              Cerrar
            </button>
            <a 
              href={googleMapsDirectionsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
            >
              <Navigation size={18} />
              Ir al Local
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 4. COMPONENTE NAVBAR MODIFICADO ---

const MenuLinks = ({ onLinkClick, onLocationClick }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { installPrompt, handleInstall } = useInstallPWA();

  const handleClick = (e, to) => {
    e.preventDefault();
    if (onLinkClick) onLinkClick();
    setTimeout(() => navigate(to), 100);
  };

  const handleLocationClick = (e) => {
    e.preventDefault();
    if (onLinkClick) onLinkClick(); // Cierra el menú móvil
    if (onLocationClick) onLocationClick(); // Abre el modal
  };

  return (
    <>
      <li className="nav-item mx-2">
        <NavLink className="nav-link text-gray-300 hover:text-white block py-2" to="/" onClick={(e) => handleClick(e, "/")}>Inicio</NavLink>
      </li>
      <li className="nav-item mx-2">
        <NavLink className="nav-link text-gray-300 hover:text-white block py-2" to="/nosotros" onClick={(e) => handleClick(e, "/nosotros")}>Nosotros</NavLink>
      </li>
      {/* BOTÓN UBICACIÓN AÑADIDO */}
      <li className="nav-item mx-2">
        <a className="nav-link text-gray-300 hover:text-orange-400 font-medium block py-2 cursor-pointer" onClick={handleLocationClick}>
          Ubicación
        </a>
      </li>
      <li className="nav-item mx-2">
        <NavLink className="nav-link text-gray-300 hover:text-white block py-2" to="/combos" onClick={(e) => handleClick(e, "/combos")}>Combos</NavLink>
      </li>
      {user?.rol === 'Cliente' && (
        <li className="nav-item mx-2">
          <NavLink className="nav-link text-gray-300 hover:text-white block py-2" to="/hacer-un-pedido" onClick={(e) => handleClick(e, "/hacer-un-pedido")}>Mi Pedido</NavLink>
        </li>
      )}
    </>
  );
};

const Navbar = () => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <nav className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
              <span className="text-3xl">🦔</span> Tito Spot
            </Link>

            {/* Menú Desktop */}
            <div className="hidden lg:flex items-center">
              <ul className="flex flex-row">
                <MenuLinks onLinkClick={null} onLocationClick={() => setIsMapOpen(true)} />
              </ul>
              <div className="ml-6 flex items-center gap-3 pl-6 border-l border-gray-700">
                <ThemeToggleButton />
                {user ? (
                  <button onClick={logout} className="text-sm border border-gray-600 text-gray-300 px-3 py-1 rounded hover:bg-gray-800 transition">Salir</button>
                ) : (
                  <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Login</button>
                )}
              </div>
            </div>

            {/* Botón Móvil */}
            <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#1a1a1a] border-t border-gray-800">
            <ul className="flex flex-col p-4">
              <MenuLinks 
                onLinkClick={() => setIsMobileMenuOpen(false)} 
                onLocationClick={() => setIsMapOpen(true)} 
              />
              <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                 <span className="text-gray-400 text-sm">Modo oscuro</span>
                 <ThemeToggleButton />
              </div>
            </ul>
          </div>
        )}
      </nav>

      {/* Renderizado del Modal fuera del nav pero dentro del fragmento */}
      <LocationModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </>
  );
};

// --- 5. PÁGINAS DE EJEMPLO ---
const Home = () => (
  <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center pt-20 px-4">
    <h1 className="text-5xl font-bold text-center mb-6">Bienvenido a <span className="text-orange-500">Tito Spot</span></h1>
    <p className="text-xl text-gray-400 mb-8 max-w-2xl text-center">
      El mejor lugar para disfrutar de snacks y bebidas en Campeche. 
      Prueba nuestro botón de <strong className="text-white">Ubicación</strong> en la barra superior.
    </p>
    <img 
      src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
      alt="Cafe Vibe" 
      className="rounded-2xl shadow-2xl w-full max-w-3xl opacity-80"
    />
  </div>
);

const NotFound = () => <div className="p-10 text-white text-center">Página no encontrada (Demo)</div>;

// --- 6. APP PRINCIPAL ---
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <InstallPwaProvider>
          <div className="font-sans antialiased bg-[#121212] min-h-screen">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/nosotros" element={<div className="p-20 text-white text-center text-2xl">Sobre Nosotros...</div>} />
              <Route path="/combos" element={<div className="p-20 text-white text-center text-2xl">Nuestros Combos...</div>} />
              <Route path="/hacer-un-pedido" element={<div className="p-20 text-white text-center text-2xl">Panel de Pedidos</div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </InstallPwaProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;