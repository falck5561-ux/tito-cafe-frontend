// Archivo: src/components/ComboCard.jsx (Versión Corregida y Robusta)

import React from 'react';
import { motion } from 'framer-motion';

function ComboCard({ combo }) {
  // --- CORRECCIÓN CLAVE ---
  // Usamos el operador '|| 0' para asegurarnos de que si los precios no vienen, se use 0 por defecto.
  // Esto evita el error NaN (Not a Number).
  const precioOriginal = parseFloat(combo.precio_original || 0);
  const precioFinal = parseFloat(combo.precio_final || precioOriginal); // Si no hay precio final, usa el original

  const tieneDescuento = precioOriginal > precioFinal;
  let descuento = 0;
  if (tieneDescuento && precioOriginal > 0) {
    descuento = ((precioOriginal - precioFinal) / precioOriginal) * 100;
  }

  // --- CORRECCIÓN DE IMAGEN ---
  // Si no hay imagen_url, usamos un placeholder de un servicio en línea confiable.
  const imageUrl = combo.imagen_url || `https://placehold.co/400x300/2a2a2a/f5f5f5?text=${combo.nombre}`;

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="col"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4 }}
    >
      <div className="product-card">
        <div className="card-image-container">
          {/* Usamos la URL de imagen segura que definimos arriba */}
          <img src={imageUrl} alt={combo.nombre} />
          
          {tieneDescuento && (
            <span className="discount-badge">-{descuento.toFixed(0)}%</span>
          )}
        </div>

        <div className="card-body">
          <h3 className="card-title">{combo.nombre || 'Nombre no disponible'}</h3>
          
          <div className="card-price">
            {tieneDescuento ? (
              <>
                <span className="original-price">${precioOriginal.toFixed(2)}</span>
                <span className="discounted-price">${precioFinal.toFixed(2)}</span>
              </>
            ) : (
              // Si no hay descuento, solo mostramos el precio final.
              <span className="discounted-price">${precioFinal.toFixed(2)}</span>
            )}
          </div>
          
          <button className="btn-buy">¡Lo Quiero!</button>
        </div>
      </div>
    </motion.div>
  );
}

export default ComboCard;
