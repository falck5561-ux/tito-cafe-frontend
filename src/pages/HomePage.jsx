// Archivo: src/pages/HomePage.jsx (Versión Final con Logo Corregido)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// --- La importación del logo se ha eliminado ---
import AuthContext from '../context/AuthContext';

function HomePage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  const getPedidoUrl = () => {
    if (!user) {
      return "/login";
    }
    switch (user.rol) {
      case 'Cliente': return "/cliente";
      case 'Jefe': return "/admin";
      case 'Empleado': return "/pos";
      default: return "/login";
    }
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get('/api/productos');
        setProductos(res.data);
      } catch (err) {
        setError('No se pudo cargar el menú.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
  };

  const getPlaceholderImage = (categoria) => {
    const cat = categoria?.toLowerCase() || '';
    if (cat.includes('caliente')) return 'https://placehold.co/600x400/6f4e37/FFF?text=Café';
    if (cat.includes('fría')) return 'https://placehold.co/600x400/a0c4ff/FFF?text=Bebida';
    if (cat.includes('postre')) return 'https://placehold.co/600x400/ffc0cb/FFF?text=Postre';
    return 'https://placehold.co/600x400/d2b48c/FFF?text=Producto';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="p-5 mb-5 text-center rounded-3 shadow" style={heroStyle}>
        {/* --- LA RUTA DE LA IMAGEN AHORA ES DIRECTA --- */}
        <motion.img 
          src="/logo.png" 
          alt="Tito Café Logo"
          className="hero-logo mb-4" 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        />
        <h1 className="display-4 fw-bold">El Sabor de la Tradición en cada Taza</h1>
        <p className="fs-4">Descubre nuestra selección de cafés de especialidad, postres artesanales y un ambiente único.</p>
        
        <Link to={getPedidoUrl()} className="btn btn-primary btn-lg mt-3" type="button">
          Haz tu Pedido
        </Link>
      </div>

      <h2 className="text-center mb-4">Nuestro Menú</h2>
      {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {productos.map((producto, index) => (
          <motion.div key={producto.id} className="col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <div className="card h-100 shadow-sm">
              <img src={producto.imagen_url || getPlaceholderImage(producto.categoria)} className="card-img-top" alt={producto.nombre} style={{ height: '200px', objectFit: 'cover' }} />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-center flex-grow-1">{producto.nombre}</h5>
              </div>
              <div className="card-footer bg-transparent border-top-0 pb-3 text-center">
                <span className="fw-bold fs-5" style={{color: '#28a745'}}>${Number(producto.precio).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default HomePage;