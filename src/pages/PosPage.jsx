import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DetallesPedidoModal from '../components/DetallesPedidoModal';

// --- CONFIGURACIÓN DE AXIOS ---
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://tito-cafe-backend.onrender.com';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
// ---------------------------------------------

function PosPage() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const [productos, setProductos] = useState([]);
  const [ventaActual, setVentaActual] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);
  const [pedidos, setPedidos] = useState([]);
  const [ventasDelDia, setVentasDelDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'pos') {
        const res = await axios.get('/api/productos');
        setProductos(res.data);
      } else if (activeTab === 'pedidos') {
        const res = await axios.get('/api/pedidos');
        setPedidos(res.data);
      } else if (activeTab === 'historial') {
        const res = await axios.get('/api/ventas/hoy');
        setVentasDelDia(res.data);
      }
    } catch (err) {
      setError(`No se pudieron cargar los datos.`);
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab]);
  useEffect(() => {
    const nuevoTotal = ventaActual.reduce((sum, item) => sum + Number(item.precio), 0);
    setTotalVenta(nuevoTotal);
  }, [ventaActual]);

  const agregarProductoAVenta = (producto) => setVentaActual(prev => [...prev, producto]);
  const limpiarVenta = () => setVentaActual([]);
  
  const handleCobrar = async () => {
    if (ventaActual.length === 0) return toast.error('El ticket está vacío.');
    const ventaData = { total: totalVenta, metodo_pago: 'Efectivo', productos: ventaActual };
    try {
      await axios.post('/api/ventas', ventaData);
      toast.success('¡Venta registrada con éxito!');
      limpiarVenta();
      if (activeTab === 'historial') {
        fetchData();
      }
    } catch (err) { 
      toast.error('Error al registrar la venta.');
      console.error(err); 
    }
  };

  const handleUpdateStatus = async (pedidoId, nuevoEstado) => {
    try {
      await axios.put(`/api/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      fetchData();
      toast.success(`Pedido #${pedidoId} actualizado.`);
    } catch (err) { toast.error('No se pudo actualizar el estado.'); }
  };
  
  const handleShowDetails = (pedido) => {
    setSelectedOrderDetails(pedido);
    setShowDetailsModal(true);
  };
  
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrderDetails(null);
  };

  const renderContenido = () => {
    if (loading) return <div className="text-center"><div className="spinner-border" role="status"></div></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    if (activeTab === 'pedidos') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-4">Gestión de Pedidos en Línea</h1>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>#{pedido.id}</td>
                    <td>{pedido.nombre_cliente}</td>
                    <td>{new Date(pedido.fecha).toLocaleString()}</td>
                    <td>${Number(pedido.total).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${pedido.tipo_orden === 'domicilio' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                        {pedido.tipo_orden.charAt(0).toUpperCase() + pedido.tipo_orden.slice(1)}
                      </span>
                    </td>
                    <td>{pedido.estado}</td>
                    <td>
                      <button className="btn btn-sm btn-info me-2" onClick={() => handleShowDetails(pedido)}>Ver Pedido</button>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleUpdateStatus(pedido.id, 'En Preparacion')}>Preparar</button>
                      <button className="btn btn-sm btn-success" onClick={() => handleUpdateStatus(pedido.id, 'Completado')}>Completado</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      );
    }

    if (activeTab === 'pos') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row">
          <div className="col-md-8">
            <h2>Menú de Productos</h2>
            <div className="row g-3">
              {productos.map(p => (
                <div key={p.id} className="col-md-4 col-lg-3">
                  <motion.div whileHover={{ scale: 1.05 }} className="card h-100 text-center" onClick={() => agregarProductoAVenta(p)} style={{ cursor: 'pointer' }}>
                    <div className="card-body d-flex flex-column justify-content-center">
                      <h5 className="card-title">{p.nombre}</h5>
                      <p className="card-text">${Number(p.precio).toFixed(2)}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-4">
            <div className="card"><div className="card-body"><h3 className="card-title text-center">Ticket de Venta</h3><hr /><ul className="list-group list-group-flush">{ventaActual.map((item, i) => (<li key={i} className="list-group-item d-flex justify-content-between"><span>{item.nombre}</span><span>${Number(item.precio).toFixed(2)}</span></li>))}</ul><hr /><h4>Total: ${totalVenta.toFixed(2)}</h4><div className="d-grid gap-2 mt-3"><button className="btn btn-success" onClick={handleCobrar}>Cobrar</button><button className="btn btn-danger" onClick={limpiarVenta}>Cancelar</button></div></div></div>
          </div>
        </motion.div>
      );
    }

    if (activeTab === 'historial') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-4">Ventas del Punto de Venta (Hoy)</h1>
          {ventasDelDia.length === 0 ? <p>No se han registrado ventas en el POS hoy.</p> : (
            <div className="list-group">
              {ventasDelDia.map(venta => (
                <div key={venta.id} className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">Venta #{venta.id} (Empleado: {venta.nombre_empleado})</h5>
                    <small>{new Date(venta.fecha).toLocaleTimeString()}</small>
                  </div>
                  <p className="mb-1">Total: <strong>${Number(venta.total).toFixed(2)}</strong></p>
                  <small>Método de Pago: {venta.metodo_pago}</small>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      );
    }
  };

  return (
    <div>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}>Pedidos en Línea</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')}>Punto de Venta</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>Ventas del Día (POS)</button></li>
      </ul>
      
      {renderContenido()}
      
      {showDetailsModal && (
        <DetallesPedidoModal
          pedido={selectedOrderDetails}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
}

export default PosPage;