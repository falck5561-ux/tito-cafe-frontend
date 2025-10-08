// Archivo: src/components/ProductModal.jsx (Corregido)
import React, { useState, useEffect } from 'react';

function ProductModal({ show, handleClose, handleSave, productoActual }) {
  const initialState = { nombre: '', precio: '', stock: '', categoria: '', imagen_url: '' };
  const [producto, setProducto] = useState(initialState);

  useEffect(() => {
    if (productoActual) {
      setProducto({ ...initialState, ...productoActual });
    } else {
      setProducto(initialState);
    }
  }, [productoActual]);
  
  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(producto);
  };

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{producto.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input type="text" className="form-control" name="nombre" value={producto.nombre} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="precio" className="form-label">Precio</label>
                <input type="number" step="0.01" className="form-control" name="precio" value={producto.precio} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="stock" className="form-label">Stock</label>
                <input type="number" className="form-control" name="stock" value={producto.stock} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="categoria" className="form-label">Categoría</label>
                <input type="text" className="form-control" name="categoria" value={producto.categoria} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="imagen_url" className="form-label">URL de la Imagen</label>
                <input type="text" className="form-control" id="imagen_url" name="imagen_url" value={producto.imagen_url || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---- ¡ESTA ES LA LÍNEA QUE FALTABA! ----
export default ProductModal;