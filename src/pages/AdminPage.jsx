import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductModal from '../components/ProductModal';
import PromoModal from '../components/PromoModal';
import SalesReportChart from '../components/SalesReportChart';
import ProductSalesReport from '../components/ProductSalesReport';
import DetallesPedidoModal from '../components/DetallesPedidoModal';

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
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [productoActual, setProductoActual] = useState(null);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoActual, setPromoActual] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // --- Estados para la purga de pedidos ---
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');

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
      } else if (activeTab === 'promociones') {
        const res = await axios.get('/api/promociones/todas');
        setPromociones(res.data);
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

  // --- Lógica de Productos ---
  const handleOpenProductModal = (producto = null) => { setProductoActual(producto); setShowProductModal(true); };
  const handleCloseProductModal = () => { setShowProductModal(false); setProductoActual(null); };
  const handleSaveProducto = async (producto) => {
    const action = producto.id ? 'actualizado' : 'creado';
    try {
      if (producto.id) { await axios.put(`/api/productos/${producto.id}`, producto); } else { await axios.post('/api/productos', producto); }
      toast.success(`Producto ${action} con éxito.`);
      fetchData();
      handleCloseProductModal();
    } catch (err) { toast.error(`No se pudo guardar el producto.`); }
  };
  const handleDeleteProducto = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este producto?')) {
      try {
        await axios.delete(`/api/productos/${id}`);
        toast.success('Producto eliminado.');
        fetchData();
      } catch (err) { toast.error('No se pudo eliminar el producto.'); }
    }
  };

  // --- Lógica de Promociones ---
  const handleOpenPromoModal = (promo = null) => { setPromoActual(promo); setShowPromoModal(true); };
  const handleClosePromoModal = () => { setShowPromoModal(false); setPromoActual(null); };
  const handleSavePromo = async (promo) => {
    const action = promo.id ? 'actualizada' : 'creada';
    try {
      if (promo.id) { await axios.put(`/api/promociones/${promo.id}`, promo); } else { await axios.post('/api/promociones', promo); }
      toast.success(`Promoción ${action} con éxito.`);
      fetchData();
      handleClosePromoModal();
    } catch (err) { toast.error(`No se pudo guardar la promoción.`); }
  };
  const handleDeletePromo = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar esta promoción?')) {
      try {
        await axios.delete(`/api/promociones/${id}`);
        toast.success('Promoción eliminada.');
        fetchData();
      } catch (err) { toast.error('No se pudo eliminar la promoción.'); }
    }
  };
  
  // --- Lógica de Pedidos ---
  const handleUpdateStatus = async (pedidoId, nuevoEstado) => {
    try {
      await axios.put(`/api/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      toast.success(`Pedido #${pedidoId} actualizado.`);
      fetchData();
    } catch (err) { toast.error('No se pudo actualizar el estado.'); }
  };
  const handleShowDetails = (pedido) => { setSelectedOrderDetails(pedido); setShowDetailsModal(true); };
  const handleCloseDetailsModal = () => { setShowDetailsModal(false); setSelectedOrderDetails(null); };

  // --- Lógica para la purga de pedidos ---
  const handlePurgePedidos = async () => {
    if (purgeConfirmText !== 'ELIMINAR') {
      return toast.error('El texto de confirmación no coincide.');
    }
    try {
      await axios.delete('/api/pedidos/todos');
      toast.success('¡Historial de pedidos eliminado con éxito!');
      setShowPurgeModal(false);
      setPurgeConfirmText('');
      if (activeTab === 'pedidosEnLinea') {
        fetchData(); 
      } else {
        setActiveTab('pedidosEnLinea');
      }
    } catch (error) {
      toast.error('Ocurrió un error al eliminar los pedidos.');
    }
  };

  return (
    <div>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'pedidosEnLinea' ? 'active' : ''}`} onClick={() => setActiveTab('pedidosEnLinea')}>Pedidos en Línea</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>Gestión de Productos</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'promociones' ? 'active' : ''}`} onClick={() => setActiveTab('promociones')}>Gestión de Promociones</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'reporteGeneral' ? 'active' : ''}`} onClick={() => setActiveTab('reporteGeneral')}>Reporte General</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'reporteProductos' ? 'active' : ''}`} onClick={() => setActiveTab('reporteProductos')}>Reporte por Producto</button></li>
      </ul>

      {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && activeTab === 'pedidosEnLinea' && (
        <div>
          <h1 className="mb-4">Gestión de Pedidos en Línea</h1>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
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
                      <button className="btn btn-sm btn-info me-2" onClick={() => handleShowDetails(pedido)}>Ver Pedido</button>
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

      {!loading && !error && activeTab === 'promociones' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Gestión de Promociones</h1>
            <button className="btn btn-primary" onClick={() => handleOpenPromoModal()}>Añadir Nueva Promoción</button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr><th>ID</th><th>Título</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {promociones.map((promo) => (
                  <tr key={promo.id}>
                    <td>{promo.id}</td>
                    <td>{promo.titulo}</td>
                    <td>${Number(promo.precio).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${promo.activa ? 'bg-success' : 'bg-secondary'}`}>
                        {promo.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleOpenPromoModal(promo)}>Editar</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePromo(promo.id)}>Eliminar</button>
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
          
          <div className="mt-5 p-4 border border-danger rounded">
            <h3 className="text-danger">Zona de Peligro</h3>
            <p>Las acciones en esta área son permanentes y no se pueden deshacer.</p>
            <button 
              className="btn btn-danger" 
              onClick={() => setShowPurgeModal(true)}
            >
              Eliminar Historial de Pedidos en Línea
            </button>
          </div>
        </div>
      )}

      {activeTab === 'reporteProductos' && <ProductSalesReport />}
      
      <ProductModal show={showProductModal} handleClose={handleCloseProductModal} handleSave={handleSaveProducto} productoActual={productoActual} />
      <PromoModal show={showPromoModal} handleClose={handleClosePromoModal} handleSave={handleSavePromo} promoActual={promoActual} />
      {showDetailsModal && (<DetallesPedidoModal pedido={selectedOrderDetails} onClose={handleCloseDetailsModal} />)}

      {showPurgeModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">⚠️ ¡Acción Irreversible!</h5>
                <button type="button" className="btn-close" onClick={() => setShowPurgeModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Estás a punto de eliminar <strong>todos los pedidos en línea</strong> de la base de datos. Esta acción no se puede deshacer.</p>
                <p>Para confirmar, por favor escribe <strong>ELIMINAR</strong> en el siguiente campo:</p>
                <input 
                  type="text" 
                  className="form-control"
                  value={purgeConfirmText}
                  onChange={(e) => setPurgeConfirmText(e.target.value)} 
                  placeholder="ELIMINAR"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPurgeModal(false)}>Cancelar</button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handlePurgePedidos}
                  disabled={purgeConfirmText !== 'ELIMINAR'}
                >
                  Entiendo las consecuencias, eliminar todo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;

