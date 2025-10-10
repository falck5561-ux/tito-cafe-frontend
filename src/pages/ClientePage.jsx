// Archivo: src/pages/ClientePage.jsx (CORREGIDO con autenticación para el cálculo de costo)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import MapSelector from '../components/MapSelector';
import AddressSearch from '../components/AddressSearch';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function ClientePage() {
  const [activeTab, setActiveTab] = useState('crear');
  const [productos, setProductos] = useState([]);
  const [pedidoActual, setPedidoActual] = useState([]);
  
  const [subtotal, setSubtotal] = useState(0);
  const [tipoOrden, setTipoOrden] = useState('llevar');
  const [direccion, setDireccion] = useState(null); 
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [calculandoCosto, setCalculandoCosto] = useState(false);

  const [misPedidos, setMisPedidos] = useState([]);
  const [misRecompensas, setMisRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const totalFinal = subtotal + costoEnvio;

  // ===== ESTA ES LA FUNCIÓN QUE SE CORRIGIÓ =====
  const handleAddressSelection = async (selected) => {
    setDireccion(selected);
    setCalculandoCosto(true);
    
    try {
      // 1. Obtenemos el token guardado en el navegador (localStorage)
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        setCalculandoCosto(false);
        return;
      }

      // 2. Creamos las cabeceras de autenticación para enviar el token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // 3. Enviamos la petición CON las cabeceras de autenticación
      const res = await axios.post('/api/pedidos/calculate-delivery-cost', { 
        lat: selected.lat, 
        lng: selected.lng 
      }, config); // <-- Se añade 'config' a la petición

      setCostoEnvio(res.data.deliveryCost);
      toast.success(`Costo de envío: $${res.data.deliveryCost.toFixed(2)}`);

    } catch (error) {
      toast.error("Ubicación fuera del área de entrega o error de servidor.");
      setCostoEnvio(0);
      setDireccion(null);
    } finally {
      setCalculandoCosto(false);
    }
  };
  
  // El resto de tu código se queda igual...
  useEffect(() => {
    if (tipoOrden !== 'domicilio') {
        setDireccion(null);
        setCostoEnvio(0);
    }
  }, [tipoOrden]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'crear') {
        const res = await axios.get('/api/productos');
        setProductos(res.data);
      } else {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        if (activeTab === 'ver') {
          const res = await axios.get('/api/pedidos/mis-pedidos', config);
          setMisPedidos(res.data);
        } else if (activeTab === 'recompensas') {
          const res = await axios.get('/api/recompensas/mis-recompensas', config);
          setMisRecompensas(res.data);
        }
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

  const limpiarPedido = () => {
    setPedidoActual([]);
    setDireccion(null);
    setCostoEnvio(0);
  };

  const handleProcederAlPago = async () => {
    if (totalFinal <= 0) return;
    if (tipoOrden === 'domicilio' && !direccion) { 
      return toast.error('Por favor, selecciona tu dirección en el mapa.');
    }
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post('/api/payments/create-payment-intent', { amount: totalFinal }, config);
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
    const pedidoData = { 
      total: totalFinal, 
      productos: productosParaEnviar,
      tipo_orden: tipoOrden,
      direccion_entrega: tipoOrden === 'domicilio' ? direccion.text : null,
      latitude: tipoOrden === 'domicilio' ? direccion.lat : null,
      longitude: tipoOrden === 'domicilio' ? direccion.lng : null,
      costo_envio: costoEnvio
    };
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post('/api/pedidos', pedidoData, config);
      if (res.data.recompensaGenerada) {
        toast.success('¡Felicidades! Ganaste un premio. Revisa "Mis Recompensas".', { duration: 6000, icon: '🎁' });
      } else {
        toast.success('¡Pedido realizado y pagado con éxito!');
      }
      limpiarPedido();
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
                {tipoOrden === 'domicilio' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    <AddressSearch onSelect={handleAddressSelection} />
                    <MapSelector onAddressSelect={handleAddressSelection} selectedLocation={direccion} />
                  </motion.div>
                )}
                <hr />
                <p className="d-flex justify-content-between">Subtotal: <span>${subtotal.toFixed(2)}</span></p>
                {tipoOrden === 'domicilio' && (
                  <p className="d-flex justify-content-between">
                    Costo de Envío:
                    <span>
                      {calculandoCosto ? <div className="spinner-border spinner-border-sm"></div> : `$${costoEnvio.toFixed(2)}`}
                    </span>
                  </p>
                )}
                <h4>Total: ${totalFinal.toFixed(2)}</h4>
                <div className="d-grid gap-2 mt-3">
                  <button className="btn btn-primary" onClick={handleProcederAlPago} disabled={pedidoActual.length === 0 || paymentLoading || calculandoCosto}>
                    {paymentLoading ? 'Iniciando...' : 'Proceder al Pago'}
                  </button>
                  <button className="btn btn-outline-danger" onClick={limpiarPedido}>Vaciar Carrito</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* El resto de tu JSX no cambia... */}
    </div>
  );
}

export default ClientePage;