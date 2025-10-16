import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../services/api';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
import toast from 'react-hot-toast';

function CombosPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const { agregarProductoAPedido } = useCart(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCombos = async () => {
      try {
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
  const handleOrdenarClick = (e, combo, precioFinal) => {
    e.stopPropagation(); 

    if (!user) {
      toast.error('Por favor, inicia sesión para añadir al carrito.');
      navigate('/login');
      return;
    }
    
    // 1. Creamos un objeto para el carrito con el precio ya calculado.
    //    Esto asegura que se agregue el precio con descuento.
    const itemParaCarrito = {
      ...combo,
      precio: precioFinal 
    };

    // 2. Pasamos el nuevo objeto con el precio correcto al carrito.
    agregarProductoAPedido(itemParaCarrito);
    navigate('/hacer-un-pedido');
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
            const esOferta = combo.en_oferta && combo.descuento_porcentaje > 0;
            const precioOriginal = Number(combo.precio);
            let precioFinal = precioOriginal;

            if (esOferta) {
              precioFinal = precioOriginal * (1 - combo.descuento_porcentaje / 100);
            }

            const displayImage = combo.imagen_url || `https://placehold.co/400x300/d7ccc8/4a2c2a?text=${encodeURIComponent(combo.nombre || combo.titulo)}`;

            return (
              <motion.div 
                key={combo.id} 
                className="col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="card h-100 shadow-sm overflow-hidden position-relative">
                  {esOferta && (
                    <span className="badge bg-danger" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.9rem' }}>
                      -{combo.descuento_porcentaje}%
                    </span>
                  )}

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
                    
                    <div>
                      {esOferta ? (
                        <>
                          <span className="text-muted text-decoration-line-through me-2">${precioOriginal.toFixed(2)}</span>
                          <span className="fw-bold fs-4 text-success">${precioFinal.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="fw-bold fs-4">${precioOriginal.toFixed(2)}</span>
                      )}
                    </div>
                    
                    {(!user || user.rol === 'Cliente') && (
                      // 3. Pasamos el 'precioFinal' a la función del onClick.
                      <button onClick={(e) => handleOrdenarClick(e, combo, precioFinal)} className="btn btn-primary">
                        ¡Lo Quiero!
                      </button>
                    )}
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

