import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import MapSelector from '../components/MapSelector';
import apiClient from '../services/api';
import ProductDetailModal from '../components/ProductDetailModal'; // Asegúrate que la ruta sea correcta

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51SFnF0ROWvZ0m785J38J20subms9zeVw92xxsdct2OVzHbIXF8Kueajcp4jxJblwBhozD1xDljC2UG1qDNOGOxTX00UiDpoLCI"
);

const styles = {
  recompensasContainer: { padding: '1rem 0' },
  cupon: {
    backgroundColor: '#2a9d8f',
    color: 'white',
    borderRadius: '15px',
    padding: '1.5rem 2rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    borderLeft: '10px dashed #264653',
    position: 'relative',
    marginBottom: '1rem'
  },
  cuponIcon: { fontSize: '3.5rem', marginRight: '2rem' },
  cuponBody: { flexGrow: 1 },
  cuponTitle: { margin: '0', fontSize: '1.5rem', fontWeight: 'bold' },
  cuponDescription: { margin: '0.25rem 0 0', fontSize: '1rem', opacity: 0.9 },
  cuponCantidad: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    backgroundColor: '#e9c46a',
    color: '#264653',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
  },
};

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
  const [datosParaCheckout, setDatosParaCheckout] = useState(null);

  // Estados para manejar el modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const totalFinal = subtotal + costoEnvio;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const results = await Promise.allSettled([
          apiClient.get('/productos'),
          apiClient.get('/usuarios/mi-direccion')
        ]);

        const productosResult = results[0];
        const direccionResult = results[1];

        if (productosResult.status === 'fulfilled') {
          setProductos(Array.isArray(productosResult.value.data) ? productosResult.value.data : []);
        } else {
          console.error("Error cargando productos:", productosResult.reason);
          throw new Error('No se pudieron cargar los productos.');
        }

        if (direccionResult.status === 'fulfilled' && direccionResult.value.data) {
          setDireccionGuardada(direccionResult.value.data);
        } else if (direccionResult.status === 'rejected') {
          console.warn("No se pudo cargar la dirección guardada:", direccionResult.reason.response?.data?.msg || direccionResult.reason.message);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

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
        setError('No se pudieron cargar los datos.');
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

  // =======================================================
  // ▼▼▼ FUNCIÓN DE DIAGNÓSTICO ▼▼▼
  // =======================================================
  const handleShowDetails = (product) => {
    // Esta línea nos dirá si el clic funciona.
    console.log("Intentando abrir detalles para:", product.nombre); 
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  const handleAddToCartFromModal = (product) => {
    agregarProductoAPedido(product);
    handleCloseDetails();
    toast.success(`${product.nombre} añadido al carrito!`);
  };

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

  // ... (el resto de tus funciones como incrementar, decrementar, etc., se mantienen igual)
  const incrementarCantidad = (productoId) => { setPedidoActual(prev => prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad + 1 } : item)); };
  const decrementarCantidad = (productoId) => { setPedidoActual(prev => { const p = prev.find(i => i.id === productoId); if (p.cantidad === 1) return prev.filter(i => i.id !== productoId); return prev.map(i => i.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i); }); };
  const eliminarProducto = (productoId) => { setPedidoActual(prev => prev.filter(item => item.id !== productoId)); };
  const limpiarPedido = () => { setPedidoActual([]); setCostoEnvio(0); setDireccion(null); setGuardarDireccion(false); setReferencia(''); setShowCartModal(false); };
  const handleLocationSelect = async (location) => { setDireccion(location); setCalculandoEnvio(true); setCostoEnvio(0); try { const res = await apiClient.post('/pedidos/calcular-envio', { lat: location.lat, lng: location.lng }); setCostoEnvio(res.data.deliveryCost); toast.success(`Costo de envío: $${res.data.deliveryCost.toFixed(2)}`); } catch (err) { toast.error(err.response?.data?.msg || 'No se pudo calcular.'); setDireccion(null); } finally { setCalculandoEnvio(false); } };
  const usarDireccionGuardada = () => { if (direccionGuardada) { handleLocationSelect(direccionGuardada); if (direccionGuardada.referencia) { setReferencia(direccionGuardada.referencia); } toast.success('Usando dirección guardada.'); } };
  const handleProcederAlPago = async () => { if (totalFinal <= 0 || (tipoOrden === 'domicilio' && !direccion) || calculandoEnvio) return; setPaymentLoading(true); try { const prods = pedidoActual.map(({ id, cantidad, precio, nombre }) => ({ id, cantidad, precio: Number(precio), nombre })); const pData = { total: totalFinal, productos: prods, tipo_orden: tipoOrden, costo_envio: costoEnvio, direccion_entrega: tipoOrden === 'domicilio' ? direccion?.description : null, latitude: tipoOrden === 'domicilio' ? direccion?.lat : null, longitude: tipoOrden === 'domicilio' ? direccion?.lng : null, referencia: tipoOrden === 'domicilio' ? referencia : null }; setDatosParaCheckout(pData); const res = await apiClient.post('/payments/create-payment-intent', { amount: totalFinal }); setShowCartModal(false); setModalView('cart'); setClientSecret(res.data.clientSecret); setShowPaymentModal(true); } catch (err) { toast.error('No se pudo iniciar el pago.'); } finally { setPaymentLoading(false); } };
  const handleContinue = () => { if (tipoOrden !== 'domicilio') handleProcederAlPago(); else setModalView('address'); };
  const handleSuccessfulPayment = async () => { if (guardarDireccion && direccion) { try { const d = { ...direccion, referencia }; await apiClient.put('/usuarios/mi-direccion', d); toast.success('Dirección guardada.'); setDireccionGuardada(d); } catch (err) { toast.error('No se pudo guardar la dirección.'); } } toast.success('¡Pedido realizado!'); limpiarPedido(); setShowPaymentModal(false); setClientSecret(''); setActiveTab('ver'); };
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
              {(Array.isArray(productos) ? productos : []).map(p => {
                const precioConDescuento = Number(p.precio) * (1 - p.descuento_porcentaje / 100);
                return (
                  <div key={p.id} className="col-md-4 col-lg-3">
                    <div 
                      className={`card h-100 text-center shadow-sm position-relative ${p.en_oferta ? 'en-oferta' : ''}`}
                      onClick={() => handleShowDetails(p)} 
                      style={{ cursor: 'pointer' }}
                    >
                      {p.en_oferta && <span className="discount-badge">-{p.descuento_porcentaje}%</span>}
                      <div className="card-body d-flex flex-column justify-content-center pt-4">
                        <h5 className="card-title">{p.nombre}</h5>
                        {p.en_oferta && p.descuento_porcentaje > 0 ? (
                          <div>
                            <span className="text-muted text-decoration-line-through me-2">${Number(p.precio).toFixed(2)}</span>
                            <span className="card-text fw-bold fs-5">${precioConDescuento.toFixed(2)}</span>
                          </div>
                        ) : (
                          <p className="card-text fw-bold fs-5">${Number(p.precio).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="col-md-4 columna-carrito-escritorio">
            {/* ... (tu código del carrito se mantiene igual) ... */}
          </div>
        </motion.div>
      )}

      {/* ... (el resto de tu JSX de Mis Pedidos, Recompensas, etc., se mantiene igual) ... */}

      {/* Código para renderizar el modal */}
      {showDetailModal && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseDetails}
          onAddToCart={handleAddToCartFromModal}
        />
      )}
    </div>
  );
}

export default ClientePage;

