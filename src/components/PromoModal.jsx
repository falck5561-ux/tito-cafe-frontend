import React, { useState, useEffect } from 'react';

function ProductModal({ show, handleClose, handleSave, productoActual }) {
  const [producto, setProducto] = useState({
    nombre: '',
    precio: '',
    stock: '',
    categoria: '',
    imagen_url: '',
    descripcion: '', // <-- CAMPO AÑADIDO
  });

  useEffect(() => {
    if (productoActual) {
      setProducto({
        nombre: productoActual.nombre || '',
        precio: productoActual.precio || '',
        stock: productoActual.stock || '',
        categoria: productoActual.categoria || '',
        imagen_url: productoActual.imagen_url || '',
        descripcion: productoActual.descripcion || '', // <-- CAMPO AÑADIDO
        id: productoActual.id,
      });
    } else {
      setProducto({
        nombre: '',
        precio: '',
        stock: '',
        categoria: '',
        imagen_url: '',
        descripcion: '', // <-- CAMPO AÑADIDO
      });
    }
  }, [productoActual, show]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(producto);
  };

  if (!show) return null;

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                <input type="text" className="form-control" id="nombre" name="nombre" value={producto.nombre} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                {/* --- CAMPO DE TEXTAREA AÑADIDO --- */}
                <textarea className="form-control" id="descripcion" name="descripcion" value={producto.descripcion} onChange={handleChange} rows="3" placeholder="Ej: Delicioso pastel de chocolate con betún cremoso..."></textarea>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="precio" className="form-label">Precio</label>
                  <input type="number" step="0.01" className="form-control" id="precio" name="precio" value={producto.precio} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="stock" className="form-label">Stock</label>
                  <input type="number" className="form-control" id="stock" name="stock" value={producto.stock} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="categoria" className="form-label">Categoría</label>
                <input type="text" className="form-control" id="categoria" name="categoria" value={producto.categoria} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="imagen_url" className="form-label">URL de la Imagen</label>
                <input type="text" className="form-control" id="imagen_url" name="imagen_url" value={producto.imagen_url} onChange={handleChange} />
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

export default ProductModal;
