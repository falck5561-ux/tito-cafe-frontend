import React from 'react';
import { motion } from 'framer-motion';

// Estilos para el modal, usan tus variables de CSS para adaptarse al tema
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
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: 'var(--bs-body-color)',
    cursor: 'pointer',
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
  if (!product) return null;

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
                <span className="fs-3 fw-bold">${precioFinal.toFixed(2)}</span>
              </>
            ) : (
              <span className="fs-3 fw-bold">${precioFinal.toFixed(2)}</span>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => onAddToCart(product)}>
            Añadir al Carrito
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProductDetailModal;

