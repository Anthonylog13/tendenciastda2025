import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from './AuthContext';

const ProductosContext = createContext();

export const ProductosProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cargar productos al iniciar
  useEffect(() => {
    obtenerProductos();
  }, []);

  // Obtener todos los productos
  const obtenerProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/productos/');
      setProductos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      //setError("No se pudieron cargar los productos. Intente nuevamente.");
      setLoading(false);
    }
  };

  // Agregar un nuevo producto
  const agregarProducto = async (productoData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/api/productos/', {
        nombre: productoData.nombre,
        descripcion: productoData.descripcion,
        precio: productoData.precio,
        stock: productoData.stock
      });

      // Actualizamos la lista de productos
      await obtenerProductos();
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al crear producto:", error);
      setError("No se pudo crear el producto. Intente nuevamente.");
      setLoading(false);
      return false;
    }
  };

  // Editar un producto existente
  const editarProducto = async (id, productoData) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.put(`/api/productos/${id}/`, {
        nombre: productoData.nombre,
        descripcion: productoData.descripcion,
        precio: productoData.precio,
        stock: productoData.stock
      });

      // Actualizamos la lista de productos
      await obtenerProductos();
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      setError("No se pudo actualizar el producto. Intente nuevamente.");
      setLoading(false);
      return false;
    }
  };

  // Eliminar un producto
  const eliminarProducto = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/api/productos/${id}/`);

      // Actualizamos la lista de productos
      await obtenerProductos();
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setError("No se pudo eliminar el producto. Intente nuevamente.");
      setLoading(false);
      return false;
    }
  };

  return (
    <ProductosContext.Provider
      value={{
        productos,
        loading,
        error,
        obtenerProductos,
        agregarProducto,
        editarProducto,
        eliminarProducto
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
};

export const useProductos = () => useContext(ProductosContext);
