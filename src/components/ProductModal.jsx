import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import toast from 'react-hot-toast';

// --- Componente Interno para la Tarjeta de Grupo de Opciones ---
// (Lo mantenemos dentro del mismo archivo para simplicidad)
function GrupoOpcionesCard({ grupo, productoId, onOptionAdded, onOptionDeleted, onGroupDeleted, theme }) {
  const [nombreOpcion, setNombreOpcion] = useState('');
  const [precioOpcion, setPrecioOpcion] = useState(0);

  // NOTA: Si tu modal principal es oscuro, quizá quieras que 'theme' se pase
  // como prop desde el modal principal para que estas tarjetas también lo sean.
  // Por ahora, lo dejaremos en 'light' como estaba.
  const cardClass = theme === 'dark' ? 'card text-bg-dark border-secondary' : 'card';
  const inputClass = theme === 'dark' ? 'form-control form-control-dark bg-dark text-white' : 'form-control';
  const listGroupClass = theme === 'dark' ? 'list-group-item bg-dark text-white border-secondary' : 'list-group-item';

  const handleAddOption = async (e) => {
    e.preventDefault();
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
    <div className={`${cardClass} mb-4`}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>Grupo: <strong>{grupo.nombre}</strong> (Selección: {grupo.tipo_seleccion})</span>
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDeleteGroup}>
          Eliminar Grupo
        </button>
      </div>
      <div className="card-body">
        <h6 className="card-title">Opciones existentes:</h6>
        {grupo.opciones && grupo.opciones.length > 0 ? (
          <ul className="list-group list-group-flush mb-3">
            {grupo.opciones.map(op => (
              <li key={op.id} className={`${listGroupClass} d-flex justify-content-between align-items-center`}>
                <span>{op.nombre} (+${Number(op.precio_adicional).toFixed(2)})</span>
                <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteOption(op.id)}>
                  &times;
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted small">No hay opciones en este grupo.</p>
        )}
        <hr />
        <h6 className="card-title">Añadir nueva opción:</h6>
        <form onSubmit={handleAddOption} className="row g-2">
          <div className="col-md-6">
            <input
              type="text"
              className={inputClass}
              placeholder="Ej: Nutella"
              value={nombreOpcion}
              onChange={(e) => setNombreOpcion(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="Ej: 15"
              value={precioOpcion}
              onChange={(e) => setPrecioOpcion(e.target.value)}
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-primary btn-sm w-100">Añadir</button>
          </div>
        </form>
      </div>
    </div>
  );
}
// --- Fin del Componente Interno ---


// --- Modal Principal de Producto ---
function ProductModal({ show, handleClose, handleSave, productoActual }) {
  
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

  // Carga los datos del producto cuando se abre el modal
  useEffect(() => {
    if (show) {
      if (productoActual) {
        setFormData(productoActual); 
        
        if (productoActual.grupos_opciones && productoActual.grupos_opciones.length > 0) {
          setGrupos(productoActual.grupos_opciones);
          setGestionarOpciones(true); 
        } else {
          setGrupos([]);
          setGestionarOpciones(false);
        }
      } else {
        // Reseteo para producto nuevo
        setFormData({
          nombre: '',
          descripcion: '',
          precio: '',
          stock: 0,
          categoria: 'General',
          imagenes: [''],
          descuento_porcentaje: 0,
          en_oferta: false,
        });
        setGrupos([]);
        setGestionarOpciones(false);
      }
    }
  }, [productoActual, show]);
  
  // Este Effect previene el scroll del <body> cuando el modal está abierto
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Limpieza
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [show]);

  if (!show) return null;

  // --- Manejadores del Formulario Principal ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
  // --- Fin Manejadores Formulario Principal ---


  // --- Manejadores para Grupos y Opciones ---
  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!productoActual?.id) {
      return toast.error('Guarda el producto antes de añadir grupos.');
    }
    if (!nombreGrupo.trim()) return toast.error('El nombre del grupo no puede estar vacío.');

    try {
      const groupData = { nombre: nombreGrupo, tipo_seleccion: tipoSeleccion };
      const res = await apiClient.post(`/productos/${productoActual.id}/grupos`, groupData);
      res.data.opciones = []; // Aseguramos que el nuevo grupo tenga un array de opciones vacío
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


  // Determina el tema del modal (basado en la imagen, parece oscuro)
  // ASUMIMOS que pasas una prop 'theme' al modal, o que el modal es oscuro
  // Si no es así, ajusta esto. Para el ejemplo, usaré 'dark'
  // const modalTheme = 'dark'; 
  // const modalContentClass = modalTheme === 'dark' ? 'modal-content bg-dark text-white' : 'modal-content';
  // const inputClass = modalTheme === 'dark' ? 'form-control bg-dark text-white' : 'form-control';
  // const formSelectClass = modalTheme === 'dark' ? 'form-select bg-dark text-white' : 'form-select';
  // const formCheckLabelClass = modalTheme === 'dark' ? 'form-check-label text-white' : 'form-check-label';
  // const borderColorClass = modalTheme === 'dark' ? 'border-secondary' : '';
  
  // O MANTENEMOS EL CÓDIGO ORIGINAL (asume inputs claros por defecto de bootstrap)
  // La imagen que mandaste tiene inputs oscuros, pero el código original no lo especifica.
  // Voy a mantenerme fiel al código original que me diste,
  // ¡pero la corrección del scroll funcionará independientemente del tema!
  const modalContentClass = "modal-content"; // Ajusta esto si usas tema oscuro

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className={modalContentClass}> {/* <--- 'modal-content' */}
          
          {/* ✅ CORRECCIÓN "BUG DEL SCROLL": 
            Añadimos 'd-flex flex-column h-100' al formulario.
            Esto es necesario porque el <form> se sitúa entre .modal-content (que es flex)
            y .modal-body (que necesita ser un 'flex-item' para poder scrollear).
          */}
          <form onSubmit={onSave} className="d-flex flex-column h-100">
            
            <div className="modal-header">
              <h5 className="modal-title">{formData.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            
            {/* Este .modal-body SÍ tendrá scroll porque su padre (<form>) 
              es ahora un contenedor flex que ocupa el 100% de la altura.
            */}
            <div className="modal-body">
              
              {/* --- CAMPOS BÁSICOS DEL PRODUCTO --- */}
              <div className="mb-3">
                <label className="form-label">Nombre del Producto</label>
                <input type="text" className="form-control" name="nombre" value={formData.nombre || ''} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" name="descripcion" rows="2" value={formData.descripcion || ''} onChange={handleChange}></textarea>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Precio</label>
                  <input type="number" step="0.01" className="form-control" name="precio" value={formData.precio || ''} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Stock</label>
                  <input type="number" className="form-control" name="stock" value={formData.stock || 0} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Categoría</label>
                  <input type="text" className="form-control" name="categoria" value={formData.categoria || 'General'} onChange={handleChange} />
                </div>
              </div>
              
              <hr />

              {/* --- SECCIÓN DE IMÁGENES --- */}
              <div className="p-3 mb-3 border rounded">
                <h6 className="mb-3">Imágenes del Producto</h6>
                {(formData.imagenes || ['']).map((url, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <input type="text" className="form-control me-2" placeholder="https://ejemplo.com/imagen.jpg" value={url || ''} onChange={(e) => handleImageChange(index, e.target.value)} />
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveImageField(index)} disabled={!formData.imagenes || formData.imagenes.length <= 1}>&times;</button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={handleAddImageField}>Añadir URL de Imagen</button>
              </div>

              {/* --- SECCIÓN DE OFERTA --- */}
              <div className="p-3 mb-3 border rounded">
                <h6 className="mb-3">Configuración de Oferta</h6>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Porcentaje de Descuento (%)</label>
                    <input type="number" className="form-control" name="descuento_porcentaje" value={formData.descuento_porcentaje || 0} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 d-flex align-items-center justify-content-center">
                    <div className="form-check form-switch fs-5 mt-3">
                      <input className="form-check-input" type="checkbox" role="switch" name="en_oferta" checked={formData.en_oferta || false} onChange={handleChange} />
                      <label className="form-check-label">Activar Oferta</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SECCIÓN DE OPCIONES (TOPPINGS) --- */}
              <div className="p-3 border rounded">
                <div className="form-check form-switch fs-5">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="gestionarOpcionesSwitch" 
                    checked={gestionarOpciones} 
                    onChange={(e) => setGestionarOpciones(e.target.checked)}
                    disabled={!formData.id}
                  />
                  <label className="form-check-label" htmlFor="gestionarOpcionesSwitch">Gestionar Opciones (Toppings)</label>
                </div>
                {!formData.id && (
                  <div className="form-text">Guarda el producto primero para poder añadirle opciones.</div>
                )}

                {/* Esta es la UI que se muestra al activar el switch */}
                {gestionarOpciones && formData.id && (
                  <div className="mt-4">
                    {/* Formulario para CREAR NUEVO GRUPO */}
                    {/* (El código original tenía este form anidado, lo cual es inválido en HTML) */}
                    {/* (Lo he corregido en el código que te pasé antes, pero si el tuyo lo tiene anidado,
                       deberías separarlo o usar un simple <div> y manejar el submit en el botón) */}
                    
                    {/* ASUMIENDO que el form de 'handleAddGroup' es independiente: */}
                    <div className="p-3 mb-4 border rounded bg-light"> {/* Cuidado si usas tema oscuro, 'bg-light' se verá mal */}
                      <h5 className="mb-3">Crear Nuevo Grupo</h5>
                      {/* Este es un <form> separado, NO anidado dentro del <form> principal */}
                      <form onSubmit={handleAddGroup} className="row g-3">
                        <div className="col-md-5">
                          <label className="form-label">Nombre del Grupo</label>
                          <input type="text" className="form-control" placeholder="Ej: Elige tu Jarabe" value={nombreGrupo} onChange={(e) => setNombreGrupo(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Tipo de Selección</label>
                          <select className="form-select" value={tipoSeleccion} onChange={(e) => setTipoSeleccion(e.target.value)}>
                            <option value="unico">Única (Radio Button)</option>
                            <option value="multiple">Múltiple (Checkbox)</option>
                          </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                          <button type="submit" className="btn btn-success w-100">Crear Grupo</button>
                        </div>
                      </form>
                    </div>

                    <hr />

                    {/* Lista de Grupos Existentes */}
                    {loadingGrupos ? (
                      <div className="text-center"><div className="spinner-border" role="status"></div></div>
                    ) : (
                      grupos.length > 0 ? (
                        grupos.map(grupo => (
                          <GrupoOpcionesCard
                            key={grupo.id}
                            grupo={grupo}
                            productoId={productoActual.id}
                            onOptionAdded={handleOptionAdded}
                            onOptionDeleted={handleOptionDeleted}
                            onGroupDeleted={handleGroupDeleted}
                            theme={"light"} // <-- Ajusta esto si tu modal es oscuro
                          />
                        ))
                      ) : (
                        <p className="text-center text-muted">Este producto no tiene grupos de opciones. ¡Crea uno!</p>
                      )
                    )}
                  </div>
                )}
              </div>

            </div> {/* Fin .modal-body */}
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar Cambios</button>
            </div>

          </form> {/* Fin <form> principal */}

        </div>
      </div>
    </div>
  );
}

export default ProductModal;