// Archivo: src/components/ComboCard.jsx

import React from 'react';
import { motion } from 'framer-motion';

// Asumimos que cada 'combo' tiene: id, nombre, precio_original, precio_final, imagen_url
function ComboCard({ combo }) {
  // Calculamos el porcentaje de descuento dinámicamente
  const precioOriginal = parseFloat(combo.precio_original);
  const precioFinal = parseFloat(combo.precio_final);
  const descuento = ((precioOriginal - precioFinal) / precioOriginal) * 100;
  const tieneDescuento = descuento > 0;

  // Animación para cada tarjeta
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="col" // Bootstrap se encarga del tamaño de la columna
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4 }}
    >
      {/* Aplicamos las clases CSS que definimos en el mensaje anterior */}
      <div className="product-card">

        <div className="card-image-container">
          <img src={combo.imagen_url || 'https://via.placeholder.com/300'} alt={combo.nombre} />
          
          {/* Mostramos la insignia solo si hay descuento */}
          {tieneDescuento && (
            <span className="discount-badge">-{descuento.toFixed(0)}%</span>
          )}
        </div>

        <div className="card-body">
          <h3 className="card-title">{combo.nombre}</h3>
          
          <div className="card-price">
            {/* Mostramos precios diferentes si hay descuento */}
            {tieneDescuento ? (
              <>
                <span className="original-price">${precioOriginal.toFixed(2)}</span>
                <span className="discounted-price">${precioFinal.toFixed(2)}</span>
              </>
            ) : (
              <span className="discounted-price">${precioOriginal.toFixed(2)}</span>
            )}
          </div>
          
          <button className="btn-buy">¡Lo Quiero!</button>
        </div>

      </div>
    </motion.div>
  );
}

export default ComboCard;