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
    AlertCircle, 
    ChefHat, 
    Truck, 
    Utensils, 
    Gift, 
    Star,
    ArrowLeft,
    ChevronRight,
    Map,
    X
} from 'lucide-react'; 

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// --- Configuración de Notificaciones ---
const notify = (type, message) => {
    switch (type) {
        case 'success': 
            toast.success(message); 
            break;
        case 'error': 
            toast.error(message); 
            break;
        default: 
            toast(message); 
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
    closeModal // Nueva prop para cerrar el modal desde dentro
}) => {

    // --- Lógica de Navegación entre Pasos ---
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

    // --- Estilos Dinámicos (Glassmorphism & Temas) ---
    const glassHeader = isDark 
        ? "bg-black/40 backdrop-blur-md border-b border-white/10" 
        : "bg-white/60 backdrop-blur-md border-b border-gray-200";
    
    const glassFooter = isDark 
        ? "bg-black/40 backdrop-blur-md border-t border-white/10" 
        : "bg-white/80 backdrop-blur-md border-t border-gray-200";

    // Función para generar clases de las tarjetas de selección
    const cardSelectable = (selected) => `
        cursor-pointer rounded-xl border p-3 transition-all duration-200 flex items-center gap-3 relative overflow-hidden
        ${selected 
            ? (isDark ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm') 
            : (isDark ? 'border-white/10 hover:border-white/30 bg-white/5' : 'border-gray-200 hover:border-gray-300 bg-white')
        }
    `;

    return (
        <div className="d-flex flex-column h-100 position-relative overflow-hidden"> 
            
            {/* 1. HEADER DEL CARRITO (Fijo y Estilizado) */}
            <div className={`flex-shrink-0 px-4 py-3 ${glassHeader} z-10 d-flex align-items-center justify-content-between`}>
                {viewState === 'cart' ? (
                    <>
                        <h5 className={`m-0 fw-bold d-flex align-items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <ShoppingCart size={20} className="text-blue-500"/> 
                            {isModal ? 'Tu Pedido' : 'Mi Pedido'}
                        </h5>
                        {isModal && (
                            <button 
                                onClick={closeModal}
                                className={`btn btn-sm p-1 rounded-circle ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                <X size={20} />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="d-flex align-items-center w-100">
                        <button 
                            onClick={volverAlCarrito} 
                            className={`btn btn-link p-0 me-3 ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-black'}`} 
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

            {/* 2. BODY DEL CARRITO (Scrollable) */}
            <div className="flex-grow-1 overflow-auto custom-scrollbar px-4 py-3" style={{ minHeight: 0 }}>
                <AnimatePresence mode="wait">
                    
                    {/* --- VISTA 1: LISTA DE PRODUCTOS Y SELECCIÓN DE ENVÍO --- */}
                    {viewState === 'cart' ? (
                        <motion.div 
                            key="cart-view"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Lista de Productos */}
                            <div className="d-flex flex-column gap-3 mb-4">
                                {pedidoActual.length === 0 && (
                                    <div className="text-center py-5 opacity-50">
                                        <ShoppingCart size={48} className="mb-2 mx-auto"/>
                                        <p>Tu carrito está vacío</p>
                                    </div>
                                )}
                                
                                {pedidoActual.map((item) => (
                                    <div key={item.cartItemId || item.id} className={`d-flex align-items-center p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                                        <div className="flex-grow-1">
                                            <span className={`fw-bold d-block ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.nombre}</span>
                                            
                                            {/* Opciones seleccionadas */}
                                            {item.opcionesSeleccionadas && item.opcionesSeleccionadas.length > 0 && (
                                                <small className={`${isDark ? 'text-blue-300' : 'text-blue-600'} d-block mb-1`}>
                                                    {item.opcionesSeleccionadas.map(op => op.nombre).join(', ')}
                                                </small>
                                            )}
                                            
                                            <div className="fw-bold text-success">
                                                ${(item.cantidad * Number(item.precio)).toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="d-flex flex-column align-items-end gap-2">
                                            {/* Selector de Cantidad (Diseño Cápsula) */}
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

                            {/* Selector de Método de Entrega (Visible solo si hay items) */}
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
                                                <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${tipoOrden === opt.id ? 'bg-blue-500 text-white' : (isDark ? 'bg-white/10' : 'bg-gray-200')}`} style={{width: '40px', height: '40px'}}>
                                                    {opt.icon}
                                                </div>
                                                <div>
                                                    <div className={`fw-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{opt.label}</div>
                                                    <div className={`small ${isDark ? 'text-gray-400' : 'text-gray-500'}`} style={{fontSize: '0.8rem'}}>{opt.sub}</div>
                                                </div>
                                                {tipoOrden === opt.id && (
                                                    <div className="ms-auto">
                                                        <CheckCircle size={20} className="text-blue-500 fill-current"/>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        /* --- VISTA 2: MAPA Y DIRECCIÓN --- */
                        <motion.div 
                            key="address-view"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Botón para usar dirección guardada */}
                            {direccionGuardada && (
                                <button 
                                    className="btn btn-outline-primary w-100 mb-3 rounded-xl py-2 d-flex align-items-center justify-content-center gap-2 border-2 fw-semibold" 
                                    onClick={usarDireccionGuardada}
                                >
                                    <MapPin size={16}/> Usar dirección guardada
                                </button>
                            )}
                            
                            {/* Contenedor del Mapa */}
                            <div className="rounded-xl overflow-hidden border border-white/10 shadow-md mb-3" style={{ height: '300px' }}> 
                                <MapSelector 
                                    onLocationSelect={handleLocationSelect} 
                                    initialAddress={direccion} 
                                    className="w-100 h-100"
                                />
                            </div>
                            
                            {/* Input de Referencia */}
                            <div className="form-group mb-3">
                                <label className={`form-label small fw-bold ms-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Referencia de entrega
                                </label>
                                <div className={`d-flex align-items-center px-3 py-2 rounded-xl border transition-all ${isDark ? 'bg-black/20 border-white/10 focus-within:border-blue-500' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'}`}>
                                    <MapPin size={18} className="opacity-50 me-2"/>
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
                            
                            {/* Checkbox Guardar Dirección */}
                            <div className="d-flex align-items-center gap-2 p-3 rounded-xl bg-opacity-10" style={{backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff'}}>
                                <input 
                                    className="form-check-input mt-0" 
                                    type="checkbox" 
                                    id="guardarDireccionCheck" 
                                    checked={guardarDireccion} 
                                    onChange={(e) => setGuardarDireccion(e.target.checked)} 
                                />
                                <label className={`form-check-label small cursor-pointer ${isDark ? 'text-white' : 'text-black'}`} htmlFor="guardarDireccionCheck">
                                    Guardar esta dirección para futuros pedidos
                                </label>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. FOOTER FLOTANTE CON GRADIENTE */}
            <div className={`flex-shrink-0 px-4 py-3 ${glassFooter} z-10`}>
                <div className="d-flex justify-content-between align-items-end mb-3">
                    <span className={`small fw-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total a Pagar</span>
                    <div className="text-end">
                        {tipoOrden === 'domicilio' && (
                             <div className={`small mb-1 fw-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Envío: {calculandoEnvio ? <span className="spinner-border spinner-border-sm"/> : <span className="text-success">+${costoEnvio.toFixed(2)}</span>}
                             </div>
                        )}
                        <span className={`h4 fw-bold m-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>${totalFinal.toFixed(2)}</span>
                    </div>
                </div>
                
                <div className="d-grid gap-2">
                    <button
                        className="btn btn-lg border-0 rounded-pill fw-bold text-white shadow-lg d-flex justify-content-center align-items-center gap-2 position-relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}
                        onClick={viewState === 'cart' ? irASiguiente : handleProcederAlPago}
                        disabled={pedidoActual.length === 0 || paymentLoading || (viewState === 'address' && !direccion) || calculandoEnvio}
                    >
                        {/* Efecto de brillo en el botón */}
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
    // --- 1. TEMA Y ESTILOS GLOBALES ---
    const { theme } = useTheme(); 
    const isDark = theme === 'dark';

    // Colores de fondo más profundos para look premium
    const bgBase = isDark ? '#09090b' : '#f3f4f6'; 
    const cardBg = isDark ? '#18181b' : '#ffffff'; 
    const textMain = isDark ? '#ffffff' : '#1f2937';
    // Corrección: Hacemos el texto "muted" más oscuro en modo claro para que se lea mejor (gray-700)
    const textMuted = isDark ? '#a1a1aa' : '#374151'; 
    
    // --- 2. HOOKS Y ESTADOS ---
    const {
        pedidoActual,
        subtotal,
        incrementarCantidad,
        decrementarCantidad,
        eliminarProducto,
        limpiarPedido,
        agregarProductoAPedido
    } = useCart();

    // Estados de navegación y datos
    const [activeTab, setActiveTab] = useState('crear');
    const [ordenExpandida, setOrdenExpandida] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [misPedidos, setMisPedidos] = useState([]);
    const [misRecompensas, setMisRecompensas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados del Carrito y Pago
    const [tipoOrden, setTipoOrden] = useState('llevar');
    const [direccion, setDireccion] = useState(null);
    const [costoEnvio, setCostoEnvio] = useState(0);
    const [calculandoEnvio, setCalculandoEnvio] = useState(false);
    const [datosParaCheckout, setDatosParaCheckout] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    
    // Estados de Dirección
    const [direccionGuardada, setDireccionGuardada] = useState(null);
    const [guardarDireccion, setGuardarDireccion] = useState(false);
    const [referencia, setReferencia] = useState('');
    
    // Estados de Modales
    const [showCartModal, setShowCartModal] = useState(false);
    const [productoSeleccionadoParaModal, setProductoSeleccionadoParaModal] = useState(null);
    
    // ESTADO PARA CONTROLAR EL PASO DEL CARRITO (Cart vs Address)
    const [cartViewState, setCartViewState] = useState('cart'); 

    const totalFinal = subtotal + costoEnvio;

    // --- 3. EFECTOS (DATA FETCHING) ---

    // Cargar menú inicial, combos y dirección guardada
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
                    const precioFinal = Number(item.precio);
                    let precioOriginal = precioFinal;
                    if (item.en_oferta && item.descuento_porcentaje > 0) {
                        precioOriginal = precioFinal / (1 - item.descuento_porcentaje / 100);
                    }
                    return { 
                        ...item, 
                        precio: precioFinal, 
                        precio_original: precioOriginal, 
                        nombre: item.nombre || item.titulo 
                    };
                };
                
                setMenuItems([
                    ...productosRes.data.map(estandarizar), 
                    ...combosRes.data.map(estandarizar)
                ]);
                
                if (direccionRes.data) {
                    setDireccionGuardada(direccionRes.data);
                }
            } catch (err) { 
                console.error(err); 
                setError('Error al cargar el menú. Intenta de nuevo.'); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchInitialData();
    }, [activeTab]);

    // Cargar Historial o Recompensas al cambiar de Tab
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

    // Resetear envío al cambiar tipo de orden y volver al paso 1
    useEffect(() => {
        if (tipoOrden !== 'domicilio') {
            setCostoEnvio(0); 
            setDireccion(null); 
            setCartViewState('cart'); 
        }
    }, [tipoOrden]);

    // --- 4. HANDLERS (LOGICA DE NEGOCIO) ---

    const limpiarPedidoCompleto = () => {
        limpiarPedido(); 
        setCostoEnvio(0); 
        setDireccion(null); 
        setReferencia(''); 
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

    const usarDireccionGuardada = () => {
        if (direccionGuardada) { 
            handleLocationSelect(direccionGuardada); 
            if (direccionGuardada.referencia) {
                setReferencia(direccionGuardada.referencia); 
            }
        }
    };

    const handleProcederAlPago = async () => {
        if (totalFinal <= 0) return;
        if (tipoOrden === 'domicilio' && !direccion) {
            return notify('error', 'Por favor selecciona una dirección de entrega.');
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
                costo_envio: costoEnvio,
                direccion_entrega: direccion?.description, 
                latitude: direccion?.lat, 
                longitude: direccion?.lng, 
                referencia
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
        if (guardarDireccion && direccion) { 
            try { 
                const data = { ...direccion, referencia };
                await apiClient.put('/usuarios/mi-direccion', data); 
                setDireccionGuardada(data); 
            } catch (e) { 
                console.error("Error guardando dirección:", e); 
            } 
        }
        notify('success', '¡Pedido realizado con éxito!'); 
        limpiarPedidoCompleto(); 
        setShowPaymentModal(false); 
        setActiveTab('ver'); 
    };

    // Helper para badges de estado
    const getStatusBadge = (estado) => {
        const style = "badge rounded-pill d-inline-flex align-items-center gap-1 px-3 py-2 border";
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
            
            {/* --- NAVEGACIÓN (TABS STICKY) --- */}
            <div className={`sticky-top pt-3 pb-2 px-3 mb-4 shadow-sm z-50 ${isDark ? 'bg-black/80 border-b border-white/10 backdrop-blur-md' : 'bg-white/80 border-b border-gray-200 backdrop-blur-md'}`}>
                <ul className="nav nav-pills nav-fill gap-2 container" style={{ maxWidth: '800px' }}>
                    {[
                        { id: 'crear', label: 'Menú', icon: <Edit3 size={18}/> },
                        { id: 'ver', label: 'Mis Pedidos', icon: <ListChecks size={18}/> },
                        { id: 'recompensas', label: 'Premios', icon: <Award size={18}/> },
                    ].map(tab => (
                        <li className="nav-item" key={tab.id}>
                            <button 
                                className={`nav-link d-flex align-items-center justify-content-center gap-2 ${activeTab === tab.id ? 'active fw-bold shadow-md' : ''} ${isDark && activeTab !== tab.id ? 'text-gray-400 hover:text-white' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ 
                                    borderRadius: '12px', 
                                    transition: 'all 0.2s', 
                                    backgroundColor: activeTab === tab.id ? (isDark ? '#2563eb' : 'white') : 'transparent', 
                                    color: activeTab === tab.id ? (isDark ? 'white' : '#2563eb') : undefined 
                                }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Añadimos pb-32 para que el botón flotante no tape el contenido al final */}
            <div className="container pb-5 md:pb-5 pb-32">
                {loading && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>}
                {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

                {/* --- PESTAÑA 1: MENÚ --- */}
                {!loading && activeTab === 'crear' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="row">
                        <div className="col-lg-8 mb-4">
                            <h2 className="fw-bold mb-4 px-3 border-start border-4 border-blue-500">¿Qué se te antoja hoy?</h2>
                            <div className="row g-3">
                                {menuItems.map(item => (
                                    <div key={item.id} className="col-6 col-md-4">
                                        <motion.div 
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            className={`card h-100 shadow-lg overflow-hidden position-relative ${item.en_oferta ? 'border border-2 border-blue-500' : 'border-0'}`}
                                            style={{ backgroundColor: cardBg, borderRadius: '24px', cursor: 'pointer' }}
                                            onClick={() => setProductoSeleccionadoParaModal(item)}
                                        >
                                            <div className="card-body d-flex flex-column text-center p-3 md:p-4">
                                                {/* ICONO DEL PRODUCTO */}
                                                <div className={`mb-3 mb-md-4 d-flex align-items-center justify-content-center rounded-circle mx-auto shadow-sm ${isDark ? 'bg-white/5' : 'bg-blue-50'}`} style={{ width: '60px', height: '60px', md: {width: '80px', height: '80px'} }}>
                                                    <Utensils size={28} className="text-blue-500 md:w-8 md:h-8" />
                                                </div>
                                                
                                                <h6 className="card-title fw-bold mb-2 line-clamp-2" style={{fontSize: '1rem'}}>{item.nombre}</h6>
                                                
                                                <div className="mt-auto pt-2">
                                                    {item.en_oferta ? (
                                                        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                                            {/* CORRECCIÓN DE PRECIO TACHADO: Rojo en modo claro, Muted en modo oscuro */}
                                                            <small 
                                                                className={`text-decoration-line-through ${isDark ? 'text-muted opacity-75' : 'text-danger fw-bold'}`} 
                                                                style={{fontSize: '0.9rem'}}
                                                            >
                                                                ${Number(item.precio_original).toFixed(2)}
                                                            </small>

                                                            <span className="badge bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-pill">
                                                                ${Number(item.precio).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="fw-bold text-blue-500 fs-5">
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

                        {/* CARRITO VERSION DESKTOP (STICKY) */}
                        <div className="col-lg-4 d-none d-lg-block">
                            <div className="shadow-xl border border-white/5" style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 120px)', backgroundColor: cardBg, borderRadius: '24px' }}>
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
                        <h3 className="fw-bold mb-4">Historial de Pedidos</h3>
                        {misPedidos.length === 0 ? (
                            <div className="text-center py-5 rounded-4 border border-dashed border-secondary opacity-50">
                                <ListChecks size={48} className="mb-3"/>
                                <p>Aún no tienes pedidos.</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {misPedidos.map(p => (
                                    <div key={p.id} className="card border-0 shadow-sm transition-transform hover:-translate-y-1" style={{ backgroundColor: cardBg, borderRadius: '16px', overflow: 'hidden' }}>
                                        <div 
                                            className="card-header border-0 d-flex justify-content-between align-items-center p-4 bg-transparent cursor-pointer" 
                                            onClick={() => setOrdenExpandida(ordenExpandida === p.id ? null : p.id)}
                                        >
                                            <div className="d-flex align-items-center gap-4">
                                                <div className={`rounded-2xl p-3 shadow-sm ${isDark ? 'bg-white/5' : 'bg-blue-50'}`}>
                                                    <Package size={24} className="text-blue-500"/>
                                                </div>
                                                <div>
                                                    <div className="fw-bold fs-5">Pedido #{p.id}</div>
                                                    <small className={textMuted}>{new Date(p.fecha).toLocaleDateString()}</small>
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
                                                                    <span className={`fw-semibold ${textMain}`}>{prod.cantidad}x {prod.nombre}</span>
                                                                    
                                                                    {prod.opciones && (
                                                                        <div className="small text-blue-400 ps-3 border-start border-blue-500 ms-1 mt-1">
                                                                            {prod.opciones}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="fw-bold opacity-75">${(prod.cantidad * Number(prod.precio)).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                        
                                                        {p.costo_envio > 0 && (
                                                            <div className="d-flex justify-content-between mt-3 pt-3 border-t border-dashed border-gray-500/30 text-muted small">
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

                {/* --- PESTAÑA 3: RECOMPENSAS (DISEÑO TICKET) --- */}
                {!loading && activeTab === 'recompensas' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-center mb-5">
                            <div className="d-inline-block p-4 rounded-full mb-3 bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30">
                                <Gift size={40} className="text-white"/>
                            </div>
                            <h3 className="fw-bold display-6">Sala de Premios</h3>
                            <p className={textMuted}>¡Tu lealtad tiene recompensa!</p>
                        </div>
                        
                        <div className="row g-4 justify-content-center">
                            {misRecompensas.length === 0 ? (
                                <div className="col-12 text-center py-5 rounded-4 border border-dashed border-secondary opacity-50">
                                    <Star size={40} className="mb-2"/>
                                    <p>Completa 20 pedidos para desbloquear.</p>
                                </div>
                            ) : misRecompensas.map(recompensa => (
                                <div key={recompensa.id} className="col-md-8 col-lg-6">
                                    <motion.div 
                                        whileHover={{ scale: 1.02 }}
                                        className="d-flex position-relative overflow-hidden shadow-2xl rounded-3xl"
                                        style={{ 
                                            background: isDark ? '#18181b' : 'white', 
                                            border: '1px solid rgba(255,255,255,0.1)' 
                                        }}
                                    >
                                        <div className="d-flex flex-column align-items-center justify-content-center p-4 text-white position-relative overflow-hidden" style={{ width: '130px', background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
                                            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2.5px)', backgroundSize: '10px 10px' }}></div>
                                            <Gift size={32} className="mb-2 position-relative z-10"/>
                                            <span className="fw-bold small position-relative z-10 tracking-widest">GIFT</span>
                                        </div>
                                        
                                        <div className="position-relative d-flex align-items-center">
                                            <div style={{ width: '1px', height: '80%', borderLeft: '2px dashed #ccc' }}></div>
                                            <div style={{ position: 'absolute', top: '-12px', left: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: bgBase }}></div>
                                            <div style={{ position: 'absolute', bottom: '-12px', left: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: bgBase }}></div>
                                        </div>

                                        <div className="p-4 flex-grow-1 d-flex flex-column justify-content-center">
                                            <h5 className={`fw-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{recompensa.nombre}</h5>
                                            <p className={`small mb-3 ${textMuted}`}>Canjéalo en tu próximo pedido.</p>
                                            <span className="badge bg-green-500/10 text-green-600 border border-green-500/20 px-3 py-1 rounded-pill align-self-start">Activo</span>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* --- MODALES Y FLOTANTES --- */}

            {/* BOTÓN FLOTANTE MÓVIL (FAB) - NUEVO DISEÑO CIRCULAR */}
            {activeTab === 'crear' && pedidoActual.length > 0 && (
                <div 
                    className="position-fixed bottom-0 end-0 m-4 d-lg-none" 
                    style={{ zIndex: 1050 }}
                >
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center position-relative border border-white/20"
                        onClick={() => setShowCartModal(true)}
                        style={{ 
                            width: '64px', 
                            height: '64px', 
                            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                            color: 'white'
                        }}
                    >
                        <ShoppingCart size={28} />
                        <span 
                            className="position-absolute top-0 end-0 badge rounded-pill bg-danger border border-white shadow-sm"
                            style={{ transform: 'translate(10%, -10%)' }}
                        >
                            {pedidoActual.reduce((acc, el) => acc + el.cantidad, 0)}
                        </span>
                    </motion.button>
                </div>
            )}

            {/* MODAL CARRITO MÓVIL (CENTRADO Y FLOTANTE) */}
            {showCartModal && (
                <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="modal-dialog modal-dialog-centered mx-3" 
                        // mx-3 asegura margen lateral para que parezca tarjeta flotante
                    >
                        <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden" style={{ backgroundColor: cardBg, color: textMain, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                            {/* Pasamos la función closeModal para que el botón X funcione */}
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

            {/* MODAL PAGO (STRIPE) */}
            {showPaymentModal && clientSecret && (
                <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1080 }}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-2xl overflow-hidden" style={{ backgroundColor: cardBg, borderRadius: '24px', color: textMain }}>
                            <div className="modal-header border-0 bg-blue-600 text-white p-4">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <DollarSign size={24}/> Pago Seguro
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPaymentModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: isDark ? 'night' : 'stripe', variables: { colorPrimary: '#2563eb', borderRadius: '12px' } } }}>
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