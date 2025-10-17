import React from 'react';

function DetallesPedidoModal({ pedido, onClose }) {
  if (!pedido) return null;

  // Aseguramos que 'productos' siempre sea un array para evitar errores
  const productos = Array.isArray(pedido.productos) ? pedido.productos : [];

  // Lógica para crear el enlace de Google Maps
  let googleMapsUrl = '';
  if (pedido.latitude && pedido.longitude) {
    // Opción 1 (la mejor): Usar coordenadas
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${pedido.latitude},${pedido.longitude}`;
  } else if (pedido.direccion_entrega) {
    // Opción 2 (alternativa): Usar la dirección de texto
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.direccion_entrega)}`;
  }

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content text-bg-dark">
          
          <div className="modal-header">
            <h5 className="modal-title">
              Detalles del Pedido #{pedido.id}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* SECCIÓN DE DATOS GENERALES */}
            <div className="mb-4">
              <p className="mb-1"><strong>Cliente:</strong> {pedido.nombre_cliente}</p>
              <p className="mb-1"><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
              <p className="mb-1"><strong>Tipo:</strong> {pedido.tipo_orden}</p>
              <p className="mb-1"><strong>Estado:</strong> <span className="fw-bold text-warning">{pedido.estado}</span></p>
            </div>
            <hr />

            {/* SECCIÓN DE PRODUCTOS */}
            {productos.length > 0 && (
              <div className="mb-4">
                <h6>Productos:</h6>
                <ul className="list-group list-group-flush">
                  {productos.map((producto, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-white px-0"
                    >
                      <span>{producto.cantidad}x {producto.nombre}</span>
                      <span className="badge bg-primary rounded-pill">
                        ${(producto.cantidad * Number(producto.precio || 0)).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SECCIÓN DE ENVÍO (SOLO PARA DOMICILIO) */}
            {pedido.tipo_orden === 'domicilio' && (
              <div className="mb-4">
                <h6>Detalles de Envío:</h6>
                <div className="card text-bg-secondary">
                  <div className="card-body">
                    <p className="card-text mb-1">
                      <strong>Dirección:</strong> {pedido.direccion_entrega || 'No especificada'}
                    </p>
                    {pedido.referencia && (
                      <p className="card-text mb-2">
                        <strong>Referencia:</strong> {pedido.referencia}
                      </p>
                    )}
                    {googleMapsUrl && (
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-info btn-sm mt-2"
                        >
                          Abrir en Google Maps
                        </a>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* SECCIÓN DEL TOTAL */}
            <div className="text-end mt-4">
              <h4 className="mb-0">
                Total:{' '}
                <span className="text-success fw-bold">
                  ${Number(pedido.total).toFixed(2)}
                </span>
              </h4>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-danger" onClick={onClose}>
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DetallesPedidoModal;