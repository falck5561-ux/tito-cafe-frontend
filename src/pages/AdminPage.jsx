import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Package, ShoppingBag, BarChart2, Trash2, Edit, Plus, Eye, 
  CheckCircle, XCircle, AlertTriangle, Layers, TrendingUp, Truck 
} from 'lucide-react'; 
import ProductModal from '../components/ProductModal';
import ComboModal from '../components/ComboModal';
import SalesReportChart from '../components/SalesReportChart';
import ProductSalesReport from '../components/ProductSalesReport';
import DetallesPedidoModal from '../components/DetallesPedidoModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import apiClient from '../services/api';
import { useTheme } from '../context/ThemeContext';

// --- Modal de Confirmación Estético ---
const ConfirmationModal = ({ show, onClose, onConfirm, title, message, theme }) => {
  if (!show) return null;
  const isDark = theme === 'dark';
  
  return (
    <div className="modal show fade" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className={`modal-content shadow-lg border-0 ${isDark ? 'bg-dark text-white' : ''}`}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <AlertTriangle className="text-warning" size={24} /> {title}
            </h5>
            <button type="button" className={`btn-close ${isDark ? 'btn-close-white' : ''}`} onClick={onClose}></button>
          </div>
          <div className="modal-body py-4">
            <p className="mb-0 text-center fs-5">{message}</p>
          </div>
          <div className="modal-footer border-0 pt-0 justify-content-center pb-4">
            <button type="button" className="btn btn-outline-secondary px-4 rounded-pill fw-bold" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn btn-danger px-4 rounded-pill fw-bold" onClick={onConfirm}>Confirmar Acción</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function AdminPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Estados
  const [activeTab, setActiveTab] = useState('pedidosEnLinea');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [productoActual, setProductoActual] = useState(null);
  const [showComboModal, setShowComboModal] = useState(false);
  const [comboActual, setComboActual] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  
  // Confirmaciones
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  // Estilos base
  // Card base para alto contraste en dark mode
  const cardBgColor = isDark ? '#1e1e1e' : '#ffffff'; 
  const cardClass = `card shadow-lg border-0 h-100`;
  const headerClass = `d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom ${isDark ? 'border-secondary' : ''}`;

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
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab]);
  
  // --- HANDLERS (Tu lógica se mantiene intacta) ---
  const handleOpenProductModal = (producto = null) => {
    if (producto) {
      apiClient.get(`/productos/${producto.id}`)
        .then(res => {
          setProductoActual({ ...res.data, imagenes: res.data.imagen_url ? [res.data.imagen_url] : [''] });
          setShowProductModal(true);
        })
        .catch(() => toast.error("Error al cargar producto."));
    } else {
      setProductoActual(null);
      setShowProductModal(true); 
    }
  };
  
  const handleCloseProductModal = () => { setShowProductModal(false); setProductoActual(null); };
  
  const handleSaveProducto = async (producto) => {
    const datos = { ...producto, imagen_url: producto.imagenes?.[0] || null };
    delete datos.imagenes; delete datos.grupos_opciones;
    try {
      let res;
      if (datos.id) res = await updateProduct(datos.id, datos);
      else res = await createProduct(datos);
      
      if (!producto.id && res) { 
        toast.success(`Producto creado. Añade opciones ahora.`);
        handleCloseProductModal(); handleOpenProductModal(res);
      } else {
        toast.success(`Producto guardado.`);
        handleCloseProductModal();
      }
      fetchData();
    } catch (err) { toast.error(`Error al guardar.`); }
  };
  
  const handleDeleteProducto = (producto) => {
    setConfirmTitle('Desactivar Producto');
    setConfirmMessage(`¿Desactivar "${producto.nombre}"?`);
    setConfirmAction(() => async () => {
      try { await deleteProduct(producto.id); toast.success("Producto desactivado."); fetchData(); } 
      catch (err) { toast.error("Error al desactivar."); }
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handleOpenComboModal = (c = null) => { setComboActual(c); setShowComboModal(true); };
  const handleCloseComboModal = () => { setShowComboModal(false); setComboActual(null); };
  const handleSaveCombo = async (c) => {
    try { c.id ? await apiClient.put(`/combos/${c.id}`, c) : await apiClient.post('/combos', c); toast.success("Combo guardado."); fetchData(); handleCloseComboModal(); } catch (err) { toast.error(err.response?.data?.msg || "Error."); }
  };
  const handleDeleteCombo = (c) => {
    setConfirmTitle('Desactivar Combo'); setConfirmMessage(`¿Desactivar "${c.nombre}"?`);
    setConfirmAction(() => async () => { try { await apiClient.patch(`/combos/${c.id}/desactivar`); toast.success("Combo desactivado."); fetchData(); } catch (err) { toast.error("Error."); } setShowConfirmModal(false); });
    setShowConfirmModal(true);
  };
  
  const handleUpdateStatus = async (id, est) => { try { await apiClient.put(`/pedidos/${id}/estado`, { estado: est }); toast.success("Estado actualizado."); fetchData(); } catch { toast.error("Error al actualizar."); } };
  
  const handleShowDetails = async (pedido) => {
    const posiblesItems = pedido.items || pedido.detalles || pedido.venta_detalles || pedido.productos || [];
    let datosParaModal = { ...pedido, items: posiblesItems };
    setSelectedOrderDetails(datosParaModal);
    setShowDetailsModal(true);
    if (posiblesItems.length > 0) return;
    try {
        const res = await apiClient.get(`/pedidos/${pedido.id}`);
        if (res.data) {
            setSelectedOrderDetails({
                ...datosParaModal,
                ...res.data,
                items: res.data.items || res.data.venta_detalles || res.data.detalles || []
            });
        }
    } catch (error) {
        console.warn(`No se pudieron cargar detalles extra para ID ${pedido.id}`);
    }
  };

  const handleCloseDetailsModal = () => { setShowDetailsModal(false); setSelectedOrderDetails(null); };

  const handlePurgePedidos = async () => { if (purgeConfirmText !== 'ELIMINAR') return toast.error('Texto incorrecto.'); try { await apiClient.delete('/pedidos/purgar'); toast.success('Historial eliminado.'); setShowPurgeModal(false); setPurgeConfirmText(''); fetchData(); } catch { toast.error('Error al purgar.'); } };

  // --- RENDERIZADO DE TABS (ESTILO CORREGIDO) ---
  const renderTabs = () => (
    <div className="d-flex gap-2 mb-4 overflow-auto py-2">
      {[
        { id: 'pedidosEnLinea', label: 'Pedidos Online', icon: <ShoppingBag size={18} /> },
        { id: 'productos', label: 'Productos', icon: <Package size={18} /> },
        { id: 'combos', label: 'Combos', icon: <Layers size={18} /> },
        { id: 'reporteGeneral', label: 'Reporte General', icon: <TrendingUp size={18} /> },
        { id: 'reporteProductos', label: 'Por Producto', icon: <BarChart2 size={18} /> },
      ].map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`btn d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-bold transition-all shadow-sm`}
          style={{
            // Azul profesional primary para la pestaña activa
            backgroundColor: activeTab === tab.id ? '#0d6efd' : cardBgColor, 
            color: activeTab === tab.id ? '#fff' : (isDark ? '#ccc' : '#555'),
            border: activeTab === tab.id ? 'none' : `1px solid ${isDark ? '#333' : '#eee'}`,
            whiteSpace: 'nowrap'
          }}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4" style={{ backgroundColor: isDark ? '#121212' : '#f8f9fa', minHeight: '100vh' }}>
      <div className="mb-4">
        <h2 className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>Panel de Administración</h2>
        <p className={isDark ? 'text-white-50' : 'text-muted'}>Gestiona tu negocio desde aquí</p>
      </div>

      {renderTabs()}

      {loading && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>}
      {error && <div className="alert alert-danger rounded-3 shadow-sm">{error}</div>}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="fade-in">
        
        {/* VISTA PRODUCTOS */}
        {!loading && !error && activeTab === 'productos' && (
          <div className={cardClass} style={{ backgroundColor: cardBgColor }}>
            <div className="card-body p-4">
              <div className={headerClass}>
                <h4 className="fw-bold m-0">Inventario de Productos</h4>
                <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm" onClick={() => handleOpenProductModal()}>
                  <Plus size={18} /> Nuevo Producto
                </button>
              </div>
              <div className="table-responsive">
                <table className={`table align-middle table-hover ${isDark ? 'table-dark' : 'table-light'}`}>
                  <thead>
                    <tr><th className="py-3 ps-3">Producto</th><th>Precio</th><th>Stock</th><th>Estado</th><th className="text-end pe-3">Acciones</th></tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td className="ps-3 fw-bold">
                          <div className="d-flex align-items-center gap-3">
                            {/* Ícono más visible */}
                            <div className="rounded d-flex align-items-center justify-content-center p-2" style={{ backgroundColor: isDark ? '#333' : '#e9ecef' }}>
                                <Package size={20} className="text-info"/>
                            </div>
                            <div>
                                <div>{p.nombre}</div>
                                <small className="text-muted">{p.categoria}</small>
                            </div>
                          </div>
                        </td>
                        <td className="fw-bold">${Number(p.precio).toFixed(2)}</td>
                        <td><span className={`badge ${p.stock < 5 ? 'bg-danger' : 'bg-success bg-opacity-75'}`}>{p.stock} unid.</span></td>
                        <td>{p.en_oferta ? <span className="badge bg-warning text-dark">Oferta {p.descuento_porcentaje}%</span> : <span className="badge bg-secondary">Regular</span>}</td>
                        <td className="text-end pe-3">
                          {/* CORRECCIÓN BOTÓN NEGRO: Uso de colores fuertes para iconos circulares */}
                          <button className={`btn btn-sm ${isDark ? 'text-warning' : 'text-primary'}`} style={{ backgroundColor: 'transparent' }} title="Editar" onClick={() => handleOpenProductModal(p)}><Edit size={18}/></button>
                          <button className={`btn btn-sm ${isDark ? 'text-danger' : 'text-danger'}`} style={{ backgroundColor: 'transparent' }} title="Eliminar" onClick={() => handleDeleteProducto(p)}><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* VISTA PEDIDOS */}
        {!loading && !error && activeTab === 'pedidosEnLinea' && (
          <div className={cardClass} style={{ backgroundColor: cardBgColor }}>
            <div className="card-body p-4">
              <div className={headerClass}>
                <h4 className="fw-bold m-0">Pedidos Entrantes</h4>
                <span className="badge bg-primary rounded-pill px-3 py-2">{pedidos.length} Pendientes</span>
              </div>
              <div className="table-responsive">
                <table className={`table align-middle table-hover ${isDark ? 'table-dark' : 'table-light'}`}>
                  <thead>
                    <tr><th className="py-3 ps-3">ID</th><th>Cliente</th><th>Total</th><th>Tipo</th><th>Estado</th><th className="text-center">Gestión</th></tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id}>
                        <td className="ps-3 text-primary fw-bold">#{p.id}</td>
                        <td>
                            <div className="fw-bold">{p.nombre_cliente}</div>
                            <small className="text-muted">{new Date(p.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                        </td>
                        <td className="fw-bold text-success">${Number(p.total).toFixed(2)}</td>
                        <td>{p.tipo_orden === 'domicilio' ? <span className="badge bg-info text-dark rounded-pill">🛵 Envío</span> : <span className="badge bg-secondary rounded-pill">🏪 Local</span>}</td>
                        <td><span className={`badge ${p.estado === 'Pendiente' ? 'bg-warning text-dark' : 'bg-success'}`}>{p.estado}</span></td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center flex-wrap gap-2">
                            {/* Botón Ver (con icono) */}
                            <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3 rounded-pill" onClick={() => handleShowDetails(p)}><Eye size={14}/> Ver</button>
                            
                            {/* Botones de Workflow (CORRECCIÓN FUNCIONAL COMPLETA) */}
                            {p.estado !== 'Completado' && p.estado !== 'Entregado' && (
                                <>
                                    <button className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 px-3 rounded-pill" onClick={() => handleUpdateStatus(p.id, 'En Preparacion')}><Layers size={14}/> Prep</button>
                                    
                                    {/* Botón En Camino */}
                                    {p.tipo_orden === 'domicilio' && (
                                      <button className="btn btn-sm btn-outline-info d-flex align-items-center gap-1 px-3 rounded-pill" onClick={() => handleUpdateStatus(p.id, 'En Camino')}><Truck size={14}/> Envío</button>
                                    )}

                                    {/* Botón Listo para Recoger (Visible en modo oscuro) */}
                                    <button className={`btn btn-sm ${isDark ? 'btn-outline-light text-white' : 'btn-outline-secondary' } d-flex align-items-center gap-1 px-3 rounded-pill`} onClick={() => handleUpdateStatus(p.id, 'Listo para Recoger')}><CheckCircle size={14}/> Listo</button>
                                    
                                    {/* Botón Finalizar */}
                                    <button className="btn btn-sm btn-success d-flex align-items-center gap-1 px-3 rounded-pill" onClick={() => handleUpdateStatus(p.id, 'Completado')}><CheckCircle size={14}/> Fin</button>
                                </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISTA COMBOS */}
        {!loading && !error && activeTab === 'combos' && (
          <div className={cardClass} style={{ backgroundColor: cardBgColor }}>
            <div className="card-body p-4">
              <div className={headerClass}>
                <h4 className="fw-bold m-0">Combos y Paquetes</h4>
                <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4" onClick={() => handleOpenComboModal()}><Plus size={18}/> Nuevo Combo</button>
              </div>
              <div className="table-responsive">
                <table className={`table align-middle table-hover ${isDark ? 'table-dark' : 'table-light'}`}>
                  <thead><tr><th className="py-3 ps-3">Nombre</th><th>Precio</th><th>Estado</th><th className="text-end pe-3">Acciones</th></tr></thead>
                  <tbody>
                    {combos.map((c) => (
                      <tr key={c.id} className={!c.esta_activo ? 'opacity-50' : ''}>
                        <td className="ps-3 fw-bold">{c.nombre}</td>
                        <td className="fw-bold text-success">${Number(c.precio).toFixed(2)}</td>
                        <td>{c.esta_activo ? <span className="badge bg-success">Activo</span> : <span className="badge bg-secondary">Inactivo</span>}</td>
                        <td className="text-end pe-3">
                            <button className={`btn btn-sm ${isDark ? 'text-warning' : 'text-primary'}`} style={{ backgroundColor: 'transparent' }} onClick={() => handleOpenComboModal(c)}><Edit size={18}/></button>
                            {c.esta_activo && <button className={`btn btn-sm ${isDark ? 'text-danger' : 'text-danger'}`} style={{ backgroundColor: 'transparent' }} onClick={() => handleDeleteCombo(c)}><XCircle size={18}/></button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISTA REPORTES (ESTILO CORREGIDO) */}
        {!loading && !error && activeTab === 'reporteGeneral' && (
           <div className="d-flex flex-column gap-4">
              <div className={cardClass} style={{ backgroundColor: cardBgColor }}>
                  <div className="card-body p-4">
                    <h4 className="fw-bold mb-4">Resumen de Ventas</h4>
                    {/* Contenedor del gráfico con mejor contraste */}
                    <div style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', padding: '15px', borderRadius: '8px' }}>
                        {reportData.length > 0 ? <SalesReportChart reportData={reportData} /> : <p className="text-center text-muted py-5">No hay datos suficientes para graficar.</p>}
                    </div>
                  </div>
              </div>

              <div className={`card border-danger border-2 shadow-sm ${isDark ? 'bg-dark text-white' : 'bg-white'}`}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-3 text-danger">
                        <AlertTriangle size={30} />
                        <h4 className="m-0 fw-bold">Zona de Peligro</h4>
                    </div>
                    <p className={isDark ? 'text-white-50' : 'text-muted'}>Estas acciones son destructivas y no se pueden deshacer.</p>
                    <button className="btn btn-outline-danger fw-bold px-4 py-2" onClick={() => setShowPurgeModal(true)}>
                        <Trash2 size={18} className="me-2"/> Eliminar Historial de Pedidos
                    </button>
                  </div>
              </div>
           </div>
        )}

        {activeTab === 'reporteProductos' && <ProductSalesReport />}
      </div>

      {/* MODALES */}
      {showProductModal && <ProductModal show={showProductModal} handleClose={handleCloseProductModal} handleSave={handleSaveProducto} productoActual={productoActual} />}
      {showComboModal && <ComboModal show={showComboModal} handleClose={handleCloseComboModal} handleSave={handleSaveCombo} comboActual={comboActual} />}
      
      {showDetailsModal && <DetallesPedidoModal pedido={selectedOrderDetails} onClose={handleCloseDetailsModal} />}
      
      <ConfirmationModal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmAction} title={confirmTitle} message={confirmMessage} theme={theme} />

      {/* MODAL PURGA */}
      {showPurgeModal && (
        <div className="modal show fade" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold"><AlertTriangle size={20} className="me-2"/> Acción Irreversible</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPurgeModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p>Estás a punto de borrar <strong>TODOS</strong> los pedidos. Para confirmar, escribe <strong>ELIMINAR</strong>:</p>
                <input type="text" className="form-control form-control-lg text-center fw-bold" value={purgeConfirmText} onChange={(e) => setPurgeConfirmText(e.target.value)} placeholder="ELIMINAR" />
              </div>
              <div className="modal-footer border-0 bg-light">
                <button className="btn btn-secondary px-4" onClick={() => setShowPurgeModal(false)}>Cancelar</button>
                <button className="btn btn-danger px-4 fw-bold" onClick={handlePurgePedidos} disabled={purgeConfirmText !== 'ELIMINAR'}>BORRAR TODO</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;