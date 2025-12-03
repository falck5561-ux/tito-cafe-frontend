import React from 'react'; // Eliminé useContext porque ya no se usa directamente
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, CheckCircle } from 'lucide-react';
// 1. CAMBIO IMPORTANTE: Importamos el hook useCart en lugar del Contexto crudo
import { useCart } from '../context/CartContext'; 
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function ComboDetailModal({ combo, onClose }) {
    // 2. CAMBIO IMPORTANTE: Usamos el hook useCart()
    // NOTA: Si tu función se llama 'agregarProductoAPedido' en lugar de 'agregarAlCarrito',
    // cambia el nombre aquí abajo. He puesto ambas por seguridad.
    const context = useCart();
    
    // Detectamos cuál nombre usa tu contexto (algunos usan agregarAlCarrito, otros agregarProductoAPedido)
    const agregarAlCarrito = context.agregarAlCarrito || context.agregarProductoAPedido;

    const { theme } = useTheme();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    if (!combo) return null;

    const handleAddToOrder = () => {
        if (!agregarAlCarrito) {
            console.error("Error: No se encontró la función para agregar al carrito en useCart()");
            toast.error("Error interno al agregar al carrito");
            return;
        }

        // Preparamos el objeto tal como lo espera el carrito
        // Aseguramos que tenga precio_final calculado si es oferta
        const precioOriginal = parseFloat(combo.precio);
        const esOferta = combo.en_oferta || combo.oferta_activa;
        const precioFinal = esOferta 
            ? precioOriginal * (1 - (combo.descuento_porcentaje || 0) / 100) 
            : precioOriginal;

        const itemParaCarrito = {
            ...combo,
            precio: precioFinal,
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
                    <img className="h-10 w-10 rounded-full object-cover" src={combo.imagen_url} alt="" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">¡Combo Agregado!</p>
                    <p className="mt-1 text-sm text-gray-500">{combo.nombre} se añadió a tu pedido.</p>
                  </div>
                </div>
              </div>
            </div>
        ));
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="modal-overlay"
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 50 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`modal-content rounded-4 overflow-hidden shadow-lg ${isDark ? 'bg-dark text-white' : 'bg-white text-dark'}`}
                    style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                >
                    <div className="position-relative h-100 d-flex flex-column flex-lg-row">
                        {/* Botón Cerrar */}
                        <button 
                            onClick={onClose}
                            className="btn btn-link position-absolute top-0 end-0 m-3 p-2 text-white bg-dark bg-opacity-50 rounded-circle"
                            style={{ zIndex: 10, textDecoration: 'none' }}
                        >
                            <X size={24} />
                        </button>

                        {/* Imagen (Izquierda) */}
                        <div className="col-lg-6 p-0 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                            <img 
                                src={combo.imagen_url || 'https://via.placeholder.com/400'} 
                                alt={combo.nombre} 
                                className="w-100 h-100 object-fit-cover"
                            />
                        </div>

                        {/* Info (Derecha) */}
                        <div className="col-lg-6 p-4 d-flex flex-column">
                            <div className="mb-auto">
                                <h2 className="fw-bold mb-3 display-6">{combo.nombre}</h2>
                                <p className={`lead ${isDark ? 'text-white-50' : 'text-muted'}`}>
                                    {combo.descripcion || 'Sin descripción detallada.'}
                                </p>
                                
                                {combo.en_oferta && (
                                    <div className="alert alert-success d-inline-flex align-items-center py-2 px-3 rounded-pill mt-2">
                                        <CheckCircle size={16} className="me-2"/> ¡Oferta Especial activa!
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 border-top pt-4">
                                <div className="d-flex justify-content-between align-items-end mb-3">
                                    <div>
                                        <small className="text-muted text-uppercase fw-bold">Precio Total</small>
                                        <div className="d-flex align-items-baseline gap-2">
                                            <span className="fs-1 fw-bold text-primary">${parseFloat(combo.precio).toFixed(2)}</span>
                                            {combo.precio_antes && (
                                                <span className="text-decoration-line-through text-muted fs-5">
                                                    ${parseFloat(combo.precio_antes).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAddToOrder}
                                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 transform-active"
                                >
                                    <ShoppingBag size={20} /> Agregar al Pedido
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