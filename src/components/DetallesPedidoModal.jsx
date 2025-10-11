import React from 'react';

function DetallesPedidoModal({ pedido, onClose }) {
  if (!pedido) return null;

  // El evento para cerrar el modal solo si se hace clic en el fondo oscuro
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Aplicamos la clase principal que controla el tema desde App.css
    <div className="detalles-pedido-modal" onClick={handleBackdropClick}>
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h4 className="modal-title">Detalles del Pedido #{pedido.id}</h4>
          </div>
          
          <div className="modal-body">
            <h5>Productos:</h5>
            {/* Usamos la clase que definimos en el CSS para la lista */}
            <ul className="lista-productos mb-3">
              {pedido.productos?.map((producto, index) => (
                <li key={index}>
                  <span>
                    <strong>{producto.cantidad}x</strong> {producto.nombre}
                  </span>
                  <span className="badge bg-success rounded-pill">
                    ${(producto.cantidad * producto.precio).toFixed(2)}
                  </span>
                </li>
              )) || <p>No se encontraron productos.</p>}
            </ul>
            
            {pedido.tipo_orden === 'domicilio' && (
              <div className="detalles-envio">
                <hr />
                <h5>Detalles de Envío:</h5>
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

          <div className="modal-footer d-flex flex-column align-items-end">
            <div className="total-pedido">
              Total: ${parseFloat(pedido.total).toFixed(2)}
            </div>
            <button type="button" className="btn btn-secondary mt-2 w-100" onClick={onClose}>
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DetallesPedidoModal;