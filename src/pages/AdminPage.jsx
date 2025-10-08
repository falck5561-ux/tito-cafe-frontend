// Archivo: src/pages/AdminPage.jsx (Versión Final con 3 Pestañas)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductModal from '../components/ProductModal';
import SalesReportChart from '../components/SalesReportChart';
import ProductSalesReport from '../components/ProductSalesReport'; // <-- 1. Importa el nuevo reporte

function AdminPage() {
  // Cambia el nombre de la pestaña de reportes para evitar confusión
  const [activeTab, setActiveTab] = useState('productos'); // 'productos', 'reporteGeneral', 'reporteProductos'
  const [productos, setProductos] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [productoActual, setProductoActual] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Solo carga datos automáticamente para las pestañas que lo necesitan
      if (activeTab === 'productos' || activeTab === 'reporteGeneral') {
        setLoading(true);
        setError('');
        try {
          if (activeTab === 'productos') {
            const res = await axios.get('https://tito-cafe-backend.onrender.com/api/productos');
            setProductos(res.data);
          } else if (activeTab === 'reporteGeneral') {
            const res = await axios.get('https://tito-cafe-backend.onrender.com/api/ventas/reporte');
            setReportData(res.data);
          }
        } catch (err) { 
          setError(`No se pudieron cargar los datos.`);
        } finally { 
          setLoading(false); 
        }
      } else {
        // Para la nueva pestaña, no cargamos nada hasta que el usuario lo pida
        setLoading(false);
        setError('');
      }
    };
    fetchData();
  }, [activeTab]);

  const refreshProducts = async () => {
    try {
      const res = await axios.get('https://tito-cafe-backend.onrender.com/api/productos');
      setProductos(res.data);
    } catch {
      // maneja el error si es necesario
    }
  }

  const handleOpenModal = (producto = null) => { setProductoActual(producto); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setProductoActual(null); };
  
  const handleSaveProducto = async (producto) => {
    const action = producto.id ? 'actualizado' : 'creado';
    try {
      if (producto.id) {
        await axios.put(`https://tito-cafe-backend.onrender.com/api/productos/${producto.id}`, producto);
      } else {
        await axios.post('https://tito-cafe-backend.onrender.com/api/productos', producto);
      }
      toast.success(`Producto ${action} con éxito.`);
      refreshProducts();
      handleCloseModal();
    } catch (err) {
      toast.error(`No se pudo guardar el producto.`);
    }
  };

  const handleDeleteProducto = async (id) => { 
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await axios.delete(`https://tito-cafe-backend.onrender.com/api/productos/${id}`);
        toast.success('Producto eliminado con éxito.');
        refreshProducts();
      } catch (err) {
        toast.error('No se pudo eliminar el producto.');
      }
    }
  };

  return (
    <div>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>
            Gestión de Productos
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'reporteGeneral' ? 'active' : ''}`} onClick={() => setActiveTab('reporteGeneral')}>
            Reporte General
          </button>
        </li>
        {/* --- 2. AÑADE LA NUEVA PESTAÑA --- */}
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'reporteProductos' ? 'active' : ''}`} onClick={() => setActiveTab('reporteProductos')}>
            Reporte por Producto
          </button>
        </li>
      </ul>

      {/* --- Contenido --- */}
      {loading && <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && activeTab === 'productos' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Gestión de Productos</h1>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>Añadir Nuevo Producto</button>
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
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleOpenModal(p)}>Editar</button>
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
          {reportData.length > 0 ? <SalesReportChart reportData={reportData} /> : <p className="text-center">No hay datos de ventas para mostrar en el gráfico.</p>}
        </div>
      )}
      
      {/* --- 3. AÑADE EL RENDERIZADO DEL NUEVO REPORTE --- */}
      {activeTab === 'reporteProductos' && (
        <ProductSalesReport />
      )}
      
      <ProductModal show={showModal} handleClose={handleCloseModal} handleSave={handleSaveProducto} productoActual={productoActual} />
    </div>
  );
}

export default AdminPage;