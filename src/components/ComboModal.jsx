import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext'; // Importado para el tema
import { 
    Edit, Tag, Image as ImageIcon, DollarSign, Plus, X, CheckCircle, EyeOff, Eye
} from 'lucide-react'; 

function ComboModal({ show, handleClose, handleSave, comboActual }) {
    // 1. Obtener tema y definir clases
    const { theme } = useTheme(); 
    const isDark = theme === 'dark';
    
    // Estilos basados en el tema (Alto contraste)
    const modalBg = isDark ? '#1a1a1a' : '#ffffff';
    const inputClass = `form-control ${isDark ? 'form-control-dark bg-dark text-white border-secondary' : 'form-control'}`;
    const sectionBg = isDark ? '#2a2a2a' : '#f8f9fa';

    // 2. Estado inicial con los interruptores correctos
    const [formData, setFormData] = useState({
        id: null,
        titulo: '', // Usado para el input (se mapea a 'nombre' o 'titulo' al guardar)
        descripcion: '',
        precio: '',
        imagenes: [''],
        descuento_porcentaje: 0,
        oferta_activa: false,  // Activa/desactiva el descuento
        activa: true,         // Visibilidad del combo (esta_activo)
    });

    // 3. Cargar datos y manejar overflow
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
            if (comboActual) {
                setFormData({
                    id: comboActual.id,
                    titulo: comboActual.titulo || comboActual.nombre || '', 
                    descripcion: comboActual.descripcion || '',
                    precio: comboActual.precio || '',
                    // Manejo de la URL de imagen
                    imagenes: (comboActual.imagenes && comboActual.imagenes.length > 0) ? comboActual.imagenes : (comboActual.imagen_url ? [comboActual.imagen_url] : ['']),
                    descuento_porcentaje: comboActual.descuento_porcentaje || 0,
                    // Mapeo de estados
                    oferta_activa: comboActual.oferta_activa !== undefined ? comboActual.oferta_activa : (comboActual.en_oferta || false),
                    activa: comboActual.activa !== undefined ? comboActual.activa : (comboActual.esta_activo !== undefined ? comboActual.esta_activo : true),
                });
            } else {
                setFormData({
                    titulo: '', descripcion: '', precio: '', imagenes: [''],
                    descuento_porcentaje: 0, oferta_activa: false, activa: true,
                });
            }
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [comboActual, show]);

    if (!show) return null;

    // 4. Manejadores de cambios
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' || type === 'switch' ? checked : value }));
    };
    
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
        
        if (!formData.titulo.trim() || !formData.precio) return toast.error('El título y el precio son obligatorios.');

        const datosParaEnviar = {
            id: formData.id,
            // Campos esperados por el API
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            precio: parseFloat(formData.precio),
            descuento_porcentaje: parseFloat(formData.descuento_porcentaje) || 0,
            en_oferta: formData.oferta_activa, // Mapea oferta_activa a en_oferta
            esta_activo: formData.activa,     // Mapea activa a esta_activo
            // Solo envía la primera imagen URL limpia
            imagen_url: (formData.imagenes.filter(url => url && url.trim() !== '')[0] || null),
        };
        
        handleSave(datosParaEnviar);
    };

    return (
        <div className="modal show fade" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content shadow-lg border-0" style={{ backgroundColor: modalBg, color: isDark ? '#fff' : '#000', borderRadius: '12px' }}> 
                    
                    {/* Header del Modal */}
                    <div className="modal-header border-0 pb-0 pt-4 px-4">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-3">
                            <Edit size={24} className="text-primary"/> {formData.id ? 'Editar Combo' : 'Añadir Nuevo Combo'}
                        </h5>
                        <button type="button" className={`btn-close ${isDark ? 'btn-close-white' : ''}`} onClick={handleClose}></button>
                    </div>
                    
                    <form onSubmit={onSave} className="d-flex flex-column flex-grow-1" style={{ minHeight: "0" }}>
                        
                        <div className="modal-body p-4">
                            
                            {/* --- SECCIÓN 1: DETALLES GENERALES --- */}
                            <div className="p-4 rounded-3 mb-4" style={{ backgroundColor: sectionBg }}>
                                <h6 className="mb-3 fw-bold text-primary border-bottom pb-2 d-flex align-items-center gap-2"><Tag size={18}/> DETALLES GENERALES</h6>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Título del Combo</label>
                                    <input type="text" className={inputClass} id="titulo" name="titulo" value={formData.titulo || ''} onChange={handleChange} required />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Descripción</label>
                                    <textarea className={inputClass} id="descripcion" name="descripcion" rows="3" value={formData.descripcion || ''} onChange={handleChange}></textarea>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Precio ($)</label>
                                        <input type="number" step="0.01" className={inputClass} id="precio" name="precio" value={formData.precio || ''} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 d-flex align-items-center justify-content-center">
                                        <div className="form-check form-switch fs-5 mt-3">
                                            {/* Interruptor para la VISIBILIDAD */}
                                            <input className="form-check-input" type="checkbox" role="switch" id="activa" name="activa" checked={formData.activa} onChange={handleChange} />
                                            <label className="form-check-label" htmlFor="activa">
                                                {formData.activa ? <Eye size={20} className="me-1"/> : <EyeOff size={20} className="me-1"/>}
                                                Combo Visible
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- SECCIÓN 2: MULTIMEDIA --- */}
                            <div className="p-4 rounded-3 mb-4" style={{ backgroundColor: sectionBg }}>
                                <h6 className="mb-3 fw-bold text-primary border-bottom pb-2 d-flex align-items-center gap-2"><ImageIcon size={18}/> IMÁGENES DEL COMBO</h6>
                                
                                {formData.imagenes.map((url, index) => (
                                    <div key={index} className="d-flex align-items-center mb-2">
                                        <input type="text" className={`${inputClass} me-2`} placeholder="https://ejemplo.com/imagen.jpg (Solo se usa la primera)" value={url || ''} onChange={(e) => handleImageChange(index, e.target.value)} />
                                        <button type="button" className="btn btn-outline-danger btn-sm p-2" onClick={() => handleRemoveImageField(index)} disabled={formData.imagenes.length <= 1}>
                                            <X size={16}/>
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline-info btn-sm mt-2 d-flex align-items-center gap-2" onClick={handleAddImageField}>
                                    <Plus size={16}/> Añadir URL de Imagen
                                </button>
                            </div>

                            {/* --- SECCIÓN 3: CONFIGURACIÓN DE OFERTA --- */}
                            <div className="p-4 rounded-3" style={{ backgroundColor: sectionBg }}>
                                <h6 className="mb-3 fw-bold text-warning border-bottom pb-2 d-flex align-items-center gap-2"><DollarSign size={18}/> CONFIGURACIÓN DE OFERTA</h6>
                                <div className="row g-3">
                                    <div className="col-md-7">
                                        <label className="form-label">Porcentaje de Descuento (%)</label>
                                        <input 
                                            type="number" 
                                            className={inputClass} 
                                            name="descuento_porcentaje" 
                                            value={formData.descuento_porcentaje || 0} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="col-md-5 d-flex align-items-end justify-content-center">
                                        <div className="form-check form-switch fs-5 mt-3">
                                            {/* Interruptor para el DESCUENTO */}
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch" 
                                                id="oferta_activa" 
                                                name="oferta_activa" 
                                                checked={formData.oferta_activa || false} 
                                                onChange={handleChange} 
                                            />
                                            <label className="form-check-label" htmlFor="oferta_activa">Activar Descuento</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> {/* Fin .modal-body */}
                        
                        <div className="modal-footer border-0 p-4 justify-content-center">
                            <button type="button" className="btn btn-secondary px-4 rounded-pill fw-bold" onClick={handleClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold d-flex align-items-center gap-2">
                                <CheckCircle size={18}/> Guardar Combo
                            </button>
                        </div>

                    </form> {/* Fin <form> principal */}

                </div>
            </div>
        </div>
    );
}

export default ComboModal;