import { useState, useEffect } from 'react';
import apiClient from '../services/api';

export const useMenuData = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // --- LA CORRECCIÓN ESTÁ AQUÍ ---
        // Nos aseguramos de que siempre pida SÓLO los productos.
        const response = await apiClient.get('/productos');
        setProductos(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError('No se pudo cargar el menú. Intenta de nuevo más tarde.');
        console.error("Error en useMenuData:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []); // El array vacío asegura que solo se ejecute una vez.

  return { productos, loading, error };
};

