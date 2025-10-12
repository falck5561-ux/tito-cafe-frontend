import { useState, useEffect } from 'react';
import axios from 'axios';

// Este hook se encargará de toda la lógica de fetching para el menú
export function useMenuData() {
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      setError('');
      try {
        const [productosRes, combosRes] = await Promise.all([
          axios.get('/api/productos'),
          axios.get('/api/combos/activas') 
        ]);
        setProductos(productosRes.data);
        setCombos(combosRes.data);
      } catch (err) {
        setError('No se pudo cargar el menú. Intenta de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuData();
  }, []); // Se ejecuta solo una vez

  // El hook devuelve los datos y los estados
  return { productos, combos, loading, error };
}