import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react'; 

// Recibimos 'onClick' como prop desde el padre
function ComboCard({ combo, onClick }) { 

  // --- LÓGICA DE PRECIOS VISUAL (Igual que antes) ---
  const precioOriginal = parseFloat(combo.precio || 0);
  const precioFinal = parseFloat(combo.precio_final || precioOriginal);
  const tieneDescuento = precioOriginal > precioFinal;
  let descuento = 0;
  if (tieneDescuento && precioOriginal > 0) {
    descuento = ((precioOriginal - precioFinal) / precioOriginal) * 100;
  }
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
      {/* Al hacer click en la tarjeta completa, abrimos el modal */}
      <div className="product-card h-100" onClick={() => onClick(combo)} style={{cursor: 'pointer'}}>
        <div className="card-image-container">
          <img src={imageUrl} alt={combo.nombre} />
          {tieneDescuento && (
            <span className="discount-badge">-{descuento.toFixed(0)}%</span>
          )}
          {/* Overlay al pasar el mouse (Efecto visual) */}
          <div className="card-overlay">
             <span className="btn btn-light rounded-pill px-3 fw-bold d-flex align-items-center gap-2">
                <Eye size={18}/> Ver Detalles
             </span>
          </div>
        </div>

        <div className="card-body d-flex flex-column">
          <h3 className="card-title text-truncate">{combo.nombre || 'Nombre no disponible'}</h3>
          
          <div className="card-price mt-auto mb-3">
            {tieneDescuento ? (
              <>
                <span className="original-price">${precioOriginal.toFixed(2)}</span>
                <span className="discounted-price">${precioFinal.toFixed(2)}</span>
              </>
            ) : (
              <span className="discounted-price">${precioFinal.toFixed(2)}</span>
            )}
          </div>
          
          {/* Este botón ahora solo abre el modal, NO compra */}
          <button className="btn-buy" onClick={(e) => {
             e.stopPropagation(); // Evita doble click si la tarjeta ya tiene evento
             onClick(combo);
          }}>
            Ver Detalles
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ComboCard;