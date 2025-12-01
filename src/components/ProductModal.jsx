import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext'; // Necesario para obtener el tema
import { X, Plus, Image as ImageIcon, Tag, DollarSign, List, Edit, Trash2, Layers, Package, CheckCircle } from 'lucide-react'; // Iconos

// --- Componente Interno: Tarjeta de Grupo de Opciones (MEJORADA) ---
function GrupoOpcionesCard({ grupo, onOptionAdded, onOptionDeleted, onGroupDeleted, theme }) {
  const [nombreOpcion, setNombreOpcion] = useState('');
  const [precioOpcion, setPrecioOpcion] = useState(0);

  const isDark = theme === 'dark';
  const cardClass = `card shadow-sm mb-4 border-0`;
  const cardBg = isDark ? '#2a2a2a' : '#f8f9fa'; // Fondo más claro para la tarjeta interna
  const inputClass = `form-control ${isDark ? 'form-control-dark bg-dark text-white border-secondary' : 'form-control'}`;
  const listGroupClass = `list-group-item d-flex justify-content-between align-items-center ${isDark ? 'bg-dark text-white border-secondary' : ''}`;

  const handleAddOption = async () => {
    if (!nombreOpcion.trim()) return toast.error('El nombre de la opción no puede estar vacío.');
    try {
      const optionData = { nombre: nombreOpcion, precio_adicional: parseFloat(precioOpcion) || 0 };
      const res = await apiClient.post(`/productos/grupos/${grupo.id}/opciones`, optionData);
      onOptionAdded(grupo.id, res.data);
      setNombreOpcion('');
      setPrecioOpcion(0);
      toast.success('Opción agregada');
    } catch (error) {
      console.error("Error al agregar opción:", error);
      toast.error('No se pudo agregar la opción.');
    }
  };

  const handleDeleteOption = async (opcionId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta opción?')) return;
    try {
      await apiClient.delete(`/productos/opciones/${opcionId}`);
      onOptionDeleted(grupo.id, opcionId);
      toast.success('Opción eliminada');
    } catch (error) {
      console.error("Error al eliminar opción:", error);
      toast.error('No se pudo eliminar la opción.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(`¿Seguro que quieres eliminar el grupo "${grupo.nombre}" y todas sus opciones?`)) return;
    try {
      await apiClient.delete(`/productos/grupos/${grupo.id}`);
      onGroupDeleted(grupo.id);
      toast.success('Grupo eliminado');
    } catch (error) {
      console.error("Error al eliminar grupo:", error);
      toast.error('No se pudo eliminar el grupo.');
    }
  };

  return (
    <div className={cardClass} style={{ backgroundColor: cardBg }}>
      <div className="card-header d-flex justify-content-between align-items-center fw-bold py-3" style={{ borderBottom: `1px solid ${isDark ? '#444' : '#eee'}` }}>
        <span className="d-flex align-items-center gap-2">
          <List size={18} className="text-primary"/> Grupo: {grupo.nombre}
        </span>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-info text-dark rounded-pill">{grupo.tipo_seleccion.toUpperCase()}</span>
          <button type="button" className="btn btn-sm btn-outline-danger px-3 rounded-pill" onClick={handleDeleteGroup}>
            <Trash2 size={16} className="me-1"/> Eliminar
          </button>
        </div>
      </div>
      <div className="card-body p-4">
        
        <h6 className="card-title fw-bold mb-3">Opciones disponibles:</h6>
        
        {grupo.opciones && grupo.opciones.length > 0 ? (
          <ul className="list-group list-group-flush mb-4 rounded-3 overflow-hidden" style={{ border: `1px solid ${isDark ? '#444' : '#eee'}` }}>
            {grupo.opciones.map(op => (
              <li key={op.id} className={`${listGroupClass} d-flex justify-content-between align-items-center py-2 px-3`}>
                <span className="fw-medium">{op.nombre} <span className="text-muted small ms-2">(+${Number(op.precio_adicional).toFixed(2)})</span></span>
                <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDeleteOption(op.id)}>
                  <X size={18}/>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted text-center py-3 border rounded-3" style={{ borderStyle: 'dashed', borderColor: isDark ? '#444' : '#ccc' }}>
            No hay opciones en este grupo.
          </p>
        )}
        
        <h6 className="card-title fw-bold mt-4 mb-3">Añadir nueva opción:</h6>
        
        <div className="row g-3">
          <div className="col-md-5">
            <input
              type="text"
              className={inputClass}
              placeholder="Nombre (Ej: Extra Chamoy)"
              value={nombreOpcion}
              onChange={(e) => setNombreOpcion(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <div className="input-group">
              <span className={`input-group-text ${isDark ? 'bg-dark text-white border-secondary' : ''}`}>$</span>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                placeholder="Precio (Ej: 15.00)"
                value={precioOpcion}
                onChange={(e) => setPrecioOpcion(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <button type="button" onClick={handleAddOption} className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
              <Plus size={18}/> Añadir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// --- Fin del Componente Interno ---


// --- Modal Principal de Producto (MEJORADO) ---
function ProductModal({ show, handleClose, handleSave, productoActual }) {
    const { theme } = useTheme(); 
    const isDark = theme === 'dark';
    const modalBg = isDark ? '#1a1a1a' : '#ffffff';
    const inputClass = `form-control ${isDark ? 'form-control-dark bg-dark text-white border-secondary' : 'form-control'}`;
    const sectionBg = isDark ? '#2a2a2a' : '#f8f9fa';

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: 0,
    categoria: 'General',
    imagenes: [''],
    descuento_porcentaje: 0,
    en_oferta: false,
  });

  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [gestionarOpciones, setGestionarOpciones] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [tipoSeleccion, setTipoSeleccion] = useState('unico');

  useEffect(() => {
    if (show) {
      if (productoActual) {
        setFormData(prev => ({
            ...prev,
            ...productoActual,
            // Asegurar que las imágenes son un array para evitar errores
            imagenes: Array.isArray(productoActual.imagenes) && productoActual.imagenes.length > 0
                ? productoActual.imagenes : (productoActual.imagen_url ? [productoActual.imagen_url] : ['']),
        })); 
        
        if (productoActual.grupos_opciones && productoActual.grupos_opciones.length > 0) {
          setGrupos(productoActual.grupos_opciones);
          setGestionarOpciones(true); 
        } else {
          setGrupos([]);
          setGestionarOpciones(false);
        }
      } else {
        setFormData({
          nombre: '', descripcion: '', precio: '', stock: 0, categoria: 'General', imagenes: [''],
          descuento_porcentaje: 0, en_oferta: false,
        });
        setGrupos([]);
        setGestionarOpciones(false);
      }
    }
  }, [productoActual, show]);
  
  useEffect(() => {
    if (show) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = 'auto'; }
    return () => { document.body.style.overflow = 'auto'; };
  }, [show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...(formData.imagenes || [''])];
    newImages[index] = value;
    setFormData({ ...formData, imagenes: newImages });
  };

  const handleAddImageField = () => {
    setFormData({ ...formData, imagenes: [...(formData.imagenes || ['']), ''] });
  };

  const handleRemoveImageField = (index) => {
    if (!formData.imagenes || formData.imagenes.length <= 1) return;
    const newImages = formData.imagenes.filter((_, i) => i !== index);
    setFormData({ ...formData, imagenes: newImages });
  };

  const onSave = (e) => {
    e.preventDefault();
    const datosParaEnviar = {
      ...formData,
      imagenes: (formData.imagenes || []).filter(url => url && url.trim() !== ''),
    };
    handleSave(datosParaEnviar);
  };

  // --- Manejadores para Grupos y Opciones ---
  const handleAddGroup = async () => {
    if (!productoActual?.id) { return toast.error('Guarda el producto antes de añadir grupos.'); }
    if (!nombreGrupo.trim()) return toast.error('El nombre del grupo no puede estar vacío.');

    try {
      const groupData = { nombre: nombreGrupo, tipo_seleccion: tipoSeleccion };
      const res = await apiClient.post(`/productos/${productoActual.id}/grupos`, groupData);
      res.data.opciones = []; 
      setGrupos([...grupos, res.data]);
      setNombreGrupo('');
      setTipoSeleccion('unico');
      toast.success('Grupo creado');
    } catch (error) {
      console.error("Error al crear grupo:", error);
      toast.error('No se pudo crear el grupo.');
    }
  };

  const handleOptionAdded = (grupoId, nuevaOpcion) => {
    setGrupos(gruposActuales => gruposActuales.map(g =>
      g.id === grupoId ? { ...g, opciones: [...g.opciones, nuevaOpcion] } : g
    ));
  };

  const handleOptionDeleted = (grupoId, opcionId) => {
    setGrupos(gruposActuales => gruposActuales.map(g =>
      g.id === grupoId ? { ...g, opciones: g.opciones.filter(o => o.id !== opcionId) } : g
    ));
  };

  const handleGroupDeleted = (grupoId) => {
    setGrupos(gruposActuales => gruposActuales.filter(g => g.id !== grupoId));
  };
  // --- Fin Manejadores Grupos y Opciones ---


  return (
    <div className="modal show fade" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0" style={{ backgroundColor: modalBg, color: isDark ? '#fff' : '#000', borderRadius: '12px' }}> 
          
          {/* Header del Modal */}
          <div className="modal-header border-0 pb-0 pt-4 px-4">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-3">
                <Package size={24} className="text-primary"/> {formData.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}
            </h5>
            <button type="button" className={`btn-close ${isDark ? 'btn-close-white' : ''}`} onClick={handleClose}></button>
          </div>
          
          <form onSubmit={onSave} className="d-flex flex-column flex-grow-1" style={{ minHeight: "0" }}>
            
            <div className="modal-body p-4">
              <div className="row g-4"> {/* Estructura principal en 2 columnas */}
                
                    {/* --- COLUMNA IZQUIERDA: GENERALES Y DESCRIPCIÓN --- */}
                  <div className="col-lg-6">
                        <h6 className="mb-3 fw-bold text-primary border-bottom pb-2 d-flex align-items-center gap-2"><Tag size={18}/> DETALLES GENERALES</h6>
                        
                        <div className="mb-3">
                            <label className="form-label fw-bold">Nombre del Producto</label>
                            <input type="text" className={inputClass} name="nombre" value={formData.nombre || ''} onChange={handleChange} required />
                        </div>
                        
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Precio ($)</label>
                                <input type="number" step="0.01" className={inputClass} name="precio" value={formData.precio || ''} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Stock</label>
                                <input type="number" className={inputClass} name="stock" value={formData.stock || 0} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Categoría</label>
                            <input type="text" className={inputClass} name="categoria" value={formData.categoria || 'General'} onChange={handleChange} />
                        </div>
                        
                        <div className="mb-4">
                            <label className="form-label fw-bold">Descripción</label>
                            <textarea className={inputClass} name="descripcion" rows="4" value={formData.descripcion || ''} onChange={handleChange}></textarea>
                        </div>
                        
                        {/* Configuración de Oferta */}
                        <div className="p-4 rounded-3" style={{ backgroundColor: sectionBg }}>
                            <h6 className="mb-3 fw-bold text-warning border-bottom pb-2 d-flex align-items-center gap-2"><DollarSign size={18}/> CONFIGURACIÓN DE OFERTA</h6>
                            <div className="row g-3">
                                <div className="col-md-7">
                                    <label className="form-label">Porcentaje de Descuento (%)</label>
                                    <input type="number" className={inputClass} name="descuento_porcentaje" value={formData.descuento_porcentaje || 0} onChange={handleChange} />
                                </div>
                                <div className="col-md-5 d-flex align-items-end justify-content-center">
                                    <div className="form-check form-switch fs-5">
                                        <input className="form-check-input" type="checkbox" role="switch" name="en_oferta" checked={formData.en_oferta || false} onChange={handleChange} />
                                        <label className="form-check-label">Activar Oferta</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                  </div>
                    {/* --- FIN COLUMNA IZQUIERDA --- */}
                
                    {/* --- COLUMNA DERECHA: MULTIMEDIA Y OPCIONES --- */}
                  <div className="col-lg-6">
                        {/* MULTIMEDIA */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold text-primary border-bottom pb-2 d-flex align-items-center gap-2"><ImageIcon size={18}/> MULTIMEDIA</h6>
                            {(formData.imagenes || ['']).map((url, index) => (
                                <div key={index} className="d-flex align-items-center mb-2">
                                    <input type="text" className={`${inputClass} me-2`} placeholder="https://ejemplo.com/imagen.jpg" value={url || ''} onChange={(e) => handleImageChange(index, e.target.value)} />
                                    <button type="button" className="btn btn-outline-danger btn-sm p-2" onClick={() => handleRemoveImageField(index)} disabled={!formData.imagenes || formData.imagenes.length <= 1}>
                                        <X size={16}/>
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-outline-info btn-sm mt-2 d-flex align-items-center gap-2" onClick={handleAddImageField}>
                                <Plus size={16}/> Añadir otra foto
                            </button>
                        </div>

                        {/* SECCIÓN DE OPCIONES (TOPPINGS) */}
                        <h6 className="mb-3 fw-bold text-primary border-bottom pb-2 d-flex align-items-center gap-2"><Layers size={18}/> PERSONALIZACIÓN (TOPPINGS)</h6>

                        <div className="p-4 rounded-3" style={{ backgroundColor: sectionBg }}>
                            <div className="form-check form-switch fs-5 mb-3">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    role="switch" 
                                    id="gestionarOpcionesSwitch" 
                                    checked={gestionarOpciones} 
                                    onChange={(e) => setGestionarOpciones(e.target.checked)}
                                    disabled={!formData.id}
                                />
                                <label className="form-check-label" htmlFor="gestionarOpcionesSwitch">Activar Opciones para el Cliente</label>
                            </div>
                            {!formData.id && (
                                <div className="form-text text-warning">Guarda el producto primero para poder añadir grupos de opciones.</div>
                            )}

                            {gestionarOpciones && formData.id && (
                                <div className="mt-4">
                                    {/* Formulario para CREAR NUEVO GRUPO */}
                                    <div className="p-3 mb-4 rounded-3 border" style={{ borderColor: isDark ? '#444' : '#ccc' }}> 
                                        <h6 className="mb-3 fw-bold d-flex align-items-center gap-2"><Plus size={18}/> Crear Nuevo Grupo</h6>
                                        
                                        <div className="row g-3">
                                            <div className="col-md-5">
                                                <label className="form-label small text-muted">Nombre del Grupo</label>
                                                <input type="text" className={inputClass} placeholder="Ej: Elege tu Jarabe" value={nombreGrupo} onChange={(e) => setNombreGrupo(e.target.value)} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small text-muted">Tipo de Selección</label>
                                                <select className={inputClass} value={tipoSeleccion} onChange={(e) => setTipoSeleccion(e.target.value)}>
                                                    <option value="unico">Única</option>
                                                    <option value="multiple">Múltiple</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3 d-flex align-items-end">
                                                <button type="button" onClick={handleAddGroup} className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-1">
                                                    <Plus size={16}/> Crear
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lista de Grupos Existentes */}
                                    {loadingGrupos ? (
                                        <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>
                                    ) : (
                                        grupos.length > 0 ? (
                                            grupos.map(grupo => (
                                                <GrupoOpcionesCard
                                                    key={grupo.id}
                                                    grupo={grupo}
                                                    onOptionAdded={handleOptionAdded} 
                                                    onOptionDeleted={handleOptionDeleted} 
                                                    onGroupDeleted={handleGroupDeleted} 
                                                    theme={theme} 
                                                />
                                            ))
                                        ) : (
                                            <p className="text-center text-muted">Este producto no tiene grupos de opciones.</p>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                  </div>
                    {/* --- FIN COLUMNA DERECHA --- */}

              </div>
            </div> {/* Fin .modal-body */}
            
            <div className="modal-footer border-0 p-4 justify-content-center">
              <button type="button" className="btn btn-secondary px-4 rounded-pill fw-bold" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold d-flex align-items-center gap-2">
                <CheckCircle size={18}/> Guardar Cambios
              </button>
            </div>

          </form> {/* Fin <form> principal */}

        </div>
      </div>
    </div>
  );
}

export default ProductModal;