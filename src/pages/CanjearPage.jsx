// Archivo: src/pages/CanjearPage.jsx (Código Completo y Corregido)

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function CanjearPage() {
  const [emailCliente, setEmailCliente] = useState('');
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clienteBuscado, setClienteBuscado] = useState(null);

  const handleBuscarCliente = async (e) => {
    e.preventDefault();
    if (!emailCliente) return toast.error('Ingresa el email del cliente.');
    
    setLoading(true);
    setRecompensas([]);
    setClienteBuscado(null);
    
    try {
      // URL construida con la variable de entorno para funcionar en producción
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/usuarios/find-by-email`;
      const res = await axios.post(apiUrl, { email: emailCliente });
      
      setRecompensas(res.data.recompensas);
      setClienteBuscado(res.data.cliente);

      if (res.data.recompensas.length === 0) {
        toast.success('El cliente no tiene recompensas pendientes.');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Cliente no encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const handleCanjear = async (recompensaId) => {
    if (!window.confirm(`¿Confirmas que quieres canjear el cupón #${recompensaId}? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      // También se debe usar la URL completa para esta llamada
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/recompensas/${recompensaId}/utilizar`;
      await axios.put(apiUrl);
      
      toast.success(`¡Cupón #${recompensaId} canjeado con éxito!`);
      // Actualiza la lista de recompensas en la pantalla
      setRecompensas(recompensas.filter(r => r.id !== recompensaId));
    } catch (err) {
      toast.error('No se pudo canjear el cupón.');
    }
  };

  return (
    <div>
      <h1 className="mb-4">Canjear Recompensas de Clientes</h1>
      <form onSubmit={handleBuscarCliente} className="mb-5">
        <div className="input-group">
          <input
            type="email"
            className="form-control"
            placeholder="Email del cliente..."
            value={emailCliente}
            onChange={(e) => setEmailCliente(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar Cliente'}
          </button>
        </div>
      </form>

      {clienteBuscado && (
        <div>
          <h3>Cupones de: {clienteBuscado.nombre}</h3>
          {recompensas.length > 0 ? (
            <div className="list-group">
              {recompensas.map(r => (
                <div key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">Cupón #{r.id}</h5>
                    <p className="mb-1">{r.descripcion}</p>
                    <small>Ganado el: {new Date(r.fecha_creacion).toLocaleDateString()}</small>
                  </div>
                  <button className="btn btn-success" onClick={() => handleCanjear(r.id)}>
                    Marcar como Canjeado
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>Este cliente ya no tiene cupones pendientes de canjear.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CanjearPage;