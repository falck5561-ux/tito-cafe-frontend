// Archivo: src/pages/ClientePage.jsx (Versión Final con Pago)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// --- Importaciones de Stripe ---
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';

// Carga Stripe fuera del componente para evitar recargarlo
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

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'crear') {
        const res = await axios.get('https://tito-cafe-backend.onrender.com/api/productos');
        setProductos(res.data);
      } else if (activeTab === 'ver') {
        const res = await axios.get('https://tito-cafe-backend.onrender.com/api/pedidos/mis-pedidos');
        setMisPedidos(res.data);
      }
    } catch (err) { setError('No se pudieron cargar los datos.'); } 
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
        return prev.map(item => 
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const limpiarPedido = () => setPedidoActual([]);

  const handleSuccessfulPayment = async () => {
    const productosParaEnviar = pedidoActual.map(({ id, cantidad, precio, nombre }) => ({ id, cantidad, precio, nombre }));
    const pedidoData = { total, productos: productosParaEnviar };
    
    try {
      await axios.post('https://tito-cafe-backend.onrender.com/api/pedidos', pedidoData);
      toast.success('¡Pedido realizado y pagado con éxito!');
      limpiarPedido();
      setShowPaymentModal(false);
      setActiveTab('ver'); 
    } catch (err) {
      toast.error('El pago fue exitoso, pero hubo un error al registrar tu pedido. Contacta al soporte.');
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
                <h3 className="card-title text-center">Mi Pedido</h3><hr />
                <ul className="list-group list-group-flush">{pedidoActual.map((item, i) => (<li key={i} className="list-group-item d-flex justify-content-between"><span>{item.cantidad}x {item.nombre}</span><span>${(item.cantidad * Number(item.precio)).toFixed(2)}</span></li>))}</ul>
                <hr /><h4>Total: ${total.toFixed(2)}</h4>
                <div className="d-grid gap-2 mt-3">
                  <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)} disabled={pedidoActual.length === 0}>
                    Proceder al Pago
                  </button>
                  <button className="btn btn-outline-danger" onClick={limpiarPedido}>Vaciar Carrito</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* --- MODAL DE PAGO --- */}
      {showPaymentModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Finalizar Compra</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Envolvemos el formulario con el proveedor de Elements */}
                <Elements stripe={stripePromise}>
                  <CheckoutForm total={total} handleSuccess={handleSuccessfulPayment} />
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