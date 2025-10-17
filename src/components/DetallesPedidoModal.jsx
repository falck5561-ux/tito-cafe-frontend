import React from 'react';

function DetallesPedidoModal({ pedido, onClose }) {
  if (!pedido) return null;

  // Aseguramos que productos siempre sea un array para evitar errores.
  const productos = Array.isArray(pedido.productos) ? pedido.productos : [];

  // --- CORRECCIÓN: LÓGICA DE GOOGLE MAPS MEJORADA ---
  // Se crea el enlace estándar de Google Maps, que funciona correctamente.
  let googleMapsUrl = '';
  if (pedido.latitude && pedido.longitude) {
    // Opción 1: Usar coordenadas (es la más precisa)
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${pedido.latitude},${pedido.longitude}`;
  } else if (pedido.direccion_entrega) {
    // Opción 2: Usar la dirección de texto como alternativa
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.direccion_entrega)}`;
  }
  
  // Se calcula el subtotal de los productos.
  const totalProductos = productos.reduce(
    (sum, p) => sum + (p.cantidad * Number(p.precio || 0)),
    0
  );

  // --- MEJORA: Cálculo del total más robusto ---
  // Si `pedido.total` no viene, se calcula sumando productos + envío.
  const costoEnvio = Number(pedido.costo_envio || 0);
  const totalCalculado = totalProductos + costoEnvio;
  const totalFinal = Number(pedido.total || totalCalculado);


  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content text-bg-dark">
          <div className="modal-header">
            <h5 className="modal-title">
              Detalles del Pedido #{pedido.id} - {pedido.nombre_cliente}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Lista de Productos */}
            <h6>Productos:</h6>
            {productos.length > 0 ? (
              <ul className="list-group list-group-flush mb-4">
                {productos.map((producto, index) => (
                  <li
                    key={index} // Se mantiene el index si no hay un ID único por item
                    className="list-group-item d-flex justify-content-between align-items-center bg-dark text-white"
                  >
                    <span>{producto.cantidad}x {producto.nombre}</span>
                    <span className="badge bg-primary rounded-pill">
                      ${(producto.cantidad * Number(producto.precio || 0)).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-4">No hay productos en este pedido.</p>
            )}

            {/* Detalles de Envío si es a domicilio */}
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
                    {/* El botón solo se muestra si se pudo crear una URL */}
                    {googleMapsUrl && (
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-info btn-sm"
                        >
                          Abrir en Google Maps
                        </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Resumen de Costos */}
            <div className="text-end">
              <p className="mb-1">
                Subtotal Productos: <strong>${totalProductos.toFixed(2)}</strong>
              </p>
              {costoEnvio > 0 && (
                <p className="mb-1">
                  Costo de Envío:{' '}
                  <strong>${costoEnvio.toFixed(2)}</strong>
                </p>
              )}
              <hr className="my-1" />
              <h4 className="mb-0">
                Total:{' '}
                <span className="text-success">
                  ${totalFinal.toFixed(2)}
                </span>
              </h4>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetallesPedidoModal;