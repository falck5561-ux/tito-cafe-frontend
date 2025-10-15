import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import MapSelector from '../components/MapSelector';
import apiClient from '../services/api';
import ProductDetailModal from '../components/ProductDetailModal'; // 1. Importar el nuevo modal

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

  // 2. Estados para manejar el modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const totalFinal = subtotal + costoEnvio;

  // ==== Cargar productos y dirección inicial ====
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
          throw new Error('No se pudieron cargar los productos. Por favor, intenta más tarde.');
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

  // ==== Cargar datos de pestañas (pedidos/recompensas) ====
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
      } finally {
        setLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab]);

  // ==== Calcular subtotal ====
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

  // 3. Funciones para abrir y cerrar el modal de detalles
  const handleShowDetails = (product) => {
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

  // ==== Funciones de carrito ====
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

  const incrementarCantidad = (productoId) => {
    setPedidoActual(prev => prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad + 1 } : item));
  };

  const decrementarCantidad = (productoId) => {
    setPedidoActual(prev => {
      const producto = prev.find(item => item.id === productoId);
      if (producto.cantidad === 1) {
        return prev.filter(item => item.id !== productoId);
      }
      return prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item);
    });
  };

  const eliminarProducto = (productoId) => {
    setPedidoActual(prev => prev.filter(item => item.id !== productoId));
  };

  const limpiarPedido = () => {
    setPedidoActual([]);
    setCostoEnvio(0);
    setDireccion(null);
    setGuardarDireccion(false);
    setReferencia('');
    setShowCartModal(false);
  };

  // ==== Funciones de dirección ====
  const handleLocationSelect = async (location) => {
    setDireccion(location);
    setCalculandoEnvio(true);
    setCostoEnvio(0);
    try {
      const res = await apiClient.post('/pedidos/calcular-envio', { lat: location.lat, lng: location.lng });
      setCostoEnvio(res.data.deliveryCost);
      toast.success(`Costo de envío: $${res.data.deliveryCost.toFixed(2)}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'No se pudo calcular el costo de envío.');
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
      toast.success('Usando dirección guardada.');
    }
  };

  // ==== Pago ====
  const handleProcederAlPago = async () => {
    if (totalFinal <= 0) return;
    if (tipoOrden === 'domicilio' && !direccion) return toast.error('Por favor, selecciona o escribe tu ubicación.');
    if (calculandoEnvio) return toast.error('Espera a que termine el cálculo del envío.');

    setPaymentLoading(true);
    try {
      const productosParaEnviar = pedidoActual.map(({ id, cantidad, precio, nombre }) => ({ id, cantidad, precio: Number(precio), nombre }));
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
      toast.error('No se pudo iniciar el proceso de pago.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleContinue = () => {
    if (tipoOrden !== 'domicilio') handleProcederAlPago();
    else setModalView('address');
  };

  const handleSuccessfulPayment = async () => {
    if (guardarDireccion && direccion) {
      try {
        const datosParaGuardar = { ...direccion, referencia };
        await apiClient.put('/usuarios/mi-direccion', datosParaGuardar);
        toast.success('Dirección y referencia guardadas.');
        setDireccionGuardada(datosParaGuardar);
      } catch (err) {
        toast.error('No se pudo guardar la dirección y referencia.');
      }
    }
    toast.success('¡Pedido realizado y pagado con éxito!');
    limpiarPedido();
    setShowPaymentModal(false);
    setClientSecret('');
    setActiveTab('ver');
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-warning text-dark';
      case 'En Preparacion': return 'bg-info text-dark';
      case 'Listo para Recoger': return 'bg-success text-white';
      case 'Completado': return 'bg-secondary text-white';
      case 'En Camino': return 'bg-primary text-white';
      default: return 'bg-light text-dark';
    }
  };

  const handleToggleDetalle = (pedidoId) => {
    setOrdenExpandida(ordenExpandida === pedidoId ? null : pedidoId);
  };

  const totalItemsEnCarrito = pedidoActual.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div>
      {/* ==== Tabs ==== */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'crear' ? 'active' : ''}`} onClick={() => setActiveTab('crear')}>Hacer un Pedido</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'ver' ? 'active' : ''}`} onClick={() => setActiveTab('ver')}>Mis Pedidos</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'recompensas' ? 'active' : ''}`} onClick={() => setActiveTab('recompensas')}>Mis Recompensas</button></li>
      </ul>

      {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ==== Crear Pedido ==== */}
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
                      onClick={() => handleShowDetails(p)} // 4. CAMBIO CLAVE: El onClick ahora abre el modal
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
                {tipoOrden === 'domicilio' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex justify-content-between">
                    Costo de Envío: {calculandoEnvio ? <span className="spinner-border spinner-border-sm"></span> : <span>${costoEnvio.toFixed(2)}</span>}
                  </motion.p>
                )}
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

      {/* ==== Mis Pedidos ==== */}
      {!loading && activeTab === 'ver' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>Mis Pedidos</h2>
          {(!Array.isArray(misPedidos) || misPedidos.length === 0) ? (
            <p className="text-center">No has realizado ningún pedido.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead><tr><th>ID</th><th>Fecha</th><th>Tipo</th><th>Estado</th><th className="text-end">Total</th></tr></thead>
                <tbody>
                  {(misPedidos || []).map(p => (
                    <React.Fragment key={p.id}>
                      <tr style={{ cursor: 'pointer' }} onClick={() => handleToggleDetalle(p.id)}>
                        <td>#{p.id}</td>
                        <td>{new Date(p.fecha).toLocaleString('es-MX')}</td>
                        <td>{p.tipo_orden}</td>
                        <td><span className={`badge ${getStatusBadge(p.estado)}`}>{p.estado}</span></td>
                        <td className="text-end">${Number(p.total).toFixed(2)}</td>
                      </tr>
                      {ordenExpandida === p.id && (
                        <tr>
                          <td colSpan="5">
                            <motion.div className="detalle-pedido-productos" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                              <h5 className="mb-3">Detalle del Pedido #{p.id}</h5>
                              {(Array.isArray(p.productos) ? p.productos : []).map(producto => (
                                <div key={`${p.id}-${producto.nombre}`} className="detalle-pedido-item">
                                  <span>{producto.cantidad}x {producto.nombre}</span>
                                  <span>${(producto.cantidad * Number(producto.precio)).toFixed(2)}</span>
                                </div>
                              ))}
                              {p.costo_envio > 0 && (
                                <div className="detalle-pedido-item mt-2 pt-2 border-top">
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

      {/* ==== Mis Recompensas ==== */}
      {!loading && activeTab === 'recompensas' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="mb-4">Mis Recompensas</h2>
          {(!Array.isArray(misRecompensas) || misRecompensas.length === 0) ? (
            <div className="no-recompensas-box">
              <h3>Aún no tienes recompensas</h3>
              <p>¡Sigue comprando para ganar bebidas gratis y más sorpresas!</p>
            </div>
          ) : (
            <div className="row g-4">
              {(misRecompensas || []).map(recompensa => (
                <div key={recompensa.id} className="col-12">
                  <div style={styles.cupon}>
                    <div style={styles.cuponIcon}>🎁</div>
                    <div style={styles.cuponBody}>
                      <h4 style={styles.cuponTitle}>{recompensa.nombre}</h4>
                      <p style={styles.cuponDescription}>{recompensa.descripcion}</p>
                    </div>
                    <div style={styles.cuponCantidad}>Tienes {recompensa.cantidad}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ==== Modal de Pago ==== */}
      {showPaymentModal && clientSecret && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Finalizar Compra</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
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

      {/* ==== Botón flotante carrito ==== */}
      {pedidoActual.length > 0 && (
        <button className="boton-carrito-flotante d-md-none" onClick={() => setShowCartModal(true)}>
          🛒
          <span className="badge-carrito">{totalItemsEnCarrito}</span>
        </button>
      )}

      {/* ==== Modal Carrito / Dirección ==== */}
      {showCartModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              {/* Omitido por brevedad, tu código del carrito va aquí */}
            </div>
          </motion.div>
        </div>
      )}

      {/* 5. AÑADIR ESTO AL FINAL: Renderiza el modal cuando sea necesario */}
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

