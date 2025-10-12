import React, { useState, useEffect } from 'react';

function PromoModal({ show, handleClose, handleSave, promoActual }) {
  const [promo, setPromo] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    imagen_url: '',
    imagen_url_2: '', // <-- CAMPO PARA SEGUNDA IMAGEN
    activa: true      // <-- CAMPO PARA ACTIVAR/DESACTIVAR
  });

  useEffect(() => {
    if (promoActual) {
      // Si editamos, llenamos el formulario con los datos existentes
      setPromo({
        ...promoActual,
        imagen_url: promoActual.imagen_url || '',
        imagen_url_2: promoActual.imagen_url_2 || '' // Aseguramos que no sea nulo
      });
    } else {
      // Si es nueva, reseteamos el formulario
      setPromo({
        titulo: '',
        descripcion: '',
        precio: '',
        imagen_url: '',
        imagen_url_2: '',
        activa: true
      });
    }
  }, [promoActual]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPromo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSave = (e) => {
    e.preventDefault();
    handleSave(promo);
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={onSave}>
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
                <textarea className="form-control" id="descripcion" name="descripcion" rows="3" value={promo.descripcion || ''} onChange={handleChange}></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="precio" className="form-label">Precio</label>
                <input type="number" step="0.01" className="form-control" id="precio" name="precio" value={promo.precio} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="imagen_url" className="form-label">URL de la Imagen Principal</label>
                <input type="text" className="form-control" id="imagen_url" name="imagen_url" value={promo.imagen_url} placeholder="https://ejemplo.com/imagen1.jpg" onChange={handleChange} />
              </div>
              
              {/* --- CAMPO PARA SEGUNDA IMAGEN AÑADIDO --- */}
              <div className="mb-3">
                <label htmlFor="imagen_url_2" className="form-label">URL de la Imagen Secundaria (Opcional)</label>
                <input type="text" className="form-control" id="imagen_url_2" name="imagen_url_2" value={promo.imagen_url_2} placeholder="https://ejemplo.com/imagen2.jpg" onChange={handleChange} />
              </div>
              
              {/* --- INTERRUPTOR PARA ACTIVAR/INACTIVAR AÑADIDO --- */}
              <div className="form-check form-switch mb-3">
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