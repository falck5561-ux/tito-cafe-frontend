// Ruta: src/services/productService.js

import axios from 'axios';

const API_URL = 'https://tito-cafe-backend.onrender.com/api/productos';

/**
 * Obtiene todos los productos del backend.
 */
export const getProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    throw error; // Lanza el error para que el componente lo maneje
  }
};

/**
 * Crea un nuevo producto.
 * @param {object} productData - Los datos del producto, incluyendo el arreglo 'imagenes'.
 * @param {string} token - El token de autenticación del administrador.
 */
export const createProduct = async (productData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  try {
    const response = await axios.post(API_URL, productData, config);
    return response.data;
  } catch (error) {
    console.error('Error al crear el producto:', error);
    throw error;
  }
};

/**
 * Actualiza un producto existente.
 * @param {string} productId - El ID del producto a actualizar.
 * @param {object} productData - Los datos actualizados del producto.
 * @param {string} token - El token de autenticación.
 */
export const updateProduct = async (productId, productData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  try {
    const response = await axios.put(`${API_URL}/${productId}`, productData, config);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    throw error;
  }
};

/**
 * Elimina un producto.
 * @param {string} productId - El ID del producto a eliminar.
 * @param {string} token - El token de autenticación.
 */
export const deleteProduct = async (productId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  try {
    const response = await axios.delete(`${API_URL}/${productId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    throw error;
  }
};