import React, { useState, useEffect } from 'react';

function PromoModal({ show, handleClose, handleSave, promoActual }) {
  const [promo, setPromo] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    imagen_url: '',
    activa: true,
  });

  // This effect runs when the modal is opened
  useEffect(() => {
    if (promoActual) {
      // If we are editing, fill the form with the existing promotion's data
      setPromo(promoActual);
    } else {
      // If we are creating, reset the form to its default empty state
      setPromo({
        titulo: '',
        descripcion: '',
        precio: '',
        imagen_url: '',
        activa: true,
      });
    }
  }, [promoActual, show]);

  // This function updates the state when the user types in an input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPromo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // This function is called when the form is submitted
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(promo);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{promo.id ? 'Editar Promoción' : 'Añadir Nueva Promoción'}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="titulo" className="form-label">Título</label>
                <input type="text" className="form-control" id="titulo" name="titulo" value={promo.titulo} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea className="form-control" id="descripcion" name="descripcion" value={promo.descripcion} onChange={handleChange}></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="precio" className="form-label">Precio</label>
                <input type="number" step="0.01" className="form-control" id="precio" name="precio" value={promo.precio} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="imagen_url" className="form-label">URL de la Imagen</label>
                <input type="text" className="form-control" id="imagen_url" name="imagen_url" value={promo.imagen_url} onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" />
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="activa" name="activa" checked={promo.activa} onChange={handleChange} />
                <label className="form-check-label" htmlFor="activa">Promoción Activa</label>
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

export default PromoModal;
