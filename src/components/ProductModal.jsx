import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Image as ImageIcon, DollarSign, Package, Tag, 
  Type, Layers, Plus, Trash2 
} from 'lucide-react';
import apiClient from '../services/api';
import toast from 'react-hot-toast';

// --- SUB-COMPONENTE: Tarjeta de Grupo de Opciones ---
function GrupoOpcionesCard({ grupo, onOptionAdded, onOptionDeleted, onGroupDeleted }) {
  const [nombreOpcion, setNombreOpcion] = useState('');
  const [precioOpcion, setPrecioOpcion] = useState('');

  const handleAddOption = async () => {
    if (!nombreOpcion.trim()) return toast.error('Nombre requerido');
    try {
      const optionData = { nombre: nombreOpcion, precio_adicional: parseFloat(precioOpcion) || 0 };
      const res = await apiClient.post(`/productos/grupos/${grupo.id}/opciones`, optionData);
      onOptionAdded(grupo.id, res.data);
      setNombreOpcion('');
      setPrecioOpcion('');
      toast.success('Opción agregada');
    } catch (error) {
      toast.error('Error al agregar opción');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(`¿Eliminar grupo "${grupo.nombre}"?`)) return;
    try {
      await apiClient.delete(`/productos/grupos/${grupo.id}`);
      onGroupDeleted(grupo.id);
      toast.success('Grupo eliminado');
    } catch (error) {
      toast.error('Error al eliminar grupo');
    }
  };

  const handleDeleteOption = async (opcionId) => {
    if (!window.confirm('¿Eliminar opción?')) return;
    try {
      await apiClient.delete(`/productos/opciones/${opcionId}`);
      onOptionDeleted(grupo.id, opcionId);
      toast.success('Opción eliminada');
    } catch (error) {
      toast.error('Error eliminar opción');
    }
  };

  return (
    <div className="rounded-3 border border-secondary border-opacity-25 bg-black bg-opacity-25 mb-3 overflow-hidden">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary border-opacity-25 bg-white bg-opacity-5">
        <div>
          <h6 className="m-0 fw-bold text-white d-flex align-items-center gap-2">
            <Layers size={16} className="text-info"/> {grupo.nombre}
          </h6>
          <small className="text-white-50" style={{fontSize: '0.75rem'}}>
            Selección: <span className="text-uppercase text-warning">{grupo.tipo_seleccion}</span>
          </small>
        </div>
        <button type="button" onClick={handleDeleteGroup} className="btn btn-sm btn-icon text-danger hover-bg-danger-subtle rounded-circle p-2">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-3">
        <div className="d-flex flex-wrap gap-2 mb-3">
          {grupo.opciones && grupo.opciones.length > 0 ? (
            grupo.opciones.map(op => (
              <div key={op.id} className="d-flex align-items-center gap-2 bg-dark border border-secondary border-opacity-50 rounded-pill px-3 py-1">
                <span className="small text-white">{op.nombre}</span>
                <span className="small text-success fw-bold">+${Number(op.precio_adicional).toFixed(2)}</span>
                <button 
                  type="button" 
                  onClick={() => handleDeleteOption(op.id)} 
                  className="btn btn-link p-0 text-secondary hover-text-danger d-flex"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <span className="text-muted small fst-italic">Sin opciones aún.</span>
          )}
        </div>

        <div className="input-group input-group-sm">
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Nombre (ej. Queso)"
            value={nombreOpcion}
            onChange={(e) => setNombreOpcion(e.target.value)}
          />
          <input
            type="number"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Precio ($)"
            style={{maxWidth: '80px'}}
            value={precioOpcion}
            onChange={(e) => setPrecioOpcion(e.target.value)}
          />
          <button type="button" onClick={handleAddOption} className="btn btn-primary d-flex align-items-center">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function ProductModal({ show, handleClose, handleSave, productoActual }) {
  const initialState = {
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagenes: [''],
    en_oferta: false,
    descuento_porcentaje: 0
  };

  const [formData, setFormData] = useState(initialState);
  const [previewImage, setPreviewImage] = useState('');
  
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [gestionarOpciones, setGestionarOpciones] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [tipoSeleccion, setTipoSeleccion] = useState('unico');

  useEffect(() => {
    if (show) {
      if (productoActual) {
        setFormData({
          id: productoActual.id,
          nombre: productoActual.nombre || '',
          descripcion: productoActual.descripcion || '',
          precio: productoActual.precio || '',
          stock: productoActual.stock || '',
          categoria: productoActual.categoria || '',
          imagenes: Array.isArray(productoActual.imagenes) && productoActual.imagenes.length > 0 
            ? productoActual.imagenes 
            : [productoActual.imagen_url || ''],
          en_oferta: productoActual.en_oferta || false,
          descuento_porcentaje: productoActual.descuento_porcentaje || 0
        });
        
        const img = Array.isArray(productoActual.imagenes) ? productoActual.imagenes[0] : productoActual.imagen_url;
        setPreviewImage(img || '');

        if (productoActual.grupos_opciones?.length > 0) {
          setGrupos(productoActual.grupos_opciones);
          setGestionarOpciones(true);
        } else {
          setGrupos([]);
          setGestionarOpciones(false);
        }
      } else {
        setFormData(initialState);
        setPreviewImage('');
        setGrupos([]);
        setGestionarOpciones(false);
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [productoActual, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'imagen_url_0') setPreviewImage(value);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      imagenes: formData.imagenes.filter(url => url && url.trim() !== '')
    };
    handleSave(cleanData);
  };

  const handleAddGroup = async () => {
    if (!formData.id) return toast.error('Guarda el producto antes de añadir grupos.');
    if (!nombreGrupo.trim()) return toast.error('Nombre de grupo requerido');
    
    try {
      const res = await apiClient.post(`/productos/${formData.id}/grupos`, { nombre: nombreGrupo, tipo_seleccion: tipoSeleccion });
      res.data.opciones = [];
      setGrupos([...grupos, res.data]);
      setNombreGrupo('');
      toast.success('Grupo creado');
    } catch (e) { toast.error('Error al crear grupo'); }
  };

  const handleOptionAdded = (gid, op) => setGrupos(gs => gs.map(g => g.id === gid ? { ...g, opciones: [...g.opciones, op] } : g));
  const handleOptionDeleted = (gid, oid) => setGrupos(gs => gs.map(g => g.id === gid ? { ...g, opciones: g.opciones.filter(o => o.id !== oid) } : g));
  const handleGroupDeleted = (gid) => setGrupos(gs => gs.filter(g => g.id !== gid));

  const inputBaseClass = "form-control bg-dark text-white border-secondary focus-ring focus-ring-primary";
  const labelClass = "form-label text-secondary small fw-bold text-uppercase ls-1";

  // --- ESTILOS DE SCROLLBAR ---
  const scrollbarStyles = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#444 #18181b'
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1055 }}>
        
        {/* Estilos inline para Webkit Scrollbar (Chrome/Edge) */}
        <style>
          {`
            .custom-scroll::-webkit-scrollbar { width: 8px; }
            .custom-scroll::-webkit-scrollbar-track { background: #18181b; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
            .custom-scroll::-webkit-scrollbar-thumb:hover { background: #555; }
          `}
        </style>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
        >
          <div className="modal-content border-0 shadow-2xl overflow-hidden" style={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '24px' }}>
            
            {/* Header: CORREGIDO - Eliminamos bg-white */}
            <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3" style={{backgroundColor: 'rgba(255,255,255,0.02)'}}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                {formData.id ? <EditIcon /> : <PlusIcon />} 
                {formData.id ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h5>
              <button onClick={handleClose} className="btn btn-icon btn-dark rounded-circle p-2 text-white-50 hover-text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-0">
              <form onSubmit={handleSubmit} className="d-flex flex-column h-100">
                <div className="container-fluid p-0">
                  <div className="row g-0">
                    
                    {/* COLUMNA IZQUIERDA */}
                    <div className="col-lg-4 bg-black bg-opacity-25 border-end border-secondary border-opacity-25 p-4">
                      <div className="ratio ratio-1x1 bg-dark rounded-4 border border-secondary border-dashed mb-4 position-relative overflow-hidden group-hover">
                        {previewImage ? (
                          <img src={previewImage} alt="Preview" className="w-100 h-100 object-fit-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Error+Imagen'} />
                        ) : (
                          <div className="d-flex flex-column align-items-center justify-content-center text-muted">
                            <ImageIcon size={48} className="opacity-50 mb-2"/>
                            <small>Vista previa</small>
                          </div>
                        )}
                      </div>

                      <div className={`p-3 rounded-4 border mb-3 transition-all ${formData.en_oferta ? 'border-warning bg-warning bg-opacity-10' : 'border-secondary border-opacity-25 bg-dark'}`}>
                         <div className="form-check form-switch mb-2">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              name="en_oferta" 
                              checked={formData.en_oferta} 
                              onChange={handleChange} 
                              style={{cursor: 'pointer'}}
                            />
                            <label className="form-check-label fw-bold text-white">Activar Oferta</label>
                         </div>
                         {formData.en_oferta && (
                           <div className="input-group input-group-sm">
                             <span className="input-group-text bg-dark text-warning border-secondary">% Desc.</span>
                             <input type="number" className={inputBaseClass} name="descuento_porcentaje" value={formData.descuento_porcentaje} onChange={handleChange} />
                           </div>
                         )}
                      </div>

                      <div className="row g-2">
                        <div className="col-6">
                           <div className="p-2 bg-dark rounded-3 border border-secondary border-opacity-25 text-center">
                              <small className="text-secondary d-block">Stock</small>
                              <span className={`fw-bold ${formData.stock < 5 ? 'text-danger' : 'text-success'}`}>{formData.stock || 0}</span>
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="p-2 bg-dark rounded-3 border border-secondary border-opacity-25 text-center">
                              <small className="text-secondary d-block">Precio</small>
                              <span className="fw-bold text-white">${formData.precio || 0}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: Con SCROLL OSCURO */}
                    <div className="col-lg-8 p-4 custom-scroll" style={{maxHeight: '80vh', overflowY: 'auto', ...scrollbarStyles}}>
                      
                      <h6 className="text-primary text-uppercase fw-bold mb-3 small ls-1"><Package size={14} className="me-1"/> Información Básica</h6>
                      
                      <div className="row g-3 mb-4">
                        <div className="col-md-8">
                          <label className={labelClass}>Nombre del Producto</label>
                          <div className="input-group">
                            <span className="input-group-text bg-dark border-secondary text-secondary"><Type size={16}/></span>
                            <input type="text" className={inputBaseClass} name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej. Dona Glaseada" />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <label className={labelClass}>Categoría</label>
                          <div className="input-group">
                             <span className="input-group-text bg-dark border-secondary text-secondary"><Tag size={16}/></span>
                             <input type="text" className={inputBaseClass} name="categoria" value={formData.categoria} onChange={handleChange} list="cat-list" />
                             <datalist id="cat-list"><option value="Bebidas"/><option value="Comida"/><option value="Postres"/></datalist>
                          </div>
                        </div>
                        
                        <div className="col-12">
                           <label className={labelClass}>Descripción</label>
                           <textarea className={inputBaseClass} name="descripcion" rows="2" value={formData.descripcion} onChange={handleChange} placeholder="Detalles del producto..."></textarea>
                        </div>

                        <div className="col-md-6">
                          <label className={labelClass}>Precio ($)</label>
                          <div className="input-group">
                            <span className="input-group-text bg-dark border-secondary text-success"><DollarSign size={16}/></span>
                            <input type="number" step="0.01" className={inputBaseClass} name="precio" value={formData.precio} onChange={handleChange} required />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className={labelClass}>Stock (Unidades)</label>
                          <div className="input-group">
                            <span className="input-group-text bg-dark border-secondary text-info"><Layers size={16}/></span>
                            <input type="number" className={inputBaseClass} name="stock" value={formData.stock} onChange={handleChange} />
                          </div>
                        </div>
                      </div>

                      <h6 className="text-primary text-uppercase fw-bold mb-3 small ls-1 border-top border-secondary border-opacity-25 pt-3">
                        <ImageIcon size={14} className="me-1"/> Galería de Imágenes
                      </h6>
                      
                      <div className="mb-4">
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

                      <div className="rounded-4 bg-dark border border-secondary border-opacity-25 p-3">
                         <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="form-check form-switch m-0">
                               <input 
                                 className="form-check-input" 
                                 type="checkbox" 
                                 checked={gestionarOpciones} 
                                 onChange={(e) => setGestionarOpciones(e.target.checked)}
                                 disabled={!formData.id}
                               />
                               <label className="form-check-label fw-bold text-white small text-uppercase">Opciones & Toppings</label>
                            </div>
                            {!formData.id && <span className="badge bg-secondary">Guardar primero</span>}
                         </div>

                         {gestionarOpciones && formData.id && (
                           <div className="animate-fade-in">
                             <div className="d-flex gap-2 mb-3 bg-black bg-opacity-25 p-2 rounded-3">
                                <input type="text" className={`${inputBaseClass} form-control-sm`} placeholder="Nuevo Grupo (ej. Salsas)" value={nombreGrupo} onChange={e => setNombreGrupo(e.target.value)} />
                                <select className={`${inputBaseClass} form-control-sm w-auto`} value={tipoSeleccion} onChange={e => setTipoSeleccion(e.target.value)}>
                                   <option value="unico">Único</option>
                                   <option value="multiple">Múltiple</option>
                                </select>
                                <button type="button" onClick={handleAddGroup} className="btn btn-sm btn-success text-nowrap">Crear</button>
                             </div>

                             {loadingGrupos ? (
                               <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-light"/></div>
                             ) : (
                               grupos.length > 0 ? (
                                 grupos.map(g => (
                                   <GrupoOpcionesCard 
                                     key={g.id} grupo={g} 
                                     onOptionAdded={handleOptionAdded} 
                                     onOptionDeleted={handleOptionDeleted} 
                                     onGroupDeleted={handleGroupDeleted} 
                                   />
                                 ))
                               ) : (
                                 <div className="text-center text-muted py-3 small border border-dashed border-secondary rounded-3">
                                   No hay grupos de opciones.
                                 </div>
                               )
                             )}
                           </div>
                         )}
                      </div>
                      <div style={{height: '60px'}}></div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top border-secondary border-opacity-25 bg-dark py-3">
                   <button type="button" className="btn btn-link text-white text-decoration-none me-auto" onClick={handleClose}>Cancelar</button>
                   <button type="submit" className="btn btn-primary px-4 fw-bold rounded-pill d-flex align-items-center gap-2 shadow-lg">
                      <Save size={18}/> Guardar Producto
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

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;