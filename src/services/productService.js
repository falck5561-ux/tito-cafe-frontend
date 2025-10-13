// src/services/productService.js

// 1. Importa solo el apiClient. No más axios directo.
import apiClient from './api';

/**
 * Obtiene todos los productos del backend.
 */
export const getProducts = () => {
  // El apiClient ya sabe la URL base
  return apiClient.get('/productos');
};

/**
 * Crea un nuevo producto.
 * @param {FormData} productData - Se recomienda FormData para subir imágenes.
 */
export const createProduct = (productData) => {
  // No necesitas pasar el token. El apiClient lo añade solo.
  // La cabecera 'Content-Type' para FormData se establece automáticamente.
  return apiClient.post('/productos', productData);
};

/**
 * Actualiza un producto existente.
 * @param {string} productId - El ID del producto a actualizar.
 * @param {FormData} productData - Los datos actualizados.
 */
export const updateProduct = (productId, productData) => {
  // Tampoco necesitas el token aquí.
  return apiClient.put(`/productos/${productId}`, productData);
};

/**
 * Elimina un producto.
 * @param {string} productId - El ID del producto a eliminar.
 */
export const deleteProduct = (productId) => {
  // Ni aquí. El interceptor se encarga de la seguridad.
  return apiClient.delete(`/productos/${productId}`);
};