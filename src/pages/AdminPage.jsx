import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ProductModal from '../components/ProductModal';
import ComboModal from '../components/ComboModal';
import SalesReportChart from '../components/SalesReportChart';
import ProductSalesReport from '../components/ProductSalesReport';
import DetallesPedidoModal from '../components/DetallesPedidoModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import apiClient from '../services/api';
import { useTheme } from '../context/ThemeContext';

// --- Modal de Confirmación Estético y Reutilizable ---
const ConfirmationModal = ({ show, onClose, onConfirm, title, message, theme }) => {
  if (!show) return null;

  const modalClass = theme === 'dark' ? 'modal-content text-bg-dark' : 'modal-content';
  const closeButtonClass = theme === 'dark' ? 'btn-close btn-close-white' : 'btn-close';

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className={modalClass}>
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className={closeButtonClass} onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


function AdminPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('pedidosEnLinea');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [productoActual, setProductoActual] = useState(null);
  const [showComboModal, setShowComboModal] = useState(false);
  const [comboActual, setComboActual] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'productos') {
        const res = await getProducts();
        setProductos(res);
      } else if (activeTab === 'reporteGeneral') {
        const res = await apiClient.get('/ventas/reporte');
        setReportData(res.data);
      } else if (activeTab === 'pedidosEnLinea') {
        const res = await apiClient.get('/pedidos');
        setPedidos(res.data);
      } else if (activeTab === 'combos') {
        const res = await apiClient.get('/combos/admin/todos');
        setCombos(res.data);
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
  
  // --- LÓGICA DE MODAL DE PRODUCTO (CORREGIDA) ---
  const handleOpenProductModal = (producto = null) => {
    if (producto) {
      // Si editamos, cargamos el producto COMPLETO (con sus opciones)
      // para pasárselo al modal.
      apiClient.get(`/productos/${producto.id}`)
        .then(res => {
          const productoCompleto = {
            ...res.data, // Esto incluye 'grupos_opciones'
            imagenes: res.data.imagen_url ? [res.data.imagen_url] : ['']
          };
          setProductoActual(productoCompleto);
          setShowProductModal(true);
        })
        .catch(err => {
          console.error("Error al cargar producto completo:", err);
          toast.error("No se pudo cargar el producto con sus opciones.");
        });
    } else {
      // Es un producto nuevo
      setProductoActual(null);
      setShowProductModal(true); 
    }
  };
  
  const handleCloseProductModal = () => { setShowProductModal(false); setProductoActual(null); };
  
  const handleSaveProducto = async (producto) => {
    const action = producto.id ? 'actualizado' : 'creado';
    const datosParaEnviar = {
      ...producto,
      imagen_url: (producto.imagenes && producto.imagenes.length > 0) ? producto.imagenes[0] : null,
    };
    delete datosParaEnviar.imagenes; 
    delete datosParaEnviar.grupos_opciones; // El backend no espera esto en un PUT

    try {
      let res;
      if (datosParaEnviar.id) {
        res = await updateProduct(datosParaEnviar.id, datosParaEnviar);
      } else {
        res = await createProduct(datosParaEnviar);
      }
      
      // Si es un producto NUEVO, lo re-abrimos para añadir opciones
      if (!producto.id && res) { 
        toast.success(`Producto ${action} con éxito. Ahora puedes añadirle opciones.`);
        handleCloseProductModal();
        handleOpenProductModal(res); // Re-abrir con el producto recién creado
      } else {
        toast.success(`Producto ${action} con éxito.`);
        handleCloseProductModal();
      }
      fetchData(); // Recargamos la lista
    } catch (err) { toast.error(`No se pudo guardar el producto.`); }
  };
  
  const handleDeleteProducto = (producto) => {
    setConfirmTitle('Desactivar Producto');
    setConfirmMessage(`¿Seguro que quieres desactivar "${producto.nombre}"? Ya no aparecerá en el menú de clientes.`);
    setConfirmAction(() => async () => {
      try {
        await deleteProduct(producto.id);
        toast.success(`"${producto.nombre}" desactivado con éxito.`);
        fetchData();
      } catch (err) { 
        toast.error(err.response?.data?.msg || 'No se pudo desactivar el producto.');
      }
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };
  // --- FIN LÓGICA MODAL PRODUCTO ---

  // --- LÓGICA MODAL COMBO (CORREGIDA) ---
  const handleOpenComboModal = (combo = null) => { setComboActual(combo); setShowComboModal(true); };
  const handleCloseComboModal = () => { setShowComboModal(false); setComboActual(null); };
  
  const handleSaveCombo = async (combo) => {
    // Esta función recibe el objeto 'combo' del ComboModal
    // que ya incluye 'titulo' y 'precio' (Error 400 Corregido)
    const action = combo.id ? 'actualizado' : 'creado';
    try {
      if (combo.id) { 
        await apiClient.put(`/combos/${combo.id}`, combo); 
      } else { 
        await apiClient.post('/combos', combo); 
      }
      toast.success(`Combo ${action} con éxito.`);
      fetchData();
      handleCloseComboModal();
    } catch (err) { 
      // Muestra el mensaje de error 400 del backend si falla la validación
      const errorMsg = err.response?.data?.msg || 'No se pudo guardar el combo.';
      toast.error(errorMsg); 
    }
  };

  const handleDeleteCombo = (combo) => {
    setConfirmTitle('Desactivar Combo');
    setConfirmMessage(`¿Seguro que quieres desactivar "${combo.titulo || combo.nombre}"? Ya no será visible para los clientes.`);
    
    setConfirmAction(() => async () => {
      try {
        // CORRECCIÓN CORS: Esto ahora funciona porque 'PATCH' está permitido
        await apiClient.patch(`/combos/${combo.id}/desactivar`);
        
        toast.success('Combo desactivado con éxito.');
        fetchData();
      } catch (err) { 
        toast.error(err.response?.data?.msg || 'No se pudo desactivar el combo.'); 
      }
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };
  // --- FIN LÓGICA MODAL COMBO ---
  
  const handleUpdateStatus = async (pedidoId, nuevoEstado) => {
    try {
      await apiClient.put(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      toast.success(`Pedido #${pedidoId} actualizado.`);
      fetchData();
    } catch (err) { 
      console.error("Error al actualizar estado:", err.response?.data || err.message);
      toast.error('No se pudo actualizar el estado.'); 
    }
  };
  const handleShowDetails = (pedido) => { setSelectedOrderDetails(pedido); setShowDetailsModal(true); };
  const handleCloseDetailsModal = () => { setShowDetailsModal(false); setSelectedOrderDetails(null); };

  const handlePurgePedidos = async () => {
    if (purgeConfirmText !== 'ELIMINAR') {
      return toast.error('El texto de confirmación no coincide.');
    }
    try {
      await apiClient.delete('/pedidos/purgar');
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
        <li className="nav-item"><button className={`nav-link ${activeTab === 'combos' ? 'active' : ''}`} onClick={() => setActiveTab('combos')}>Gestión de Combos</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'reporteGeneral' ? 'active' : ''}`} onClick={() => setActiveTab('reporteGeneral')}>Reporte General</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'reporteProductos' ? 'active' : ''}`} onClick={() => setActiveTab('reporteProductos')}>Reporte por Producto</button></li>
      </ul>

      {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && activeTab === 'productos' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Gestión de Productos</h1>
            <button className="btn btn-primary" onClick={() => handleOpenProductModal()}>Añadir Nuevo Producto</button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Oferta</th><th>Stock</th><th>Categoría</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td><td>{p.nombre}</td><td>${Number(p.precio).toFixed(2)}</td><td>{p.en_oferta ? `${p.descuento_porcentaje}%` : 'No'}</td>
                    <td>{p.stock}</td><td>{p.categoria}</td>
                    <td>
                      {/* --- BOTÓN DE EDITAR (CORREGIDO) --- */}
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleOpenProductModal(p)}>Editar / Opciones</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProducto(p)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {!loading && !error && activeTab === 'pedidosEnLinea' && (
        <div>
          <h1 className="mb-4">Gestión de Pedidos en Línea</h1>
          {/* Aquí iría tu tabla de pedidos... */}
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
      {!loading && !error && activeTab === 'combos' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Gestión de Combos</h1>
            <button className="btn btn-primary" onClick={() => handleOpenComboModal()}>Añadir Nuevo Combo</button>
          </div>
          {/* Aquí iría tu tabla de combos... */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Visible</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {combos.map((combo) => (
                  <tr key={combo.id} className={!combo.esta_activo ? 'text-muted opacity-50' : ''}>
                    <td>{combo.id}</td>
                    <td>{combo.nombre}</td>
                    <td>${Number(combo.precio).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${combo.esta_activo ? 'bg-success' : 'bg-danger'}`}>
                        {combo.esta_activo ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleOpenComboModal(combo)}>Editar</button>
                      {combo.esta_activo && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCombo(combo)}>Eliminar</button>
                      )}
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
          {/* Aquí iría tu reporte... */}
          {reportData.length > 0 ? <SalesReportChart reportData={reportData} /> : <p className="text-center">No hay datos de ventas para mostrar.</p>}
          <div className="mt-5 p-4 border border-danger rounded">
            <h3 className="text-danger">Zona de Peligro</h3>
            <p>Las acciones en esta área son permanentes y no se pueden deshacer.</p>
            <button className="btn btn-danger" onClick={() => setShowPurgeModal(true)}>Eliminar Historial de Pedidos en Línea</button>
          </div>
        </div>
      )}
      {activeTab === 'reporteProductos' && <ProductSalesReport />}

      {/* --- RENDERIZADO DE MODALES (CORREGIDO) --- */}
      
      {/* Usamos el NUEVO ProductModal. 'show' lo controla */}
      {showProductModal && (
        <ProductModal 
          show={showProductModal} 
          handleClose={handleCloseProductModal} 
          handleSave={handleSaveProducto} 
          productoActual={productoActual} 
        />
      )}
      
      {/* Usamos el ComboModal corregido. 'show' lo controla */}
      {showComboModal && (
        <ComboModal 
          show={showComboModal} 
          handleClose={handleCloseComboModal} 
          handleSave={handleSaveCombo} 
          comboActual={comboActual} 
        />
      )}
      
      {showDetailsModal && (<DetallesPedidoModal pedido={selectedOrderDetails} onClose={handleCloseDetailsModal} />)}

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        title={confirmTitle}
        message={confirmMessage}
        theme={theme}
      />

      {showPurgeModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          {/* ... (el resto de tu modal de purga) ... */}
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title text-danger">⚠️ ¡Acción Irreversible!</h5><button type="button" className="btn-close" onClick={() => setShowPurgeModal(false)}></button></div>
              <div className="modal-body">
                <p>Estás a punto de eliminar <strong>todos los pedidos en línea</strong> de la base de datos. Esta acción no se puede deshacer.</p>
                <p>Para confirmar, por favor escribe <strong>ELIMINAR</strong> en el siguiente campo:</p>
                <input type="text" className="form-control" value={purgeConfirmText} onChange={(e) => setPurgeConfirmText(e.target.value)} placeholder="ELIMINAR" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPurgeModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={handlePurgePedidos} disabled={purgeConfirmText !== 'ELIMINAR'}>Entiendo las consecuencias, eliminar todo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;