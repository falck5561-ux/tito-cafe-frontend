// Archivo: src/pages/ClientePage.jsx (con integración de Google Maps)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import MapSelector from '../components/MapSelector'; // <-- CAMBIO: Se importa el nuevo componente de mapa

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function ClientePage() {
  const [activeTab, setActiveTab] = useState('crear');
  const [productos, setProductos] = useState([]);
  const [pedidoActual, setPedidoActual] = useState([]);
  
  // --- ESTADOS MODIFICADOS ---
  const [subtotal, setSubtotal] = useState(0);
  const [tipoOrden, setTipoOrden] = useState('llevar'); // Opciones: 'llevar', 'local', 'domicilio'
  const [direccion, setDireccion] = useState(null); // <-- CAMBIO: Ahora es null, guardará un objeto { lat, lng, text }
  const costoEnvio = 40.00; 
  // -------------------------

  const [misPedidos, setMisPedidos] = useState([]);
  const [misRecompensas, setMisRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const totalFinal = tipoOrden === 'domicilio' ? subtotal + costoEnvio : subtotal;

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'crear') {
        const res = await axios.get('/api/productos');
        setProductos(res.data);
      } else if (activeTab === 'ver') {
        const res = await axios.get('/api/pedidos/mis-pedidos');
        setMisPedidos(res.data);
      } else if (activeTab === 'recompensas') {
        const res = await axios.get('/api/recompensas/mis-recompensas');
        setMisRecompensas(res.data);
      }
    } catch (err) { 
      setError('No se pudieron cargar los datos.'); 
      console.error("Error en fetchData:", err);
    } 
    finally { setLoading(false); }
  };
  
  useEffect(() => { fetchData(); }, [activeTab]);
  
  useEffect(() => {
    const nuevoSubtotal = pedidoActual.reduce((sum, item) => sum + item.cantidad * Number(item.precio), 0);
    setSubtotal(nuevoSubtotal);
  }, [pedidoActual]);

  const agregarProductoAPedido = (producto) => {
    setPedidoActual(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const limpiarPedido = () => setPedidoActual([]);

  const handleProcederAlPago = async () => {
    if (totalFinal <= 0) return;
    
    // <-- CAMBIO: Se actualiza la validación de la dirección
    if (tipoOrden === 'domicilio' && !direccion) { 
      return toast.error('Por favor, selecciona tu dirección en el mapa.');
    }

    setPaymentLoading(true);
    try {
      const res = await axios.post('/api/payments/create-payment-intent', { amount: totalFinal });
      setClientSecret(res.data.clientSecret);
      setShowPaymentModal(true);
    } catch (err) {
      toast.error('No se pudo iniciar el proceso de pago.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSuccessfulPayment = async () => {
    const productosParaEnviar = pedidoActual.map(({ id, cantidad, precio, nombre }) => ({ id, cantidad, precio, nombre }));
    
    // <-- CAMBIO: Se actualiza el objeto que se envía al backend con las coordenadas
    const pedidoData = { 
      total: totalFinal, 
      productos: productosParaEnviar,
      tipo_orden: tipoOrden,
      direccion_entrega: tipoOrden === 'domicilio' ? direccion.text : null,
      latitude: tipoOrden === 'domicilio' ? direccion.lat : null,
      longitude: tipoOrden === 'domicilio' ? direccion.lng : null,
      costo_envio: tipoOrden === 'domicilio' ? costoEnvio : 0
    };
    
    try {
      const res = await axios.post('/api/pedidos', pedidoData);
      
      if (res.data.recompensaGenerada) {
        toast.success('¡Felicidades! Ganaste un premio. Revisa "Mis Recompensas".', { duration: 6000, icon: '🎁' });
      } else {
        toast.success('¡Pedido realizado y pagado con éxito!');
      }

      limpiarPedido();
      setDireccion(null); // <-- CAMBIO: Se limpia el estado de la dirección a null
      setShowPaymentModal(false);
      setClientSecret('');
      setActiveTab('ver'); 
    } catch (err) {
      toast.error('Hubo un error al registrar tu pedido. Contacta al soporte.');
    }
  };
  
  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-warning text-dark';
      case 'En Preparación': return 'bg-info text-dark';
      case 'Listo para Recoger': return 'bg-success';
      case 'Completado': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  };

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
            <div className="row g-3">{productos.map(p => (<div key={p.id} className="col-md-4 col-lg-3"><div className="card h-100 text-center shadow-sm" onClick={() => agregarProductoAPedido(p)} style={{ cursor: 'pointer' }}><div className="card-body d-flex flex-column justify-content-center"><h5 className="card-title">{p.nombre}</h5><p className="card-text text-success fw-bold">${Number(p.precio).toFixed(2)}</p></div></div></div>))}</div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-center">Mi Pedido</h3>
                <hr />
                <ul className="list-group list-group-flush">{pedidoActual.map((item, i) => (<li key={i} className="list-group-item d-flex justify-content-between"><span>{item.cantidad}x {item.nombre}</span><span>${(item.cantidad * Number(item.precio)).toFixed(2)}</span></li>))}</ul>
                <hr />

                <h5>Elige una opción:</h5>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="tipoOrden" id="llevar" value="llevar" checked={tipoOrden === 'llevar'} onChange={(e) => setTipoOrden(e.target.value)} />
                  <label className="form-check-label" htmlFor="llevar">Para Llevar</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="tipoOrden" id="local" value="local" checked={tipoOrden === 'local'} onChange={(e) => setTipoOrden(e.target.value)} />
                  <label className="form-check-label" htmlFor="local">Para Comer Aquí</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="tipoOrden" id="domicilio" value="domicilio" checked={tipoOrden === 'domicilio'} onChange={(e) => setTipoOrden(e.target.value)} />
                  <label className="form-check-label" htmlFor="domicilio">Entrega a Domicilio</label>
                </div>
                
                {/* <-- CAMBIO: Se reemplaza el textarea por el componente MapSelector --> */}
                {tipoOrden === 'domicilio' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    <MapSelector onAddressSelect={setDireccion} />
                  </motion.div>
                )}

                <hr />
                <p className="d-flex justify-content-between">Subtotal: <span>${subtotal.toFixed(2)}</span></p>
                {tipoOrden === 'domicilio' && (
                  <p className="d-flex justify-content-between">Costo de Envío: <span>${costoEnvio.toFixed(2)}</span></p>
                )}
                <h4>Total: ${totalFinal.toFixed(2)}</h4>

                <div className="d-grid gap-2 mt-3">
                  <button className="btn btn-primary" onClick={handleProcederAlPago} disabled={pedidoActual.length === 0 || paymentLoading}>
                    {paymentLoading ? 'Iniciando...' : 'Proceder al Pago'}
                  </button>
                  <button className="btn btn-outline-danger" onClick={limpiarPedido}>Vaciar Carrito</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ... (el resto del JSX para las otras pestañas y el modal no cambia) ... */}
      {!loading && activeTab === 'ver' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>Mis Pedidos</h2>
          {misPedidos.length === 0 ? <p className="text-center">No has realizado ningún pedido.</p> : (
            <div className="list-group">{misPedidos.map(p => (
              <div key={p.id} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between"><h5 className="mb-1">Pedido #{p.id}</h5><small>{new Date(p.fecha).toLocaleDateString()}</small></div>
                <p className="mb-1">Total: ${Number(p.total).toFixed(2)}</p>
                <small>Estado: <span className={`badge ${getStatusBadge(p.estado)}`}>{p.estado}</span></small>
              </div>))}
            </div>
          )}
        </motion.div>
      )}
      {!loading && activeTab === 'recompensas' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>Mis Recompensas</h2>
          {misRecompensas.length === 0 ? (
            <p className="text-center">Aún no tienes recompensas. ¡Sigue comprando para ganar premios!</p>
          ) : (
            <div className="row g-4">
              {misRecompensas.map(recompensa => (
                <div key={recompensa.id} className="col-md-6 col-lg-4">
                  <div className="card text-center text-white bg-dark shadow-lg" style={{ border: '2px dashed #00ff7f' }}>
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: '#00ff7f', fontWeight: 'bold' }}>🎁 ¡Cupón Ganado! 🎁</h5>
                      <p className="card-text">{recompensa.descripcion}</p>
                      <hr style={{ backgroundColor: '#00ff7f' }}/>
                      <p className="h3">ID del Cupón: {recompensa.id}</p>
                      <p className="card-text mt-2"><small>Muéstrale este ID al empleado para canjear tu premio.</small></p>
                      <p className="card-text mt-2"><small className="text-muted">Ganado el: {new Date(recompensa.fecha_creacion).toLocaleDateString()}</small></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
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
                  <CheckoutForm handleSuccess={handleSuccessfulPayment} total={totalFinal} />
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