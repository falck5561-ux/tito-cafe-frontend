import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// --- CONFIGURACIÓN DE AXIOS ---
axios.defaults.baseURL = 'https://tito-cafe-backend.onrender.com';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
// ---------------------------------------------

// --- COMPONENTE MODAL INTEGRADO ---
const DetallesPedidoModal = ({ pedido, onClose }) => {
  if (!pedido) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1050
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#2c2c2c', color: 'white', padding: '2rem',
        borderRadius: '0.5rem', width: '90%', maxWidth: '500px'
      }} onClick={e => e.stopPropagation()}>
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
  const [productos, setProductos] = useState([]);
  const [ventaActual, setVentaActual] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);
  const [pedidos, setPedidos] = useState([]);
  const [ventasDelDia, setVentasDelDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // --- ESTADOS PARA LA BÚSQUEDA DE RECOMPENSAS ---
  const [emailCliente, setEmailCliente] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [recompensaAplicadaId, setRecompensaAplicadaId] = useState(null);

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
    const nuevoTotal = ventaActual.reduce((sum, item) => sum + (item.cantidad * Number(item.precioFinal)), 0);
    setTotalVenta(nuevoTotal);
  }, [ventaActual]);

  const agregarProductoAVenta = (producto) => {
    let precioFinal = parseFloat(producto.precio);
    if (producto.oferta_activa && producto.porcentaje_descuento > 0) {
      const descuento = precioFinal * (producto.porcentaje_descuento / 100);
      precioFinal -= descuento;
    }
    
    setVentaActual(prevVenta => {
      // Modificación para agrupar solo si no es una recompensa
      const productoExistente = prevVenta.find(item => item.id === producto.id && !item.esRecompensa);
      
      if (productoExistente) {
        return prevVenta.map(item =>
          item.id === producto.id && !item.esRecompensa ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      
      return [...prevVenta, { 
        ...producto, 
        cantidad: 1, 
        precioFinal: precioFinal.toFixed(2)
      }];
    });
  };

  const incrementarCantidad = (productoId) => {
    setVentaActual(prev =>
      prev.map(item =>
        item.id === productoId ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  };

  const decrementarCantidad = (productoId) => {
    setVentaActual(prev => {
      const producto = prev.find(item => item.id === productoId);
      if (producto.cantidad === 1) {
        return prev.filter(item => item.id !== productoId);
      }
      return prev.map(item =>
        item.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item
      );
    });
  };

  const eliminarProducto = (productoId) => {
    setVentaActual(prev => prev.filter(item => item.id !== productoId));
  };
  
  const limpiarVenta = () => {
    setVentaActual([]);
    setEmailCliente('');
    setClienteEncontrado(null);
    setRecompensaAplicadaId(null);
  };
  
  const handleCobrar = async () => {
    if (ventaActual.length === 0) return toast.error('El ticket está vacío.');
    
    const productosParaEnviar = ventaActual.map(({ id, cantidad, precioFinal, nombre }) => ({ 
      id, 
      cantidad, 
      precio: Number(precioFinal),
      nombre 
    }));
    
    const ventaData = { 
      total: totalVenta, 
      metodo_pago: 'Efectivo', 
      productos: productosParaEnviar,
      // Se envían los datos del cliente y la recompensa si se usaron
      clienteId: clienteEncontrado ? clienteEncontrado.cliente.id : null,
      recompensaUsadaId: recompensaAplicadaId
    };

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
  
  // --- LÓGICA PARA BUSCAR Y APLICAR RECOMPENSAS ---
  const handleBuscarCliente = async (e) => {
    e.preventDefault();
    if (!emailCliente) return toast.error('Por favor, ingresa un correo.');
    
    try {
      const { data } = await axios.post('/api/recompensas/buscar-por-email', { email: emailCliente });
      setClienteEncontrado(data);
      if (data.recompensas.length > 0) {
        toast.success(`${data.cliente.nombre} tiene recompensas disponibles.`);
      } else {
        toast.error(`${data.cliente.nombre} no tiene recompensas por el momento.`);
      }
    } catch (err) {
      setClienteEncontrado(null);
      toast.error(err.response?.data?.msg || 'Error al buscar cliente.');
    }
  };

  const handleAplicarRecompensa = (recompensa) => {
    const productosElegibles = ['Café Americano', 'Frappe Coffee'];
    let itemParaDescontar = null;
    let precioMaximo = -1;

    // Busca el producto elegible más caro que AÚN NO sea una recompensa
    ventaActual.forEach(item => {
      if (productosElegibles.includes(item.nombre) && Number(item.precio) > precioMaximo && !item.esRecompensa) {
        precioMaximo = Number(item.precio);
        itemParaDescontar = item;
      }
    });

    if (!itemParaDescontar) {
      return toast.error('Añade un Café o Frappe al ticket para aplicar la recompensa.');
    }
    
    setVentaActual(prevVenta => prevVenta.map(item => 
      item.id === itemParaDescontar.id 
        ? { ...item, precioFinal: "0.00", nombre: `${item.nombre} (Recompensa)`, esRecompensa: true }
        : item
    ));

    setRecompensaAplicadaId(recompensa.id);
    toast.success('¡Recompensa aplicada!');
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
                  <th>ID</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Tipo</th><th>Estado</th><th>Acciones</th>
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
          <div className="col-md-7">
            <h2>Menú de Productos</h2>
            <div className="row g-3">
              {productos.map(p => {
                const tieneOferta = p.oferta_activa && p.porcentaje_descuento > 0;
                let precioFinal = parseFloat(p.precio);
                if (tieneOferta) {
                  precioFinal -= precioFinal * (p.porcentaje_descuento / 100);
                }

                return (
                  <div key={p.id} className="col-md-4 col-lg-3">
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      className={`card h-100 text-center ${tieneOferta ? 'border-danger' : ''}`}
                      onClick={() => agregarProductoAVenta(p)} 
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      {tieneOferta && (
                        <span className="badge bg-danger" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                          -{p.porcentaje_descuento}%
                        </span>
                      )}
                      <div className="card-body d-flex flex-column justify-content-center pt-4">
                        <h5 className="card-title">{p.nombre}</h5>
                        {tieneOferta ? (
                          <p className="card-text">
                            <del className="text-muted me-2">${Number(p.precio).toFixed(2)}</del>
                            <strong>${precioFinal.toFixed(2)}</strong>
                          </p>
                        ) : (
                          <p className="card-text">${Number(p.precio).toFixed(2)}</p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="col-md-5">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title text-center">Ticket de Venta</h3>
                <hr />
                {/* --- SECCIÓN PARA BUSCAR RECOMPENSAS --- */}
                <form onSubmit={handleBuscarCliente} className="d-flex mb-3">
                  <input
                    type="email"
                    className="form-control me-2"
                    placeholder="Buscar cliente por correo..."
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                  />
                  <button type="submit" className="btn btn-info">Buscar</button>
                </form>

                {/* --- SECCIÓN PARA MOSTRAR RECOMPENSAS --- */}
                {clienteEncontrado && (
                  <div className="alert alert-secondary">
                    <p className="mb-1"><strong>Cliente:</strong> {clienteEncontrado.cliente.nombre}</p>
                    {clienteEncontrado.recompensas.length > 0 ? (
                      clienteEncontrado.recompensas.map(rec => (
                        <div key={rec.id}>
                          <p className="mb-1">{rec.descripcion}</p>
                          <button
                            className="btn btn-sm btn-success w-100"
                            onClick={() => handleAplicarRecompensa(rec)}
                            disabled={recompensaAplicadaId === rec.id}
                          >
                            {recompensaAplicadaId === rec.id ? 'Recompensa Aplicada' : `Aplicar ${rec.nombre}`}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="mb-0">No hay recompensas disponibles.</p>
                    )}
                  </div>
                )}
                
                <hr />
                <ul className="list-group list-group-flush">
                  {ventaActual.length === 0 && <li className="list-group-item text-center text-muted">El ticket está vacío</li>}
                  {ventaActual.map((item) => (
                    <li key={item.id} className="list-group-item d-flex align-items-center justify-content-between p-1">
                      <span className="me-auto">{item.nombre}</span>
                      <div className="d-flex align-items-center">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => decrementarCantidad(item.id)}>-</button>
                        <span className="mx-2">{item.cantidad}</span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => incrementarCantidad(item.id)}>+</button>
                      </div>
                      <span className="mx-3" style={{ minWidth: '60px', textAlign: 'right' }}>
                        ${(item.cantidad * Number(item.precioFinal)).toFixed(2)}
                      </span>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarProducto(item.id)}>&times;</button>
                    </li>
                  ))}
                </ul>
                <hr />
                <h4>Total: ${totalVenta.toFixed(2)}</h4>
                <div className="d-grid gap-2 mt-3">
                  <button className="btn btn-success" onClick={handleCobrar}>Cobrar</button>
                  <button className="btn btn-danger" onClick={limpiarVenta}>Cancelar</button>
                </div>
              </div>
            </div>
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

