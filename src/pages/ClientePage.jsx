// Archivo: src/pages/ClientePage.jsx (Versión con direcciones guardadas)

import React, { useState, useEffect, useCallback } from 'react';
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
  
  // --- NUEVOS ESTADOS PARA DIRECCIONES ---
  const [direccionGuardada, setDireccionGuardada] = useState(null);
  const [guardarDireccion, setGuardarDireccion] = useState(false);

  const totalFinal = subtotal + costoEnvio;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Carga de datos según la pestaña activa
      let endpoint = '';
      if (activeTab === 'crear') {
        const res = await axios.get('/api/productos');
        setProductos(res.data);
        // Al cargar la pestaña de crear, también buscamos la dirección guardada
        const resDir = await axios.get('/api/usuarios/mi-direccion');
        if (resDir.data) {
          setDireccionGuardada(resDir.data);
        }
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
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    setCostoEnvio(0);
    setDireccion(null);
    setGuardarDireccion(false);
  };

  const handleLocationSelect = async (location) => {
    setDireccion(location);
    setCalculandoEnvio(true);
    setCostoEnvio(0);
    try {
      const res = await axios.post('/api/pedidos/calculate-delivery-cost', { lat: location.lat, lng: location.lng });
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
      toast.success('Usando dirección guardada.');
    }
  };

  const handleProcederAlPago = async () => {
    if (totalFinal <= 0) return;
    if (tipoOrden === 'domicilio' && !direccion) {
      return toast.error('Por favor, selecciona o escribe tu ubicación.');
    }
    if (calculandoEnvio) {
      return toast.error('Espera a que termine el cálculo del envío.');
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
    if (guardarDireccion && direccion) {
      try {
        await axios.put('/api/usuarios/mi-direccion', direccion);
        toast.success('Dirección guardada para futuras compras.');
        setDireccionGuardada(direccion);
      } catch (err) {
        toast.error('No se pudo guardar la dirección.');
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

  const getStatusBadge = (estado) => {
    // ... tu función getStatusBadge se queda igual
  };

  return (
    <div>
      {/* ... Tus tabs y loading/error se quedan igual ... */}
      <ul className="nav nav-tabs mb-4">{/*...*/}</ul>
      {loading && <div className="text-center">{/*...*/}</div>}
      {error && <div className="alert alert-danger">{/*...*/}</div>}

      {!loading && activeTab === 'crear' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row">
          <div className="col-md-8">{/* ... Tu lista de productos se queda igual ... */}</div>
          
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                {/* ... Título y lista de productos en el carrito se quedan igual ... */}
                <h3 className="card-title text-center">Mi Pedido</h3>
                <hr />
                <ul className="list-group list-group-flush">{pedidoActual.map((item, i) => (<li key={i} className="list-group-item d-flex justify-content-between"><span>{item.cantidad}x {item.nombre}</span><span>${(item.cantidad * Number(item.precio)).toFixed(2)}</span></li>))}</ul>
                <hr />
                
                <h5>Elige una opción:</h5>
                {/* ... Tus radio buttons para tipo de orden se quedan igual ... */}
                <div className="form-check">{/*...*/}</div>
                <div className="form-check">{/*...*/}</div>
                <div className="form-check">{/*...*/}</div>

                {tipoOrden === 'domicilio' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    {direccionGuardada && (
                      <button className="btn btn-outline-info w-100 mb-3" onClick={usarDireccionGuardada}>
                        Usar mi dirección guardada
                      </button>
                    )}
                    <label className="form-label">Dirección de Entrega:</label>
                    <MapSelector 
                      onLocationSelect={handleLocationSelect}
                      initialAddress={direccion}
                    />
                  </motion.div>
                )}

                {tipoOrden === 'domicilio' && direccion && (
                  <div className="form-check mt-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="guardarDireccion"
                      checked={guardarDireccion}
                      onChange={(e) => setGuardarDireccion(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="guardarDireccion">
                      Guardar/Actualizar esta dirección para futuras compras
                    </label>
                  </div>
                )}
                
                <hr />
                {/* ... Subtotal, Costo de Envío, Total y Botones se quedan igual ... */}
                <p className="d-flex justify-content-between">Subtotal: <span>${subtotal.toFixed(2)}</span></p>
                {/*...*/}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ... Tus vistas de 'ver' y 'recompensas' se quedan igual ... */}
      {!loading && activeTab === 'ver' && (<div>{/*...*/}</div>)}
      {!loading && activeTab === 'recompensas' && (<div>{/*...*/}</div>)}

      {/* ... Tu modal de pago se queda igual ... */}
      {showPaymentModal && clientSecret && (<div>{/*...*/}</div>)}
    </div>
  );
}

export default ClientePage;