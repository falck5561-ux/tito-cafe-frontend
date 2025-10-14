import React from 'react';

function DetallesPedidoModal({ pedido, onClose }) {
  if (!pedido) return null;

  // Aseguramos que productos siempre sea un array
  const productos = Array.isArray(pedido.productos) ? pedido.productos : [];

  const totalProductos = productos.reduce(
    (sum, p) => sum + (p.cantidad * Number(p.precio || 0)),
    0
  );

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Detalles del Pedido #{pedido.id} - {pedido.nombre_cliente}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Lista de Productos */}
            <h6>Productos:</h6>
            {productos.length > 0 ? (
              <ul className="list-group list-group-flush mb-4">
                {productos.map((producto, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
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
                <div className="card">
                  <div className="card-body">
                    <p className="card-text mb-1">
                      <strong>Dirección:</strong> {pedido.direccion_entrega}
                    </p>
                    {pedido.referencia && (
                      <p className="card-text mb-2">
                        <strong>Referencia:</strong> {pedido.referencia}
                      </p>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${pedido.latitude},${pedido.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-info btn-sm"
                    >
                      Abrir en Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen de Costos */}
            <div className="text-end">
              <p className="mb-1">
                Subtotal Productos: <strong>${totalProductos.toFixed(2)}</strong>
              </p>
              {pedido.costo_envio > 0 && (
                <p className="mb-1">
                  Costo de Envío:{' '}
                  <strong>${Number(pedido.costo_envio).toFixed(2)}</strong>
                </p>
              )}
              <hr className="my-1" />
              <h4 className="mb-0">
                Total:{' '}
                <span className="text-success">
                  ${Number(pedido.total || totalProductos).toFixed(2)}
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
