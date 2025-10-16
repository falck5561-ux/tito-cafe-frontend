import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [pedidoActual, setPedidoActual] = useState([]);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    const nuevoSubtotal = pedidoActual.reduce((sum, item) => sum + item.cantidad * Number(item.precio), 0);
    setSubtotal(nuevoSubtotal);
  }, [pedidoActual]);

  const agregarProductoAPedido = (producto) => {
    // --- ¡CORRECCIÓN CLAVE! ---
    // Se añade una validación para prevenir que se agreguen productos inválidos o vacíos.
    // Esto elimina el error del item "NaN" automático.
    if (!producto || !producto.id || typeof producto.precio === 'undefined') {
      console.error("Intento de agregar un producto inválido al carrito:", producto);
      return; // Detiene la ejecución si el producto no es válido
    }

    let precioFinal = Number(producto.precio);
    if (producto.en_oferta && producto.descuento_porcentaje > 0) {
      precioFinal = precioFinal * (1 - producto.descuento_porcentaje / 100);
    }
    setPedidoActual(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1, precio: precioFinal }];
    });
    
    // NOTA: La notificación toast.success() se ha movido a los componentes 
    // que llaman a esta función para dar más control y evitar duplicados.
  };

  const incrementarCantidad = (productoId) => {
    setPedidoActual(prev => prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad + 1 } : item));
  };

  const decrementarCantidad = (productoId) => {
    setPedidoActual(prev => {
      const producto = prev.find(item => item.id === productoId);
      if (producto.cantidad === 1) {
        return prev.filter(item => item.id !== productoId);
      }
      return prev.map(item => item.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item);
    });
  };

  const eliminarProducto = (productoId) => {
    setPedidoActual(prev => prev.filter(item => item.id !== productoId));
  };

  const limpiarPedido = () => {
    setPedidoActual([]);
  };

  const value = {
    pedidoActual,
    subtotal,
    agregarProductoAPedido,
    incrementarCantidad,
    decrementarCantidad,
    eliminarProducto,
    limpiarPedido,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
