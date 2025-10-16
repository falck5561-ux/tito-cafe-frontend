import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../services/api';
import AuthContext from '../context/AuthContext';
// CORRECCIÓN: El hook se llama 'useCart', no está en el contexto directamente
import { useCart } from '../context/CartContext'; 
import toast from 'react-hot-toast';

function CombosPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  // CORRECCIÓN: Se usa el nombre de la función que provee el hook
  const { agregarAlCarrito } = useCart(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        // CORRECCIÓN: Usamos la API que devuelve los nombres correctos
        const response = await apiClient.get('/combos'); 
        setCombos(response.data);
      } catch (err) {
        setError('No se pudieron cargar los combos en este momento.');
        console.error("Error en CombosPage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  // --- FUNCIÓN CLAVE CORREGIDA ---
  const handleOrdenarClick = (e, combo) => {
    // 1. Detiene cualquier evento click en elementos padres (previene doble notificación)
    e.stopPropagation(); 

    if (!user) {
      toast.error('Por favor, inicia sesión para añadir al carrito.');
      navigate('/login');
      return;
    }
    
    // 2. Agrega el producto al carrito (usa la función correcta del contexto)
    agregarAlCarrito(combo);
    toast.success(`${combo.nombre || combo.titulo} añadido al carrito!`);
    
    // 3. ¡NUEVO! Redirige al usuario a la página del pedido
    navigate('/hacer-un-pedido'); // Asegúrate que esta sea tu ruta correcta
  };

  if (loading) {
    return <div className="text-center p-5"><div className="spinner-border"></div></div>;
  }
  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  return (
    <motion.div 
      className="container section-padding"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-center mb-5">Nuestros Combos Especiales</h1>
      
      {!loading && !error && combos.length === 0 && (
        <div className="text-center p-5 rounded" style={{backgroundColor: 'var(--bs-tertiary-bg)'}}>
          <h3>No hay combos especiales disponibles por el momento.</h3>
        </div>
      )}

      {!loading && !error && combos.length > 0 && (
        <div className="row g-4">
          {combos.map((combo, index) => {
            const displayImage = combo.imagen_url || `https://placehold.co/400x300/d7ccc8/4a2c2a?text=${encodeURIComponent(combo.nombre || combo.titulo)}`;

            return (
              <motion.div 
                key={combo.id} 
                className="col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="card h-100 shadow-sm overflow-hidden">
                  <img 
                    src={displayImage}
                    className="card-img-top" 
                    alt={combo.nombre || combo.titulo}
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h4 className="card-title flex-grow-1">{combo.nombre || combo.titulo}</h4>
                    <p className="card-text">{combo.descripcion}</p>
                  </div>
                  <div className="card-footer bg-transparent border-top-0 pb-3 d-flex justify-content-between align-items-center">
                    <span className="fw-bold fs-4">${Number(combo.precio).toFixed(2)}</span>
                    {/* 4. Pasamos el evento 'e' a la función */}
                    <button onClick={(e) => handleOrdenarClick(e, combo)} className="btn btn-primary">
                      ¡Lo Quiero!
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default CombosPage;