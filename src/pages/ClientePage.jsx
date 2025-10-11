// Archivo: src/pages/ClientePage.jsx (Versión Definitiva y Unificada)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import MapSelector from '../components/MapSelector';

// --- CONFIGURACIÓN GLOBAL DE AXIOS ---
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://tito-cafe-backend.onrender.com';
// ------------------------------------

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function ClientePage() {
  // --- Estados del Componente ---
  const [activeTab, setActiveTab] = useState('crear');
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

  const totalFinal = subtotal + costoEnvio;

  // --- Efectos y Lógica ---

  // Efecto para cargar datos iniciales (productos y dirección guardada) una sola vez
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const [productosRes, direccionRes] = await Promise.all([
          axios.get('/api/productos'),
          axios.get('/api/usuarios/mi-direccion')
        ]);
        
        setProductos(productosRes.data);
        if (direccionRes.data) {
          setDireccionGuardada(direccionRes.data);
        }
      } catch (err) {
        setError('No se pudieron cargar los datos iniciales.');
        console.error("Error en fetchInitialData:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Efecto para cargar datos cuando se cambia de pestaña
  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === 'crear') return; // Los productos ya se cargaron inicialmente
      
      setLoading(true);
      setError('');
      try {
        let endpoint = '';
        if (activeTab === 'ver') endpoint = '/api/pedidos/mis-pedidos';
        else if (activeTab === 'recompensas') endpoint = '/api/recompensas/mis-recompensas';

        if (endpoint) {
          const res = await axios.get(endpoint);
          if (activeTab === 'ver') setMisPedidos(res.data);
          else if (activeTab === 'recompensas') setMisRecompensas(res.data);
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
    const nuevoSubtotal = pedidoActual.reduce((sum, item) => sum + item.cantidad * Number(item.precio), 0);
    setSubtotal(nuevoSubtotal);
  }, [pedidoActual]);

  useEffect(() => {
    if (tipoOrden !== 'domicilio') {
      setCostoEnvio(0);
      setDireccion(null);
    }
  }, [tipoOrden]);

  const agregarProductoAPedido = (producto) => { setPedidoActual(prev => { const existe = prev.find(item => item.id === producto.id); if (existe) { return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item); } return [...prev, { ...producto, cantidad: 1 }]; }); };
  const limpiarPedido = () => { setPedidoActual([]); setCostoEnvio(0); setDireccion(null); setGuardarDireccion(false); };
  const handleLocationSelect = async (location) => { setDireccion(location); setCalculandoEnvio(true); setCostoEnvio(0); try { const res = await axios.post('/api/pedidos/calculate-delivery-cost', { lat: location.lat, lng: location.lng }); setCostoEnvio(res.data.deliveryCost); toast.success(`Costo de envío: $${res.data.deliveryCost.toFixed(2)}`); } catch (err) { toast.error(err.response?.data?.msg || 'No se pudo calcular el costo de envío.'); setDireccion(null); } finally { setCalculandoEnvio(false); } };
  const usarDireccionGuardada = () => { if (direccionGuardada) { handleLocationSelect(direccionGuardada); toast.success('Usando dirección guardada.'); } };
  const handleProcederAlPago = async () => { if (totalFinal <= 0) return; if (tipoOrden === 'domicilio' && !direccion) { return toast.error('Por favor, selecciona o escribe tu ubicación.'); } if (calculandoEnvio) { return toast.error('Espera a que termine el cálculo del envío.'); } setPaymentLoading(true); try { const res = await axios.post('/api/payments/create-payment-intent', { amount: totalFinal }); setClientSecret(res.data.clientSecret); setShowPaymentModal(true); } catch (err) { toast.error('No se pudo iniciar el proceso de pago.'); } finally { setPaymentLoading(false); } };

  const handleSuccessfulPayment = async () => {
    // Guardar la dirección si el usuario lo eligió
    if (guardarDireccion && direccion) {
      try {
        await axios.put('/api/usuarios/mi-direccion', direccion);
        toast.success('Dirección guardada para futuras compras.');
        setDireccionGuardada(direccion);
      } catch (err) {
        toast.error('No se pudo guardar la dirección.');
      }
    }

    // CORRECCIÓN CRÍTICA: Asegurarse de que 'precio' es un número
    const productosParaEnviar = pedidoActual.map(({ id, cantidad, precio, nombre }) => ({
      id,
      cantidad,
      precio: Number(precio), // <-- AQUÍ ESTÁ LA CORRECCIÓN
      nombre
    }));
    
    const pedidoData = { 
      total: totalFinal, 
      productos: productosParaEnviar,
      tipo_orden: tipoOrden,
      costo_envio: costoEnvio,
      direccion_entrega: tipoOrden === 'domicilio' ? direccion?.description : null,
      latitude: tipoOrden === 'domicilio' ? direccion?.lat : null,
      longitude: tipoOrden === 'domicilio' ? direccion?.lng : null
    };

    try {
      const res = await axios.post('/api/pedidos', pedidoData);
      if (res.data.recompensaGenerada) {
        toast.success('¡Felicidades! Ganaste un premio.', { duration: 6000, icon: '🎁' });
      } else {
        toast.success('¡Pedido realizado y pagado con éxito!');
      }
      limpiarPedido();
      setShowPaymentModal(false);
      setClientSecret('');
      setActiveTab('ver'); 
    } catch (err) {
      console.error("Error al registrar el pedido:", err.response?.data || err.message);
      toast.error(err.response?.data?.msg || 'Hubo un error al registrar tu pedido.');
    }
  };

  const getStatusBadge = (estado) => { switch (estado) { case 'Pendiente': return 'bg-warning text-dark'; case 'En Preparacion': return 'bg-info text-dark'; case 'Listo para Recoger': return 'bg-success text-white'; case 'Completado': return 'bg-secondary text-white'; case 'En Camino': return 'bg-primary text-white'; default: return 'bg-light text-dark'; } };

  // --- JSX (VISTA DEL COMPONENTE) ---
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
                <div className="form-check"><input className="form-check-input" type="radio" name="tipoOrden" id="llevar" value="llevar" checked={tipoOrden === 'llevar'} onChange={(e) => setTipoOrden(e.target.value)} /><label className="form-check-label" htmlFor="llevar">Para Llevar</label></div>
                <div className="form-check"><input className="form-check-input" type="radio" name="tipoOrden" id="local" value="local" checked={tipoOrden === 'local'} onChange={(e) => setTipoOrden(e.target.value)} /><label className="form-check-label" htmlFor="local">Para Comer Aquí</label></div>
                <div className="form-check"><input className="form-check-input" type="radio" name="tipoOrden" id="domicilio" value="domicilio" checked={tipoOrden === 'domicilio'} onChange={(e) => setTipoOrden(e.target.value)} /><label className="form-check-label" htmlFor="domicilio">Entrega a Domicilio</label></div>

                {tipoOrden === 'domicilio' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    {direccionGuardada && (<button className="btn btn-outline-info w-100 mb-3" onClick={usarDireccionGuardada}>Usar mi dirección guardada</button>)}
                    <label className="form-label">Dirección de Entrega:</label>
                    <MapSelector onLocationSelect={handleLocationSelect} />
                  </motion.div>
                )}
                {tipoOrden === 'domicilio' && direccion && (
                  <div className="form-check mt-3">
                    <input className="form-check-input" type="checkbox" id="guardarDireccion" checked={guardarDireccion} onChange={(e) => setGuardarDireccion(e.target.checked)} />
                    <label className="form-check-label" htmlFor="guardarDireccion">Guardar/Actualizar esta dirección para futuras compras</label>
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

      {!loading && activeTab === 'ver' && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><h2>Mis Pedidos</h2>{misPedidos.length === 0 ? <p className="text-center">No has realizado ningún pedido.</p> : (<div className="list-group">{misPedidos.map(p => (<div key={p.id} className="list-group-item list-group-item-action"><div className="d-flex w-100 justify-content-between"><h5 className="mb-1">Pedido #{p.id} ({p.tipo_orden})</h5><small>{new Date(p.fecha).toLocaleDateString()}</small></div><p className="mb-1">Total: ${Number(p.total).toFixed(2)}</p><small>Estado: <span className={`badge ${getStatusBadge(p.estado)}`}>{p.estado}</span></small></div>))}</div>)}</motion.div>)}
      {!loading && activeTab === 'recompensas' && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><h2>Mis Recompensas</h2>{misRecompensas.length === 0 ? (<p className="text-center">Aún no tienes recompensas.</p>) : (<div className="row g-4">{misRecompensas.map(recompensa => (<div key={recompensa.id} className="col-md-6 col-lg-4"><div className="card text-center text-white bg-dark shadow-lg" style={{ border: '2px dashed #00ff7f' }}><div className="card-body"><h5 className="card-title" style={{ color: '#00ff7f', fontWeight: 'bold' }}>🎁 ¡Cupón Ganado! 🎁</h5><p className="card-text">{recompensa.descripcion}</p><hr style={{ backgroundColor: '#00ff7f' }} /><p className="h3">ID del Cupón: {recompensa.id}</p><p className="card-text mt-2"><small>Muéstrale este ID al empleado para canjear tu premio.</small></p><p className="card-text mt-2"><small className="text-muted">Ganado el: {new Date(recompensa.fecha_creacion).toLocaleDateString()}</small></p></div></div></div>))}</div>)}</motion.div>)}
      {showPaymentModal && clientSecret && (<div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}><motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog"><div className="modal-content"><div className="modal-header"><h5 className="modal-title">Finalizar Compra</h5><button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button></div><div className="modal-body"><Elements stripe={stripePromise} options={{ clientSecret }}><CheckoutForm handleSuccess={handleSuccessfulPayment} total={totalFinal} /></Elements></div></div></motion.div></div>)}
    </div>
  );
}

export default ClientePage;