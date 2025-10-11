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
  const [referencia, setReferencia] = useState('');

  const totalFinal = subtotal + costoEnvio;

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
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === 'crear' || !token) return;
      setLoading(true);
      try {
        if (activeTab === 'ver') {
          const res = await axios.get('/api/pedidos/mis-pedidos');
          setMisPedidos(res.data);
        } else if (activeTab === 'recompensas') {
          const res = await axios.get('/api/recompensas/mis-recompensas');
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

  const agregarProductoAPedido = (producto) => { setPedidoActual(prev => { const existe = prev.find(item => item.id === producto.id); if (existe) { return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item); } return [...prev, { ...producto, cantidad: 1 }]; }); };
  const limpiarPedido = () => { setPedidoActual([]); setCostoEnvio(0); setDireccion(null); setGuardarDireccion(false); setReferencia(''); };
  const handleLocationSelect = async (location) => { setDireccion(location); setCalculandoEnvio(true); setCostoEnvio(0); try { const res = await axios.post('/api/pedidos/calculate-delivery-cost', { lat: location.lat, lng: location.lng }); setCostoEnvio(res.data.deliveryCost); toast.success(`Costo de envío: $${res.data.deliveryCost.toFixed(2)}`); } catch (err) { toast.error(err.response?.data?.msg || 'No se pudo calcular el costo de envío.'); setDireccion(null); } finally { setCalculandoEnvio(false); } };
  
  const usarDireccionGuardada = () => {
    if (direccionGuardada) {
      handleLocationSelect(direccionGuardada);
      if (direccionGuardada.referencia) {
        setReferencia(direccionGuardada.referencia);
      }
      toast.success('Usando dirección guardada.');
    }
  };
  
  const handleProcederAlPago = async () => { if (totalFinal <= 0) return; if (tipoOrden === 'domicilio' && !direccion) { return toast.error('Por favor, selecciona o escribe tu ubicación.'); } if (calculandoEnvio) { return toast.error('Espera a que termine el cálculo del envío.'); } setPaymentLoading(true); try { const res = await axios.post('/api/payments/create-payment-intent', { amount: totalFinal }); setClientSecret(res.data.clientSecret); setShowPaymentModal(true); } catch (err) { toast.error('No se pudo iniciar el proceso de pago.'); } finally { setPaymentLoading(false); } };
  
  const handleSuccessfulPayment = async () => {
    if (guardarDireccion && direccion) {
      try {
        const datosParaGuardar = { ...direccion, referencia: referencia };
        await axios.put('/api/usuarios/mi-direccion', datosParaGuardar);
        toast.success('Dirección y referencia guardadas.');
        setDireccionGuardada(datosParaGuardar);
      } catch (err) {
        toast.error('No se pudo guardar la dirección y referencia.');
      }
    }
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
      toast.error(err.response?.data?.msg || 'Hubo un error al registrar tu pedido.');
    }
  };
  
  const getStatusBadge = (estado) => { /* ...código sin cambios... */ };

  return (
    <div>
      {/* ...JSX de tabs... */}
      {!loading && activeTab === 'crear' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row">
          <div className="col-md-8">{/* ...JSX de productos... */}</div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                {/* ...JSX del pedido... */}
                <h5>Elige una opción:</h5>
                {/* ...JSX de radios... */}
                {tipoOrden === 'domicilio' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    {direccionGuardada && (<button className="btn btn-outline-info w-100 mb-3" onClick={usarDireccionGuardada}>Usar mi dirección guardada</button>)}
                    <label className="form-label">Dirección de Entrega:</label>
                    <MapSelector onLocationSelect={handleLocationSelect} initialAddress={direccion} />
                    <div className="mt-3">
                      <label htmlFor="referencia" className="form-label">Referencia (opcional):</label>
                      <input
                        type="text"
                        id="referencia"
                        className="form-control"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                        placeholder="Ej: Casa azul, portón negro"
                      />
                    </div>
                  </motion.div>
                )}
                {tipoOrden === 'domicilio' && direccion && (
                  <div className="form-check mt-3">
                    <input className="form-check-input" type="checkbox" id="guardarDireccion" checked={guardarDireccion} onChange={(e) => setGuardarDireccion(e.target.checked)} />
                    <label className="form-check-label" htmlFor="guardarDireccion">Guardar/Actualizar dirección y referencia para futuras compras</label>
                  </div>
                )}
                {/* ...JSX de totales y botones... */}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* ...JSX de otras tabs y modal... */}
    </div>
  );
}

export default ClientePage;