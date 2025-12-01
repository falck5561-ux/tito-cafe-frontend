import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion'; // Requerido para las animaciones suaves
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ShoppingBag, Package, Star, MapPin, Truck, CheckCircle, Minus, Plus as PlusIcon, Trash2, Home, School } from 'lucide-react'; 
import CheckoutForm from '../components/CheckoutForm';
import MapSelector from '../components/MapSelector';
import apiClient from '../services/api';
import { useCart } from '../context/CartContext';
import ProductDetailModal from '../components/ProductDetailModal';

// Nota: Asegúrate de que tu useTheme esté importado correctamente desde tu context.
const useTheme = () => ({ theme: 'dark' }); 

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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


// --- CarritoContent (Componente interno con estilos aplicados) ---
const CarritoContent = ({
  isModal, pedidoActual, decrementarCantidad, incrementarCantidad, eliminarProducto, tipoOrden, setTipoOrden, direccionGuardada, usarDireccionGuardada, handleLocationSelect, direccion, referencia, setReferencia, guardarDireccion, setGuardarDireccion, subtotal, costoEnvio, calculandoEnvio, totalFinal, handleContinue, handleProcederAlPago, paymentLoading, limpiarPedidoCompleto
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const listClass = isDark ? 'list-group-item bg-dark text-white border-secondary' : 'list-group-item';
    const listGroupFlushClass = isDark ? 'list-group-flush border-top border-secondary' : 'list-group-flush';
    const formCheckInputClass = isDark ? 'form-check-input bg-dark border-secondary' : 'form-check-input';
    const inputClass = isDark ? 'form-control form-control-dark bg-dark text-white border-secondary' : 'form-control';

    return (
        <>
            <div className={isModal ? "modal-body" : "card-body"}>
                {!isModal && (
                    <>
                        <h3 className="card-title text-center fw-bold">Mi Pedido</h3>
                        <hr className={isDark ? "border-secondary" : ""}/>
                    </>
                )}
                <ul className={`list-group ${listGroupFlushClass}`}>
                    {pedidoActual.length === 0 && <li className={`${listClass} text-center text-muted`}>Tu carrito está vacío</li>}
                    
                    {pedidoActual.map((item) => (
                        <li key={item.cartItemId || item.id} className={`${listClass} d-flex align-items-center justify-content-between p-2`}>
                            
                            <div className="me-auto" style={{ paddingRight: '10px' }}> 
                                <span className="fw-bold">{item.nombre}</span>
                                
                                {item.opcionesSeleccionadas && item.opcionesSeleccionadas.length > 0 && (
                                    <ul className="list-unstyled small text-info mb-0" style={{ marginTop: '-3px' }}>
                                        {item.opcionesSeleccionadas.map(opcion => (
                                            <li key={opcion.id}>+ {opcion.nombre}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="d-flex align-items-center bg-light rounded-pill p-1 shadow-sm" style={{ pointerEvents: 'auto' }}>
                                <button className="btn btn-sm btn-link text-dark p-0 px-2" onClick={() => decrementarCantidad(item.cartItemId || item.id)}><Minus size={16}/></button>
                                <span className="mx-1 fw-bold text-dark">{item.cantidad}</span>
                                <button className="btn btn-sm btn-link text-dark p-0 px-2" onClick={() => incrementarCantidad(item.cartItemId || item.id)}><PlusIcon size={16}/></button>
                            </div>
                            
                            <span className="mx-3 fw-bold text-success" style={{ minWidth: '70px', textAlign: 'right' }}>${(item.cantidad * Number(item.precio)).toFixed(2)}</span>
                            <button className="btn btn-sm btn-link text-danger p-0" onClick={() => eliminarProducto(item.cartItemId || item.id)}><Trash2 size={18}/></button>
                        </li>
                    ))}
                </ul>
                <hr className={isDark ? "border-secondary" : ""}/>

                <h5 className="fw-bold mb-3">Elige una opción:</h5>
                <div className="d-flex flex-column gap-2">
                    <div className="form-check">
                        <input className={formCheckInputClass} type="radio" name={isModal ? "tipoOrdenModal" : "tipoOrden"} id={isModal ? "llevarModal" : "llevar"} value="llevar" checked={tipoOrden === 'llevar'} onChange={(e) => setTipoOrden(e.target.value)} />
                        <label className="form-check-label d-flex align-items-center gap-2" htmlFor={isModal ? "llevarModal" : "llevar"}><CheckCircle size={18}/> Para Recoger</label>
                    </div>
                    <div className="form-check">
                        <input className={formCheckInputClass} type="radio" name={isModal ? "tipoOrdenModal" : "tipoOrden"} id={isModal ? "localModal" : "local"} value="local" checked={tipoOrden === 'local'} onChange={(e) => setTipoOrden(e.target.value)} />
                        <label className="form-check-label d-flex align-items-center gap-2" htmlFor={isModal ? "localModal" : "local"}><School size={18}/> Para La Escuela</label>
                    </div>
                    <div className="form-check">
                        <input className={formCheckInputClass} type="radio" name={isModal ? "tipoOrdenModal" : "tipoOrden"} id={isModal ? "domicilioModal" : "domicilio"} value="domicilio" checked={tipoOrden === 'domicilio'} onChange={(e) => setTipoOrden(e.target.value)} />
                        <label className="form-check-label d-flex align-items-center gap-2" htmlFor={isModal ? "domicilioModal" : "domicilio"}><Truck size={18}/> Entrega a Domicilio</label>
                    </div>
                </div>

                {tipoOrden === 'domicilio' && !isModal && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded" style={{ backgroundColor: isDark ? '#1e1e1e' : '#eee' }}>
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-info"><MapPin size={18}/> Dirección de Envío</h6>
                        {direccionGuardada && (<button className="btn btn-info w-100 mb-3 d-flex align-items-center justify-content-center gap-2 fw-bold rounded-pill" onClick={usarDireccionGuardada}><Home size={18}/> Usar mi dirección guardada</button>)}

                        <label className="form-label small text-muted">Busca tu dirección:</label>
                        <MapSelector onLocationSelect={handleLocationSelect} initialAddress={direccion} />

                        <div className="mt-3">
                            <label htmlFor="referenciaDesktop" className="form-label fw-bold">Referencia:</label>
                            <input type="text" id="referenciaDesktop" className={inputClass} value={referencia} onChange={(e) => setReferencia(e.target.value)} />
                        </div>

                        <div className="form-check mt-3">
                            <input className={formCheckInputClass} type="checkbox" id="guardarDireccionDesktop" checked={guardarDireccion} onChange={(e) => setGuardarDireccion(e.target.checked)} />
                            <label className="form-check-label" htmlFor="guardarDireccionDesktop">Guardar dirección</label>
                        </div>
                    </motion.div>
                )}

                <hr className={isDark ? "border-secondary" : ""}/>
                <p className="d-flex justify-content-between fw-medium">Subtotal: <span>${subtotal.toFixed(2)}</span></p>
                {tipoOrden === 'domicilio' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex justify-content-between fw-medium text-info">
                        Costo de Envío: {calculandoEnvio ? <span className="spinner-border spinner-border-sm"></span> : <span>${costoEnvio.toFixed(2)}</span>}
                    </motion.p>
                )}
                <h4 className="fw-bold d-flex justify-content-between pt-2 border-top">Total: <span className="text-success">${totalFinal.toFixed(2)}</span></h4>
            </div>

            <div className={isModal ? "modal-footer d-grid gap-2" : "card-footer d-grid gap-2 mt-auto"}>
                {isModal ? (
                    <button
                        className="btn btn-primary fw-bold rounded-pill"
                        onClick={handleContinue}
                        disabled={pedidoActual.length === 0 || paymentLoading}
                    >
                        {tipoOrden === 'domicilio' ? 'Siguiente' : 'Proceder al Pago'}
                    </button>
                ) : (
                    <button
                        className="btn btn-primary fw-bold rounded-pill"
                        onClick={handleProcederAlPago}
                        disabled={pedidoActual.length === 0 || paymentLoading || (tipoOrden === 'domicilio' && !direccion) || calculandoEnvio}
                    >
                        {paymentLoading ? 'Iniciando...' : 'Proceder al Pago'}
                    </button>
                )}
                <button className="btn btn-outline-danger fw-bold rounded-pill" onClick={limpiarPedidoCompleto}>Vaciar Carrito</button>
            </div>
        </>
    );
};


// --- ClientePage (Componente Principal) ---
function ClientePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const {
        pedidoActual, subtotal, incrementarCantidad, decrementarCantidad, eliminarProducto, limpiarPedido, agregarProductoAPedido
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

    // --- FUNCIÓN DE RENDERIZADO DE TABS (ESTILO CÁPSULA) ---
    const renderTabs = () => {
        const tabs = [
            { id: 'crear', label: 'Hacer un Pedido', icon: <ShoppingBag size={18} /> },
            { id: 'ver', label: 'Mis Pedidos', icon: <Package size={18} /> },
            { id: 'recompensas', label: 'Mis Recompensas', icon: <Star size={18} /> },
        ];
        const tabBg = isDark ? '#1e1e1e' : '#f8f9fa';

        return (
            <div className="d-flex gap-2 mb-5 p-3 rounded-3 shadow-sm" style={{ backgroundColor: tabBg, maxWidth: 'fit-content' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-bold transition-all shadow-sm`}
                        style={{
                            backgroundColor: activeTab === tab.id ? '#0d6efd' : 'transparent',
                            color: activeTab === tab.id ? '#fff' : (isDark ? '#ccc' : '#555'),
                            border: activeTab === tab.id ? 'none' : `1px solid ${isDark ? '#444' : '#ccc'}`,
                            transition: 'all 0.2s',
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>
        );
    };
    // --- FIN RENDER TABS ---


    // --- Efectos y Manejadores (Sin cambios funcionales mayores) ---
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
        notify('success', '¡Pedido realizado y pagado con éxito!');
        limpiarPedidoCompleto();
        setShowPaymentModal(false);
        setClientSecret('');
        setActiveTab('ver');
    };

    
    const handleProductClick = (item) => {
        setProductoSeleccionadoParaModal(item);
    };
    
    const getStatusBadge = (estado) => { switch (estado) { case 'Pendiente': return 'bg-warning text-dark'; case 'En Preparacion': return 'bg-info text-dark'; case 'Listo para Recoger': return 'bg-success text-white'; case 'Completado': return 'bg-secondary text-white'; case 'En Camino': return 'bg-primary text-white'; default: return 'bg-light text-dark'; } };
    const handleToggleDetalle = (pedidoId) => { setOrdenExpandida(ordenExpandida === pedidoId ? null : pedidoId); };
    const totalItemsEnCarrito = pedidoActual.reduce((sum, item) => sum + item.cantidad, 0);

    const pageStyle = {
        pointerEvents: (productoSeleccionadoParaModal || showPaymentModal || showCartModal) ? 'none' : 'auto'
    };


    return (
        <div className="container mt-4" style={pageStyle}> 
            
            {/* Reemplazamos el ul.nav con el componente estilizado */}
            {renderTabs()}

            {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && activeTab === 'crear' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row">
                    <div className="col-md-8">
                        <h2 className={`fw-bold mb-4 ${isDark ? 'text-white' : 'text-dark'}`}>Elige tus Productos</h2>
                        <div className="row g-3">
                            {menuItems?.map(item => (
                                <div key={item.id} className="col-6 col-md-4 col-lg-3">
                                    
                                    <div 
                                        className={`card h-100 text-center shadow-sm ${isDark ? 'bg-secondary text-white border-secondary' : ''}`} 
                                        onClick={() => handleProductClick(item)} 
                                        style={{ cursor: 'pointer', overflow: 'hidden' }}
                                    >
                                        {item.en_oferta && (
                                            <span className="badge bg-danger position-absolute top-0 start-0 m-2 rounded-pill shadow-sm">
                                                -{item.descuento_porcentaje}%
                                            </span>
                                        )}
                                        <div className="card-body d-flex flex-column justify-content-center pt-4">
                                            <h5 className="card-title fw-bold mt-2">{item.nombre}</h5>
                                            {item.en_oferta ? (
                                                <div>
                                                    <span className="text-muted text-decoration-line-through me-2">${Number(item.precio_original).toFixed(2)}</span>
                                                    <span className="card-text fw-bold fs-5 text-success">${Number(item.precio).toFixed(2)}</span>
                                                </div>
                                            ) : (
                                                <p className="card-text fw-bold fs-5">${Number(item.precio).toFixed(2)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-md-4 d-none d-md-block">
                        <div className={`card shadow-lg position-sticky ${isDark ? 'bg-dark text-white border-secondary' : ''}`} style={{ top: '20px' }}>
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
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {!loading && activeTab === 'ver' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className={`fw-bold mb-4 ${isDark ? 'text-white' : 'text-dark'}`}>Mis Pedidos</h2>
                    {(!Array.isArray(misPedidos) || misPedidos.length === 0) ? (
                        <p className="text-center text-muted">No has realizado ningún pedido.</p>
                    ) : (
                        <div className={`table-responsive card p-3 shadow-sm ${isDark ? 'bg-dark text-white border-secondary' : ''}`}>
                            <table className={`table table-hover ${isDark ? 'table-dark' : ''}`}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Estado</th>
                                        <th className="text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {misPedidos?.map(p => (
                                        <React.Fragment key={p.id}>
                                            <tr style={{ cursor: 'pointer' }} onClick={() => handleToggleDetalle(p.id)}>
                                                <td><span className="fw-bold text-primary">#{p.id}</span></td>
                                                <td>{new Date(p.fecha).toLocaleString('es-MX')}</td>
                                                <td><span className={`badge ${p.tipo_orden === 'domicilio' ? 'bg-info text-dark' : 'bg-secondary'}`}>{p.tipo_orden}</span></td>
                                                <td><span className={`badge ${getStatusBadge(p.estado)}`}>{p.estado}</span></td>
                                                <td className="text-end fw-bold text-success">${Number(p.total).toFixed(2)}</td>
                                            </tr>
                                            {ordenExpandida === p.id && (
                                                <tr>
                                                    <td colSpan="5" className={isDark ? 'bg-dark' : 'bg-light'}>
                                                        <motion.div className="p-3 border rounded" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                                                            <h5 className="mb-3 fw-bold">Detalle del Pedido</h5>
                                                            {p.productos?.map(producto => (
                                                                <div key={`${p.id}-${producto.nombre}`} className="d-flex justify-content-between py-1">
                                                                    <div>
                                                                        <span>{producto.cantidad}x <span className="fw-medium">{producto.nombre}</span></span>
                                                                        {producto.opciones && <small className="text-info d-block" style={{marginTop: '-5px'}}>+ {producto.opciones}</small>}
                                                                    </div>
                                                                    <span>${(producto.cantidad * Number(producto.precio)).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                            {p.costo_envio > 0 && (
                                                                <div className="d-flex justify-content-between py-1 mt-2 pt-2 border-top">
                                                                    <span className="fw-bold">Costo de Envío</span>
                                                                    <span className="fw-bold">${Number(p.costo_envio).toFixed(2)}</span>
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

            {!loading && activeTab === 'recompensas' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className={`fw-bold mb-4 ${isDark ? 'text-white' : 'text-dark'}`}>Mis Recompensas</h2>
                    {(!misRecompensas || misRecompensas.length === 0) ? (
                        <p className="text-center text-muted">Aún no tienes recompensas. ¡Sigue comprando!</p>
                    ) : (
                        <div className="row g-4">
                            {misRecompensas.map(recompensa => (
                                <div key={recompensa.id} className="col-12">
                                    {/* Estilo de cupón mejorado con alto contraste */}
                                    <div className={`d-flex align-items-center p-4 rounded-3 shadow-sm ${isDark ? 'bg-info text-dark' : 'bg-success text-white'}`} style={{ borderLeft: '8px solid var(--bs-warning)' }}>
                                        <div className="fs-1 me-4">🎁</div>
                                        <div className="flex-grow-1">
                                            <h4 className="fw-bold m-0">{recompensa.nombre}</h4>
                                            <p className="m-0 small">¡Usalo en tu próxima compra!</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}


            {/* --- SECCIÓN DE MODALES --- */}

            {activeTab === 'crear' && pedidoActual.length > 0 && (
                <button 
                    className="boton-carrito-flotante d-md-none" 
                    onClick={() => setShowCartModal(true)}
                    style={{ pointerEvents: 'auto' }}
                >
                    🛒 <span className="badge-carrito">{totalItemsEnCarrito}</span>
                </button>
            )}

            {showCartModal && (
                <div 
                    className="modal show fade" 
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
                >
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-scrollable">
                        <div className={`modal-content shadow-lg ${isDark ? 'bg-dark text-white border-secondary' : ''}`}>
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
                                />
                            ) : (
                                <>
                                    <div className="modal-body">
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-info"><MapPin size={18}/> Domicilio de Entrega</h6>
                                        {direccionGuardada && (<button className="btn btn-info w-100 mb-3 d-flex align-items-center justify-content-center gap-2 fw-bold rounded-pill" onClick={usarDireccionGuardada}><Home size={18}/> Usar mi dirección guardada</button>)}
                                        
                                        <label className="form-label small text-muted">Busca tu dirección:</label>
                                        <MapSelector onLocationSelect={handleLocationSelect} initialAddress={direccion} apiKey={apiKey}/>
                                        
                                        <div className="mt-3">
                                            <label htmlFor="referenciaModal" className="form-label fw-bold">Referencia:</label>
                                            <input type="text" id="referenciaModal" className={`form-control ${isDark ? 'form-control-dark bg-dark text-white border-secondary' : ''}`} value={referencia} onChange={(e) => setReferencia(e.target.value)} />
                                        </div>
                                        <div className="form-check mt-3">
                                            <input className="form-check-input" type="checkbox" id="guardarDireccionModal" checked={guardarDireccion} onChange={(e) => setGuardarDireccion(e.target.checked)} />
                                            <label className="form-check-label" htmlFor="guardarDireccionModal">Guardar dirección</label>
                                        </div>
                                    </div>
                                    <div className="modal-footer d-flex justify-content-between">
                                        <button className="btn btn-secondary fw-bold rounded-pill" onClick={() => setModalView('cart')}>Volver</button>
                                        <button className="btn btn-primary fw-bold rounded-pill" onClick={handleProcederAlPago} disabled={!direccion || paymentLoading || calculandoEnvio}>{paymentLoading ? 'Iniciando...' : 'Confirmar y Pagar'}</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}


            {productoSeleccionadoParaModal && (
                <div style={{ pointerEvents: 'auto' }}>
                    <ProductDetailModal
                        product={productoSeleccionadoParaModal}
                        onClose={() => setProductoSeleccionadoParaModal(null)}
                        onAddToCart={agregarProductoAPedido}
                    />
                </div>
            )}


            {showPaymentModal && clientSecret && (
                <div 
                    className="modal show fade" 
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
                >
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog">
                        <div className={`modal-content shadow-lg ${isDark ? 'bg-dark text-white border-secondary' : ''}`}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Finalizar Compra</h5>
                                <button type="button" className={`btn-close ${isDark ? 'btn-close-white' : ''}`} onClick={() => setShowPaymentModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutForm
                                        handleSuccess={handleSuccessfulPayment}
                                        total={totalFinal}
                                        datosPedido={datosParaCheckout}
                                    />
                                </Elements>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div> // Cierre final del componente
    );
}

export default ClientePage;