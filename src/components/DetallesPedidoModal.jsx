import React from 'react';

// Estilos para el modal, puedes moverlos a un archivo CSS si prefieres.
const modalStyles = {
  backdrop: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', 
    justifyContent: 'center', alignItems: 'center', zIndex: 1050,
  },
  content: {
    backgroundColor: '#212529', color: 'white', padding: '2rem',
    borderRadius: '0.5rem', width: '90%', maxWidth: '600px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.5)', border: '1px solid #444'
  },
  header: { borderBottom: '1px solid #444', paddingBottom: '1rem', marginBottom: '1rem' },
  footer: { borderTop: '1px solid #444', paddingTop: '1rem', marginTop: '1.5rem', textAlign: 'right' },
  listItem: { backgroundColor: '#343a40', borderColor: '#495057' }
};

function DetallesPedidoModal({ pedido, onClose }) {
  if (!pedido) return null;

  return (
    <div style={modalStyles.backdrop} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h4 className="modal-title">Detalles del Pedido #{pedido.id}</h4>
          <p className="mb-0 text-muted"><strong>Cliente:</strong> {pedido.nombre_cliente}</p>
        </div>
        
        <div className="modal-body">
          <h6>Productos:</h6>
          <ul className="list-group mb-3">
            {pedido.productos?.map((producto, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center" style={modalStyles.listItem}>
                <span>
                  <strong>{producto.cantidad}x</strong> {producto.nombre}
                </span>
                <span className="badge bg-light text-dark rounded-pill">
                  ${(producto.cantidad * producto.precio).toFixed(2)}
                </span>
              </li>
            )) || <p>No se encontraron productos para este pedido.</p>}
          </ul>
          
          {pedido.tipo_orden === 'domicilio' && (
            <div>
              <hr style={{borderColor: '#444'}} />
              <h6>Detalles de Envío:</h6>
              <p className="mb-1"><strong>Dirección:</strong> {pedido.direccion_entrega}</p>
              
              {/* ===== LÍNEA AÑADIDA AQUÍ ===== */}
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

        <div style={modalStyles.footer}>
          <h3 className="text-success">Total: ${parseFloat(pedido.total).toFixed(2)}</h3>
          <button type="button" className="btn btn-secondary mt-2" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetallesPedidoModal;