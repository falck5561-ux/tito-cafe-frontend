// src/hooks/useMenuData.jsx

import { useState, useEffect } from 'react';
// 1. Importa apiClient en lugar de axios
import apiClient from '../services/api';

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
        // 2. Usa apiClient y quita el prefijo '/api' (ya está en la baseURL)
        const [productosRes, combosRes] = await Promise.all([
          apiClient.get('/productos'),
          apiClient.get('/combos/activas') 
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
  }, []);

  return { productos, combos, loading, error };
}