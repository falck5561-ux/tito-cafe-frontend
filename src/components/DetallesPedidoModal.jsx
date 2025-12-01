import React from 'react';
import { useTheme } from '../context/ThemeContext'; 

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

  // Estilos según tema
  const modalClass = theme === 'dark' ? 'modal-content text-bg-dark' : 'modal-content';
  const closeButtonClass = theme === 'dark' ? 'btn-close btn-close-white' : 'btn-close';
  const cardBgStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
  };
  const mutedTextColor = theme === 'dark' ? 'text-white-50' : 'text-muted';

  // --- FUNCIÓN DE LIMPIEZA AGRESIVA ---
  const parseOpciones = (raw) => {
    if (!raw) return [];
    
    // 1. Si ya es un arreglo, solo sacamos los nombres
    if (Array.isArray(raw)) {
        return raw.map(op => (typeof op === 'string' ? op : op.nombre));
    }

    // 2. Si es texto, aplicamos limpieza profunda
    if (typeof raw === 'string') {
        // A. Intentamos parsear JSON estándar
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.map(op => op.nombre || op);
        } catch (e) {}

        // B. Intentamos parsear JSON "sucio" (quitando barras invertidas primero)
        try {
            const unescaped = raw.replace(/\\/g, ''); 
            const parsed = JSON.parse(unescaped);
            if (Array.isArray(parsed)) return parsed.map(op => op.nombre || op);
        } catch (e) {}

        // C. FALLBACK MANUAL (El que arreglará tu problema visual)
        // Divide por comas
        return raw.split(',')
            // Filtra cualquier parte que contenga "id" o sea solo números/símbolos
            .filter(part => !part.includes('id') && /[a-zA-Z]/.test(part))
            .map(part => {
                // Borra: barras, comillas, llaves, corchetes, dos puntos y la palabra "nombre"
                let limpio = part.replace(/[\\"{}\[\]:]/g, '').replace('nombre', '').trim();
                return limpio;
            })
            // Elimina vacíos
            .filter(part => part !== '');
    }
    
    return [];
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className={modalClass}>
          
          <div className="modal-header border-0">
            <h5 className="modal-title">Detalles del Pedido #{pedido.id}</h5>
            <button type="button" className={closeButtonClass} onClick={onClose}></button>
          </div>

          <div className="modal-body pt-0">
            {/* --- INFO GENERAL --- */}
            <div className="d-flex justify-content-between mb-2">
              <span className={mutedTextColor}>Cliente:</span>
              <span className="fw-bold text-end">{pedido.nombre_cliente || 'Mostrador'}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className={mutedTextColor}>Fecha:</span>
              <span className="text-end">{new Date(pedido.fecha).toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className={mutedTextColor}>Tipo:</span>
              <span className="text-end">{pedido.tipo_orden || 'Presencial'}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className={mutedTextColor}>Estado:</span>
              <span className="fw-bold text-warning text-end">{pedido.estado}</span>
            </div>
            
            <hr />

            {/* --- PRODUCTOS --- */}
            <h6 className="mb-2">Productos:</h6>
            
            <ul className="list-unstyled mb-3">
              {productos.map((producto, index) => {
                
                // Usamos la nueva limpieza agresiva
                const opcionesLimpias = parseOpciones(producto.opciones || producto.selectedOptions);

                return (
                  <li key={index} className="mb-2 p-1 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">{producto.cantidad}x {producto.nombre || producto.nombre_producto}</span>
                      <span className="text-end">${(producto.cantidad * Number(producto.precio || producto.precio_unitario || 0)).toFixed(2)}</span>
                    </div>

                    {/* Renderizado de Opciones Limpias */}
                    {opcionesLimpias.length > 0 && (
                      <ul className="list-unstyled small ps-3 mb-0" style={{ opacity: 0.8 }}>
                        {opcionesLimpias.map((textoOpcion, opIndex) => (
                          <li key={opIndex} className={mutedTextColor}>+ {textoOpcion}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            
            {/* --- ENVÍO --- */}
            {pedido.tipo_orden === 'domicilio' && (
              <>
                <hr />
                <h6 className="mb-2">Detalles de Envío:</h6>
                <div className="p-3 rounded" style={cardBgStyle}>
                  <p className="mb-1">
                    <strong>Dirección:</strong> {pedido.direccion_entrega || pedido.direccion || 'No especificada'}
                  </p>
                  {pedido.referencia && (
                    <p className="mb-2">
                      <strong>Referencia:</strong> {pedido.referencia}
                    </p>
                  )}
                  {googleMapsUrl && (
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-info btn-sm mt-1">
                      Abrir en Google Maps
                    </a>
                  )}
                </div>
              </>
            )}

            <hr />
            
            {/* --- TOTAL --- */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <h5 className="mb-0">Total:</h5>
              <h5 className="mb-0 text-success fw-bold">${Number(pedido.total).toFixed(2)}</h5>
            </div>
          </div>

          <div className="modal-footer border-0">
            <button type="button" className="btn btn-danger w-100" onClick={onClose}>
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DetallesPedidoModal;