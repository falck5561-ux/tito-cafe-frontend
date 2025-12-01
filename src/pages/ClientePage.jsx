import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
// 🚨 Asumo la existencia de useTheme para manejar el tema como en el ejemplo anterior
import { useTheme } from '../context/ThemeContext'; 
import CheckoutForm from '../components/CheckoutForm';
import MapSelector from '../components/MapSelector';
import apiClient from '../services/api';
import { useCart } from '../context/CartContext';
import ProductDetailModal from '../components/ProductDetailModal';
import { ShoppingCart, ListChecks, Award, Edit3, MapPin } from 'lucide-react'; // Importamos íconos para las pestañas y títulos

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Estilos de cupón/recompensa (Ajustados para alto contraste)
const styles = {
    cupon: {
        backgroundColor: '#2a9d8f', // Color primario fuerte
        color: 'white',
        borderRadius: '12px', // Más acorde al estilo moderno
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // Sombra definida
        borderLeft: '8px solid #264653', // Borde sólido mejor que dashed
        position: 'relative',
        marginBottom: '1rem',
        transition: 'all 0.2s',
    },
    cuponIcon: { fontSize: '2.5rem', marginRight: '1.5rem' },
    cuponBody: { flexGrow: 1 },
    cuponTitle: { margin: '0', fontSize: '1.4rem', fontWeight: 'bold' },
};

