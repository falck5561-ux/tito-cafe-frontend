import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react'; 
import { useTheme } from '../context/ThemeContext';

function ComboCard({ combo, onClick }) { 
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- LÓGICA DE PRECIOS ---
  const precioOriginal = parseFloat(combo.precio || 0);
  const descuentoPorcentaje = parseFloat(combo.descuento_porcentaje || 0);
  const tieneDescuento = (combo.en_oferta || combo.oferta_activa) && descuentoPorcentaje > 0;
  
  const precioMostrar = tieneDescuento 
      ? precioOriginal * (1 - (descuentoPorcentaje / 100)) 
      : precioOriginal;

  const imageUrl = combo.imagen_url || `https://placehold.co/400x300/${isDark ? '1a1a1a' : 'f0f0f0'}/${isDark ? 'ffffff' : '000000'}?text=${combo.nombre}`;

  // --- COLORES CORREGIDOS ---
  // Azul más fuerte (Royal Blue) para que resalte
  const strongBlue = '#0055ff'; 
  const strongRed = '#ff3333';

  // En Dark mode usamos el Azul Fuerte, en Light el Rojo (o inviértelo si prefieres)
  const cardBorderColor = isDark ? strongBlue : strongRed; 
  
  const glowEffect = isDark 
      ? `0 0 15px ${strongBlue}40` // Brillo azulado
      : `0 0 10px ${strongRed}40`; // Brillo rojizo
  
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#212529';
  const priceColor = '#00e676'; // Verde Neón para el precio

  return (
    <motion.div 
      className="col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }} 
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
            border: `2px solid ${cardBorderColor}`,
            boxShadow: glowEffect,
            position: 'relative' // Necesario para posicionar el círculo
        }}
      >
        {/* --- IMAGEN --- */}
        <div className="overflow-hidden" style={{ height: '200px' }}>
            <motion.img 
                src={imageUrl} 
                alt={combo.nombre} 
                className="w-100 h-100 object-fit-cover"
                whileHover={{ scale: 1.1 }} 
                transition={{ duration: 0.5 }}
            />
        </div>

        {/* --- BADGE CIRCULAR (¡CORREGIDO!) --- */}
        {tieneDescuento && (
            <div 
                className="position-absolute shadow d-flex align-items-center justify-content-center fw-bold text-white"
                style={{ 
                    top: '15px',
                    right: '15px',
                    width: '50px',   // Ancho fijo
                    height: '50px',  // Alto igual al ancho para hacerlo circular
                    borderRadius: '50%', // Esto lo hace un círculo perfecto
                    fontSize: '0.9rem', 
                    backgroundColor: cardBorderColor, // Usa el mismo color fuerte del borde
                    zIndex: 10,
                    lineHeight: 1
                }}
            >
                -{descuentoPorcentaje.toFixed(0)}%
            </div>
        )}

        {/* --- CUERPO --- */}
        <div className="card-body d-flex flex-column p-3">
            <h5 className="card-title fw-bold text-center mb-3 text-truncate" style={{ fontSize: '1.2rem' }}>
                {combo.nombre || 'Combo Especial'}
            </h5>
            
            {/* --- FOOTER --- */}
            <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                
                {/* Precios */}
                <div className="d-flex flex-column lh-1">
                    {tieneDescuento && (
                        <small className="text-decoration-line-through opacity-50 mb-1" style={{ fontSize: '0.75rem' }}>
                            ${precioOriginal.toFixed(2)}
                        </small>
                    )}
                    <span className="fw-bold fs-5" style={{ color: priceColor }}> 
                        ${precioMostrar.toFixed(2)}
                    </span>
                </div>

                {/* Botón Ver */}
                <button 
                    className="btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                    style={{ 
                        backgroundColor: cardBorderColor, 
                        color: '#fff', 
                        border: 'none',
                        boxShadow: `0 4px 10px ${cardBorderColor}60` // Sombra del color del botón
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