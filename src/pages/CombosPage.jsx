import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ComboCard from '../components/ComboCard'; // Crearemos este componente en el siguiente paso

function CombosPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCombos = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/combos/activas');
        setCombos(res.data);
      } catch (err) {
        setError('No se pudieron cargar los combos. Intenta de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  return (
    <motion.div 
      className="container my-5"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-center display-4 mb-5">Combos de Tito</h1>

      {loading && <div className="text-center my-5"><div className="spinner-border" style={{ width: '3rem', height: '3rem' }} role="status"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {combos.map((combo, index) => (
            <ComboCard key={combo.id} combo={combo} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default CombosPage;