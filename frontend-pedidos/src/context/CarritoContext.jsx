import React, { createContext, useContext, useState } from 'react';

const CarritoContext = createContext();

export const useCarrito = () => useContext(CarritoContext);

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item._id === producto._id);
      if (existe) {
        // Si ya existe, aumenta cantidad
        return prev.map(item =>
          item._id === producto._id
            ? { ...item, cantidad: item.cantidad + producto.cantidad }
            : item
        );
      }
      // Si no existe, lo añade
      return [...prev, producto];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item._id !== id));
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, limpiarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
};
