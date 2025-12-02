import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useTheme } from '../context/ThemeContext'; 
import CheckoutForm from '../components/CheckoutForm';
import MapSelector from '../components/MapSelector';
import apiClient from '../services/api';
import { useCart } from '../context/CartContext';
import ProductDetailModal from '../components/ProductDetailModal';
import { 
    ShoppingCart, 
    ListChecks, 
    Award, 
    Edit3, 
    MapPin, 
    DollarSign, 
    Clock, 
    Package, 
    CheckCircle, 
    ChefHat, 
    Truck, 
    Utensils, 
    Gift, 
    Star,
    ArrowLeft,
    ChevronRight,
    X,
    Ticket,
    Phone 
} from 'lucide-react'; 

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const notify = (type, message, toastId = null) => {
    // Si pasamos un ID, le decimos a la librería que no duplique el mensaje
    const options = toastId ? { id: toastId } : {};

    switch (type) {
        case 'success': 
            toast.success(message, options); 
            break;
        case 'error': 
            toast.error(message, options); 
            break;
        default: 
            toast(message, options); 
            break;
    }
};

// ==========================================
// COMPONENTE INTERNO: CONTENIDO DEL CARRITO
// ==========================================
const CarritoContent = ({
    isModal,
    pedidoActual,
    decrementarCantidad,
    incrementarCantidad,
    eliminarProducto,
    tipoOrden,
    setTipoOrden,
    direccionGuardada,
    usarDireccionGuardada,
    handleLocationSelect,
    direccion,
    referencia,
    setReferencia,
    telefono, 
    setTelefono, 
    guardarDireccion,
    setGuardarDireccion,
    subtotal,
    costoEnvio,
    calculandoEnvio,
    totalFinal,
    handleProcederAlPago,
    paymentLoading,
    limpiarPedidoCompleto,
    isDark,
    viewState,
    setViewState,
    closeModal 
}) => {

    // --- SCROLL: REFERENCIA PARA EL SCROLL AUTOMÁTICO ---
    const contentRef = React.useRef(null);
    
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [viewState]);

    // --- VARIABLES DE ESTILO DINÁMICO (ROJO vs AZUL) ---
    const accentColor = isDark ? 'text-blue-500' : 'text-red-600';
    const accentBg = isDark ? 'bg-blue-500' : 'bg-red-600';
    
    const btnGradient = isDark 
        ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' // Azul
        : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'; // Rojo

    const irASiguiente = () => {
        if (tipoOrden === 'domicilio') {
            setViewState('address');
        } else {
            handleProcederAlPago();
        }
    };

    const volverAlCarrito = () => {
        setViewState('cart');
    };

    const glassHeader = isDark 
        ? "bg-black/40 backdrop-blur-md border-b border-white/10" 
        : "bg-white/60 backdrop-blur-md border-b border-gray-200";
      
    const glassFooter = isDark 
        ? "bg-black/40 backdrop-blur-md border-t border-white/10" 
        : "bg-white/80 backdrop-blur-md border-t border-gray-200";

    const cardSelectable = (selected) => `
        cursor-pointer rounded-3xl border p-3 transition-all duration-200 flex items-center gap-3 relative overflow-hidden
        ${selected 
            ? (isDark 
                ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'border-red-600 bg-red-50 text-red-900 shadow-sm')
            : (isDark 
                ? 'border-white/10 hover:border-white/30 bg-white/5' 
                : 'border-gray-200 hover:border-gray-300 bg-white')
        }
    `;

    return (
        <div className="d-flex flex-column h-100 position-relative overflow-hidden"> 
              
            {/* 1. HEADER DEL CARRITO */}
            <div className={`flex-shrink-0 px-4 py-3 ${glassHeader} z-10 d-flex align-items-center justify-content-between`}>
                {viewState === 'cart' ? (
                    <>
                        <h5 className={`m-0 fw-bold d-flex align-items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <ShoppingCart size={20} className={accentColor}/> 
                            {isModal ? 'Tu Pedido' : 'Mi Pedido'}
                        </h5>
                        {isModal && (
                            <button 
                                onClick={closeModal}
                                className={`btn btn-sm p-1 rounded-circle ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-800'}`}
                            >
                                <X size={20} />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="d-flex align-items-center w-100">
                        <button 
                            onClick={volverAlCarrito} 
                            className={`btn btn-link p-0 me-3 ${isDark ? 'text-white/70 hover:text-white' : 'text-red-600 hover:text-red-800'}`} 
                            style={{textDecoration: 'none'}}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h5 className={`m-0 fw-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Ubicación de Entrega
                        </h5>
                    </div>
                )}
            </div>

            {/* 2. BODY DEL CARRITO (CON REFERENCIA DE SCROLL) */}
            <div 
                ref={contentRef}
                className="flex-grow-1 overflow-auto custom-scrollbar px-4 py-3" 
                style={{ minHeight: 0 }}
            >
                <AnimatePresence mode="wait">
                      
                    {viewState === 'cart' ? (
                        <motion.div 
                            key="cart-view"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="d-flex flex-column gap-3 mb-4">
                                {pedidoActual.length === 0 && (
                                    <div className={`text-center py-5 opacity-50 ${isDark ? 'text-white' : 'text-gray-500'}`}>
                                        <ShoppingCart size={48} className="mb-2 mx-auto"/>
                                        <p>Tu carrito está vacío</p>
                                    </div>
                                )}
                                
                                {pedidoActual.map((item) => (
                                    <div key={item.cartItemId || item.id} className={`d-flex align-items-center p-3 rounded-3xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                                        <div className="flex-grow-1">
                                            <span className={`fw-bold d-block ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.nombre}</span>
                                            {item.opcionesSeleccionadas && item.opcionesSeleccionadas.length > 0 && (
                                                <small className={`${isDark ? 'text-blue-300' : 'text-gray-500'} d-block mb-1`}>
                                                    {item.opcionesSeleccionadas.map(op => op.nombre).join(', ')}
                                                </small>
                                            )}
                                            <div className={`fw-bold ${accentColor}`}>
                                                ${(item.cantidad * Number(item.precio)).toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="d-flex flex-column align-items-end gap-2">
                                            <div className={`d-flex align-items-center rounded-pill px-1 py-1 ${isDark ? 'bg-black/30 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                                                <button 
                                                    className="btn btn-sm p-1 rounded-circle hover-bg-primary d-flex align-items-center justify-content-center" 
                                                    style={{width: '28px', height: '28px'}} 
                                                    onClick={() => decrementarCantidad(item.cartItemId || item.id)} 
                                                    disabled={paymentLoading}
                                                >
                                                    <span className={isDark ? 'text-white' : 'text-black'}>-</span>
                                                </button>
                                                <span className={`mx-2 fw-bold small ${isDark ? 'text-white' : 'text-black'}`}>
                                                    {item.cantidad}
                                                </span>
                                                <button 
                                                    className="btn btn-sm p-1 rounded-circle hover-bg-primary d-flex align-items-center justify-content-center" 
                                                    style={{width: '28px', height: '28px'}} 
                                                    onClick={() => incrementarCantidad(item.cartItemId || item.id)} 
                                                    disabled={paymentLoading}
                                                >
                                                    <span className={isDark ? 'text-white' : 'text-black'}>+</span>
                                                </button>
                                            </div>
                                            <button 
                                                className="btn btn-link p-0 text-danger text-decoration-none small" 
                                                style={{fontSize: '0.8rem'}} 
                                                onClick={() => eliminarProducto(item.cartItemId || item.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {pedidoActual.length > 0 && (
                                <div className="mb-4">
                                    <h6 className={`fw-bold mb-3 small text-uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`} style={{letterSpacing: '1px'}}>
                                        Método de Entrega
                                    </h6>
                                    
                                    <div className="d-flex flex-column gap-2">
                                        {[
                                            { id: 'llevar', label: 'Para Recoger', sub: 'Pasa por él al local', icon: <Package size={20}/> },
                                            { id: 'local', label: 'Comer Aquí', sub: 'Te lo llevamos a tu mesa', icon: <ChefHat size={20}/> },
                                            { id: 'domicilio', label: 'A Domicilio', sub: 'Envío hasta tu puerta', icon: <Truck size={20}/> }
                                        ].map(opt => (
                                            <div 
                                                key={opt.id} 
                                                className={cardSelectable(tipoOrden === opt.id)}
                                                onClick={() => setTipoOrden(opt.id)}
                                            >
                                                <div 
                                                    className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${
                                                         tipoOrden === opt.id 
                                                            ? `${accentBg} !text-white`
                                                            : (isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-600')
                                                    }`} 
                                                    style={{width: '40px', height: '40px'}}
                                                >
                                                    {opt.icon}
                                                </div>
                                                <div>
                                                    <div className={`fw-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{opt.label}</div>
                                                    <div className={`small ${isDark ? 'text-gray-400' : 'text-gray-500'}`} style={{fontSize: '0.8rem'}}>{opt.sub}</div>
                                                </div>
                                                {tipoOrden === opt.id && (
                                                    <div className="ms-auto">
                                                        <CheckCircle size={20} className={`${accentColor} fill-current`}/>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="address-view"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {direccionGuardada && (
                                <button 
                                    className={`btn w-100 mb-3 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 border-2 fw-semibold ${isDark ? 'btn-outline-primary' : 'btn-outline-danger'}`} 
                                    onClick={usarDireccionGuardada}
                                >
                                    <MapPin size={16}/> Usar dirección y número guardados
                                </button>
                            )}
                            
                            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-md mb-3" style={{ height: '300px', borderRadius: '24px' }}> 
                                <MapSelector 
                                    onLocationSelect={handleLocationSelect} 
                                    initialAddress={direccion} 
                                    className="w-100 h-100"
                                />
                            </div>
                            
                            {/* CAMPO REFERENCIA */}
                            <div className="form-group mb-3">
                                <label className={`form-label small fw-bold ms-1 ${isDark ? 'text-gray-300' : 'text-red-700'}`}>
                                    Referencia de entrega
                                </label>
                                <div className={`d-flex align-items-center px-3 py-3 rounded-3xl border transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-white border-gray-200 focus-within:border-red-500'}`} style={{ borderRadius: '24px' }}>
                                    <MapPin size={18} className={`${isDark ? 'opacity-50' : 'text-red-500'} me-2`}/>
                                    <input 
                                        type="text" 
                                        className="bg-transparent border-0 w-100 outline-none shadow-none"
                                        style={{ color: isDark ? 'white' : 'black', outline: 'none' }}
                                        placeholder="Ej: Portón negro, casa de dos pisos..." 
                                        value={referencia} 
                                        onChange={(e) => setReferencia(e.target.value)} 
                                    />
                                </div>
                            </div>

                            {/* --- CAMPO: TELÉFONO --- */}
                            <div className="form-group mb-3">
                                <label className={`form-label small fw-bold ms-1 ${isDark ? 'text-gray-300' : 'text-red-700'}`}>
                                    Número de Contacto
                                </label>
                                <div className={`d-flex align-items-center px-3 py-3 rounded-3xl border transition-all ${isDark ? 'bg-black/20 border-white/10' : 'bg-white border-gray-200 focus-within:border-red-500'}`} style={{ borderRadius: '24px' }}>
                                    <Phone size={18} className={`${isDark ? 'opacity-50' : 'text-red-500'} me-2`}/>
                                    <input 
                                        type="tel" 
                                        className="bg-transparent border-0 w-100 outline-none shadow-none"
                                        style={{ color: isDark ? 'white' : 'black', outline: 'none' }}
                                        placeholder="Ej: 55 1234 5678" 
                                        value={telefono} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            setTelefono(val);
                                        }} 
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                            
                            {/* Checkbox de Guardado */}
                            <div className="d-flex align-items-center gap-2 p-3 rounded-3xl bg-opacity-10" style={{backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '20px'}}>
                                <input 
                                    className="form-check-input mt-0" 
                                    type="checkbox" 
                                    id="guardarDireccionCheck" 
                                    checked={guardarDireccion} 
                                    onChange={(e) => setGuardarDireccion(e.target.checked)} 
                                />
                                <label className={`form-check-label small cursor-pointer ${isDark ? 'text-white' : 'text-gray-800'}`} htmlFor="guardarDireccionCheck">
                                    Guardar esta dirección y número para futuros pedidos
                                </label>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. FOOTER FLOTANTE MEJORADO */}
            <div className={`flex-shrink-0 px-4 py-3 ${glassFooter} z-10`}>
                
                {/* Barra de Progreso para Envío Gratis */}
                {tipoOrden === 'domicilio' && subtotal > 0 && subtotal < 150 && (
                    <div className="mb-3 animate-fade-in">
                        <div className="d-flex justify-content-between align-items-center small mb-1">
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Faltan <span className="fw-bold text-success">${(150 - subtotal).toFixed(2)}</span> para envío gratis
                            </span>
                            <span className="text-muted fw-bold" style={{fontSize: '0.7rem'}}>{Math.round((subtotal/150)*100)}%</span>
                        </div>
                        <div className="progress" style={{height: '6px', backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e9ecef', borderRadius: '4px'}}>
                            <div 
                                className="progress-bar bg-success" 
                                role="progressbar" 
                                style={{
                                    width: `${(subtotal/150)*100}%`, 
                                    transition: 'width 0.5s ease-in-out',
                                    borderRadius: '4px'
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Totales */}
                <div className="d-flex justify-content-between align-items-end mb-3">
                    <span className={`small fw-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total a Pagar</span>
                    <div className="text-end">
                        {tipoOrden === 'domicilio' && (
                               <div className={`small mb-1 fw-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Envío: {calculandoEnvio ? (
                                        <span className="spinner-border spinner-border-sm"/> 
                                    ) : (
                                        subtotal >= 150 ? (
                                            <span className="text-success fw-bold animate-bounce-in">
                                                ¡GRATIS! <span className="text-decoration-line-through text-muted opacity-50 ms-1 small" style={{fontSize: '0.75em'}}>${costoEnvio.toFixed(2)}</span>
                                            </span>
                                        ) : (
                                            <span className={isDark ? 'text-white' : 'text-gray-900'}>+${costoEnvio.toFixed(2)}</span>
                                        )
                                    )}
                               </div>
                        )}
                        <span className={`h4 fw-bold m-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {/* Calculamos el total visualmente aquí para que coincida con la lógica de envío gratis */}
                            ${(subtotal + (tipoOrden === 'domicilio' && subtotal >= 150 ? 0 : (tipoOrden === 'domicilio' ? costoEnvio : 0))).toFixed(2)}
                        </span>
                    </div>
                </div>
                
                {/* Botón de Acción */}
                <div className="d-grid gap-2">
                    <button
                        className="btn btn-lg border-0 rounded-pill fw-bold text-white shadow-lg d-flex justify-content-center align-items-center gap-2 position-relative overflow-hidden"
                        style={{ background: btnGradient }}
                        onClick={viewState === 'cart' ? irASiguiente : handleProcederAlPago}
                        disabled={
                            pedidoActual.length === 0 || 
                            paymentLoading || 
                            (viewState === 'address' && (!direccion || !telefono || telefono.length < 10)) || 
                            calculandoEnvio
                        }
                    >
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-10" style={{ transform: 'skewX(-20deg) translateX(-150%)', animation: 'shine 3s infinite' }}></div>
                        
                        {paymentLoading ? (
                            <>Procesando...</>
                        ) : (
                            <>
                                {viewState === 'cart' && tipoOrden === 'domicilio' ? 'Siguiente Paso' : 'Confirmar y Pagar'}
                                <ChevronRight size={20}/>
                            </>
                        )}
                    </button>
                    
                    {viewState === 'cart' && (
                        <button 
                            className={`btn btn-sm ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`} 
                            onClick={limpiarPedidoCompleto} 
                            disabled={paymentLoading}
                        >
                            Vaciar Carrito
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// COMPONENTE PRINCIPAL DE LA PÁGINA
// ==========================================
function ClientePage() {
    const { theme } = useTheme(); 
    const isDark = theme === 'dark';

    const bgBase = isDark ? '#09090b' : '#f3f4f6'; 
    const cardBg = isDark ? '#18181b' : '#ffffff'; 
    const textMain = isDark ? '#ffffff' : '#1f2937';
    const textMuted = isDark ? '#a1a1aa' : '#374151'; 
    
    const accentColor = isDark ? 'text-blue-500' : 'text-red-600';
    const accentBorder = isDark ? '3px solid #2563eb' : '3px solid #dc2626';
    const accentGradient = isDark 
        ? 'linear-gradient(135deg, #2563eb, #1e40af)' 
        : 'linear-gradient(135deg, #ef4444, #b91c1c)';

    const {
        pedidoActual,
        subtotal,
        incrementarCantidad,
        decrementarCantidad,
        eliminarProducto,
        limpiarPedido,
        agregarProductoAPedido
    } = useCart();

    const [activeTab, setActiveTab] = useState('crear');
    const [ordenExpandida, setOrdenExpandida] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [misPedidos, setMisPedidos] = useState([]);
    const [misRecompensas, setMisRecompensas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [tipoOrden, setTipoOrden] = useState('llevar');
    const [direccion, setDireccion] = useState(null);
    const [costoEnvio, setCostoEnvio] = useState(0);
    const [calculandoEnvio, setCalculandoEnvio] = useState(false);
    const [datosParaCheckout, setDatosParaCheckout] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
      
    const [direccionGuardada, setDireccionGuardada] = useState(null);
    const [guardarDireccion, setGuardarDireccion] = useState(false);
    const [referencia, setReferencia] = useState('');
    const [telefono, setTelefono] = useState(''); 
      
    const [showCartModal, setShowCartModal] = useState(false);
    const [productoSeleccionadoParaModal, setProductoSeleccionadoParaModal] = useState(null);
      
    const [cartViewState, setCartViewState] = useState('cart'); 

    const aplicaEnvioGratis = subtotal >= 150;
    const costoEnvioReal = aplicaEnvioGratis ? 0 : costoEnvio;
    const totalFinal = subtotal + costoEnvioReal;

    useEffect(() => {
        const fetchInitialData = async () => {
            if (activeTab !== 'crear') return;
            setLoading(true);
            try {
                const [productosRes, combosRes, direccionRes] = await Promise.all([
                    apiClient.get('/productos'),
                    apiClient.get('/combos'),
                    apiClient.get('/usuarios/mi-direccion')
                ]);
                
                
const estandarizar = (item) => {
    // 1. El precio que viene de la BD ($32.00) es el PRECIO ORIGINAL
    const precioBase = Number(item.precio); 
    
    let precioFinal = precioBase;
    let precioOriginal = precioBase;

    // 2. Si tiene oferta, calculamos el precio final aplicando el descuento
    if (item.en_oferta && item.descuento_porcentaje > 0) {
        // Ejemplo: 32.00 * (1 - 0.22) = 24.96
        precioFinal = precioBase * (1 - item.descuento_porcentaje / 100);
        precioOriginal = precioBase; // Mantenemos 32.00 como original para tachar
    }

    return { 
        ...item, 
        precio: precioFinal, // Precio que pagará el cliente
        precio_original: precioOriginal, // Precio para mostrar tachado
        nombre: item.nombre || item.titulo,
        en_oferta: item.en_oferta && precioOriginal > precioFinal
    };
};
                
                setMenuItems([
                    ...productosRes.data.map(estandarizar), 
                    ...combosRes.data.map(estandarizar)
                ]);
                
                if (direccionRes.data) {
                    setDireccionGuardada(direccionRes.data);
                    // --- CORRECCIÓN TELÉFONO: Cargar el teléfono guardado al inicio si existe ---
                    if (direccionRes.data.telefono) {
                        setTelefono(direccionRes.data.telefono);
                    }
                }
            } catch (err) { 
                console.error("Error al cargar datos iniciales:", err); 
                setError('Error al cargar el menú. Intenta de nuevo.'); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchInitialData();
    }, [activeTab]);

    useEffect(() => {
        const fetchTabData = async () => {
            if (activeTab === 'crear') return;
            setLoading(true);
            try {
                const endpoint = activeTab === 'ver' ? '/pedidos/mis-pedidos' : '/recompensas/mis-recompensas';
                const res = await apiClient.get(endpoint);
                
                if (activeTab === 'ver') {
                    setMisPedidos(Array.isArray(res.data) ? res.data : []);
                } else {
                    setMisRecompensas(Array.isArray(res.data) ? res.data : []);
                }
            } catch (err) { 
                setError('Error al cargar los datos.'); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchTabData();
    }, [activeTab]);

    useEffect(() => {
        if (tipoOrden !== 'domicilio') {
            setCostoEnvio(0); 
            setDireccion(null); 
            setCartViewState('cart'); 
        }
    }, [tipoOrden]);

    const limpiarPedidoCompleto = () => {
        limpiarPedido(); 
        setCostoEnvio(0); 
        setDireccion(null); 
        setReferencia(''); 
        // No limpiamos el teléfono para que persista a través de limpiezas de carrito
        // setTelefono(''); 
        setShowCartModal(false); 
        setCartViewState('cart');
    };

    const handleLocationSelect = async (location) => {
        setDireccion(location); 
        setCalculandoEnvio(true);
        try {
            const res = await apiClient.post('/pedidos/calcular-envio', { 
                lat: location.lat, 
                lng: location.lng 
            });
            setCostoEnvio(res.data.deliveryCost); 
            notify('success', `Costo de envío actualizado: $${res.data.deliveryCost}`);
        } catch (err) { 
            notify('error', 'No se pudo calcular el costo de envío.'); 
            setDireccion(null); 
            setCostoEnvio(0); 
        } finally { 
            setCalculandoEnvio(false); 
        }
    };

    // --- CORRECCIÓN TELÉFONO: Aseguramos que el teléfono se cargue al usar dirección guardada ---
    const usarDireccionGuardada = () => {
        if (direccionGuardada) { 
            // 1. Cargamos la dirección y calculamos el envío
            handleLocationSelect(direccionGuardada); 
            
            // 2. Cargamos la referencia
            if (direccionGuardada.referencia) {
                setReferencia(direccionGuardada.referencia); 
            } else {
                setReferencia('');
            }
            
            // 3. Cargamos el teléfono
            if (direccionGuardada.telefono) { 
                setTelefono(direccionGuardada.telefono);
            } else {
                setTelefono('');
            }
            
            // Opcional: notificamos
            notify('success', 'Dirección y número guardados cargados.');
        }
    };

    const handleProcederAlPago = async () => {
        if (totalFinal <= 0) return;
        
        // Validación de Domicilio
        if (tipoOrden === 'domicilio') {
            if (!direccion) return notify('error', 'Por favor selecciona una dirección de entrega.');
            if (!telefono || telefono.length < 10) return notify('error', 'Ingresa un número de contacto válido (10 dígitos).');
        }
        
        setPaymentLoading(true);
        try {
            const productosData = pedidoActual.map(item => ({ 
                id: item.id, 
                cantidad: item.cantidad, 
                precio: Number(item.precio), 
                nombre: item.nombre,
                opciones: item.opcionesSeleccionadas 
                    ? item.opcionesSeleccionadas.map(op => op.nombre).join(', ') 
                    : null
            }));

            const pedidoData = {
                total: totalFinal, 
                productos: productosData, 
                tipo_orden: tipoOrden, 
                // AQUÍ ESTÁ EL CAMBIO: Usamos costoEnvioReal (que es 0 si supera los $150)
                costo_envio: costoEnvioReal, 
                direccion_entrega: direccion?.description, 
                latitude: direccion?.lat, 
                longitude: direccion?.lng, 
                referencia,
                telefono 
            };
            
            setDatosParaCheckout(pedidoData);
            
            const res = await apiClient.post('/payments/create-payment-intent', { amount: totalFinal });
            
            setShowCartModal(false); 
            setCartViewState('cart'); 
            setClientSecret(res.data.clientSecret); 
            setShowPaymentModal(true);
        } catch (err) { 
            notify('error', 'Error al iniciar el proceso de pago.'); 
            console.error(err); 
        } finally { 
            setPaymentLoading(false); 
        }
    };

    const handleSuccessfulPayment = async () => {
        // --- CORRECCIÓN TELÉFONO: Aseguramos que el teléfono se guarde ---
        if (guardarDireccion && direccion) { 
            try { 
                // Guardamos la dirección, referencia y teléfono
                const data = { ...direccion, referencia, telefono }; 
                await apiClient.put('/usuarios/mi-direccion', data); 
                setDireccionGuardada(data); 
                notify('success', 'Dirección y número guardados para futuros pedidos.');
            } catch (e) { 
                console.error("Error guardando dirección:", e); 
            } 
        }
        // El tercer parámetro es el ID único. Si se intenta llamar de nuevo, no creará otro toast.
        notify('success', '¡Pedido realizado con éxito!', 'pedido-exito-unico');
        limpiarPedido(); // Limpiamos solo el carrito
        setCostoEnvio(0); 
        setDireccion(null); 
        setReferencia('');
        setShowPaymentModal(false); 
        setActiveTab('ver'); 
    };

    const getStatusBadge = (estado) => {
        const style = "rounded-pill d-inline-flex align-items-center gap-1 px-3 py-2 border fw-bold small";
        switch (estado) { 
            case 'Pendiente': 
                return <span className={`${style} bg-yellow-500/10 text-yellow-500 border-yellow-500/20`}><Clock size={14}/> Pendiente</span>;
            case 'En Preparacion': 
                return <span className={`${style} bg-blue-500/10 text-blue-500 border-blue-500/20`}><ChefHat size={14}/> Preparando</span>;
            case 'En Camino': 
                return <span className={`${style} bg-indigo-500/10 text-indigo-500 border-indigo-500/20`}><Truck size={14}/> En Camino</span>;
            case 'Listo para Recoger': 
                return <span className={`${style} bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}><Package size={14}/> Listo</span>;
            case 'Completado': 
                return <span className={`${style} bg-gray-500/10 text-gray-500 border-gray-500/20`}><CheckCircle size={14}/> Entregado</span>;
            default: 
                return <span className={`${style} bg-gray-100 text-dark`}>{estado}</span>;
        } 
    };

    return (
        <div style={{ backgroundColor: bgBase, minHeight: '100vh', color: textMain, pointerEvents: (productoSeleccionadoParaModal || showPaymentModal || showCartModal) ? 'none' : 'auto' }}> 
              
            {/* TABS NAVEGACIÓN */}
            <div className={`sticky-top pt-3 pb-2 px-3 mb-4 shadow-sm z-50 ${isDark ? 'bg-black/80 border-b border-white/10 backdrop-blur-md' : 'bg-white/80 border-b border-gray-200 backdrop-blur-md'}`}>
                <ul className="nav nav-pills nav-fill gap-2 container" style={{ maxWidth: '800px' }}>
                    {[
                        { id: 'crear', label: 'Menú', icon: <Edit3 size={18}/> },
                        { id: 'ver', label: 'Mis Pedidos', icon: <ListChecks size={18}/> },
                        { id: 'recompensas', label: 'Premios', icon: <Award size={18}/> },
                    ].map(tab => (
                        <li className="nav-item" key={tab.id}>
                            <button 
                                className={`nav-link d-flex align-items-center justify-content-center gap-2 ${activeTab === tab.id ? 'active fw-bold shadow-md' : ''} ${isDark ? (activeTab !== tab.id ? 'text-gray-400 hover:text-white' : '') : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ 
                                    borderRadius: '16px', 
                                    transition: 'all 0.2s', 
                                    backgroundColor: activeTab === tab.id ? (isDark ? '#2563eb' : '#dc2626') : 'transparent', 
                                    color: activeTab === tab.id ? 'white' : (isDark ? '#9ca3af' : '#dc2626') 
                                }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="container pb-5 md:pb-5 pb-32">
                {loading && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>}
                {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

                {/* --- PESTAÑA 1: MENÚ --- */}
                {!loading && activeTab === 'crear' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="row">
                        <div className="col-lg-8 mb-4">
                            {/* Titulo con borde de color dinámico */}
                            <h2 className={`fw-bold mb-4 px-3 border-start border-4 ${isDark ? 'border-blue-500' : 'border-red-600'} ${isDark ? 'text-white' : 'text-gray-900'}`}>¿Qué se te antoja hoy?</h2>
                            
                            <div className="row g-3">
                                {menuItems.map(item => (
                                    <div key={item.id} className="col-6 col-md-4">
                                        <motion.div 
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            className="card h-100 shadow-lg overflow-hidden position-relative"
                                            style={{ 
                                                backgroundColor: cardBg, 
                                                borderRadius: '32px', 
                                                cursor: 'pointer',
                                                border: item.en_oferta ? accentBorder : 'none'
                                            }}
                                            onClick={() => setProductoSeleccionadoParaModal(item)}
                                        >
                                            <div className="card-body d-flex flex-column text-center p-3 md:p-4">
                                                <div className={`mb-3 mb-md-4 d-flex align-items-center justify-content-center rounded-circle mx-auto shadow-sm ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} style={{ width: '60px', height: '60px', md: {width: '80px', height: '80px'} }}>
                                                    <Utensils size={28} className={isDark ? 'text-blue-500' : 'text-red-600'} />
                                                </div>
                                                
                                                <h6 className={`card-title fw-bold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '1rem'}}>{item.nombre}</h6>
                                                
                                                <div className="mt-auto pt-2">
                                                    {item.en_oferta ? (
                                                        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                                            <small 
                                                                className="text-decoration-line-through fw-bold" 
                                                                style={{ 
                                                                    fontSize: '0.9rem',
                                                                    color: isDark ? '#3b82f6' : '#dc2626'
                                                                }}
                                                            >
                                                                ${Number(item.precio_original).toFixed(2)}
                                                            </small>

                                                            <span className="rounded-pill bg-green-500/10 border border-green-500/20 px-2 py-1 fw-bold" style={{ color: '#22c55e' }}>
                                                                ${Number(item.precio).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className={`fw-bold fs-5 ${accentColor}`}>
                                                            ${Number(item.precio).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-lg-4 d-none d-lg-block">
                            <div className="shadow-xl border border-white/5" style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 120px)', backgroundColor: cardBg, borderRadius: '32px' }}>
                                <CarritoContent
                                    isModal={false}
                                    pedidoActual={pedidoActual}
                                    decrementarCantidad={decrementarCantidad}
                                    incrementarCantidad={incrementarCantidad}
                                    eliminarProducto={eliminarProducto}
                                    tipoOrden={tipoOrden}
                                    setTipoOrden={setTipoOrden}
                                    direccionGuardada={direccionGuardada}
                                    usarDireccionGuardada={usarDireccionGuardada}
                                    handleLocationSelect={handleLocationSelect}
                                    direccion={direccion}
                                    referencia={referencia}
                                    setReferencia={setReferencia}
                                    telefono={telefono}        
                                    setTelefono={setTelefono}  
                                    guardarDireccion={guardarDireccion}
                                    setGuardarDireccion={setGuardarDireccion}
                                    subtotal={subtotal}
                                    costoEnvio={costoEnvio}
                                    calculandoEnvio={calculandoEnvio}
                                    totalFinal={totalFinal}
                                    handleProcederAlPago={handleProcederAlPago}
                                    paymentLoading={paymentLoading}
                                    limpiarPedidoCompleto={limpiarPedidoCompleto}
                                    isDark={isDark}
                                    viewState={cartViewState}
                                    setViewState={setCartViewState}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- PESTAÑA 2: HISTORIAL DE PEDIDOS --- */}
                {!loading && activeTab === 'ver' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h3 className={`fw-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Historial de Pedidos</h3>
                        {misPedidos.length === 0 ? (
                            <div className={`text-center py-5 rounded-4 border border-dashed border-secondary opacity-50 ${isDark ? 'text-white' : 'text-gray-600'}`}>
                                <ListChecks size={48} className="mb-3"/>
                                <p>Aún no tienes pedidos.</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {misPedidos.map(p => (
                                    <div key={p.id} className="card border-0 shadow-sm transition-transform hover:-translate-y-1" style={{ backgroundColor: cardBg, borderRadius: '24px', overflow: 'hidden' }}>
                                        <div 
                                            className="card-header border-0 d-flex justify-content-between align-items-center p-4 bg-transparent cursor-pointer" 
                                            onClick={() => setOrdenExpandida(ordenExpandida === p.id ? null : p.id)}
                                        >
                                            <div className="d-flex align-items-center gap-4">
                                                <div className={`rounded-2xl p-3 shadow-sm ${isDark ? 'bg-white/5' : 'bg-blue-50'}`}>
                                                    <Package size={24} className={isDark ? 'text-blue-500' : 'text-blue-600'}/>
                                                </div>
                                                <div>
                                                    <div className={`fw-bold fs-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Pedido #{p.id}</div>
                                                    <small style={{ color: textMuted }}>{new Date(p.fecha).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-success fs-5 mb-1">${Number(p.total).toFixed(2)}</div>
                                                {getStatusBadge(p.estado)}
                                            </div>
                                        </div>
                                          
                                        <AnimatePresence>
                                            {ordenExpandida === p.id && (
                                                <motion.div 
                                                    initial={{ height: 0 }} 
                                                    animate={{ height: 'auto' }} 
                                                    exit={{ height: 0 }} 
                                                    className="overflow-hidden"
                                                >
                                                    <div className={`card-body p-4 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                                                        {p.productos?.map((prod, idx) => (
                                                            <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                                                                <div>
                                                                    <span className="fw-semibold" style={{ color: textMain }}>{prod.cantidad}x {prod.nombre}</span>
                                                                    {prod.opciones && (
                                                                        <div className="small text-blue-400 ps-3 border-start border-blue-500 ms-1 mt-1">
                                                                            {prod.opciones}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="fw-bold opacity-75" style={{ color: textMain }}>${(prod.cantidad * Number(prod.precio)).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                        
                                                        {p.costo_envio > 0 && (
                                                            <div className="d-flex justify-content-between mt-3 pt-3 border-t border-dashed border-gray-500/30 small" style={{ color: textMuted }}>
                                                                <span>Envío</span>
                                                                <span>${Number(p.costo_envio).toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* --- PESTAÑA 3: RECOMPENSAS --- */}
                {!loading && activeTab === 'recompensas' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-center mb-5">
                            <div 
                                className="d-inline-block p-4 rounded-full mb-3 shadow-lg"
                                style={{ background: accentGradient }}
                            >
                                <Gift size={40} className="text-white"/>
                            </div>
                            <h3 className={`fw-bold display-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sala de Premios</h3>
                            <p style={{ color: textMuted }}>¡Tu lealtad tiene recompensa!</p>
                        </div>
                        
                        <div className="row g-4 justify-content-center">
                            {misRecompensas.length === 0 ? (
                                <div className={`col-12 text-center py-5 rounded-4 border border-dashed ${isDark ? 'border-secondary text-white opacity-50' : 'border-gray-300 text-gray-500'}`}>
                                    <Star size={40} className={`mb-2 ${isDark ? 'text-white' : 'text-yellow-500'}`}/>
                                    <p className="fw-bold">Completa 20 pedidos para desbloquear.</p>
                                </div>
                            ) : misRecompensas.map(recompensa => (
                                <div key={recompensa.id} className="col-md-8 col-lg-6">
                                    <motion.div 
                                        whileHover={{ scale: 1.02 }}
                                        className="d-flex position-relative shadow-lg"
                                        style={{ 
                                            background: isDark ? '#18181b' : 'white', 
                                            borderRadius: '24px', 
                                            overflow: 'hidden',
                                            minHeight: '140px'
                                        }}
                                    >
                                        {/* PARTE IZQUIERDA: ICONO */}
                                        <div 
                                            className="d-flex align-items-center justify-content-center text-white" 
                                            style={{ 
                                                width: '110px', 
                                                background: accentGradient 
                                            }}
                                        >
                                            <Ticket size={40} className="text-white opacity-90"/>
                                        </div>
                                        
                                        {/* DIVISOR Y "MORDIDAS" (Bites) para efecto ticket */}
                                        <div className="position-relative d-flex align-items-center" style={{ width: '0px' }}>
                                            <div style={{ position: 'absolute', left: '-1px', height: '80%', borderLeft: `2px dashed ${isDark ? '#52525b' : '#d1d5db'}` }}></div>
                                            <div style={{ position: 'absolute', top: '-12px', left: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: bgBase }}></div>
                                            <div style={{ position: 'absolute', bottom: '-12px', left: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: bgBase }}></div>
                                        </div>

                                        {/* PARTE DERECHA: TEXTO */}
                                        <div className="p-4 flex-grow-1 d-flex flex-column justify-content-center ps-5">
                                            <h5 className={`fw-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{recompensa.nombre}</h5>
                                            <p className="small mb-2" style={{ color: textMuted }}>Gratis por tus 20 compras.</p>
                                            
                                            <span 
                                                className={`badge rounded-pill align-self-start px-3 py-2 ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-red-100 text-red-600'}`}
                                            >
                                                Activo
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            
            {/* BOTÓN FLOTANTE MÓVIL - PREMIUM CIRCULAR CON GLOW */}
            {activeTab === 'crear' && pedidoActual.length > 0 && (
                <div 
                    className="position-fixed bottom-0 end-0 m-4 d-lg-none" 
                    style={{ zIndex: 1050 }}
                >
                    <motion.button 
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="btn rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                        onClick={() => setShowCartModal(true)}
                        style={{ 
                            width: '68px', 
                            height: '68px', 
                            background: accentGradient,
                            color: 'white',
                            border: '2px solid rgba(255,255,255,0.25)', // Anillo sutil interior
                            // Sombra de resplandor (Glow) del color del tema
                            boxShadow: isDark 
                                ? '0 10px 30px -5px rgba(37, 99, 235, 0.6)' 
                                : '0 10px 30px -5px rgba(220, 38, 38, 0.6)'
                        }}
                    >
                        <ShoppingCart size={28} strokeWidth={2.5} />
                        
                        {/* Badge Minimalista Blanco */}
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="position-absolute d-flex align-items-center justify-content-center fw-bold"
                            style={{ 
                                top: '0px', 
                                right: '0px',
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                color: isDark ? '#2563eb' : '#dc2626', // Texto del color del tema
                                fontSize: '0.9rem',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            {pedidoActual.reduce((acc, el) => acc + el.cantidad, 0)}
                        </motion.span>
                    </motion.button>
                </div>
            )}

            {/* MODAL CARRITO (Móvil) */}
            {showCartModal && (
                <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="modal-dialog modal-dialog-centered" 
                        style={{ 
                            maxWidth: '400px', 
                            margin: 'auto' 
                        }}
                    >
                        <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden" style={{ backgroundColor: cardBg, borderRadius: '32px', color: textMain, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                            <CarritoContent
                                isModal={true}
                                closeModal={() => { setShowCartModal(false); setCartViewState('cart'); }} 
                                pedidoActual={pedidoActual}
                                decrementarCantidad={decrementarCantidad}
                                incrementarCantidad={incrementarCantidad}
                                eliminarProducto={eliminarProducto}
                                tipoOrden={tipoOrden}
                                setTipoOrden={setTipoOrden}
                                direccionGuardada={direccionGuardada}
                                usarDireccionGuardada={usarDireccionGuardada}
                                handleLocationSelect={handleLocationSelect}
                                direccion={direccion}
                                referencia={referencia}
                                setReferencia={setReferencia}
                                telefono={telefono}        
                                setTelefono={setTelefono}  
                                guardarDireccion={guardarDireccion}
                                setGuardarDireccion={setGuardarDireccion}
                                subtotal={subtotal}
                                costoEnvio={costoEnvio}
                                calculandoEnvio={calculandoEnvio}
                                totalFinal={totalFinal}
                                handleProcederAlPago={handleProcederAlPago}
                                paymentLoading={paymentLoading}
                                limpiarPedidoCompleto={limpiarPedidoCompleto}
                                isDark={isDark}
                                viewState={cartViewState}
                                setViewState={setCartViewState}
                            />
                        </div>
                    </motion.div>
                </div>
            )}

            {/* MODAL DETALLE PRODUCTO */}
            {productoSeleccionadoParaModal && (
                <div style={{ pointerEvents: 'auto', zIndex: 1070 }}>
                    <ProductDetailModal
                        product={productoSeleccionadoParaModal}
                        onClose={() => setProductoSeleccionadoParaModal(null)}
                        onAddToCart={agregarProductoAPedido}
                        isDark={isDark}
                    />
                </div>
            )}

            {/* MODAL PAGO */}
            {showPaymentModal && clientSecret && (
                <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1080 }}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-2xl overflow-hidden" style={{ backgroundColor: cardBg, borderRadius: '32px', color: textMain }}>
                            
                            <div className={`modal-header border-0 p-4 ${isDark ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'}`}>
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <DollarSign size={24}/> Pago Seguro
                                </h5>
                                <button 
                                    type="button" 
                                    className={`btn-close ${isDark ? 'btn-close-white' : ''}`} 
                                    onClick={() => setShowPaymentModal(false)}
                                ></button>
                            </div>

                            <div className="modal-body p-4">
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: isDark ? 'night' : 'stripe', variables: { colorPrimary: isDark ? '#2563eb' : '#dc2626', borderRadius: '16px' } } }}>
                                    <CheckoutForm 
                                        handleSuccess={handleSuccessfulPayment} 
                                        total={totalFinal}
                                        datosPedido={datosParaCheckout} 
                                        isDark={isDark} 
                                    />
                                </Elements>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            
        </div>
    );
}

export default ClientePage;