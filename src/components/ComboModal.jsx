import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { 
    Edit, Tag, Image as ImageIcon, DollarSign, Plus, X, 
    CheckCircle, Eye, EyeOff, Package, Layers, Trash2
} from 'lucide-react'; 

function ComboModal({ show, handleClose, handleSave, comboActual }) {
    const { theme } = useTheme(); 
    const isDark = theme === 'dark';

    // --- VARIABLES DE TEMA (Mismo estilo que ProductModal) ---
    const modalBg = isDark ? '#212529' : '#ffffff'; // Gris elegante
    const textColor = isDark ? '#f8f9fa' : '#212529';
    const subTextColor = isDark ? 'text-white-50' : 'text-muted';
    const borderColor = isDark ? 'border-secondary border-opacity-25' : 'border-gray-200';
    
    // Inputs y Paneles
    const inputBaseClass = `form-control ${isDark ? 'bg-dark text-white border-secondary' : 'bg-light text-dark border-gray-300'} focus-ring focus-ring-primary`;
    const labelClass = `form-label ${subTextColor} small fw-bold text-uppercase ls-1`;
    const sidePanelBg = isDark ? 'bg-black bg-opacity-25' : 'bg-gray-50';

    // --- ESTADOS ---
    const [formData, setFormData] = useState({
        id: null,
        titulo: '',
        descripcion: '',
        precio: '',
        imagenes: [''],
        descuento_porcentaje: 0,
        oferta_activa: false,
        activa: true,
    });
    const [previewImage, setPreviewImage] = useState('');

    // --- CARGAR DATOS ---
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
            if (comboActual) {
                const imgs = (comboActual.imagenes && comboActual.imagenes.length > 0) 
                    ? comboActual.imagenes 
                    : (comboActual.imagen_url ? [comboActual.imagen_url] : ['']);

                setFormData({
                    id: comboActual.id,
                    titulo: comboActual.titulo || comboActual.nombre || '', 
                    descripcion: comboActual.descripcion || '',
                    precio: comboActual.precio || '',
                    imagenes: imgs,
                    descuento_porcentaje: comboActual.descuento_porcentaje || 0,
                    oferta_activa: comboActual.oferta_activa !== undefined ? comboActual.oferta_activa : (comboActual.en_oferta || false),
                    activa: comboActual.activa !== undefined ? comboActual.activa : (comboActual.esta_activo !== undefined ? comboActual.esta_activo : true),
                });
                setPreviewImage(imgs[0] || '');
            } else {
                setFormData({
                    titulo: '', descripcion: '', precio: '', imagenes: [''],
                    descuento_porcentaje: 0, oferta_activa: false, activa: true,
                });
                setPreviewImage('');
            }
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [comboActual, show]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' || type === 'switch' ? checked : value }));
        if (name === 'imagenes') setPreviewImage(value); // Fallback simple
    };
    
    const handleImageChange = (index, value) => {
        const newImages = [...formData.imagenes];
        newImages[index] = value;
        setFormData({ ...formData, imagenes: newImages });
        if (index === 0) setPreviewImage(value);
    };

    const handleAddImageField = () => setFormData({ ...formData, imagenes: [...formData.imagenes, ''] });

    const handleRemoveImageField = (index) => {
        if (formData.imagenes.length <= 1) return;
        const newImages = formData.imagenes.filter((_, i) => i !== index);
        setFormData({ ...formData, imagenes: newImages });
        if (index === 0) setPreviewImage(newImages[0] || '');
    };

    const onSave = (e) => {
        e.preventDefault();
        if (!formData.titulo.trim() || !formData.precio) return toast.error('El título y el precio son obligatorios.');

        const datosParaEnviar = {
            id: formData.id,
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            precio: parseFloat(formData.precio),
            descuento_porcentaje: parseFloat(formData.descuento_porcentaje) || 0,
            
            // --- CORRECCIÓN PARA EL BACKEND ---
            // Enviamos los nombres EXACTOS que tu servidor espera recibir
            oferta_activa: formData.oferta_activa, 
            activa: formData.activa,
            
            // Enviamos también los nombres viejos por seguridad
            en_oferta: formData.oferta_activa,
            esta_activo: formData.activa,

            imagen_url: (formData.imagenes.filter(url => url && url.trim() !== '')[0] || null),
            imagenes: formData.imagenes.filter(url => url && url.trim() !== '')
        };
        handleSave(datosParaEnviar);
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1055 }}>
                
                {/* Estilos para Scrollbar Personalizado (Igual que ProductModal) */}
                <style>
                  {`
                    .custom-scroll::-webkit-scrollbar { width: 8px; }
                    .custom-scroll::-webkit-scrollbar-track { background: ${isDark ? '#212529' : '#f8f9fa'}; }
                    .custom-scroll::-webkit-scrollbar-thumb {
                      background-color: ${isDark ? '#495057' : '#dee2e6'}; 
                      border-radius: 4px;
                    }
                    .custom-scroll::-webkit-scrollbar-thumb:hover {
                      background-color: ${isDark ? '#6c757d' : '#ced4da'}; 
                    }
                  `}
                </style>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
                >
                    <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ backgroundColor: modalBg, color: textColor, borderRadius: '20px' }}> 
                        
                        {/* Header */}
                        <div className={`modal-header border-bottom ${borderColor} px-4 py-3 position-relative`} style={{ backgroundColor: modalBg }}>
                            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                <Edit size={20} className="text-primary"/> {formData.id ? 'Editar Combo' : 'Crear Nuevo Combo'}
                            </h5>
                            
                            {/* Botón Cerrar Correcto */}
                            <button 
                                onClick={handleClose} 
                                className={`btn btn-link position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle p-2 ${isDark ? 'text-white-50 hover-text-white' : 'text-muted hover-text-dark'}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="modal-body p-0">
                            <form onSubmit={onSave} className="d-flex flex-column h-100">
                                <div className="container-fluid p-0">
                                    <div className="row g-0">
                                        
                                        {/* COLUMNA IZQUIERDA: Imagen y Toggles */}
                                        <div className={`col-lg-4 border-end ${borderColor} ${sidePanelBg} p-4`}>
                                            
                                            {/* Preview Imagen */}
                                            <div className={`ratio ratio-1x1 rounded-4 border ${borderColor} mb-4 overflow-hidden d-flex align-items-center justify-content-center ${isDark ? 'bg-dark' : 'bg-white'}`}>
                                                {previewImage ? (
                                                    <img src={previewImage} alt="Preview" className="w-100 h-100 object-fit-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Error'} />
                                                ) : (
                                                    <div className={`text-center ${subTextColor}`}>
                                                        <ImageIcon size={48} className="opacity-50 mb-2"/>
                                                        <small>Vista previa</small>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Switch: Visibilidad */}
                                            <div className={`p-3 rounded-4 border mb-3 ${formData.activa ? `${borderColor} ${isDark ? 'bg-dark' : 'bg-white'}` : 'border-danger bg-danger bg-opacity-10'}`}>
                                                <div className="form-check form-switch m-0 d-flex align-items-center justify-content-between">
                                                    <label className={`form-check-label fw-bold ${textColor} d-flex align-items-center gap-2`} htmlFor="activa">
                                                        {formData.activa ? <Eye size={18} className="text-success"/> : <EyeOff size={18} className="text-danger"/>}
                                                        Combo Visible
                                                    </label>
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        role="switch" 
                                                        id="activa" 
                                                        name="activa" 
                                                        checked={formData.activa} 
                                                        onChange={handleChange} 
                                                        style={{cursor: 'pointer'}}
                                                    />
                                                </div>
                                            </div>

                                            {/* Switch: Oferta */}
                                            <div className={`p-3 rounded-4 border mb-3 ${formData.oferta_activa ? 'border-warning bg-warning bg-opacity-10' : `${borderColor} ${isDark ? 'bg-dark' : 'bg-white'}`}`}>
                                                <div className="form-check form-switch mb-2">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="oferta_activa" 
                                                        name="oferta_activa" 
                                                        checked={formData.oferta_activa} 
                                                        onChange={handleChange} 
                                                        style={{cursor: 'pointer'}}
                                                    />
                                                    <label className={`form-check-label fw-bold ${textColor}`} htmlFor="oferta_activa">Activar Oferta</label>
                                                </div>
                                                {formData.oferta_activa && (
                                                    <div className="input-group input-group-sm">
                                                        <span className={`input-group-text ${isDark ? 'bg-dark border-secondary text-warning' : 'bg-light border-gray-300 text-warning'}`}>% Desc.</span>
                                                        <input type="number" className={inputBaseClass} name="descuento_porcentaje" value={formData.descuento_porcentaje} onChange={handleChange} />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Precio Resumen */}
                                            <div className={`p-2 rounded-3 border ${borderColor} text-center ${isDark ? 'bg-dark' : 'bg-white'}`}>
                                                <small className={`${subTextColor} d-block`}>Precio Final</small>
                                                <span className={`fw-bold fs-5 ${textColor}`}>${formData.precio || '0.00'}</span>
                                            </div>

                                        </div>

                                        {/* COLUMNA DERECHA: Formulario */}
                                        <div className="col-lg-8 p-4 custom-scroll" style={{maxHeight: '80vh', overflowY: 'auto'}}>
                                            
                                            <h6 className="text-primary text-uppercase fw-bold mb-3 small ls-1"><Tag size={14} className="me-1"/> Información General</h6>
                                            
                                            <div className="mb-3">
                                                <label className={labelClass}>Título del Combo</label>
                                                <div className="input-group">
                                                    <span className={`input-group-text ${isDark ? 'bg-dark border-secondary text-secondary' : 'bg-light border-gray-300 text-muted'}`}><Layers size={16}/></span>
                                                    <input type="text" className={inputBaseClass} name="titulo" value={formData.titulo} onChange={handleChange} required placeholder="Ej. Paquete Amigos" />
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className={labelClass}>Descripción</label>
                                                <textarea className={inputBaseClass} name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange} placeholder="Qué incluye este combo..."></textarea>
                                            </div>

                                            <div className="mb-4">
                                                <label className={labelClass}>Precio ($)</label>
                                                <div className="input-group">
                                                    <span className={`input-group-text ${isDark ? 'bg-dark border-secondary text-success' : 'bg-light border-gray-300 text-success'}`}><DollarSign size={16}/></span>
                                                    <input type="number" step="0.01" className={inputBaseClass} name="precio" value={formData.precio} onChange={handleChange} required />
                                                </div>
                                            </div>

                                            <h6 className={`text-primary text-uppercase fw-bold mb-3 small ls-1 border-top ${borderColor} pt-3`}>
                                                <ImageIcon size={14} className="me-1"/> Imágenes del Combo
                                            </h6>

                                            <div className="mb-3">
                                                {formData.imagenes.map((url, index) => (
                                                    <div key={index} className="d-flex gap-2 mb-2">
                                                        <input 
                                                            type="text" 
                                                            className={`${inputBaseClass} form-control-sm`} 
                                                            placeholder="URL de la imagen..." 
                                                            value={url} 
                                                            onChange={(e) => handleImageChange(index, e.target.value)} 
                                                        />
                                                        {formData.imagenes.length > 1 && (
                                                            <button type="button" onClick={() => handleRemoveImageField(index)} className="btn btn-sm btn-outline-danger">
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button type="button" onClick={handleAddImageField} className="btn btn-sm btn-link text-decoration-none text-info p-0">
                                                    <Plus size={14}/> Agregar otra imagen
                                                </button>
                                            </div>
                                            
                                            {/* Espaciador final */}
                                            <div style={{height: '40px'}}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`modal-footer border-top ${borderColor} py-3`} style={{ backgroundColor: modalBg }}>
                                    <button type="button" className={`btn btn-link ${textColor} text-decoration-none me-auto`} onClick={handleClose}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold rounded-pill d-flex align-items-center gap-2 shadow-lg">
                                        <CheckCircle size={18}/> Guardar Combo
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default ComboModal;