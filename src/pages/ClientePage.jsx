// Archivo: src/pages/ClientePage.jsx (Versión Corregida Final)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Importaciones de Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function ClientePage() {
  const [activeTab, setActiveTab] = useState('crear');
  const [productos, setProductos] = useState([]);
  const [pedidoActual, setPedidoActual] = useState([]);
  const [total, setTotal] = useState(0);
  const [misPedidos, setMisPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // --- CAMBIO 1: Estado para guardar el clientSecret aquí ---
  const [clientSecret, setClientSecret] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'crear') {
        const res = await axios.get('https://tito-cafe-backend.onrender.com/api/productos');
        setProductos(res.data);
      } else if (activeTab === 'ver') {
        // --- ¡LÍNEA CORREGIDA! ---
        const res = await axios.get('https://tito-cafe-backend.onrender.com/api/pedidos/mis-pedidos');
        setMisPedidos(res.data);
      }
    } catch (err) { 
      setError('No se pudieron cargar los datos.'); 
      console.error("Error al cargar mis pedidos:", err); // Añadimos un log para ver el error si persiste
    } 
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [activeTab]);
  
  useEffect(() => {
    const nuevoTotal = pedidoActual.reduce((sum, item) => sum + item.cantidad * Number(item.precio), 0);
    setTotal(nuevoTotal);
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

  // --- CAMBIO 2: Nueva función para iniciar el pago ---
  const handleProcederAlPago = async () => {
    if (total <= 0) return;
    setPaymentLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://tito-cafe-backend.onrender.com/api/payments/create-payment-intent', 
        { amount: total },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClientSecret(res.data.clientSecret);
      setShowPaymentModal(true); // Abrimos el modal solo después de tener el secret
    } catch (err) {
      toast.error('No se pudo iniciar el proceso de pago.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSuccessfulPayment = async () => {
    const productosParaEnviar = pedidoActual.map(({ id, cantidad, precio, nombre }) => ({ id, cantidad, precio, nombre }));
    const pedidoData = { total, productos: productosParaEnviar };
    
    try {
      await axios.post('https://tito-cafe-backend.onrender.com/api/pedidos', pedidoData);
      toast.success('¡Pedido realizado y pagado con éxito!');
      limpiarPedido();
      setShowPaymentModal(false);
      setClientSecret('');
      setActiveTab('ver'); 
    } catch (err) {
      toast.error('El pago fue exitoso, pero hubo un error al registrar tu pedido.');
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
        {/* ... (código de las pestañas no cambia) ... */}
         <li className="nav-item"><button className={`nav-link ${activeTab === 'crear' ? 'active' : ''}`} onClick={() => setActiveTab('crear')}>Hacer un Pedido</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'ver' ? 'active' : ''}`} onClick={() => setActiveTab('ver')}>Mis Pedidos</button></li>
      </ul>

      {/* ... (código del loading, error, y renderizado de productos no cambia) ... */}
       {!loading && activeTab === 'crear' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row">
          <div className="col-md-8">
            <h2>Elige tus Productos</h2>
            <div className="row g-3">{productos.map(p => (<div key={p.id} className="col-md-4 col-lg-3"><div className="card h-100 text-center shadow-sm" onClick={() => agregarProductoAPedido(p)} style={{ cursor: 'pointer' }}><div className="card-body d-flex flex-column justify-content-center"><h5 className="card-title">{p.nombre}</h5><p className="card-text text-success fw-bold">${Number(p.precio).toFixed(2)}</p></div></div></div>))}</div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-center">Mi Pedido</h3><hr />
                <ul className="list-group list-group-flush">{pedidoActual.map((item, i) => (<li key={i} className="list-group-item d-flex justify-content-between"><span>{item.cantidad}x {item.nombre}</span><span>${(item.cantidad * Number(item.precio)).toFixed(2)}</span></li>))}</ul>
                <hr /><h4>Total: ${total.toFixed(2)}</h4>
                <div className="d-grid gap-2 mt-3">
                  {/* --- CAMBIO 3: El botón ahora llama a la nueva función --- */}
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

      {/* --- CAMBIO 4: El modal ahora solo se renderiza si tenemos un clientSecret --- */}
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
                  <CheckoutForm handleSuccess={handleSuccessfulPayment} total={total} />
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