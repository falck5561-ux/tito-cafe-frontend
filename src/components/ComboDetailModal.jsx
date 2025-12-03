import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Tag, ChevronRight } from 'lucide-react'; // Iconos extra para estética
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function ComboDetailModal({ combo, onClose }) {
    const context = useCart();
    // Compatibilidad por si tu hook se llama diferente
    const agregarAlCarrito = context.agregarAlCarrito || context.agregarProductoAPedido;

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!combo) return null;

    // --- 1. LÓGICA DE PRECIOS CORRECTA ---
    const precioOriginal = parseFloat(combo.precio);
    const tieneDescuento = (combo.en_oferta || combo.oferta_activa) && combo.descuento_porcentaje > 0;
    
    // Calculamos el precio final REAL
    const precioFinal = tieneDescuento 
        ? precioOriginal * (1 - (combo.descuento_porcentaje / 100)) 
        : precioOriginal;

    const handleAddToOrder = () => {
        if (!agregarAlCarrito) return;

        const itemParaCarrito = {
            ...combo,
            precio: precioFinal, // ¡Importante! Guardamos el precio con descuento
            id: combo.id,
            nombre: combo.nombre || combo.titulo,
            imagen: combo.imagen_url || (combo.imagenes && combo.imagenes[0])
        };

        agregarAlCarrito(itemParaCarrito);

        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <img className="h-10 w-10 rounded-full object-cover" src={itemParaCarrito.imagen} alt="" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">¡Agregado!</p>
                    <p className="mt-1 text-sm text-gray-500">{itemParaCarrito.nombre} añadido por ${precioFinal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
        ));
        onClose();
    };

    // Estilos dinámicos según el tema
    const bgColor = isDark ? '#1e1e1e' : '#ffffff';
    const textColor = isDark ? '#f8f9fa' : '#212529';
    const mutedColor = isDark ? '#adb5bd' : '#6c757d';

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="modal-overlay"
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1050, // Fondo más oscuro para resaltar
                    backdropFilter: 'blur(5px)', // Efecto borroso de fondo
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 30 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="modal-content overflow-hidden shadow-lg"
                    style={{ 
                        maxWidth: '850px', 
                        width: '100%', 
                        backgroundColor: bgColor, 
                        color: textColor,
                        borderRadius: '24px', // Bordes más redondeados
                        display: 'flex', flexDirection: 'column' 
                    }}
                >
                    <div className="row g-0">
                        {/* --- COLUMNA IZQUIERDA: IMAGEN --- */}
                        <div className="col-md-6 position-relative" style={{ minHeight: '350px' }}>
                            <img 
                                src={combo.imagen_url || 'https://via.placeholder.com/600x600'} 
                                alt={combo.nombre} 
                                className="w-100 h-100 object-fit-cover"
                            />
                            {/* Botón Cerrar (Móvil) */}
                            <button 
                                onClick={onClose}
                                className="d-md-none position-absolute top-0 end-0 m-3 btn btn-light rounded-circle shadow-sm p-2"
                                style={{ zIndex: 10 }}
                            >
                                <X size={20} color="#000"/>
                            </button>
                        </div>

                        {/* --- COLUMNA DERECHA: INFORMACIÓN --- */}
                        <div className="col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-between">
                            
                            {/* Header: Título y Botón Cerrar Desktop */}
                            <div>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    {tieneDescuento && (
                                        <span className="badge bg-danger rounded-pill px-3 py-2 mb-2 shadow-sm d-flex align-items-center gap-1">
                                            <Tag size={14} /> -{combo.descuento_porcentaje}% OFF
                                        </span>
                                    )}
                                    <button 
                                        onClick={onClose}
                                        className="d-none d-md-block btn btn-link p-0 text-decoration-none"
                                        style={{ color: mutedColor }}
                                    >
                                        <X size={28} />
                                    </button>
                                </div>

                                <h2 className="fw-bold mb-3 display-6 lh-1">{combo.nombre || combo.titulo}</h2>
                                
                                <p className="lead fs-6 mb-4" style={{ color: mutedColor, lineHeight: '1.6' }}>
                                    {combo.descripcion || 'Una deliciosa combinación seleccionada especialmente para ti.'}
                                </p>
                            </div>

                            {/* Footer: Precios y Botón de Acción */}
                            <div className="mt-4 pt-4 border-top" style={{ borderColor: isDark ? '#333' : '#eee' }}>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="d-flex flex-column">
                                        <small className="text-uppercase fw-bold" style={{ fontSize: '0.75rem', color: mutedColor, letterSpacing: '1px' }}>Precio Total</small>
                                        <div className="d-flex align-items-baseline gap-2">
                                            {/* PRECIO FINAL GRANDE */}
                                            <span className="fw-bold" style={{ fontSize: '2rem', color: isDark ? '#fff' : '#212529' }}>
                                                ${precioFinal.toFixed(2)}
                                            </span>
                                            
                                            {/* PRECIO ORIGINAL TACHADO (Si hay descuento) */}
                                            {tieneDescuento && (
                                                <span className="text-decoration-line-through fs-5" style={{ color: mutedColor }}>
                                                    ${precioOriginal.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAddToOrder}
                                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
                                    style={{ fontSize: '1.1rem', transition: 'transform 0.2s' }}
                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <ShoppingBag size={22} /> 
                                    <span>Agregar al Pedido</span>
                                    <ChevronRight size={20} className="ms-auto opacity-50"/>
                                </button>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ComboDetailModal;