import { useState, useEffect } from 'react';
import apiClient from '../services/api';

export const useMenuData = () => {
  const [productos, setProductos] = useState([]);
  // 1. Añadimos un estado para guardar los combos
  const [combos, setCombos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cambiamos el nombre para que sea más claro que carga todo el menú
    const fetchMenuData = async () => { 
      try {
        // 2. Usamos Promise.all para hacer ambas peticiones a la vez y ser más eficientes
        const [productosResponse, combosResponse] = await Promise.all([
          apiClient.get('/productos'),
          apiClient.get('/combos') // <-- Añadimos la llamada a la URL correcta de combos
        ]);

        setProductos(Array.isArray(productosResponse.data) ? productosResponse.data : []);
        // Guardamos los combos en su propio estado
        setCombos(Array.isArray(combosResponse.data) ? combosResponse.data : []);

      } catch (err) {
        setError('No se pudo cargar el menú. Intenta de nuevo más tarde.');
        console.error("Error en useMenuData:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuData();
  }, []);

  // 3. Devolvemos los productos Y los combos para que puedan ser usados
  return { productos, combos, loading, error };
};