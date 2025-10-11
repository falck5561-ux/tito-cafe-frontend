import React from 'react';

function DetallesPedidoModal({ pedido, onClose }) {
  if (!pedido) return null;

  return (
    // Se reemplaza style por className para que App.css lo controle
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">Detalles del Pedido #{pedido.id}</h4>
          <p className="mb-0 text-muted"><strong>Cliente:</strong> {pedido.nombre_cliente}</p>
        </div>
        
        <div className="modal-body">
          <h6>Productos:</h6>
          <ul className="list-group list-group-flush mb-3">
            {pedido.productos?.map((producto, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>{producto.cantidad}x</strong> {producto.nombre}
                </span>
                <span className="badge bg-success rounded-pill">
                  ${(producto.cantidad * producto.precio).toFixed(2)}
                </span>
              </li>
            )) || <p>No se encontraron productos para este pedido.</p>}
          </ul>
          
          {pedido.tipo_orden === 'domicilio' && (
            <div>
              <hr />
              <h6>Detalles de Envío:</h6>
              <p className="mb-1"><strong>Dirección:</strong> {pedido.direccion_entrega}</p>
              {pedido.referencia && <p className="mb-1"><strong>Referencia:</strong> {pedido.referencia}</p>}
              
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${pedido.latitude},${pedido.longitude}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline-info btn-sm mt-2"
              >
                Abrir en Google Maps
              </a>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <h3 className="total-pedido text-success">Total: ${parseFloat(pedido.total).toFixed(2)}</h3>
          <button type="button" className="btn btn-secondary mt-2 w-100" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetallesPedidoModal;