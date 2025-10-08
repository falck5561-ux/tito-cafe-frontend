// Archivo: src/pages/PosPage.jsx (Versión Final con 3 Pestañas y Corrección)
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function PosPage() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const [productos, setProductos] = useState([]);
  const [ventaActual, setVentaActual] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);
  const [pedidos, setPedidos] = useState([]);
  const [ventasDelDia, setVentasDelDia] = useState([]); // Para la nueva pestaña
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'pos') {
        const res = await axios.get('https://tito-cafe-backend.onrender.com/api/productos');
        setProductos(res.data);
      } else if (activeTab === 'pedidos') {
        const res = await axios.get('https://tito-cafe-backend.onrender.com/api/pedidos');
        setPedidos(res.data);
      } else if (activeTab === 'historial') {
        // --- LÓGICA PARA LA NUEVA PESTAÑA ---
        const res = await axios.get('https://tito-cafe-backend.onrender.com/api/ventas/mis-ventas');
        setVentasDelDia(res.data);
      }
    } catch (err) {
      setError(`No se pudieron cargar los datos.`);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  useEffect(() => {
    const nuevoTotal = ventaActual.reduce((sum, item) => sum + Number(item.precio), 0);
    setTotalVenta(nuevoTotal);
  }, [ventaActual]);

  const agregarProductoAVenta = (producto) => setVentaActual(prev => [...prev, producto]);
  const limpiarVenta = () => setVentaActual([]);
  
  // --- FUNCIÓN DE COBRAR CORREGIDA ---
  const handleCobrar = async () => {
    if (ventaActual.length === 0) return toast.error('El ticket está vacío.');
    const ventaData = { total: totalVenta, metodo_pago: 'Efectivo', productos: ventaActual };
    try {
      await axios.post('https://tito-cafe-backend.onrender.com/api/ventas', ventaData);
      toast.success('¡Venta registrada con éxito!');
      limpiarVenta(); // <-- AHORA SÍ SE LIMPIARÁ EL TICKET
    } catch (err) { 
      toast.error('Error al registrar la venta.');
      console.error(err); 
    }
  };

  const handleUpdateStatus = async (pedidoId, nuevoEstado) => {
    try {
      await axios.put(`https://tito-cafe-backend.onrender.com/api/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      fetchData();
      toast.success(`Pedido #${pedidoId} actualizado.`);
    } catch (err) { toast.error('No se pudo actualizar el estado.'); }
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

  const renderContenido = () => {
    if (loading) return <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    if (activeTab === 'historial') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-4">Ventas del Punto de Venta (Hoy)</h1>
          {ventasDelDia.length === 0 ? <p>No has registrado ventas en el POS hoy.</p> : (
            <div className="list-group">
              {ventasDelDia.map(venta => (
                <div key={venta.id} className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">Venta #{venta.id}</h5>
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
    
    // ... (El resto del renderizado para 'pedidos' y 'pos' no cambia)
    if (activeTab === 'pedidos') {
      return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-4">Gestión de Pedidos en Línea</h1>
          {pedidos.length === 0 ? <p className="text-center">No hay pedidos pendientes.</p> : (
            <div className="table-responsive"><table className="table table-hover align-middle"><thead className="table-dark"><tr><th>ID</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{pedidos.map(p => (
              <tr key={p.id}>
                <td>#{p.id}</td><td>{p.nombre_cliente}</td><td>{new Date(p.fecha).toLocaleString()}</td><td>${Number(p.total).toFixed(2)}</td>
                <td><span className={`badge ${getStatusBadge(p.estado)}`}>{p.estado}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-info me-2" onClick={() => setPedidoSeleccionado(p)}>Ver Detalles</button>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleUpdateStatus(p.id, 'En Preparación')}>Preparar</button>
                    <button className="btn btn-sm btn-outline-success" onClick={() => handleUpdateStatus(p.id, 'Listo para Recoger')}>Listo</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleUpdateStatus(p.id, 'Completado')}>Completado</button>
                  </div>
                </td>
              </tr>))}
            </tbody></table></div>
          )}
        </motion.div>
      );
    }
    if (activeTab === 'pos') {
       return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row">
          <div className="col-md-8"><h2>Menú de Productos</h2><div className="row g-3">{productos.map(p => (<div key={p.id} className="col-md-4 col-lg-3"><motion.div whileHover={{ scale: 1.05 }} className="card h-100 text-center" onClick={() => agregarProductoAVenta(p)} style={{ cursor: 'pointer' }}><div className="card-body d-flex flex-column justify-content-center"><h5 className="card-title">{p.nombre}</h5><p className="card-text">${Number(p.precio).toFixed(2)}</p></div></motion.div></div>))}</div></div>
          <div className="col-md-4"><div className="card"><div className="card-body"><h3 className="card-title text-center">Ticket de Venta</h3><hr /><ul className="list-group list-group-flush">{ventaActual.map((item, i) => (<li key={i} className="list-group-item d-flex justify-content-between"><span>{item.nombre}</span><span>${Number(item.precio).toFixed(2)}</span></li>))}</ul><hr /><h4>Total: ${totalVenta.toFixed(2)}</h4><div className="d-grid gap-2 mt-3"><button className="btn btn-success" onClick={handleCobrar}>Cobrar</button><button className="btn btn-danger" onClick={limpiarVenta}>Cancelar</button></div></div></div></div>
        </motion.div>)
    }
  };

  return (
    <div>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}>Pedidos en Línea</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')}>Punto de Venta</button></li>
        {/* --- NUEVA PESTAÑA AÑADIDA --- */}
        <li className="nav-item"><button className={`nav-link ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>Ventas del Día (POS)</button></li>
      </ul>
      {renderContenido()}
      
      {pedidoSeleccionado && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog">
            <div className="modal-content"><div className="modal-header"><h5 className="modal-title">Detalles del Pedido #{pedidoSeleccionado.id}</h5><button type="button" className="btn-close" onClick={() => setPedidoSeleccionado(null)}></button></div><div className="modal-body"><p><strong>Cliente:</strong> {pedidoSeleccionado.nombre_cliente}</p><ul className="list-group">{pedidoSeleccionado.productos.map((prod, index) => (<li key={index} className="list-group-item d-flex justify-content-between"><span>{prod.nombre} (x{prod.cantidad})</span><span>${Number(prod.precio).toFixed(2)}</span></li>))}</ul><hr/><h5 className="text-end">Total: ${Number(pedidoSeleccionado.total).toFixed(2)}</h5></div></div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default PosPage;