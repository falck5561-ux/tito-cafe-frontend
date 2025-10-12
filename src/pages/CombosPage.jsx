import React from 'react';
import { motion } from 'framer-motion';
import { useMenuData } from '../hooks/useMenuData';
import ComboCard from '../components/ComboCard';

function CombosPage() {
  const { combos, loading, error } = useMenuData();

  return (
    <motion.div 
      className="container section-padding"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-center display-4 mb-5">Nuestros Combos Especiales</h1>

      {loading && <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {combos.map((combo, index) => (
            <ComboCard key={combo.id} combo={combo} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
export default CombosPage;