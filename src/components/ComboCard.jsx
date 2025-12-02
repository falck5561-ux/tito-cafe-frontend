import React, { useContext } from 'react'; 
import { motion } from 'framer-motion';
// Eliminamos useNavigate y CartContext, ya que la tarjeta solo debe mostrar detalles
// import { useNavigate } from 'react-router-dom'; 
// import { CartContext } from '../context/CartContext'; 

// CLAVE: Recibimos una función para mostrar los detalles del combo.
function ComboCard({ combo, onShowDetails }) { 
  // const navigate = useNavigate(); // Ya no se necesita aquí
  // const { agregarAlCarrito } = useContext(CartContext); // Ya no se necesita aquí

  // --- LÓGICA DE PRECIOS Y DESCUENTOS (sin cambios) ---
  const precioOriginal = parseFloat(combo.precio || 0);
  const precioFinal = parseFloat(combo.precio_final || precioOriginal);
  const tieneDescuento = precioOriginal > precioFinal;
  let descuento = 0;
  if (tieneDescuento && precioOriginal > 0) {
    descuento = ((precioOriginal - precioFinal) / precioOriginal) * 100;
  }
  const imageUrl = combo.imagen_url || `https://placehold.co/400x300/2a2a2a/f5f5f5?text=${combo.nombre}`;

  // --- NUEVA FUNCIÓN PARA ABRIR EL MODAL ---
  const handleDetailsClick = (e) => {
    e.stopPropagation(); // Previene la acción por defecto
    if (onShowDetails) {
      onShowDetails(combo); // Llama a la función del padre para abrir el modal
    }
  };

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
      {/*         CLAVE: El click en la tarjeta o en el botón ahora abre el modal de detalles.
        Eliminamos la lógica de carrito de este componente. 
      */}
      <div className="product-card" onClick={handleDetailsClick}>
        <div className="card-image-container">
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
              <span className="discounted-price">${precioFinal.toFixed(2)}</span>
            )}
          </div>
          
          {/* El botón ahora también llama a handleDetailsClick */}
          <button className="btn-buy" onClick={handleDetailsClick}>
            Ver Detalles
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ComboCard;