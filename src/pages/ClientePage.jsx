import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import MapSelector from '../components/MapSelector';

// --- CONFIGURACIÓN GLOBAL DE AXIOS ---
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://tito-cafe-backend.onrender.com';
// ------------------------------------

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function ClientePage() {
  const [activeTab, setActiveTab] = useState('crear');
  const [ordenExpandida, setOrdenExpandida] = useState(null);
  const [productos, setProductos] = useState([]);
  const [pedidoActual, setPedidoActual] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tipoOrden, setTipoOrden] = useState('llevar');
  const [direccion, setDireccion] = useState(null);
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [calculandoEnvio, setCalculandoEnvio] = useState(false);
  const [misPedidos, setMisPedidos] = useState([]);
  const [misRecompensas, setMisRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [direccionGuardada, setDireccionGuardada] = useState(null);
  const [guardarDireccion, setGuardarDireccion] = useState(false);
  const [referencia, setReferencia] = useState('');

  const [showCartModal, setShowCartModal] = useState(false);
  const [modalView, setModalView] = useState('cart');

  const totalFinal = subtotal + costoEnvio;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [productosRes, direccionRes] = await Promise.all([
          axios.get('/api/productos', config),
          axios.get('/api/usuarios/mi-direccion', config)
        ]);
        setProductos(productosRes.data);
        if (direccionRes.data) {
          setDireccionGuardada(direccionRes.data);
        }
      } catch (err) {
        setError('No se pudieron cargar los datos iniciales.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchTabData = async () => {
      const token = localStorage.getItem('token');
      if (activeTab === 'crear' || !token) return;
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      setLoading(true);
      setError('');
      try {
        if (activeTab === 'ver') {
          const res = await axios.get('/api/pedidos/mis-pedidos', config);
          setMisPedidos(res.data);
        } else if (activeTab === 'recompensas') {
          const res = await axios.get('/api/recompensas/mis-recompensas', config);
          setMisRecompensas(res.data);
        }
      } catch (err) {
        setError('No se pudieron cargar los datos de la pestaña.');
      } finally {
        setLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab]);

  useEffect(() => {
    const nuevoSubtotal = pedidoActual.reduce((sum, item) => sum + item.cantidad * Number(item.precio), 0);
    setSubtotal(nuevoSubtotal);
  }, [pedidoActual]);

  useEffect(() => {
    if (tipoOrden !== 'domicilio') {
      setCostoEnvio(0);
      setDireccion(null);
    }
  }, [tipoOrden]);

  const agregarProductoAPedido = (producto) => {
    let precioFinal = Number(producto.precio);
    if (producto.en_oferta && producto.descuento_porcentaje > 0) {
      precioFinal = precioFinal * (1 - producto.descuento_porcentaje / 100);
    }

    setPedidoActual(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1, precio: precioFinal }];
    });
  };

  const incrementarCantidad = (productoId) => { setPedidoActual(prev => prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad + 1 } : item)); };
  const decrementarCantidad = (productoId) => { setPedidoActual(prev => { const producto = prev.find(item => item.id === productoId); if (producto.cantidad === 1) { return prev.filter(item => item.id !== productoId); } return prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item); }); };
  const eliminarProducto = (productoId) => { setPedidoActual(prev => prev.filter(item => item.id !== productoId)); };
  
  const limpiarPedido = () => {
    setPedidoActual([]);
    setCostoEnvio(0);
    setDireccion(null);
    setGuardarDireccion(false);
    setReferencia('');
    setShowCartModal(false);
  };

  const handleLocationSelect = async (location) => { setDireccion(location); setCalculandoEnvio(true); setCostoEnvio(0); try { const res = await axios.post('/api/pedidos/calculate-delivery-cost', { lat: location.lat, lng: location.lng }); setCostoEnvio(res.data.deliveryCost); toast.success(`Costo de envío: $${res.data.deliveryCost.toFixed(2)}`); } catch (err) { toast.error(err.response?.data?.msg || 'No se pudo calcular el costo de envío.'); setDireccion(null); } finally { setCalculandoEnvio(false); } };
  const usarDireccionGuardada = () => { if (direccionGuardada) { handleLocationSelect(direccionGuardada); if (direccionGuardada.referencia) { setReferencia(direccionGuardada.referencia); } toast.success('Usando dirección guardada.'); } };
  
  const handleProcederAlPago = async () => {
    if (totalFinal <= 0) return;
    if (tipoOrden === 'domicilio' && !direccion) { return toast.error('Por favor, selecciona o escribe tu ubicación.'); }
    if (calculandoEnvio) { return toast.error('Espera a que termine el cálculo del envío.'); }
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/payments/create-payment-intent', { amount: totalFinal }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowCartModal(false);
      setModalView('cart');

      setClientSecret(res.data.clientSecret);
      setShowPaymentModal(true);
    } catch (err) {
      toast.error('No se pudo iniciar el proceso de pago.');
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
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    if (guardarDireccion && direccion) {
      try {
        const datosParaGuardar = { ...direccion, referencia };
        await axios.put('/api/usuarios/mi-direccion', datosParaGuardar, config);
        toast.success('Dirección y referencia guardadas.');
        setDireccionGuardada(datosParaGuardar);
      } catch (err) {
        toast.error('No se pudo guardar la dirección y referencia.');
      }
    }
    const productosParaEnviar = pedidoActual.map(({ id, cantidad, precio, nombre }) => ({ id, cantidad, precio: Number(precio), nombre }));
    const pedidoData = { total: totalFinal, productos: productosParaEnviar, tipo_orden: tipoOrden, costo_envio: costoEnvio, direccion_entrega: tipoOrden === 'domicilio' ? direccion?.description : null, latitude: tipoOrden === 'domicilio' ? direccion?.lat : null, longitude: tipoOrden === 'domicilio' ? direccion?.lng : null, referencia: tipoOrden === 'domicilio' ? referencia : null };
    try {
      const res = await axios.post('/api/pedidos', pedidoData, config);
      if (res.data.recompensaGenerada) { toast.success('¡Felicidades! Ganaste un premio.', { duration: 6000, icon: '🎁' }); } else { toast.success('¡Pedido realizado y pagado con éxito!'); }
      limpiarPedido();
      setShowPaymentModal(false);
      setClientSecret('');
      setActiveTab('ver');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Hubo un error al registrar tu pedido.');
    }
  };

  const getStatusBadge = (estado) => { switch (estado) { case 'Pendiente': return 'bg-warning text-dark'; case 'En Preparacion': return 'bg-info text-dark'; case 'Listo para Recoger': return 'bg-success text-white'; case 'Completado': return 'bg-secondary text-white'; case 'En Camino': return 'bg-primary text-white'; default: return 'bg-light text-dark'; } };
  const handleToggleDetalle = (pedidoId) => { setOrdenExpandida(ordenExpandida === pedidoId ? null : pedidoId); };
  const totalItemsEnCarrito = pedidoActual.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'crear' ? 'active' : ''}`} onClick={() => setActiveTab('crear')}>Hacer un Pedido</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'ver' ? 'active' : ''}`} onClick={() => setActiveTab('ver')}>Mis Pedidos</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'recompensas' ? 'active' : ''}`} onClick={() => setActiveTab('recompensas')}>Mis Recompensas</button></li>
      </ul>

      {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && activeTab === 'crear' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row">
          <div className="col-md-8">
            <h2>Elige tus Productos</h2>
            <div className="row g-3">
              {productos?.map(p => {
                const precioConDescuento = Number(p.precio) * (1 - p.descuento_porcentaje / 100);
                return (
                  <div key={p.id} className="col-md-4 col-lg-3">
                    <div 
                      className="card h-100 text-center shadow-sm position-relative" 
                      onClick={() => agregarProductoAPedido(p)} 
                      style={{ cursor: 'pointer', border: p.en_oferta ? '2px solid #dc3545' : '' }}
                    >
                      {/* --- CAMBIO: Se usa la clase 'discount-badge' --- */}
                      {p.en_oferta && <span className="discount-badge">-{p.descuento_porcentaje}%</span>}
                      
                      <div className="card-body d-flex flex-column justify-content-center">
                        <h5 className="card-title">{p.nombre}</h5>
                        
                        {p.en_oferta && p.descuento_porcentaje > 0 ? (
                          <div>
                            <span className="text-muted text-decoration-line-through me-2">${Number(p.precio).toFixed(2)}</span>
                            <span className="card-text text-success fw-bold fs-5">${precioConDescuento.toFixed(2)}</span>
                          </div>
                        ) : (
                          <p className="card-text text-success fw-bold fs-5">${Number(p.precio).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="col-md-4 columna-carrito-escritorio">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-center">Mi Pedido</h3>
                <hr />
                <ul className="list-group list-group-flush">
                  {pedidoActual.length === 0 && <li className="list-group-item text-center text-muted">Tu carrito está vacío</li>}
                  {pedidoActual.map((item) => (
                    <li key={item.id} className="list-group-item d-flex align-items-center justify-content-between p-1">
                      <span className="me-auto">{item.nombre}</span>
                      <div className="d-flex align-items-center">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => decrementarCantidad(item.id)}>-</button>
                        <span className="mx-2">{item.cantidad}</span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => incrementarCantidad(item.id)}>+</button>
                      </div>
                      <span className="mx-3" style={{ minWidth: '60px', textAlign: 'right' }}>${(item.cantidad * Number(item.precio)).toFixed(2)}</span>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarProducto(item.id)}>&times;</button>
                    </li>
                  ))}
                </ul>
                <hr />
                <h5>Elige una opción:</h5>
                <div className="form-check"><input className="form-check-input" type="radio" name="tipoOrden" id="llevar" value="llevar" checked={tipoOrden === 'llevar'} onChange={(e) => setTipoOrden(e.target.value)} /><label className="form-check-label" htmlFor="llevar">Para Recoger</label></div>
                <div className="form-check"><input className="form-check-input" type="radio" name="tipoOrden" id="local" value="local" checked={tipoOrden === 'local'} onChange={(e) => setTipoOrden(e.target.value)} /><label className="form-check-label" htmlFor="local">Para Comer Aquí</label></div>
                <div className="form-check"><input className="form-check-input" type="radio" name="tipoOrden" id="domicilio" value="domicilio" checked={tipoOrden === 'domicilio'} onChange={(e) => setTipoOrden(e.target.value)} /><label className="form-check-label" htmlFor="domicilio">Entrega a Domicilio</label></div>
                {tipoOrden === 'domicilio' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    {direccionGuardada && (<button className="btn btn-outline-info w-100 mb-3" onClick={usarDireccionGuardada}>Usar mi dirección guardada</button>)}
                    <label className="form-label">Dirección de Entrega:</label>
                    <MapSelector onLocationSelect={handleLocationSelect} initialAddress={direccion} />
                    <div className="mt-3">
                      <label htmlFor="referencia" className="form-label">Referencia (opcional):</label>
                      <input type="text" id="referencia" className="form-control" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ej: Casa azul, portón negro"/>
                    </div>
                  </motion.div>
                )}
                {tipoOrden === 'domicilio' && direccion && (
                  <div className="form-check mt-3">
                    <input className="form-check-input" type="checkbox" id="guardarDireccion" checked={guardarDireccion} onChange={(e) => setGuardarDireccion(e.target.checked)} />
                    <label className="form-check-label" htmlFor="guardarDireccion">Guardar/Actualizar dirección y referencia para futuras compras</label>
                  </div>
                )}
                <hr />
                <p className="d-flex justify-content-between">Subtotal: <span>${subtotal.toFixed(2)}</span></p>
                {tipoOrden === 'domicilio' && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex justify-content-between">Costo de Envío: {calculandoEnvio ? <span className="spinner-border spinner-border-sm"></span> : <span>${costoEnvio.toFixed(2)}</span>}</motion.p>)}
                <h4>Total: ${totalFinal.toFixed(2)}</h4>
                <div className="d-grid gap-2 mt-3">
                  <button className="btn btn-primary" onClick={handleProcederAlPago} disabled={pedidoActual.length === 0 || paymentLoading || calculandoEnvio}>{paymentLoading ? 'Iniciando...' : 'Proceder al Pago'}</button>
                  <button className="btn btn-outline-danger" onClick={limpiarPedido}>Vaciar Carrito</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* El resto de las pestañas (Mis Pedidos, Mis Recompensas) y modales no necesitan cambios y se mantienen igual */}
      {/* ... */}
    </div>
  );
}

export default ClientePage;