const notify = (type, message) => {
    // ... (función notify queda igual)
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

// Componente CartContent actualizado con estilos dinámicos
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
    isDark, // Prop para el tema
    inputClass // Prop para los inputs
}) => (
    <>
        <div className={isModal ? "modal-body" : "card-body"}>
            {!isModal && (
                <>
                    <h4 className="card-title fw-bold text-center mb-3 d-flex align-items-center justify-content-center gap-2">
                        <ShoppingCart size={20} className="text-primary"/> Mi Pedido
                    </h4>
                    <hr className={isDark ? 'border-secondary' : ''} />
                </>
            )}
            <ul className="list-group list-group-flush">
                {pedidoActual.length === 0 && <li className={`list-group-item text-center text-muted ${isDark ? 'bg-dark' : ''}`}>Tu carrito está vacío</li>}
                
                {pedidoActual.map((item) => (
                    <li key={item.cartItemId || item.id} className={`list-group-item d-flex align-items-center justify-content-between p-2 ${isDark ? 'bg-transparent text-white' : ''}`}>
                        
                        <div className="me-auto" style={{ paddingRight: '10px' }}> 
                            <span className="fw-semibold">{item.nombre}</span>
                            
                            {item.opcionesSeleccionadas && item.opcionesSeleccionadas.length > 0 && (
                                <ul className="list-unstyled small text-muted mb-0" style={{ marginTop: '-3px' }}>
                                    {item.opcionesSeleccionadas.map(opcion => (
                                        <li key={opcion.id} className={isDark ? 'text-secondary' : ''}>+ {opcion.nombre}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="d-flex align-items-center">
                            <button className={`btn btn-sm ${isDark ? 'btn-outline-light' : 'btn-outline-dark'}`} onClick={() => decrementarCantidad(item.cartItemId || item.id)} disabled={paymentLoading}>-</button>
                            <span className="mx-2 fw-bold">{item.cantidad}</span>
                            <button className={`btn btn-sm ${isDark ? 'btn-outline-light' : 'btn-outline-dark'}`} onClick={() => incrementarCantidad(item.cartItemId || item.id)} disabled={paymentLoading}>+</button>
                        </div>
                        <span className="mx-3 fw-bold" style={{ minWidth: '70px', textAlign: 'right' }}>${(item.cantidad * Number(item.precio)).toFixed(2)}</span>
                        <button className="btn btn-sm btn-danger p-1" onClick={() => eliminarProducto(item.cartItemId || item.id)} disabled={paymentLoading}>&times;</button>
                    </li>
                ))}
            </ul>
            <hr className={isDark ? 'border-secondary' : ''} />
            <h5 className="fw-bold mb-3">Elige una opción:</h5>
            <div className="d-flex gap-3 mb-3">
                <div className="form-check"><input className="form-check-input" type="radio" name={isModal ? "tipoOrdenModal" : "tipoOrden"} id={isModal ? "llevarModal" : "llevar"} value="llevar" checked={tipoOrden === 'llevar'} onChange={(e) => setTipoOrden(e.target.value)} /><label className="form-check-label" htmlFor={isModal ? "llevarModal" : "llevar"}>Para Recoger</label></div>
                <div className="form-check"><input className="form-check-input" type="radio" name={isModal ? "tipoOrdenModal" : "tipoOrden"} id={isModal ? "localModal" : "local"} value="local" checked={tipoOrden === 'local'} onChange={(e) => setTipoOrden(e.target.value)} /><label className="form-check-label" htmlFor={isModal ? "localModal" : "local"}>Para La Escuela</label></div>
                <div className="form-check"><input className="form-check-input" type="radio" name={isModal ? "tipoOrdenModal" : "tipoOrden"} id={isModal ? "domicilioModal" : "domicilio"} value="domicilio" checked={tipoOrden === 'domicilio'} onChange={(e) => setTipoOrden(e.target.value)} /><label className="form-check-label" htmlFor={isModal ? "domicilioModal" : "domicilio"}>A Domicilio</label></div>
            </div>

            {tipoOrden === 'domicilio' && !isModal && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mt-3 p-3 rounded ${isDark ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                    <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><MapPin size={18}/> Ubicación</h6>
                    {direccionGuardada && (<button className="btn btn-outline-info w-100 mb-3" onClick={usarDireccionGuardada}>Usar mi dirección guardada</button>)}

                    <label className="form-label fw-bold">Busca tu dirección:</label>
                    <MapSelector onLocationSelect={handleLocationSelect} initialAddress={direccion} className={inputClass}/>

                    <div className="mt-3">
                        <label htmlFor="referenciaDesktop" className="form-label fw-bold">Referencia:</label>
                        <input type="text" id="referenciaDesktop" className={inputClass} value={referencia} onChange={(e) => setReferencia(e.target.value)} />
                    </div>

                    <div className="form-check mt-3">
                        <input className="form-check-input" type="checkbox" id="guardarDireccionDesktop" checked={guardarDireccion} onChange={(e) => setGuardarDireccion(e.target.checked)} />
                        <label className={`form-check-label ${isDark ? 'text-white' : ''}`} htmlFor="guardarDireccionDesktop">Guardar dirección</label>
                    </div>
                </motion.div>
            )}

            <hr className={isDark ? 'border-secondary' : ''} />
            <p className="d-flex justify-content-between fw-light">Subtotal: <span>${subtotal.toFixed(2)}</span></p>
            {tipoOrden === 'domicilio' && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex justify-content-between fw-light">Costo de Envío: {calculandoEnvio ? <span className="spinner-border spinner-border-sm text-primary"></span> : <span>${costoEnvio.toFixed(2)}</span>}</motion.p>)}
            <h4 className="d-flex justify-content-between fw-bold mt-2">Total: <span className="text-success">${totalFinal.toFixed(2)}</span></h4>
        </div>

        <div className={isModal ? "modal-footer d-grid gap-2" : "card-footer d-grid gap-2 mt-auto"}>
            {isModal ? (
                <button
                    className="btn btn-lg btn-primary fw-bold"
                    onClick={handleContinue}
                    disabled={pedidoActual.length === 0 || paymentLoading}
                >
                    {tipoOrden === 'domicilio' ? 'Siguiente' : 'Proceder al Pago'}
                </button>
            ) : (
                <button
                    className="btn btn-lg btn-primary fw-bold"
                    onClick={handleProcederAlPago}
                    disabled={pedidoActual.length === 0 || paymentLoading || (tipoOrden === 'domicilio' && !direccion) || calculandoEnvio}
                >
                    {paymentLoading ? 'Iniciando Pago...' : 'Proceder al Pago'}
                </button>
            )}
            <button className="btn btn-outline-danger fw-bold" onClick={limpiarPedidoCompleto} disabled={paymentLoading}>Vaciar Carrito</button>
        </div>
    </>
);


function ClientePage() {
    // 1. Obtener tema
    const { theme } = useTheme(); 
    const isDark = theme === 'dark';

    // 2. Definir clases dinámicas
    const cardClass = `card shadow-lg border-0 ${isDark ? 'bg-dark text-white' : ''}`;
    const inputClass = `form-control ${isDark ? 'form-control-dark bg-dark text-white border-secondary' : 'form-control'}`;
    const lightBgClass = isDark ? 'bg-secondary bg-opacity-10 text-white' : 'bg-light';
    const darkBgClass = isDark ? 'bg-dark text-white' : '';
    const spinnerColor = isDark ? 'text-primary' : 'text-dark';

    // ... (Estados y Hooks, sin cambios)
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

    useEffect(() => {
        const fetchInitialData = async () => {
            if (activeTab !== 'crear') return;
            setLoading(true);
            setError('');
            try {
                const [productosRes, combosRes, direccionRes] = await Promise.all([
                    apiClient.get('/productos'),
                    apiClient.get('/combos'),
                    apiClient.get('/usuarios/mi-direccion')
                ]);
                
                const estandarizarItem = (item) => {
                    const precioFinal = Number(item.precio);
                    let precioOriginal = precioFinal;
                    if (item.en_oferta && item.descuento_porcentaje > 0) {
                        precioOriginal = precioFinal / (1 - item.descuento_porcentaje / 100);
                    }
                    return {
                        ...item, 
                        precio: precioFinal,
                        precio_original: precioOriginal,
                        nombre: item.nombre || item.titulo,
                    };
                };
                const productosEstandarizados = productosRes.data.map(estandarizarItem);
                const combosEstandarizados = combosRes.data.map(estandarizarItem);
                setMenuItems([...productosEstandarizados, ...combosEstandarizados]);
                if (direccionRes.data) {
                    setDireccionGuardada(direccionRes.data);
                }
            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
                setError('No se pudieron cargar los productos en este momento.');
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
            setError('');
            try {
                if (activeTab === 'ver') {
                    const res = await apiClient.get('/pedidos/mis-pedidos');
                    setMisPedidos(Array.isArray(res.data) ? res.data : []);
                } else if (activeTab === 'recompensas') {
                    const res = await apiClient.get('/recompensas/mis-recompensas');
                    setMisRecompensas(Array.isArray(res.data) ? res.data : []);
                }
            } catch (err) {
                setError('No se pudieron cargar los datos de la pestaña.');
                console.error("Error en fetchTabData:", err);
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
        }
    }, [tipoOrden]);

    const limpiarPedidoCompleto = () => {
        limpiarPedido();
        setCostoEnvio(0);
        setDireccion(null);
        setGuardarDireccion(false);
        setReferencia('');
        setShowCartModal(false);
    };

    const handleLocationSelect = async (location) => {
        setDireccion(location);
        setCalculandoEnvio(true);
        setCostoEnvio(0);
        try {
            const res = await apiClient.post('/pedidos/calcular-envio', { lat: location.lat, lng: location.lng });
            setCostoEnvio(res.data.deliveryCost);
            notify('success', `Costo de envío: $${res.data.deliveryCost.toFixed(2)}`);
        } catch (err) {
            notify('error', err.response?.data?.msg || 'No se pudo calcular el costo de envío.');
            setDireccion(null);
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
            notify('success', 'Usando dirección guardada.');
        }
    };

    const handleProcederAlPago = async () => {
        if (totalFinal <= 0) return;
        if (tipoOrden === 'domicilio' && !direccion) { return notify('error', 'Por favor, selecciona o escribe tu ubicación.'); }
        if (calculandoEnvio) { return notify('error', 'Espera a que termine el cálculo del envío.'); }
        setPaymentLoading(true);
        try {
            
            const productosParaEnviar = pedidoActual.map(item => ({ 
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
                productos: productosParaEnviar,
                tipo_orden: tipoOrden,
                costo_envio: costoEnvio,
                direccion_entrega: tipoOrden === 'domicilio' ? direccion?.description : null,
                latitude: tipoOrden === 'domicilio' ? direccion?.lat : null,
                longitude: tipoOrden === 'domicilio' ? direccion?.lng : null,
                referencia: tipoOrden === 'domicilio' ? referencia : null
            };
            
            setDatosParaCheckout(pedidoData);
            const res = await apiClient.post('/payments/create-payment-intent', { amount: totalFinal });
            setShowCartModal(false);
            setModalView('cart');
            setClientSecret(res.data.clientSecret);
            setShowPaymentModal(true);
        } catch (err) {
            notify('error', 'No se pudo iniciar el proceso de pago.');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleContinue = () => {
        if (tipoOrden !== 'domicilio') {
            handleProcederAlPago();
        } else {
            setModalView('address');
        }
    };

    const handleSuccessfulPayment = async () => {
        if (guardarDireccion && direccion) {
            try {
                const datosParaGuardar = { ...direccion, referencia };
                await apiClient.put('/usuarios/mi-direccion', datosParaGuardar);
                notify('success', 'Dirección y referencia guardadas.');
                setDireccionGuardada(datosParaGuardar);
            } catch (err) {
                notify('error', 'No se pudo guardar la dirección y referencia.');
            }
        }
        notify('success', '¡Pedido realizado y pagado con éxito! 🎉');
        limpiarPedidoCompleto();
        setShowPaymentModal(false);
        setClientSecret('');
        setActiveTab('ver');
    };

    const handleProductClick = (item) => {
        setProductoSeleccionadoParaModal(item);
    };

    const getStatusBadge = (estado) => { 
        const base = 'badge fw-bold p-2';
        switch (estado) { 
            case 'Pendiente': return `${base} bg-warning text-dark`; 
            case 'En Preparacion': return `${base} bg-info text-dark`; 
            case 'Listo para Recoger': return `${base} bg-success text-white`; 
            case 'Completado': return `${base} bg-secondary text-white`; 
            case 'En Camino': return `${base} bg-primary text-white`; 
            default: return `${base} bg-light text-dark`; 
        } 
    };
    
    const handleToggleDetalle = (pedidoId) => { setOrdenExpandida(ordenExpandida === pedidoId ? null : pedidoId); };
    const totalItemsEnCarrito = pedidoActual.reduce((sum, item) => sum + item.cantidad, 0);

    const pageStyle = {
        pointerEvents: (productoSeleccionadoParaModal || showPaymentModal || showCartModal) ? 'none' : 'auto'
    };


    return (
        <div className={darkBgClass} style={pageStyle}> 
            <ul className={`nav nav-tabs mb-4 ${isDark ? 'nav-tabs-dark' : ''}`}>
                <li className="nav-item">
                    <button className={`nav-link fw-bold d-flex align-items-center gap-2 ${activeTab === 'crear' ? 'active text-primary' : (isDark ? 'text-white' : 'text-dark')}`} onClick={() => setActiveTab('crear')}>
                        <Edit3 size={18} /> Crear un Pedido
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-bold d-flex align-items-center gap-2 ${activeTab === 'ver' ? 'active text-primary' : (isDark ? 'text-white' : 'text-dark')}`} onClick={() => setActiveTab('ver')}>
                        <ListChecks size={18} /> Mis Pedidos
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-bold d-flex align-items-center gap-2 ${activeTab === 'recompensas' ? 'active text-primary' : (isDark ? 'text-white' : 'text-dark')}`} onClick={() => setActiveTab('recompensas')}>
                        <Award size={18} /> Mis Recompensas
                    </button>
                </li>
            </ul>

            {/* --- CONTENIDO DE PESTAÑAS --- */}
            
            {loading && <div className="text-center p-5"><div className={`spinner-border ${spinnerColor}`} role="status"></div><p className="mt-2 text-muted">Cargando...</p></div>}
            {error && <div className="alert alert-danger p-3 rounded-3">{error}</div>}

            {/* PESTAÑA 1: CREAR PEDIDO */}
            {!loading && activeTab === 'crear' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="row">
                    <div className="col-md-8">
                        <h2 className={`fw-bold mb-4 ${isDark ? 'text-primary' : 'text-dark'}`}>Menú Disponible</h2>
                        <div className="row g-4">
                            {menuItems?.map(item => (
                                <div key={item.id} className="col-6 col-md-4 col-lg-3">
                                    
                                    <div 
                                        className={`${cardClass} h-100 text-center cursor-pointer transition-shadow hover-shadow-lg`} 
                                        onClick={() => handleProductClick(item)} 
                                        style={{ cursor: 'pointer', borderRadius: '10px' }}
                                    >
                                        <div className="card-body d-flex flex-column justify-content-between p-3">
                                            <h6 className="card-title fw-bold mb-3">{item.nombre}</h6>
                                            <div className="mt-auto">
                                                {item.en_oferta ? (
                                                    <div>
                                                        <span className="text-muted text-decoration-line-through me-2 small">${Number(item.precio_original).toFixed(2)}</span>
                                                        <span className="card-text fw-bolder fs-5 text-success">${Number(item.precio).toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <p className="card-text fw-bolder fs-5 text-primary">${Number(item.precio).toFixed(2)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CARRITO (Desktop) */}
                    <div className="col-md-4 d-none d-md-block">
                        <div className={`${cardClass} position-sticky`} style={{ top: '20px', borderRadius: '15px' }}>
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
                                isDark={isDark} // Pasar tema
                                inputClass={inputClass} // Pasar clase de input
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            <hr className={isDark ? 'border-secondary mt-5' : 'mt-5'} />

            {/* PESTAÑA 2: MIS PEDIDOS */}
            {!loading && activeTab === 'ver' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className={`fw-bold mb-4 ${isDark ? 'text-primary' : 'text-dark'}`}>Historial de Pedidos</h2>
                    {(!Array.isArray(misPedidos) || misPedidos.length === 0) ? (
                        <div className={`p-4 text-center rounded-3 ${lightBgClass}`}><p className="mb-0">No has realizado ningún pedido aún. ¡Comienza uno!</p></div>
                    ) : (
                        <div className="table-responsive">
                            <table className={`table table-hover ${isDark ? 'table-dark' : ''} align-middle`}>
                                <thead className={isDark ? 'border-secondary' : 'table-light'}>
                                    <tr>
                                        <th className="fw-bold">ID</th>
                                        <th className="fw-bold">Fecha</th>
                                        <th className="fw-bold">Tipo</th>
                                        <th className="fw-bold">Estado</th>
                                        <th className="text-end fw-bold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {misPedidos?.map(p => (
                                        <React.Fragment key={p.id}>
                                            <tr style={{ cursor: 'pointer' }} onClick={() => handleToggleDetalle(p.id)} className={isDark ? 'text-white' : ''}>
                                                <td>#{p.id}</td>
                                                <td>{new Date(p.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                <td><span className={`badge ${isDark ? 'bg-info bg-opacity-10 text-info' : 'bg-secondary bg-opacity-10 text-secondary'} fw-normal`}>{p.tipo_orden}</span></td>
                                                <td><span className={getStatusBadge(p.estado)}>{p.estado}</span></td>
                                                <td className="text-end fw-bold text-success">${Number(p.total).toFixed(2)}</td>
                                            </tr>
                                            {ordenExpandida === p.id && (
                                                <tr>
                                                    <td colSpan="5" className={`p-0 border-0 ${isDark ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                                                        <motion.div 
                                                            className="p-4" 
                                                            initial={{ opacity: 0, height: 0 }} 
                                                            animate={{ opacity: 1, height: 'auto' }} 
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <h6 className="mb-3 fw-bold text-primary">Detalle de Productos</h6>
                                                            <ul className="list-unstyled">
                                                            {p.productos?.map(producto => (
                                                                <li key={`${p.id}-${producto.nombre}`} className="d-flex justify-content-between py-1 border-bottom">
                                                                    <div>
                                                                        <span className="fw-semibold me-2">{producto.cantidad}x {producto.nombre}</span>
                                                                        {producto.opciones && <small className={`text-muted d-block ${isDark ? 'text-secondary' : ''}`}>+ {producto.opciones}</small>}
                                                                    </div>
                                                                    <span className="fw-semibold">${(producto.cantidad * Number(producto.precio)).toFixed(2)}</span>
                                                                </li>
                                                            ))}
                                                            </ul>
                                                            {p.costo_envio > 0 && (
                                                                <div className="d-flex justify-content-between mt-2 pt-2 fw-bold text-info border-top border-info border-opacity-50">
                                                                    <span>Costo de Envío</span>
                                                                    <span>${Number(p.costo_envio).toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            )}

            <hr className={isDark ? 'border-secondary mt-5' : 'mt-5'} />

            {/* PESTAÑA 3: MIS RECOMPENSAS */}
            {!loading && activeTab === 'recompensas' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className={`fw-bold mb-4 ${isDark ? 'text-primary' : 'text-dark'}`}>Mis Recompensas</h2>
                    {(!misRecompensas || misRecompensas.length === 0) ? (
                        <div className={`${lightBgClass} p-5 text-center rounded-3`}>
                            <img
                                src="/tito-icon.png" 
                                alt="Icono de Tito Cafe"
                                className="mb-3"
                                style={{ width: '80px', height: '80px', filter: isDark ? 'invert(1)' : 'none' }}
                            />
                            <h3 className="fw-bold">Aún no tienes recompensas</h3>
                            <p className={isDark ? 'text-secondary' : 'text-muted'}>¡Sigue comprando! Ganas una recompensa por cada 20 compras. 🎁</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {misRecompensas.map(recompensa => (
                                <div key={recompensa.id} className="col-12">
                                    <motion.div whileHover={{ scale: 1.02 }} style={styles.cupon}>
                                        <div style={styles.cuponIcon}>⭐</div>
                                        <div style={styles.cuponBody}>
                                            <h4 style={styles.cuponTitle}>{recompensa.nombre}</h4>
                                            <p style={styles.cuponDescription}>Canjeable por un producto seleccionado. ¡Felicidades!</p>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}


            {/* --- SECCIÓN DE MODALES --- */}

            {/* Botón Carrito Flotante (Móvil) */}
            {activeTab === 'crear' && pedidoActual.length > 0 && (
                <button 
                    className="btn btn-primary btn-lg rounded-pill shadow-lg d-md-none" 
                    onClick={() => setShowCartModal(true)}
                    style={{ 
                        pointerEvents: 'auto', 
                        position: 'fixed', 
                        bottom: '20px', 
                        right: '20px',
                        zIndex: 1050,
                        padding: '10px 20px'
                    }} 
                >
                    <ShoppingCart size={20} className="me-2"/> <span className="fw-bold">Ver Carrito</span>
                    <span className="ms-2 badge bg-white text-primary rounded-pill">{totalItemsEnCarrito}</span>
                </button>
            )}

            {/* Modal de Carrito/Dirección (Móvil) */}
            {showCartModal && (
                <div 
                    className="modal show fade" 
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
                >
                    <motion.div 
                        initial={{ y: '100%', opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    >
                        <div className={`${cardClass} modal-content border-0`} style={{ borderRadius: '12px' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">{modalView === 'cart' ? 'Mi Pedido' : 'Dirección de Entrega'}</h5>
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
                                    isDark={isDark} // Pasar tema
                                    inputClass={inputClass} // Pasar clase de input
                                />
                            ) : (
                                <>
                                    <div className="modal-body p-4">
                                        <div className={`p-3 rounded-3 ${lightBgClass}`}>
                                            {direccionGuardada && (<button className="btn btn-outline-info w-100 mb-3 fw-bold" onClick={usarDireccionGuardada}>Usar mi dirección guardada</button>)}
                                            <label className="form-label fw-bold">Busca tu dirección:</label>
                                            <MapSelector onLocationSelect={handleLocationSelect} initialAddress={direccion} className={inputClass} />
                                            <div className="mt-3">
                                                <label htmlFor="referenciaModal" className="form-label fw-bold">Referencia:</label>
                                                <input type="text" id="referenciaModal" className={inputClass} value={referencia} onChange={(e) => setReferencia(e.target.value)} />
                                            </div>
                                            <div className="form-check mt-3">
                                                <input className="form-check-input" type="checkbox" id="guardarDireccionModal" checked={guardarDireccion} onChange={(e) => setGuardarDireccion(e.target.checked)} />
                                                <label className={`form-check-label ${isDark ? 'text-white' : ''}`} htmlFor="guardarDireccionModal">Guardar dirección</label>
                                            </div>
                                            <hr className={isDark ? 'border-secondary' : ''} />
                                            <p className="d-flex justify-content-between fw-light">Subtotal: <span>${subtotal.toFixed(2)}</span></p>
                                            <p className="d-flex justify-content-between fw-light">Costo de Envío: {calculandoEnvio ? <span className={`spinner-border spinner-border-sm ${spinnerColor}`}></span> : <span>${costoEnvio.toFixed(2)}</span>}</p>
                                            <h4 className="d-flex justify-content-between fw-bold mt-2">Total: <span className="text-success">${totalFinal.toFixed(2)}</span></h4>
                                        </div>
                                    </div>
                                    <div className="modal-footer d-flex justify-content-between border-0 p-4">
                                        <button className="btn btn-secondary fw-bold rounded-pill px-4" onClick={() => setModalView('cart')}>Volver</button>
                                        <button className="btn btn-primary fw-bold rounded-pill px-4" onClick={handleProcederAlPago} disabled={!direccion || paymentLoading || calculandoEnvio}>{paymentLoading ? 'Iniciando...' : 'Confirmar y Pagar'}</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}


            {/* Modal de Detalle de Producto */}
            {productoSeleccionadoParaModal && (
                <div style={{ pointerEvents: 'auto' }}>
                    <ProductDetailModal
                        product={productoSeleccionadoParaModal}
                        onClose={() => setProductoSeleccionadoParaModal(null)}
                        onAddToCart={agregarProductoAPedido}
                        // 🚨 Asumo que el modal de detalle de producto también acepta isDark
                        isDark={isDark} 
                    />
                </div>
            )}


            {/* Modal de Pago (Stripe) */}
            {showPaymentModal && clientSecret && (
                <div 
                    className="modal show fade" 
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
                >
                    <motion.div 
                        initial={{ y: -50, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="modal-dialog modal-md modal-dialog-centered"
                    >
                        <div className={`${cardClass} modal-content border-0`} style={{ borderRadius: '12px' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-success d-flex align-items-center gap-2"><DollarSign size={20}/> Finalizar Compra</h5>
                                <button type="button" className={`btn-close ${isDark ? 'btn-close-white' : ''}`} onClick={() => setShowPaymentModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutForm
                                        handleSuccess={handleSuccessfulPayment}
                                        total={totalFinal}
                                        datosPedido={datosParaCheckout}
                                        isDark={isDark} // Pasar tema
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