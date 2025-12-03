import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../services/api';

// 1. IMPORTAMOS TUS NUEVOS COMPONENTES
import ComboCard from '../components/ComboCard';
import ComboDetailModal from '../components/ComboDetailModal';

function CombosPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar qué combo se muestra en el modal
  const [selectedCombo, setSelectedCombo] = useState(null);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await apiClient.get('/combos'); // Asegúrate que esta ruta coincida con tu backend
        setCombos(response.data);
      } catch (err) {
        setError('No se pudieron cargar los combos en este momento.');
        console.error("Error en CombosPage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  if (loading) {
    return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center m-5">{error}</div>;
  }

  return (
    <>
      <motion.div
        className="container py-5" // Ajusté padding para que se vea bien
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-center mb-5 fw-bold display-5">Nuestros Combos Especiales</h1>
        
        {combos.length === 0 ? (
          <div className="text-center p-5 rounded bg-light border border-secondary border-opacity-25">
            <h3 className="text-muted">No hay combos especiales disponibles por el momento.</h3>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {combos.map((combo) => (
              // 2. USAMOS LA NUEVA TARJETA
              // Ya no escribimos todo el HTML aquí, usamos el componente limpio
              <ComboCard 
                key={combo.id} 
                combo={combo} 
                onClick={setSelectedCombo} // Al dar click, guardamos el combo en el estado
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* 3. CONECTAMOS EL NUEVO MODAL */}
      {/* Si hay un combo seleccionado, mostramos el modal de detalles */}
      {selectedCombo && (
        <ComboDetailModal 
          combo={selectedCombo} 
          onClose={() => setSelectedCombo(null)} 
        />
      )}
    </>
  );
}

export default CombosPage;