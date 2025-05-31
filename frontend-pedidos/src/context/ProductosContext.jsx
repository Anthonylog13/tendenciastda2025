import React, { createContext, useContext, useState } from 'react';

const ProductosContext = createContext();

export const ProductosProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);

  const agregarProducto = (producto) => {
    setProductos(prev => [...prev, producto]);
  };

  return (
    <ProductosContext.Provider value={{ productos, agregarProducto }}>
      {children}
    </ProductosContext.Provider>
  );
};

export const useProductos = () => useContext(ProductosContext);
