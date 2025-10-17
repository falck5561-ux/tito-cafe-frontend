import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Importación para la navegación
import AuthContext from '../context/AuthContext';

const modalStyles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1050,
  },
  content: {
    width: '90%',
    maxWidth: '500px',
    background: 'var(--bs-card-bg)',
    borderRadius: '15px',
    padding: '2rem',
    position: 'relative',
    color: 'var(--bs-body-color)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    color: 'var(--bs-body-color)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  productImage: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    border: '1px solid var(--bs-border-color)',
  },
  productTitle: {
    fontFamily: "'Playfair Display', serif",
  },
  productDescription: {
    margin: '1rem 0',
    fontSize: '1rem',
    lineHeight: '1.6',
  },
};

function ProductDetailModal({ product, onClose, onAddToCart }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Hook para redirigir

  if (!product) return null;

  // Función que maneja el clic en "Hacer Pedido"
  const handleOrderAndNavigate = (productToAdd) => {
    // 1. Agrega el producto al carrito
    onAddToCart(productToAdd);
    // 2. Redirige al usuario a la página del pedido
    navigate('/hacer-un-pedido');
  };

  const precioFinal = product.en_oferta && product.descuento_porcentaje > 0
    ? Number(product.precio) * (1 - product.descuento_porcentaje / 100)
    : Number(product.precio);

  const displayImage = (product.imagenes && product.imagenes.length > 0)
    ? product.imagenes[0]
    : 'https://placehold.co/500x250/d7ccc8/4a2c2a?text=Sin+Imagen';

  return (
    <motion.div
      style={modalStyles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        style={modalStyles.content}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button style={modalStyles.closeButton} onClick={onClose}>&times;</button>
        
        <img 
          src={displayImage} 
          alt={product.nombre} 
          style={modalStyles.productImage} 
        />

        <h2 style={modalStyles.productTitle}>{product.nombre}</h2>
        
        {product.descripcion && (
          <p style={modalStyles.productDescription}>{product.descripcion}</p>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            {product.en_oferta && product.descuento_porcentaje > 0 ? (
              <>
                <span className="text-muted text-decoration-line-through me-2 fs-5">${Number(product.precio).toFixed(2)}</span>
                <span className="fs-3 fw-bold text-success">${precioFinal.toFixed(2)}</span>
              </>
            ) : (
              <span className="fs-3 fw-bold">${precioFinal.toFixed(2)}</span>
            )}
          </div>

          {(!user || user.rol === 'Cliente') && (
            <button className="btn btn-primary" onClick={() => handleOrderAndNavigate(product)}>
              Hacer Pedido
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProductDetailModal;

