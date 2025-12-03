import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Tag, ChevronRight, Star } from 'lucide-react';
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
    const navigate = useNavigate();

    if (!combo) return null;

    // --- 1. LÓGICA DE PRECIOS Y DESCUENTOS ---
    const precioOriginal = parseFloat(combo.precio);
    const descuentoPorcentaje = parseFloat(combo.descuento_porcentaje || 0);
    // Verificamos si realmente tiene descuento activo
    const tieneDescuento = (combo.en_oferta || combo.oferta_activa) && descuentoPorcentaje > 0;
    
    // Calculamos el precio final matemático
    const precioFinal = tieneDescuento 
        ? precioOriginal * (1 - (descuentoPorcentaje / 100)) 
        : precioOriginal;

    // --- 2. FUNCIÓN DE AGREGAR Y REDIRIGIR ---
    const handleAddToOrder = () => {
        if (!agregarAlCarrito) return;

        const itemParaCarrito = {
            ...combo,
            precio: precioFinal, // Guardamos el precio ya rebajado
            precio_regular: precioOriginal, // Guardamos referencia del original
            id: combo.id,
            nombre: combo.nombre || combo.titulo,
            imagen: combo.imagen_url || (combo.imagenes && combo.imagenes[0]),
            tipo: 'combo'
        };

        agregarAlCarrito(itemParaCarrito);
        
        // Notificación rápida
        toast.success(`¡${itemParaCarrito.nombre} agregado!`);
        
        // Cerrar modal
        onClose();

        // --- 3. REDIRECCIÓN (LO QUE FALTABA) ---
        // Te lleva a la pantalla de pedido inmediatamente
        navigate('/hacer-un-pedido');
    };

    // --- ESTILOS VISUALES ---
    // Colores basados en el tema para que no se vea "parche"
    const bgColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#f8f9fa' : '#212529';
    const subTextColor = isDark ? '#a0a0a0' : '#6c757d';
    const cardBorder = isDark ? '1px solid #333' : '1px solid #eee';

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="modal-overlay"
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050,
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 50 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="modal-content shadow-lg"
                    style={{ 
                        maxWidth: '900px', 
                        width: '100%', 
                        backgroundColor: bgColor, 
                        color: textColor,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: cardBorder
                    }}
                >
                    <div className="row g-0">
                        {/* --- COLUMNA IZQUIERDA: IMAGEN GRANDE --- */}
                        <div className="col-lg-6 position-relative bg-black" style={{ minHeight: '350px' }}>
                            <img 
                                src={combo.imagen_url || 'https://via.placeholder.com/600x600?text=Combo'} 
                                alt={combo.nombre} 
                                className="w-100 h-100 object-fit-cover opacity-90"
                            />
                            
                            {/* Overlay degradado para que se vea premium */}
                            <div className="position-absolute bottom-0 start-0 w-100 p-3" 
                                 style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                            </div>

                            {/* Badge de Descuento (Estilo Tito Spot) */}
                            {tieneDescuento && (
                                <div className="position-absolute top-0 start-0 m-3 px-3 py-1 bg-danger text-white rounded-pill fw-bold shadow d-flex align-items-center gap-1">
                                    <Tag size={16} fill="white" /> -{descuentoPorcentaje.toFixed(0)}%
                                </div>
                            )}

                            {/* Botón Cerrar Flotante (Móvil) */}
                            <button onClick={onClose} className="d-lg-none position-absolute top-0 end-0 m-3 btn btn-light rounded-circle shadow p-2">
                                <X size={20} />
                            </button>
                        </div>

                        {/* --- COLUMNA DERECHA: DATOS --- */}
                        <div className="col-lg-6 p-4 p-lg-5 d-flex flex-column">
                            
                            {/* Header Desktop */}
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="d-flex align-items-center gap-2 mb-2 text-warning">
                                    <Star size={18} fill="currentColor" />
                                    <small className="fw-bold text-uppercase ls-1">Combo Especial</small>
                                </div>
                                <button onClick={onClose} className="d-none d-lg-block btn btn-link text-muted p-0">
                                    <X size={28} />
                                </button>
                            </div>

                            <h2 className="fw-bold display-6 mb-3">{combo.nombre || combo.titulo}</h2>
                            
                            <p className="lead fs-6 mb-4 flex-grow-1" style={{ color: subTextColor, lineHeight: '1.6' }}>
                                {combo.descripcion || 'Disfruta de esta increíble combinación de sabores preparada especialmente para ti.'}
                            </p>

                            {/* Sección de Precio */}
                            <div className="mt-auto pt-4 border-top" style={{ borderColor: isDark ? '#333' : '#eee' }}>
                                <div className="d-flex align-items-end justify-content-between mb-4">
                                    <div>
                                        <small className="text-uppercase fw-bold" style={{ fontSize: '0.7rem', color: subTextColor }}>Precio Final</small>
                                        <div className="d-flex align-items-baseline gap-3">
                                            {/* PRECIO FINAL */}
                                            <span className="fw-bold display-5 text-primary">
                                                ${precioFinal.toFixed(2)}
                                            </span>
                                            
                                            {/* PRECIO ORIGINAL (TACHADO) */}
                                            {tieneDescuento && (
                                                <div className="d-flex flex-column justify-content-center">
                                                    <span className="text-decoration-line-through fs-5" style={{ color: subTextColor }}>
                                                        ${precioOriginal.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Botón de Acción Grande */}
                                <button 
                                    onClick={handleAddToOrder}
                                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 transform-active"
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    <ShoppingBag size={22} /> 
                                    Agregar al Pedido
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