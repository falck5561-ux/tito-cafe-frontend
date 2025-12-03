import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Tag, ArrowRight } from 'lucide-react'; 
import { useTheme } from '../context/ThemeContext'; // Importamos el hook de tema

function ComboCard({ combo, onClick }) { 
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- LÓGICA DE PRECIOS ---
  const precioOriginal = parseFloat(combo.precio || 0);
  // Si hay descuento calculado o directo
  const descuentoPorcentaje = parseFloat(combo.descuento_porcentaje || 0);
  const tieneDescuento = (combo.en_oferta || combo.oferta_activa) && descuentoPorcentaje > 0;
  
  const precioMostrar = tieneDescuento 
      ? precioOriginal * (1 - (descuentoPorcentaje / 100)) 
      : precioOriginal;

  const imageUrl = combo.imagen_url || `https://placehold.co/400x300/${isDark ? '1a1a1a' : 'f0f0f0'}/${isDark ? 'ffffff' : '000000'}?text=${combo.nombre}`;

  // --- ESTILOS DINÁMICOS (ROJO vs AZUL) ---
  // Modo Dark (Picante) -> Rojo
  // Modo Light (Fresco) -> Azul
  const cardBorderColor = isDark ? '#ff4d4d' : '#00bfff'; 
  const glowEffect = isDark 
      ? '0 0 15px rgba(255, 77, 77, 0.4)' // Brillo Rojo
      : '0 0 15px rgba(0, 191, 255, 0.4)'; // Brillo Azul
  
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#212529';

  return (
    <motion.div 
      className="col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }} // Efecto "Pop" al pasar el mouse
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div 
        className="card h-100 border-0 overflow-hidden" 
        onClick={() => onClick(combo)} 
        style={{ 
            cursor: 'pointer', 
            backgroundColor: bgColor, 
            color: textColor,
            borderRadius: '20px',
            // AQUÍ ESTÁ EL BORDE DE COLOR Y EL BRILLO QUE PEDISTE
            border: `2px solid ${cardBorderColor}`,
            boxShadow: glowEffect
        }}
      >
        {/* --- IMAGEN --- */}
        <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
            <motion.img 
                src={imageUrl} 
                alt={combo.nombre} 
                className="w-100 h-100 object-fit-cover"
                whileHover={{ scale: 1.1 }} // Zoom interno
                transition={{ duration: 0.5 }}
            />
            
            {/* Badge de Descuento */}
            {tieneDescuento && (
                <div 
                    className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded-3 fw-bold shadow-sm d-flex align-items-center gap-1"
                    style={{ 
                        fontSize: '0.8rem', 
                        backgroundColor: cardBorderColor, // El badge combina con el borde
                        color: '#fff'
                    }}
                >
                    <Tag size={12} /> -{descuentoPorcentaje.toFixed(0)}%
                </div>
            )}
        </div>

        {/* --- CUERPO (SIN DESCRIPCIÓN) --- */}
        <div className="card-body d-flex flex-column p-3">
            {/* Título Centrado y Grande */}
            <h5 className="card-title fw-bold text-center mb-3 text-truncate" style={{ fontSize: '1.2rem' }}>
                {combo.nombre || 'Combo Especial'}
            </h5>
            
            {/* La descripción ha sido ELIMINADA de aquí como pediste */}
            
            {/* --- FOOTER: PRECIO Y BOTÓN --- */}
            <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                
                {/* Precios */}
                <div className="d-flex flex-column lh-1">
                    {tieneDescuento && (
                        <small className="text-decoration-line-through opacity-50 mb-1" style={{ fontSize: '0.75rem' }}>
                            ${precioOriginal.toFixed(2)}
                        </small>
                    )}
                    <span className="fw-bold fs-5" style={{ color: cardBorderColor }}> 
                        ${precioMostrar.toFixed(2)}
                    </span>
                </div>

                {/* Botón Pequeño "Ver" */}
                <button 
                    className="btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                    style={{ 
                        backgroundColor: cardBorderColor, 
                        color: '#fff', 
                        border: 'none',
                        boxShadow: `0 4px 6px -1px ${isDark ? 'rgba(255,77,77,0.3)' : 'rgba(0,191,255,0.3)'}`
                    }}
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