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
    ShoppingCart, ListChecks, Award, Edit3, MapPin, DollarSign, 
    Clock, Package, CheckCircle, AlertCircle, ChefHat, Truck, Utensils // Agregado Utensils
} from 'lucide-react'; 

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Configuración de notificaciones
const notify = (type, message) => {
    switch (type) {
        case 'success': toast.success(message); break;
        case 'error': toast.error(message); break;
        default: toast(message); break;
    }
};

// --- COMPONENTE CARRITO (Reutilizable) ---
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
    handleContinue,
    handleProcederAlPago,
    paymentLoading,
    limpiarPedidoCompleto,
    isDark,
    inputClass
}) => (
    <>
        <div className={isModal ? "modal-body p-4" : "card-body p-4"}>
            {!isModal && (
                <>
                    <h4 className={`card-title fw-bold text-center mb-4 d-flex align-items-center justify-content-center gap-2 ${isDark ? 'text-primary' : 'text-dark'}`}>
                        <ShoppingCart size={24} /> Mi Pedido
                    </h4>
                    <hr className={isDark ? 'border-secondary opacity-50' : ''} />
                </>
            )}

            {/* Lista de productos con scroll si es muy larga */}
            <ul className="list-group list-group-flush mb-3 custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {pedidoActual.length === 0 && (
                    <div className={`text-center py-5 ${isDark ? 'text-muted' : 'text-secondary'}`}>
                        <ShoppingCart size={40} className="mb-2 opacity-50"/>
                        <p className="mb-0">Tu carrito está vacío</p>
                    </div>
                )}
                
                {pedidoActual.map((item) => (
                    <li key={item.cartItemId || item.id} className={`list-group-item border-0 border-bottom d-flex align-items-center justify-content-between py-3 px-0 ${isDark ? 'bg-transparent text-white border-secondary' : ''}`}>
                        <div className="me-auto pe-2"> 
                            <span className="fw-bold d-block">{item.nombre}</span>
                            {item.opcionesSeleccionadas?.length > 0 && (
                                <small className={`d-block ${isDark ? 'text-info' : 'text-muted'}`} style={{ fontSize: '0.85em' }}>
                                    {item.opcionesSeleccionadas.map(op => op.nombre).join(', ')}
                                </small>
                            )}
                        </div>

                        <div className="d-flex align-items-center bg-opacity-10 rounded-pill border px-1 py-1" style={{ borderColor: isDark ? '#444' : '#ddd' }}>
                            <button className="btn btn-sm btn-link text-decoration-none p-0 px-2 text-reset" onClick={() => decrementarCantidad(item.cartItemId || item.id)} disabled={paymentLoading}>-</button>
                            <span className="fw-bold px-1" style={{minWidth: '20px', textAlign: 'center'}}>{item.cantidad}</span>
                            <button className="btn btn-sm btn-link text-decoration-none p-0 px-2 text-reset" onClick={() => incrementarCantidad(item.cartItemId || item.id)} disabled={paymentLoading}>+</button>
                        </div>
                        
                        <div className="text-end ps-3">
                            <div className="fw-bold">${(item.cantidad * Number(item.precio)).toFixed(2)}</div>
                            <button className="btn btn-link text-danger p-0 text-decoration-none" style={{ fontSize: '0.8em' }} onClick={() => eliminarProducto(item.cartItemId || item.id)}>Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Selector de Tipo de Entrega */}
            <div className={`p-3 rounded-3 mb-3 ${isDark ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Método de Entrega</h6>
                <div className="d-flex flex-column gap-2">
                    {[
                        { id: 'llevar', label: 'Para Recoger', icon: <Package size={16}/> },
                        { id: 'local', label: 'Para La Escuela (Mesa)', icon: <ChefHat size={16}/> },
                        { id: 'domicilio', label: 'A Domicilio', icon: <Truck size={16}/> }
                    ].map(opt => (
                        <div key={opt.id} className="form-check custom-radio-card">
                            <input 
                                className="form-check-input" 
                                type="radio" 
                                name={isModal ? "tipoOrdenModal" : "tipoOrden"} 
                                id={isModal ? `${opt.id}Modal` : opt.id} 
                                value={opt.id} 
                                checked={tipoOrden === opt.id} 
                                onChange={(e) => setTipoOrden(e.target.value)} 
                            />
                            <label className={`form-check-label d-flex align-items-center gap-2 ${isDark ? 'text-white' : ''}`} htmlFor={isModal ? `${opt.id}Modal` : opt.id}>
                                {opt.icon} {opt.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Formulario de Dirección (Condicional) */}
            <AnimatePresence>
                {tipoOrden === 'domicilio' && !isModal && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 overflow-hidden"
                    >
                        <div className={`p-3 rounded border ${isDark ? 'border-secondary' : 'border-light'}`}>
                            <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><MapPin size={18}/> Ubicación</h6>
                            
                            {direccionGuardada && (
                                <button className="btn btn-outline-primary btn-sm w-100 mb-3 d-flex align-items-center justify-content-center gap-2" onClick={usarDireccionGuardada}>
                                    <MapPin size={14}/> Usar dirección guardada
                                </button>
                            )}

                            <label className="form-label small fw-bold">Buscar dirección:</label>
                            <div className="mb-2">
                                <MapSelector onLocationSelect={handleLocationSelect} initialAddress={direccion} className={inputClass}/>
                            </div>

                            <label className="form-label small fw-bold mt-2">Referencia / Color de casa:</label>
                            <input type="text" className={inputClass} placeholder="Ej: Portón negro, al lado de..." value={referencia} onChange={(e) => setReferencia(e.target.value)} />

                            <div className="form-check mt-2">
                                <input className="form-check-input" type="checkbox" id="guardarDireccionDesktop" checked={guardarDireccion} onChange={(e) => setGuardarDireccion(e.target.checked)} />
                                <label className={`form-check-label small ${isDark ? 'text-secondary' : 'text-muted'}`} htmlFor="guardarDireccionDesktop">Guardar esta dirección para futuros pedidos</label>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Resumen de Costos */}
            <hr className={isDark ? 'border-secondary opacity-50' : ''} />
            <div className="d-flex justify-content-between mb-1 text-muted"><span>Subtotal</span> <span>${subtotal.toFixed(2)}</span></div>
            {tipoOrden === 'domicilio' && (
                <div className="d-flex justify-content-between mb-1 text-muted">
                    <span>Envío</span> 
                    {calculandoEnvio ? <span className="spinner-border spinner-border-sm text-primary"></span> : <span>${costoEnvio.toFixed(2)}</span>}
                </div>
            )}
            <div className="d-flex justify-content-between mt-3">
                <span className="h4 fw-bold">Total</span>
                <span className="h4 fw-bold text-success">${totalFinal.toFixed(2)}</span>
            </div>
        </div>

        <div className={isModal ? "modal-footer border-0 pt-0" : "card-footer border-0 pt-0 bg-transparent"}>
            <div className="d-grid gap-2">
                {isModal ? (
                    <button
                        className="btn btn-primary btn-lg fw-bold rounded-pill"
                        onClick={handleContinue}
                        disabled={pedidoActual.length === 0 || paymentLoading}
                    >
                        {tipoOrden === 'domicilio' ? 'Siguiente: Dirección' : 'Ir a Pagar'}
                    </button>
                ) : (
                    <button
                        className="btn btn-primary btn-lg fw-bold rounded-pill shadow-sm"
                        onClick={handleProcederAlPago}
                        disabled={pedidoActual.length === 0 || paymentLoading || (tipoOrden === 'domicilio' && !direccion) || calculandoEnvio}
                    >
                        {paymentLoading ? (
                            <><span className="spinner-border spinner-border-sm me-2"/> Procesando...</>
                        ) : (
                            <><DollarSign size={18} className="me-1"/> Proceder al Pago</>
                        )}
                    </button>
                )}
                <button 
                    className={`btn btn-sm ${isDark ? 'btn-outline-secondary text-light' : 'btn-outline-danger'} border-0`} 
                    onClick={limpiarPedidoCompleto} 
                    disabled={paymentLoading}
                >
                    Vaciar Carrito
                </button>
            </div>
        </div>
    </>
);

function ClientePage() {
    // 1. TEMA Y ESTILOS
    const { theme } = useTheme(); 
    const isDark = theme === 'dark';

    // Definición de colores y clases base
    const bgBase = isDark ? '#121212' : '#f8f9fa';
    const cardBg = isDark ? '#1e1e1e' : '#ffffff';
    const textMain = isDark ? '#ffffff' : '#212529';
    const textMuted = isDark ? '#b0b3b8' : '#6c757d';
    const inputClass = `form-control ${isDark ? 'bg-dark text-white border-secondary' : ''}`;
    
    // Hooks y Estados
    const {
        pedidoActual, subtotal, incrementarCantidad, decrementarCantidad, 
        eliminarProducto, limpiarPedido, agregarProductoAPedido
    } = useCart();

    const [activeTab, setActiveTab] = useState('crear');
    const [ordenExpandida, setOrdenExpandida] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [tipoOrden, setTipoOrden] = useState('llevar');
    const [direccion, setDireccion] = useState(null);
    const [costoEnvio, setCostoEnvio] = useState(0);
    const [calculandoEnvio, setCalculandoEnvio] = useState(false);
    const [misPedidos, setMisPedidos] = useState([]);
    const [misRecompensas, setMisRecompensas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [datosParaCheckout, setDatosParaCheckout] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [direccionGuardada, setDireccionGuardada] = useState(null);
    const [guardarDireccion, setGuardarDireccion] = useState(false);
    const [referencia, setReferencia] = useState('');
    const [showCartModal, setShowCartModal] = useState(false);
    const [modalView, setModalView] = useState('cart');
    const [productoSeleccionadoParaModal, setProductoSeleccionadoParaModal] = useState(null);

    const totalFinal = subtotal + costoEnvio;

    // --- EFECTOS (Data Fetching) ---
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
                    return { ...item, precio: precioFinal, precio_original: precioOriginal, nombre: item.nombre || item.titulo };
                };
                
                setMenuItems([...productosRes.data.map(estandarizar), ...combosRes.data.map(estandarizar)]);
                if (direccionRes.data) setDireccionGuardada(direccionRes.data);
            } catch (err) {
                console.error(err);
                setError('Error al cargar menú.');
            } finally { setLoading(false); }
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
                if (activeTab === 'ver') setMisPedidos(res.data || []);
                else setMisRecompensas(res.data || []);
            } catch (err) { setError('Error al cargar datos.'); } 
            finally { setLoading(false); }
        };
        fetchTabData();
    }, [activeTab]);

    useEffect(() => {
        if (tipoOrden !== 'domicilio') {
            setCostoEnvio(0); setDireccion(null);
        }
    }, [tipoOrden]);

    // --- HANDLERS ---
    const limpiarPedidoCompleto = () => {
        limpiarPedido();
        setCostoEnvio(0); setDireccion(null); setReferencia(''); setShowCartModal(false);
    };

    const handleLocationSelect = async (location) => {
        setDireccion(location);
        setCalculandoEnvio(true);
        try {
            const res = await apiClient.post('/pedidos/calcular-envio', { lat: location.lat, lng: location.lng });
            setCostoEnvio(res.data.deliveryCost);
            notify('success', `Envío calculado: $${res.data.deliveryCost}`);
        } catch (err) {
            notify('error', 'Error calculando envío.');
            setDireccion(null); setCostoEnvio(0);
        } finally { setCalculandoEnvio(false); }
    };

    const usarDireccionGuardada = () => {
        if (direccionGuardada) {
            handleLocationSelect(direccionGuardada);
            if (direccionGuardada.referencia) setReferencia(direccionGuardada.referencia);
        }
    };

    const handleProcederAlPago = async () => {
        if (totalFinal <= 0) return;
        if (tipoOrden === 'domicilio' && !direccion) return notify('error', 'Falta la dirección de entrega.');
        
        setPaymentLoading(true);
        try {
            const productosData = pedidoActual.map(item => ({ 
                id: item.id, cantidad: item.cantidad, precio: Number(item.precio), nombre: item.nombre,
                opciones: item.opcionesSeleccionadas ? item.opcionesSeleccionadas.map(op => op.nombre).join(', ') : null
            }));

            const pedidoData = {
                total: totalFinal, productos: productosData, tipo_orden: tipoOrden, costo_envio: costoEnvio,
                direccion_entrega: direccion?.description, latitude: direccion?.lat, longitude: direccion?.lng, referencia
            };
            
            setDatosParaCheckout(pedidoData);
            const res = await apiClient.post('/payments/create-payment-intent', { amount: totalFinal });
            setShowCartModal(false);
            setModalView('cart');
            setClientSecret(res.data.clientSecret);
            setShowPaymentModal(true);
        } catch (err) {
            notify('error', 'Error al iniciar pago.');
        } finally { setPaymentLoading(false); }
    };

    const handleContinue = () => {
        if (tipoOrden !== 'domicilio') handleProcederAlPago();
        else setModalView('address');
    };

    const handleSuccessfulPayment = async () => {
        if (guardarDireccion && direccion) {
            try {
                const data = { ...direccion, referencia };
                await apiClient.put('/usuarios/mi-direccion', data);
                setDireccionGuardada(data);
            } catch (e) { console.error(e); }
        }
        notify('success', '¡Pedido Éxitoso!');
        limpiarPedidoCompleto();
        setShowPaymentModal(false);
        setActiveTab('ver');
    };

    // --- HELPER UI ---
    const getStatusBadge = (estado) => {
        const style = "badge rounded-pill d-inline-flex align-items-center gap-1 px-3 py-2";
        switch (estado) { 
            case 'Pendiente': return <span className={`${style} bg-warning text-dark`}><Clock size={14}/> Pendiente</span>;
            case 'En Preparacion': return <span className={`${style} bg-info text-dark`}><ChefHat size={14}/> Preparando</span>;
            case 'En Camino': return <span className={`${style} bg-primary text-white`}><Truck size={14}/> En Camino</span>;
            case 'Listo para Recoger': return <span className={`${style} bg-success text-white`}><Package size={14}/> Listo</span>;
            case 'Completado': return <span className={`${style} bg-secondary text-white`}><CheckCircle size={14}/> Entregado</span>;
            default: return <span className={`${style} bg-light text-dark`}>{estado}</span>;
        } 
    };

    return (
        <div style={{ backgroundColor: bgBase, minHeight: '100vh', color: textMain, pointerEvents: (productoSeleccionadoParaModal || showPaymentModal || showCartModal) ? 'none' : 'auto' }}> 
            
            {/* Navegación Tabs */}
            <div className={`sticky-top pt-3 pb-2 px-3 mb-4 shadow-sm ${isDark ? 'bg-dark border-bottom border-secondary' : 'bg-white'}`} style={{ zIndex: 100 }}>
                <ul className="nav nav-pills nav-fill gap-2 container" style={{ maxWidth: '800px' }}>
                    {[
                        { id: 'crear', label: 'Menú', icon: <Edit3 size={18}/> },
                        { id: 'ver', label: 'Mis Pedidos', icon: <ListChecks size={18}/> },
                        { id: 'recompensas', label: 'Premios', icon: <Award size={18}/> },
                    ].map(tab => (
                        <li className="nav-item" key={tab.id}>
                            <button 
                                className={`nav-link d-flex align-items-center justify-content-center gap-2 ${activeTab === tab.id ? 'active fw-bold shadow' : ''} ${isDark && activeTab !== tab.id ? 'text-secondary hover-text-white' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ borderRadius: '12px', transition: 'all 0.2s' }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="container pb-5">
                {loading && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>}
                {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

                {/* --- PESTAÑA MENÚ --- */}
                {!loading && activeTab === 'crear' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="row">
                        <div className="col-lg-8 mb-4">
                            <h2 className="fw-bold mb-4 px-2 border-start border-4 border-primary">¿Qué se te antoja hoy?</h2>
                            <div className="row g-3">
                                {menuItems.map(item => (
                                    <div key={item.id} className="col-6 col-md-4">
                                        <motion.div 
                                            whileHover={{ y: -5 }}
                                            className="card h-100 border-0 shadow-sm overflow-hidden"
                                            style={{ backgroundColor: cardBg, borderRadius: '16px', cursor: 'pointer' }}
                                            onClick={() => setProductoSeleccionadoParaModal(item)}
                                        >
                                            <div className="card-body d-flex flex-column text-center p-3">
                                                {/* CORRECCIÓN 2: Ícono genérico (Utensils) en lugar de hamburguesa */}
                                                <div className={`mb-3 d-flex align-items-center justify-content-center rounded-circle mx-auto ${isDark ? 'bg-dark bg-opacity-50' : 'bg-primary bg-opacity-10'}`} style={{ width: '64px', height: '64px' }}>
                                                    <Utensils size={28} className="text-primary" />
                                                </div>
                                                <h6 className="card-title fw-bold mb-2 line-clamp-2">{item.nombre}</h6>
                                                <div className="mt-auto pt-2">
                                                    {item.en_oferta ? (
                                                        <div>
                                                            <small className="text-decoration-line-through text-muted me-2">${Number(item.precio_original).toFixed(2)}</small>
                                                            <span className="fw-bold text-success fs-5">${Number(item.precio).toFixed(2)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="fw-bold text-primary fs-5">${Number(item.precio).toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CARRITO DESKTOP */}
                        <div className="col-lg-4 d-none d-lg-block">
                            <div className="shadow border-0" style={{ position: 'sticky', top: '100px', backgroundColor: cardBg, borderRadius: '16px' }}>
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
                                    handleContinue={handleContinue}
                                    handleProcederAlPago={handleProcederAlPago}
                                    paymentLoading={paymentLoading}
                                    limpiarPedidoCompleto={limpiarPedidoCompleto}
                                    isDark={isDark}
                                    inputClass={inputClass}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- PESTAÑA PEDIDOS --- */}
                {!loading && activeTab === 'ver' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h3 className="fw-bold mb-4">Historial de Pedidos</h3>
                        {misPedidos.length === 0 ? (
                            <div className="text-center py-5 rounded-4" style={{ backgroundColor: cardBg }}>
                                <ListChecks size={48} className="text-muted mb-3 opacity-50"/>
                                <p className="text-muted">Aún no tienes pedidos.</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {misPedidos.map(p => (
                                    <div key={p.id} className="card border-0 shadow-sm" style={{ backgroundColor: cardBg, borderRadius: '12px', overflow: 'hidden' }}>
                                        <div 
                                            className="card-header border-0 d-flex justify-content-between align-items-center p-3" 
                                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa', cursor: 'pointer' }}
                                            onClick={() => setOrdenExpandida(ordenExpandida === p.id ? null : p.id)}
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`rounded-circle p-2 ${isDark ? 'bg-dark' : 'bg-white'}`}>
                                                    <Package size={20} className="text-primary"/>
                                                </div>
                                                <div>
                                                    <div className="fw-bold">Pedido #{p.id}</div>
                                                    <small className="text-muted">{new Date(p.fecha).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-success">${Number(p.total).toFixed(2)}</div>
                                                <div>{getStatusBadge(p.estado)}</div>
                                            </div>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {ordenExpandida === p.id && (
                                                <motion.div 
                                                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} 
                                                    className="overflow-hidden"
                                                >
                                                    {/* CORRECCIÓN 3: Mostrar opciones/toppings en el historial */}
                                                    <div className="card-body p-3" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8f9fa' }}>
                                                        {p.productos?.map((prod, idx) => (
                                                            <div key={idx} className="d-flex justify-content-between align-items-start mb-2">
                                                                <div className="small">
                                                                    <span className={`fw-bold ${textMain}`}>{prod.cantidad}x {prod.nombre}</span>
                                                                    {prod.opciones && (
                                                                        <div className={`small fst-italic ${textMuted}`} style={{ fontSize: '0.85em' }}>
                                                                            + {prod.opciones}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="fw-semibold small">${(prod.cantidad * Number(prod.precio)).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                        {p.costo_envio > 0 && (
                                                            <div className="d-flex justify-content-between mt-2 pt-2 border-top border-secondary border-opacity-25 text-info small fw-bold">
                                                                <span>Costo de Envío</span><span>${Number(p.costo_envio).toFixed(2)}</span>
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

                {/* --- PESTAÑA RECOMPENSAS --- */}
                {!loading && activeTab === 'recompensas' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-center mb-5">
                            <div className="d-inline-block p-3 rounded-circle mb-3 bg-warning bg-opacity-25">
                                <Award size={40} className="text-warning"/>
                            </div>
                            <h3 className="fw-bold">Tus Recompensas</h3>
                            <p className={textMuted}>¡Gana premios por tu lealtad! 1 Recompensa cada 20 pedidos.</p>
                        </div>
                        
                        <div className="row g-4">
                            {misRecompensas.length === 0 ? (
                                <div className="col-12 text-center py-4">
                                    <p className="text-muted">Aún no tienes recompensas disponibles.</p>
                                </div>
                            ) : misRecompensas.map(recompensa => (
                                <div key={recompensa.id} className="col-md-6">
                                    <div className="card border-0 shadow h-100" style={{ backgroundColor: '#2a9d8f', color: 'white', borderRadius: '16px' }}>
                                        <div className="card-body d-flex align-items-center p-4">
                                            <div className="me-3 display-4">🎁</div>
                                            <div>
                                                <h4 className="fw-bold mb-1">{recompensa.nombre}</h4>
                                                <p className="mb-0 opacity-75">¡Disponible para canjear en tu próximo pedido!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* --- MODALES Y FLOTANTES --- */}

            {/* CORRECCIÓN 1: Botón Flotante Carrito (Móvil) Estético */}
            {activeTab === 'crear' && pedidoActual.length > 0 && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    className="fixed-bottom p-3 d-lg-none d-flex justify-content-center" 
                    style={{ zIndex: 1050, pointerEvents: 'none' }}
                >
                    <button 
                        className="btn btn-primary rounded-pill shadow-lg d-flex justify-content-between align-items-center px-4 py-3 fw-bold"
                        onClick={() => setShowCartModal(true)}
                        style={{ pointerEvents: 'auto', width: '90%', maxWidth: '400px',border: '2px solid rgba(255,255,255,0.1)' }}
                    >
                        <div className="d-flex align-items-center">
                            <ShoppingCart size={20} className="me-2"/>
                            <span className="badge bg-white text-primary rounded-pill me-2 px-2">{pedidoActual.reduce((acc, el) => acc + el.cantidad, 0)}</span>
                            <span>Ver Carrito</span>
                        </div>
                        <span className="fs-5">${totalFinal.toFixed(2)}</span>
                    </button>
                </motion.div>
            )}

            {/* Modal Carrito / Checkout */}
            {showCartModal && (
                <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', pointerEvents: 'auto' }}>
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} 
                        className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
                        style={{ margin: '1rem' }} // Margen para que no pegue a los bordes en móvil
                    >
                        <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: cardBg, borderRadius: '20px', color: textMain, maxHeight: '85vh' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">{modalView === 'cart' ? 'Tu Pedido' : 'Dirección de Entrega'}</h5>
                                <button type="button" className={`btn-close ${isDark ? 'btn-close-white' : ''}`} onClick={() => { setShowCartModal(false); setModalView('cart'); }}></button>
                            </div>
                            
                            {modalView === 'cart' ? (
                                <CarritoContent
                                    isModal={true}
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
                                    handleContinue={handleContinue}
                                    handleProcederAlPago={handleProcederAlPago}
                                    paymentLoading={paymentLoading}
                                    limpiarPedidoCompleto={limpiarPedidoCompleto}
                                    isDark={isDark}
                                    inputClass={inputClass}
                                />
                            ) : (
                                <div className="modal-body p-4">
                                     <button className="btn btn-link text-decoration-none mb-3 px-0 d-flex align-items-center" onClick={() => setModalView('cart')}>
                                        <Edit3 size={16} className="me-1"/> Volver al carrito
                                     </button>
                                     <div className={`p-4 rounded border ${isDark ? 'border-secondary bg-dark bg-opacity-50' : 'bg-light border-0'}`}>
                                         <h5 className="fw-bold mb-3 d-flex align-items-center"><MapPin size={20} className="me-2 text-primary"/>Confirma tu ubicación</h5>
                                         <div className="mb-3">
                                            <MapSelector onLocationSelect={handleLocationSelect} initialAddress={direccion} className={inputClass} />
                                         </div>
                                         <div className="form-floating">
                                            <input type="text" className={inputClass} id="floatingInput" placeholder="Referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} style={{height: '60px'}}/>
                                            <label htmlFor="floatingInput" className={isDark ? 'text-muted' : ''}>Referencia (Ej: Casa azul, portón negro...)</label>
                                         </div>
                                     </div>
                                     <div className="mt-4">
                                        <button className="btn btn-primary btn-lg w-100 fw-bold rounded-pill py-3 shadow-sm d-flex justify-content-center align-items-center" onClick={handleProcederAlPago} disabled={!direccion || paymentLoading}>
                                            {paymentLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <DollarSign size={20} className="me-1"/>}
                                            Pagar ${totalFinal.toFixed(2)}
                                        </button>
                                     </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal Detalle Producto */}
            {productoSeleccionadoParaModal && (
                <div style={{ pointerEvents: 'auto' }}>
                    <ProductDetailModal
                        product={productoSeleccionadoParaModal}
                        onClose={() => setProductoSeleccionadoParaModal(null)}
                        onAddToCart={agregarProductoAPedido}
                        isDark={isDark}
                    />
                </div>
            )}

            {/* Modal Stripe */}
            {showPaymentModal && clientSecret && (
                <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', pointerEvents: 'auto' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: cardBg, borderRadius: '16px', color: textMain }}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold text-success d-flex align-items-center gap-2">
                                    <DollarSign size={24}/> Pago Seguro
                                </h5>
                                <button type="button" className={`btn-close ${isDark ? 'btn-close-white' : ''}`} onClick={() => setShowPaymentModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: isDark ? 'night' : 'stripe', variables: { colorPrimary: '#0d6efd' } } }}>
                                    <CheckoutForm handleSuccess={handleSuccessfulPayment} total={totalFinal} datosPedido={datosParaCheckout} isDark={isDark} />
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