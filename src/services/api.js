// Archivo: src/services/api.js (Versión Final MODIFICADA)

import axios from 'axios';

// 1. Leemos las variables de entorno
const API_URL = import.meta.env.VITE_API_URL;
const TIENDA_ID = import.meta.env.VITE_TIENDA_ID; // <--- AÑADIDO

// 2. Verificamos que las variables existan
if (!API_URL) {
  console.error("Error: VITE_API_URL no está definida en el archivo .env");
}
if (!TIENDA_ID) {
  console.error("Error: VITE_TIENDA_ID no está definida en el archivo .env. Debe ser '1' para Tito Cafe.");
}

// 3. Creamos la instancia de Axios con la URL base del .env
const apiClient = axios.create({
  baseURL: API_URL // <--- MODIFICADO (antes era 'https://...')
});

// 4. MODIFICAMOS el interceptor para que añada AMBOS encabezados
apiClient.interceptors.request.use(
  (config) => {
    
    // --- AÑADIMOS EL ID DE LA TIENDA (NUEVO) ---
    // Esto le dice al backend "Soy la Tienda 1"
    config.headers['x-tienda-id'] = TIENDA_ID;

    // --- MANTENEMOS TU LÓGICA DE AUTENTICACIÓN (EXISTENTE) ---
    const token = localStorage.getItem('token');
    if (token) {
      // OJO: Tu backend (server.js) espera 'x-auth-token'. 
      // Si 'Authorization: Bearer' te funciona, déjalo.
      // Si te da error, cámbialo por la línea comentada:
      config.headers['Authorization'] = `Bearer ${token}`;
      // config.headers['x-auth-token'] = token; // (Opción B)
    }
    
    return config; // Devuelve la configuración para que la petición continúe
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =======================================================
// ▼▼▼ TU FUNCIÓN (SIN CAMBIOS) ▼▼▼
// =======================================================
export const crearPedidoAPI = async (datosPedido) => {
  const { data } = await apiClient.post('/pedidos', datosPedido);
  return data;
};

export default apiClient;