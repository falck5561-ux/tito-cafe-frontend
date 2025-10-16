import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import apiClient from '../services/api'; // 1. Usar apiClient en lugar de axios directamente

// Componente Modal integrado para no tener que importarlo
const DetallesPedidoModal = ({ pedido, onClose }) => {
  if (!pedido) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }} onClick={onClose}>
      <div style={{ backgroundColor: '#2c2c2c', color: 'white', padding: '2rem', borderRadius: '0.5rem', width: '90%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <h3>Detalles del Pedido #{pedido.id}</h3>
        <hr />
        <p><strong>Cliente:</strong> {pedido.nombre_cliente}</p>
        <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
        <p><strong>Total:</strong> ${Number(pedido.total).toFixed(2)}</p>
        <p><strong>Tipo:</strong> {pedido.tipo_orden}</p>
        <p><strong>Estado:</strong> {pedido.estado}</p>
        <button className="btn btn-danger mt-3 w-100" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

function PosPage() {
  const [activeTab, setActiveTab] = useState('pos');
  const [menuItems, setMenuItems] = useState([]); // <-- 2. Estado para el menú unificado
  const [ventaActual, setVentaActual] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);
  const [pedidos, setPedidos] = useState([]);
  const [ventasDelDia, setVentasDelDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [emailCliente, setEmailCliente] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [recompensaAplicadaId, setRecompensaAplicadaId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'pos') {
        // 3. Cargar productos Y combos
        const [productosRes, combosRes] = await Promise.allSettled([
          apiClient.get('/productos'),
          apiClient.get('/combos'), 
        ]);

        let combinedMenu = [];
        if (productosRes.status === 'fulfilled' && Array.isArray(productosRes.value.data)) {
          combinedMenu.push(...productosRes.value.data.map(p => ({...p, tipo: 'producto'})));
        }
        if (combosRes.status === 'fulfilled' && Array.isArray(combosRes.value.data)) {
          combinedMenu.push(...combosRes.value.data.map(c => ({
            id: `combo-${c.id}`,
            nombre: c.titulo,
            precio: c.precio_oferta > 0 && Number(c.precio_oferta) < Number(c.precio) ? c.precio_oferta : c.precio,
            precio_original: c.precio,
            en_oferta: c.precio_oferta > 0 && Number(c.precio_oferta) < Number(c.precio),
            descuento_porcentaje: c.descuento_porcentaje,
            tipo: 'combo'
          })));
        }
        setMenuItems(combinedMenu);

      } else if (activeTab === 'pedidos') {
        // 4. CORRECCIÓN DE RUTAS: Usar apiClient y quitar /api
        const res = await apiClient.get('/pedidos');
        setPedidos(res.data);
      } else if (activeTab === 'historial') {
        const res = await apiClient.get('/ventas/hoy');
        setVentasDelDia(res.data);
      }
    } catch (err) {
      setError(`No se pudieron cargar los datos.`);
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  useEffect(() => {
    const nuevoTotal = ventaActual.reduce((sum, item) => sum + (item.cantidad * Number(item.precioFinal)), 0);
    setTotalVenta(nuevoTotal);
  }, [ventaActual]);

  const agregarProductoAVenta = (item) => {
    const precioFinal = item.en_oferta ? item.precio : item.precio_original || item.precio;

    setVentaActual(prevVenta => {
      const productoExistente = prevVenta.find(p => p.id === item.id && !p.esRecompensa);
      if (productoExistente) {
        return prevVenta.map(p =>
          p.id === item.id && !p.esRecompensa ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prevVenta, { 
        ...item, 
        cantidad: 1, 
        precioFinal: parseFloat(precioFinal).toFixed(2),
        esRecompensa: false
      }];
    });
  };

  // --- El resto de funciones ahora usarán apiClient implícitamente ---

  const incrementarCantidad = (productoId) => { setVentaActual(prev => prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad + 1 } : item)); };
  const decrementarCantidad = (productoId) => { setVentaActual(prev => { const p = prev.find(item => item.id === productoId); if (p.cantidad === 1) { return prev.filter(item => item.id !== productoId); } return prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item); }); };
  const eliminarProducto = (productoId) => { setVentaActual(prev => prev.filter(item => item.id !== productoId)); };
  const limpiarVenta = () => { setVentaActual([]); setEmailCliente(''); setClienteEncontrado(null); setRecompensaAplicadaId(null); };
  
  const handleCobrar = async () => {
    if (ventaActual.length === 0) return toast.error('El ticket está vacío.');
    const productosParaEnviar = ventaActual.map(({ id, cantidad, precioFinal, nombre }) => ({ id, cantidad, precio: Number(precioFinal), nombre }));
    const ventaData = { total: totalVenta, metodo_pago: 'Efectivo', productos: productosParaEnviar, clienteId: clienteEncontrado ? clienteEncontrado.cliente.id : null, recompensaUsadaId: recompensaAplicadaId };
    try {
      await apiClient.post('/ventas', ventaData);
      toast.success('¡Venta registrada con éxito!');
      limpiarVenta();
      if (activeTab === 'historial') { fetchData(); }
    } catch (err) { toast.error('Error al registrar la venta.'); }
  };
  
  const handleUpdateStatus = async (pedidoId, nuevoEstado) => { try { await apiClient.put(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado }); fetchData(); toast.success(`Pedido #${pedidoId} actualizado.`); } catch (err) { toast.error('No se pudo actualizar el estado.'); } };
  const handleShowDetails = (pedido) => { setSelectedOrderDetails(pedido); setShowDetailsModal(true); };
  const handleCloseDetailsModal = () => { setShowDetailsModal(false); setSelectedOrderDetails(null); };
  
  const handleBuscarCliente = async (e) => {
    e.preventDefault();
    if (!emailCliente) return toast.error('Por favor, ingresa un correo.');
    try {
      const { data } = await apiClient.post('/recompensas/buscar-por-email', { email: emailCliente });
      setClienteEncontrado(data);
      if (data.recompensas.length > 0) { toast.success(`${data.cliente.nombre} tiene recompensas disponibles.`); } else { toast.error(`${data.cliente.nombre} no tiene recompensas.`); }
    } catch (err) { setClienteEncontrado(null); toast.error(err.response?.data?.msg || 'Error al buscar cliente.'); }
  };

  const handleAplicarRecompensa = (recompensa) => {
    const productosElegibles = ['Café Americano', 'Frappe Coffee'];
    let itemParaDescontar = null;
    let precioMaximo = -1;
    ventaActual.forEach(item => { if (productosElegibles.includes(item.nombre) && Number(item.precioFinal) > precioMaximo && !item.esRecompensa) { precioMaximo = Number(item.precioFinal); itemParaDescontar = item; } });
    if (!itemParaDescontar) { return toast.error('Añade un Café o Frappe al ticket para aplicar la recompensa.'); }
    setVentaActual(prevVenta => prevVenta.map(item => item.id === itemParaDescontar.id && !item.esRecompensa ? { ...item, precioFinal: "0.00", nombre: `${item.nombre} (Recompensa)`, esRecompensa: true } : item ));
    setRecompensaAplicadaId(recompensa.id);
    toast.success('¡Recompensa aplicada!');
  };

  const renderContenido = () => {
    if (loading) return <div className="text-center"><div className="spinner-border" role="status"></div></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    if (activeTab === 'pedidos') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Tu JSX de Pedidos en Línea aquí */}
        </motion.div>
      );
    }

    if (activeTab === 'pos') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row">
          <div className="col-md-7">
            <h2>Menú de Productos</h2>
            <div className="row g-3">
              {menuItems.map(item => (
                <div key={item.id} className="col-md-4 col-lg-3">
                  <motion.div whileHover={{ scale: 1.05 }} className={`card h-100 text-center ${item.en_oferta ? 'border-danger' : ''}`} onClick={() => agregarProductoAVenta(item)} style={{ cursor: 'pointer', position: 'relative' }}>
                    {item.en_oferta && (<span className="badge bg-danger" style={{ position: 'absolute', top: '10px', right: '10px' }}>-{item.descuento_porcentaje}%</span>)}
                    <div className="card-body d-flex flex-column justify-content-center pt-4">
                      <h5 className="card-title">{item.nombre}</h5>
                      {item.en_oferta ? (
                        <p className="card-text">
                          <del className="text-muted me-2">${Number(item.precio_original).toFixed(2)}</del>
                          <strong>${Number(item.precio).toFixed(2)}</strong>
                        </p>
                      ) : (
                        <p className="card-text">${Number(item.precio).toFixed(2)}</p>
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-5">
            {/* Tu JSX del Ticket de Venta aquí */}
          </div>
        </motion.div>
      );
    }
    
    if (activeTab === 'historial') {
        // Tu JSX de Historial de Ventas aquí
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
      {showDetailsModal && (<DetallesPedidoModal pedido={selectedOrderDetails} onClose={handleCloseDetailsModal} />)}
    </div>
  );
}

export default PosPage;

