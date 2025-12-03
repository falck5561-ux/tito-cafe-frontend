import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function ComboDetailModal({ combo, onClose }) {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const context = useCart();
    const agregarAlCarrito = context.agregarAlCarrito || context.agregarProductoAPedido;
    const isDark = theme === 'dark';

    if (!combo) return null;

    // --- LÓGICA DE PRECIOS ---
    const precioOriginal = parseFloat(combo.precio || 0);
    const descuentoPorcentaje = parseFloat(combo.descuento_porcentaje || 0);
    const tieneDescuento = (combo.en_oferta || combo.oferta_activa) && descuentoPorcentaje > 0;
    
    const precioFinal = tieneDescuento 
        ? precioOriginal * (1 - (descuentoPorcentaje / 100)) 
        : precioOriginal;

    // --- MANEJAR COMPRA ---
    const handleAddToOrder = () => {
        if (!agregarAlCarrito) return;
        const itemParaCarrito = {
            ...combo,
            precio: precioFinal,
            id: combo.id,
            nombre: combo.nombre || combo.titulo,
            imagen: combo.imagen_url || (combo.imagenes && combo.imagenes[0]),
            tipo: 'combo'
        };
        agregarAlCarrito(itemParaCarrito);
        toast.success(`¡${itemParaCarrito.nombre} agregado!`);
        onClose();
        navigate('/hacer-un-pedido');
    };

    // --- COLORES DINÁMICOS (TITO PIKULITO / MOJADITO) ---
    // Dark Mode: Fondo Gris Oscuro, Texto Blanco, Botón Azul
    // Light Mode: Fondo Blanco, Texto Oscuro, Botón Rojo
    
    const modalBg = isDark ? '#1f1f1f' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#212529';
    const subTextColor = isDark ? '#a0a0a0' : '#6c757d';
    const borderColor = isDark ? '#333333' : '#e9ecef';
    
    // Verde siempre para el precio final (es un estándar visual de oferta)
    // O puedes usar azul en light mode si prefieres: isDark ? '#2ecc71' : '#0d6efd';
    const priceColor = '#2ecc71'; 
    
    // AQUÍ ESTÁ EL CAMBIO QUE PEDISTE:
    const buttonColor = isDark ? '#3498db' : '#dc3545'; // Azul en Dark, Rojo en Light

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="modal-overlay"
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060,
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px'
                }}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="modal-content overflow-hidden shadow-lg"
                    style={{ 
                        maxWidth: '450px', 
                        width: '100%', 
                        backgroundColor: modalBg, 
                        color: textColor,
                        borderRadius: '16px',
                        border: `1px solid ${borderColor}`,
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '85vh'
                    }}
                >
                    {/* --- 1. IMAGEN SUPERIOR --- */}
                    <div style={{ overflowY: 'auto', flexGrow: 1 }}>
                        <div className="position-relative">
                            <img 
                                src={combo.imagen_url || 'https://via.placeholder.com/500x300'} 
                                alt={combo.nombre} 
                                className="w-100 object-fit-cover"
                                style={{ height: '220px', display: 'block' }}
                            />
                            
                            {/* Botón Cerrar (X) */}
                            <button 
                                onClick={onClose}
                                className="position-absolute top-0 end-0 m-3 btn rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                                style={{ 
                                    width: '30px', 
                                    height: '30px', 
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)', 
                                    border: 'none', 
                                    color: isDark ? '#fff' : '#000' 
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* --- 2. CUERPO DEL MODAL --- */}
                        <div className="p-4">
                            <h3 className="fw-bold mb-2" style={{ color: textColor }}>{combo.nombre || combo.titulo}</h3>
                            
                            {/* Descripción */}
                            <p className="small mb-3" style={{ lineHeight: '1.5', color: subTextColor }}>
                                {combo.descripcion || 'Combo especial de la casa.'}
                            </p>
                        </div>
                    </div>

                    {/* --- 3. FOOTER FIJO --- */}
                    <div className="p-3 border-top" style={{ backgroundColor: isDark ? '#252525' : '#f8f9fa', borderColor: borderColor }}>
                        <div className="d-flex align-items-center justify-content-between">
                            
                            {/* Precio a la izquierda */}
                            <div className="d-flex flex-column lh-1">
                                {tieneDescuento && (
                                    <small className="text-decoration-line-through mb-1" style={{ fontSize: '0.8rem', color: subTextColor }}>
                                        ${precioOriginal.toFixed(2)}
                                    </small>
                                )}
                                <span className="fw-bold fs-3" style={{ color: priceColor }}>
                                    ${precioFinal.toFixed(2)}
                                </span>
                            </div>

                            {/* Botón "Hacer Pedido" a la derecha */}
                            <button 
                                onClick={handleAddToOrder}
                                className="btn rounded-pill px-4 py-2 fw-bold text-white shadow-sm"
                                style={{ 
                                    backgroundColor: buttonColor,
                                    border: 'none',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Hacer Pedido
                            </button>
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ComboDetailModal;