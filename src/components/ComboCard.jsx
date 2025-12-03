import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Tag, ArrowRight } from 'lucide-react'; 

function ComboCard({ combo, onClick }) { 

  // --- LÓGICA DE PRECIOS ---
  const precioOriginal = parseFloat(combo.precio || 0);
  const precioFinal = parseFloat(combo.precio_final || precioOriginal);
  // Calculamos descuento si viene del backend o lo deducimos
  const descuentoPorcentaje = combo.descuento_porcentaje || 0;
  const tieneDescuento = (combo.en_oferta || combo.oferta_activa) && descuentoPorcentaje > 0;
  
  // Si hay descuento, recalculamos el precio final visual
  const precioMostrar = tieneDescuento 
      ? precioOriginal * (1 - (descuentoPorcentaje / 100)) 
      : precioOriginal;

  const imageUrl = combo.imagen_url || `https://placehold.co/400x300/1a1a1a/ffffff?text=${combo.nombre}`;

  return (
    <motion.div 
      className="col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }} // Efecto de flotar al pasar el mouse
      transition={{ duration: 0.3 }}
    >
      <div 
        className="card h-100 shadow-lg border-0 overflow-hidden" 
        onClick={() => onClick(combo)} 
        style={{ 
            cursor: 'pointer', 
            backgroundColor: '#1e1e1e', // Fondo oscuro Tito Spot
            borderRadius: '16px',
            color: '#fff'
        }}
      >
        {/* --- IMAGEN --- */}
        <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
            <motion.img 
                src={imageUrl} 
                alt={combo.nombre} 
                className="w-100 h-100 object-fit-cover"
                whileHover={{ scale: 1.05 }} // Zoom suave en la imagen
                transition={{ duration: 0.4 }}
            />
            
            {/* Badge de Descuento */}
            {tieneDescuento && (
                <div className="position-absolute top-0 end-0 m-3 badge bg-primary shadow-sm px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-1">
                    <Tag size={12} /> -{descuentoPorcentaje}%
                </div>
            )}

            {/* Overlay sutil oscuro abajo para que el texto resalte si decides poner texto encima */}
            <div className="position-absolute bottom-0 start-0 w-100" 
                 style={{ height: '40px', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
            </div>
        </div>

        {/* --- CUERPO DE LA CARTA --- */}
        <div className="card-body d-flex flex-column p-4">
            {/* Título */}
            <h5 className="card-title fw-bold mb-2 text-truncate" style={{ fontSize: '1.1rem' }}>
                {combo.nombre || 'Combo Especial'}
            </h5>
            
            {/* Descripción corta (opcional, si existe) */}
            <p className="card-text text-secondary small mb-4 flex-grow-1" style={{ lineHeight: '1.4', fontSize: '0.85rem' }}>
                {combo.descripcion ? 
                    (combo.descripcion.length > 50 ? combo.descripcion.substring(0, 50) + '...' : combo.descripcion) 
                    : 'Deliciosa combinación preparada para ti.'}
            </p>
            
            {/* --- FOOTER: PRECIO Y BOTÓN --- */}
            <div className="d-flex align-items-end justify-content-between mt-auto pt-3 border-top border-secondary border-opacity-25">
                
                {/* Sección de Precio */}
                <div className="d-flex flex-column">
                    {tieneDescuento && (
                        <small className="text-decoration-line-through text-secondary" style={{ fontSize: '0.75rem' }}>
                            ${precioOriginal.toFixed(2)}
                        </small>
                    )}
                    <span className="fw-bold fs-4" style={{ color: '#00e676' }}> {/* Verde estilo Matrix/Neon */}
                        ${precioMostrar.toFixed(2)}
                    </span>
                </div>

                {/* Botón visual (solo estético, toda la carta es clickeable) */}
                <button 
                    className="btn btn-sm btn-outline-light rounded-pill px-3 d-flex align-items-center gap-1"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                >
                    Ver <ArrowRight size={14} />
                </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ComboCard;