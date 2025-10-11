// Archivo: src/pages/AdminPage.jsx (Versión Final Corregida)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductModal from '../components/ProductModal';
import SalesReportChart from '../components/SalesReportChart';
import ProductSalesReport from '../components/ProductSalesReport';

// --- CONFIGURACIÓN CENTRALIZADA DE AXIOS ---
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://tito-cafe-backend.onrender.com';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
// ---------------------------------------------

function AdminPage() {
  const [activeTab, setActiveTab] = useState('pedidosEnLinea');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [productoActual, setProductoActual] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'productos') {
        const res = await axios.get('/api/productos');
        setProductos(res.data);
      } else if (activeTab === 'reporteGeneral') {
        const res = await axios.get('/api/ventas/reporte');
        setReportData(res.data);
      } else if (activeTab === 'pedidosEnLinea') {
        const res = await axios.get('/api/pedidos');
        setPedidos(res.data);
      }
    } catch (err) {
      setError(`No se pudieron cargar los datos.`);
      console.error("Error en fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleOpenProductModal = (producto = null) => { setProductoActual(producto); setShowProductModal(true); };
  const handleCloseProductModal = () => { setShowProductModal(false); setProductoActual(null); };
  
  const handleSaveProducto = async (producto) => {
    const action = producto.id ? 'actualizado' : 'creado';
    try {
      if (producto.id) {
        await axios.put(`/api/productos/${producto.id}`, producto);
      } else {
        await axios.post('/api/productos', producto);
      }
      toast.success(`Producto ${action} con éxito.`);
      fetchData();
      handleCloseProductModal();
    } catch (err) {
      toast.error(`No se pudo guardar el producto.`);
    }
  };

  const handleDeleteProducto = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await axios.delete(`/api/productos/${id}`);
        toast.success('Producto eliminado con éxito.');
        fetchData();
      } catch (err) {
        toast.error('No se pudo eliminar el producto.');
      }
    }
  };
  
  // === FUNCIÓN CORREGIDA ===
  const handleUpdateStatus = async (pedidoId, nuevoEstado) => {
    try {
      // Se usa el método PUT y la URL correcta que espera tu backend.
      await axios.put(`/api/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      
      toast.success(`Pedido #${pedidoId} actualizado a "${nuevoEstado}"`);
      fetchData(); // Recarga la lista de pedidos
    } catch (err) {
      toast.error('No se pudo actualizar el estado del pedido.');
      console.error("Error al actualizar estado:", err.response);
    }
  };

  const handleShowAddress = (pedido) => {
    setSelectedOrder(pedido);
    setShowAddressModal(true);
  };
  
  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setSelectedOrder(null);
  };

  return (
    <div>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'pedidosEnLinea' ? 'active' : ''}`} onClick={() => setActiveTab('pedidosEnLinea')}>Pedidos en Línea</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>Gestión de Productos</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'reporteGeneral' ? 'active' : ''}`} onClick={() => setActiveTab('reporteGeneral')}>Reporte General</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'reporteProductos' ? 'active' : ''}`} onClick={() => setActiveTab('reporteProductos')}>Reporte por Producto</button></li>
      </ul>

      {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && activeTab === 'pedidosEnLinea' && (
        <div>
          <h1 className="mb-4">Gestión de Pedidos en Línea</h1>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr><th>ID</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>#{pedido.id}</td>
                    <td>{pedido.nombre_cliente}</td>
                    <td>{new Date(pedido.fecha).toLocaleString()}</td>
                    <td>${Number(pedido.total).toFixed(2)}</td>
                    <td><span className={`badge ${pedido.tipo_orden === 'domicilio' ? 'bg-info text-dark' : 'bg-secondary'}`}>{pedido.tipo_orden.charAt(0).toUpperCase() + pedido.tipo_orden.slice(1)}</span></td>
                    <td>{pedido.estado}</td>
                    <td>
                      {pedido.tipo_orden === 'domicilio' && (<button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleShowAddress(pedido)}>Ver Dirección</button>)}
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleUpdateStatus(pedido.id, 'En Preparacion')}>Preparar</button>
                      <button className="btn btn-sm btn-success me-2" onClick={() => handleUpdateStatus(pedido.id, 'Completado')}>Completado</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && activeTab === 'productos' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Gestión de Productos</h1>
            <button className="btn btn-primary" onClick={() => handleOpenProductModal()}>Añadir Nuevo Producto</button>
          </div>
          <div className="table-responsive">
             <table className="table table-hover align-middle">
               <thead className="table-dark">
                 <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Categoría</th><th>Acciones</th></tr>
               </thead>
               <tbody>
                 {productos.map((p) => (
                   <tr key={p.id}>
                     <td>{p.id}</td><td>{p.nombre}</td><td>${Number(p.precio).toFixed(2)}</td><td>{p.stock}</td><td>{p.categoria}</td>
                     <td>
                       <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleOpenProductModal(p)}>Editar</button>
                       <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProducto(p.id)}>Eliminar</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {!loading && !error && activeTab === 'reporteGeneral' && (
        <div>
          {reportData.length > 0 ? <SalesReportChart reportData={reportData} /> : <p className="text-center">No hay datos de ventas para mostrar.</p>}
        </div>
      )}
      {activeTab === 'reporteProductos' && <ProductSalesReport />}
      
      <ProductModal show={showProductModal} handleClose={handleCloseProductModal} handleSave={handleSaveProducto} productoActual={productoActual} />

      {showAddressModal && selectedOrder && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Dirección de Entrega - Pedido #{selectedOrder.id}</h5><button type="button" className="btn-close" onClick={handleCloseAddressModal}></button></div>
              <div className="modal-body"><p><strong>Cliente:</strong> {selectedOrder.nombre_cliente}</p><p><strong>Dirección:</strong> {selectedOrder.direccion_entrega}</p></div>
              <div className="modal-footer"><a href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.latitude},${selectedOrder.longitude}`} target="_blank" rel="noopener noreferrer" className="btn btn-success w-100">Abrir en Google Maps</a></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;