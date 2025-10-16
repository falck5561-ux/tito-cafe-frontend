import React, { useState, useEffect } from 'react';

function ComboModal({ show, handleClose, handleSave, comboActual }) {
  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    imagenes: [''],
    descuento_porcentaje: 0,
    activa: true, // Por defecto, un combo nuevo es visible para clientes
  });

  useEffect(() => {
    if (show) {
      if (comboActual) {
        // Si estamos editando, llenamos el formulario con los datos existentes
        setFormData({
          id: comboActual.id,
          // CORRECCIÓN: Usamos 'titulo' y 'descripcion'
          titulo: comboActual.titulo || '',
          descripcion: comboActual.descripcion || '',
          precio: comboActual.precio || '',
          // Se asegura de que siempre haya al menos un campo de imagen
          imagenes: (comboActual.imagenes && comboActual.imagenes.length > 0) ? comboActual.imagenes : [''],
          descuento_porcentaje: comboActual.descuento_porcentaje || 0,
          activa: comboActual.activa !== undefined ? comboActual.activa : true,
        });
      } else {
        // Si es un combo nuevo, reseteamos el formulario
        setFormData({
          titulo: '',
          descripcion: '',
          precio: '',
          imagenes: [''],
          descuento_porcentaje: 0,
          activa: true,
        });
      }
    }
  }, [comboActual, show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'switch' ? checked : value,
    }));
  };
  
  // Funciones para manejar múltiples imágenes
  const handleImageChange = (index, value) => {
    const newImages = [...formData.imagenes];
    newImages[index] = value;
    setFormData({ ...formData, imagenes: newImages });
  };

  const handleAddImageField = () => {
    setFormData({ ...formData, imagenes: [...formData.imagenes, ''] });
  };

  const handleRemoveImageField = (index) => {
    if (formData.imagenes.length <= 1) return;
    const newImages = formData.imagenes.filter((_, i) => i !== index);
    setFormData({ ...formData, imagenes: newImages });
  };

  const onSave = (e) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      imagenes: formData.imagenes.filter(url => url && url.trim() !== ''),
    };
    handleSave(cleanedData);
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={onSave}>
            <div className="modal-header">
              <h5 className="modal-title">{formData.id ? 'Editar Combo' : 'Añadir Nuevo Combo'}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                {/* CORRECCIÓN: El 'name' del input ahora es 'titulo' */}
                <label htmlFor="titulo" className="form-label">Título del Combo</label>
                <input type="text" className="form-control" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea className="form-control" id="descripcion" name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="precio" className="form-label">Precio</label>
                <input type="number" step="0.01" className="form-control" id="precio" name="precio" value={formData.precio} onChange={handleChange} required />
              </div>

              {/* Sección de Imágenes (ya estaba bien) */}
              <div className="p-3 mb-3 border rounded">
                <h6 className="mb-3">Imágenes del Combo</h6>
                {formData.imagenes.map((url, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <input type="text" className="form-control me-2" placeholder="https://ejemplo.com/imagen.jpg" value={url} onChange={(e) => handleImageChange(index, e.target.value)} />
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveImageField(index)} disabled={formData.imagenes.length <= 1}>&times;</button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={handleAddImageField}>Añadir URL de Imagen</button>
              </div>

              {/* Oferta y Visibilidad */}
              <div className="p-3 border rounded">
                  <h6 className="mb-3">Configuración de Oferta</h6>
                  <div className="mb-3">
                    <label htmlFor="descuento_porcentaje" className="form-label">Porcentaje de Descuento (%)</label>
                    <input type="number" className="form-control" id="descuento_porcentaje" name="descuento_porcentaje" value={formData.descuento_porcentaje} onChange={handleChange} />
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="activa" name="activa" checked={formData.activa} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="activa">Combo Activo (Visible para clientes)</label>
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

export default ComboModal;
