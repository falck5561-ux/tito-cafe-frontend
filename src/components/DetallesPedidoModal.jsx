import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Phone } from 'lucide-react'; // <--- 1. IMPORTAMOS EL ICONO

function DetallesPedidoModal({ pedido, onClose }) {
  if (!pedido) return null;

  const { theme } = useTheme();

  // --- LÓGICA PARA ENCONTRAR PRODUCTOS ---
  const productos = 
      pedido.items || 
      pedido.detalles_pedido || 
      pedido.productos || 
      pedido.detalles || 
      pedido.venta_detalles || 
      [];

  let googleMapsUrl = '';
  if (pedido.latitude && pedido.longitude) {
    googleMapsUrl = `http://googleusercontent.com/maps.google.com/maps?q=${pedido.latitude},${pedido.longitude}`;
  } else if (pedido.direccion_entrega) {
    googleMapsUrl = `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(pedido.direccion_entrega)}`;
  }

  // Estilos
  const modalClass = theme === 'dark' ? 'modal-content text-bg-dark' : 'modal-content';
  const closeButtonClass = theme === 'dark' ? 'btn-close btn-close-white' : 'btn-close';
  const mutedTextColor = theme === 'dark' ? 'text-white-50' : 'text-muted';
  const borderColor = theme === 'dark' ? 'border-secondary' : ''; 

  // --- FUNCIÓN DE LIMPIEZA AGRESIVA ---
  const parseOpciones = (raw) => {
    if (!raw) return [];
    
    if (Array.isArray(raw)) {
        return raw.map(op => (typeof op === 'string' ? op : op.nombre));
    }

    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.map(op => op.nombre || op);
        } catch (e) {}

        try {
            const unescaped = raw.replace(/\\/g, ''); 
            const parsed = JSON.parse(unescaped);
            if (Array.isArray(parsed)) return parsed.map(op => op.nombre || op);
        } catch (e) {}

        // Fallback manual
        return raw.split(',')
            .filter(part => !part.includes('id') && /[a-zA-Z]/.test(part))
            .map(part => {
                let limpio = part.replace(/[\\"{}\[\]:]/g, '').replace('nombre', '').trim();
                return limpio;
            })
            .filter(part => part !== '');
    }
    
    return [];
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className={modalClass} style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderRadius: '15px', overflow: 'hidden' }}>
          
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">Ticket #{pedido.id}</h5>
            <button type="button" className={closeButtonClass} onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* --- CABECERA DEL TICKET --- */}
            <div className="p-3 rounded mb-3" style={{ backgroundColor: theme === 'dark' ? '#2c3035' : '#f8f9fa' }}>
                <div className="d-flex justify-content-between mb-1">
                <span className={mutedTextColor}>Cliente:</span>
                <span className="fw-bold text-end">{pedido.nombre_cliente || 'Mostrador'}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                <span className={mutedTextColor}>Fecha:</span>
                <span className="text-end" style={{ fontSize: '0.9rem' }}>{new Date(pedido.fecha).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                <span className={mutedTextColor}>Estado:</span>
                <span className={`badge ${!pedido.estado || pedido.estado === 'Completado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {pedido.estado || 'Completado'}
                </span>
                </div>
            </div>

            <h6 className="mb-3 border-bottom pb-2">Productos</h6>
            
            {/* --- LISTA DE PRODUCTOS --- */}
            <ul className="list-unstyled mb-0">
              {productos.map((producto, index) => {
                const opcionesLimpias = parseOpciones(producto.opciones || producto.selectedOptions);

                return (
                  <li key={index} className={`py-3 border-bottom ${borderColor}`} style={{ borderColor: theme === 'dark' ? '#444' : '#eee' }}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <span className="fw-bold" style={{ fontSize: '1.05rem' }}>
                            {producto.cantidad}x {producto.nombre || producto.nombre_producto}
                        </span>
                      </div>
                      <span className="fw-bold text-nowrap ms-2">
                        ${(producto.cantidad * Number(producto.precio || producto.precio_unitario || 0)).toFixed(2)}
                      </span>
                    </div>

                    {opcionesLimpias.length > 0 && (
                      <div className="mt-1 ps-3 border-start border-3" style={{ borderColor: theme === 'dark' ? '#555' : '#ddd' }}>
                        {opcionesLimpias.map((textoOpcion, opIndex) => (
                          <div key={opIndex} className={`${mutedTextColor} small`} style={{ lineHeight: '1.4' }}>
                            + {textoOpcion}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            
            {/* --- SECCIÓN DE ENVÍO CON TELÉFONO --- */}
            {pedido.tipo_orden === 'domicilio' && (
              <div className="mt-4">
                <h6 className="mb-2 border-bottom pb-2">Datos de Entrega</h6>
                <div className="small">
                  
                  {/* 2. AQUÍ MOSTRAMOS EL TELÉFONO DESTACADO */}
                  {pedido.telefono && (
                    <div className="mb-2 p-2 rounded d-flex align-items-center gap-2" style={{ backgroundColor: theme === 'dark' ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff', color: theme === 'dark' ? '#60a5fa' : '#1d4ed8' }}>
                        <Phone size={16} />
                        <span className="fw-bold">Tel:</span>
                        <a href={`tel:${pedido.telefono}`} className="fw-bold text-decoration-none" style={{ color: 'inherit' }}>
                            {pedido.telefono}
                        </a>
                    </div>
                  )}

                  <p className="mb-1"><strong>📍 Dirección:</strong> {pedido.direccion_entrega || pedido.direccion || 'No especificada'}</p>
                  
                  {pedido.referencia && <p className="mb-1 text-muted">Ref: {pedido.referencia}</p>}
                  
                  {googleMapsUrl && (
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none fw-bold mt-1 d-inline-block">
                      Ver en Mapa &rarr;
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* --- TOTAL GRANDE --- */}
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top" style={{ borderColor: theme === 'dark' ? '#444' : '#eee' }}>
              <span className="h5 mb-0 text-muted">Total Pagado</span>
              <span className="h3 mb-0 fw-bold text-success">${Number(pedido.total).toFixed(2)}</span>
            </div>
          </div>

          <div className="modal-footer border-0 pt-0">
            <button type="button" className="btn btn-lg btn-secondary w-100" onClick={onClose} style={{ borderRadius: '10px' }}>
              Cerrar Ticket
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DetallesPedidoModal;