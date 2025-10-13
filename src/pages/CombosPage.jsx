// Archivo: src/pages/CombosPage.jsx (Versión Corregida y con Debugging)

import React, { useEffect } from 'react'; // Importamos useEffect para el debugging
import { motion } from 'framer-motion';
import { useMenuData } from '../hooks/useMenuData';
import ComboCard from '../components/ComboCard';

function CombosPage() {
  const { combos, loading, error } = useMenuData();

  // --- PASO DE DEBUGGING ---
  // Este código es para ayudarte a ver el problema real.
  // Abre la consola de tu navegador (presiona F12) y verás qué datos están llegando.
  useEffect(() => {
    if (!loading) {
      console.log('Datos de combos recibidos desde la API:', combos);
    }
  }, [combos, loading]);

  // --- FUNCIÓN PARA RENDERIZAR EL CONTENIDO ---
  // Esto hace el código más limpio y fácil de leer.
  const renderContent = () => {
    if (loading) {
      return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
    }

    if (error) {
      return <div className="alert alert-danger">{error}</div>;
    }
    
    // --- VALIDACIÓN DE DATOS ---
    // Si 'combos' no existe o es un array vacío, mostramos un mensaje amigable.
    // Esto evita que la página se vea rota o en blanco.
    if (!combos || combos.length === 0) {
      return (
        <div className="text-center my-5">
          <p className="lead">No hay combos especiales disponibles en este momento.</p>
        </div>
      );
    }

    // Si llegamos aquí, significa que hay datos y podemos mostrarlos.
    return (
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {combos.map((combo) => (
          // Nos aseguramos de que cada combo tenga un ID antes de intentar mostrarlo.
          combo && combo.id ? <ComboCard key={combo.id} combo={combo} /> : null
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      className="container section-padding"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-center display-4 mb-5">Nuestros Combos Especiales</h1>
      
      {renderContent()}

    </motion.div>
  );
}

export default CombosPage;
