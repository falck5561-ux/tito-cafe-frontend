import React, { useState, useEffect } from 'react';

function ComboModal({ show, handleClose, handleSave, comboActual }) {
  const [combo, setCombo] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    imagen_url: '',
    imagen_url_2: '',
    activa: true
  });

  useEffect(() => {
    if (comboActual) {
      setCombo({
        ...comboActual,
        imagen_url: comboActual.imagen_url || '',
        imagen_url_2: comboActual.imagen_url_2 || ''
      });
    } else {
      setCombo({
        titulo: '',
        descripcion: '',
        precio: '',
        imagen_url: '',
        imagen_url_2: '',
        activa: true
      });
    }
  }, [comboActual]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCombo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSave = (e) => {
    e.preventDefault();
    handleSave(combo);
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={onSave}>
            <div className="modal-header">
              <h5 className="modal-title">{combo.id ? 'Editar Combo' : 'Añadir Nuevo Combo'}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="titulo" className="form-label">Título del Combo</label>
                <input type="text" className="form-control" name="titulo" value={combo.titulo} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea className="form-control" name="descripcion" rows="3" value={combo.descripcion || ''} onChange={handleChange}></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="precio" className="form-label">Precio</label>
                <input type="number" step="0.01" className="form-control" name="precio" value={combo.precio} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="imagen_url" className="form-label">URL de la Imagen Principal</label>
                <input type="text" className="form-control" name="imagen_url" value={combo.imagen_url} placeholder="https://ejemplo.com/imagen1.jpg" onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="imagen_url_2" className="form-label">URL de la Imagen Secundaria (Opcional)</label>
                <input type="text" className="form-control" name="imagen_url_2" value={combo.imagen_url_2} placeholder="https://ejemplo.com/imagen2.jpg" onChange={handleChange} />
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" role="switch" name="activa" checked={combo.activa} onChange={handleChange} />
                <label className="form-check-label" htmlFor="activa">Combo Activo</label>
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

export default ComboModal;

