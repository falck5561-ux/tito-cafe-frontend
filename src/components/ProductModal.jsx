import React, { useState, useEffect } from 'react';

function ProductModal({ show, handleClose, handleSave, productoActual }) {
  // Estado inicial que incluye los nuevos campos
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '', // <-- NUEVO
    precio: '',
    stock: '',
    categoria: '',
    imagen_url: '',
    descuento_porcentaje: 0, // <-- NUEVO
    en_oferta: false, // <-- NUEVO
  });

  useEffect(() => {
    if (productoActual) {
      // Si estamos editando, llenamos el formulario con los datos del producto
      setFormData({
        id: productoActual.id,
        nombre: productoActual.nombre || '',
        descripcion: productoActual.descripcion || '', // <-- NUEVO
        precio: productoActual.precio || '',
        stock: productoActual.stock || 0,
        categoria: productoActual.categoria || '',
        imagen_url: productoActual.imagen_url || '',
        descuento_porcentaje: productoActual.descuento_porcentaje || 0, // <-- NUEVO
        en_oferta: productoActual.en_oferta || false, // <-- NUEVO
      });
    } else {
      // Si estamos añadiendo uno nuevo, reseteamos el formulario
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        imagen_url: '',
        descuento_porcentaje: 0,
        en_oferta: false,
      });
    }
  }, [productoActual, show]); // Se ejecuta cuando el producto a editar cambia o el modal se abre

  if (!show) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const onSave = (e) => {
    e.preventDefault();
    handleSave(formData);
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={onSave}>
            <div className="modal-header">
              <h5 className="modal-title">{formData.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              {/* --- CAMPOS EXISTENTES --- */}
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre del Producto</label>
                <input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              
              {/* --- CAMPO NUEVO: DESCRIPCIÓN --- */}
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción (Opcional)</label>
                <textarea className="form-control" id="descripcion" name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="precio" className="form-label">Precio</label>
                  <input type="number" step="0.01" className="form-control" id="precio" name="precio" value={formData.precio} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="stock" className="form-label">Stock</label>
                  <input type="number" className="form-control" id="stock" name="stock" value={formData.stock} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="categoria" className="form-label">Categoría</label>
                <input type="text" className="form-control" id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} />
              </div>

              {/* --- CAMPOS NUEVOS PARA OFERTAS --- */}
              <div className="p-3 mb-3 border rounded">
                <h6 className="mb-3">Configuración de Oferta</h6>
                <div className="mb-3">
                  <label htmlFor="descuento_porcentaje" className="form-label">Porcentaje de Descuento (%)</label>
                  <input type="number" className="form-control" id="descuento_porcentaje" name="descuento_porcentaje" value={formData.descuento_porcentaje} onChange={handleChange} />
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="en_oferta" name="en_oferta" checked={formData.en_oferta} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="en_oferta">Activar oferta para este producto</label>
                </div>
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
