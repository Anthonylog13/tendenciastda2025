import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { useAuth } from "./AuthContext";

const EntregasContext = createContext();

export const EntregasProvider = ({ children }) => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cargar entregas al iniciar o cuando cambia el usuario
  useEffect(() => {
    if (user) {
      obtenerEntregas();
    }
  }, [user]);

  // Obtener todas las entregas
  const obtenerEntregas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/entregas/');
      setEntregas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener entregas:", error);
      //setError("No se pudieron cargar las entregas. Intente nuevamente.");
      setLoading(false);
    }
  };

  // Crear una nueva entrega
  const crearEntrega = async (entregaData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/api/entregas/', entregaData);

      // Actualizamos la lista de entregas
      await obtenerEntregas();
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al crear entrega:", error);
      setError("No se pudo crear la entrega. Intente nuevamente.");
      setLoading(false);
      return false;
    }
  };

  // Actualizar una entrega existente
  const actualizarEntrega = async (id, entregaData) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/api/entregas/${id}/`, entregaData);

      // Actualizamos la lista de entregas
      await obtenerEntregas();
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al actualizar entrega:", error);
      setError("No se pudo actualizar la entrega. Intente nuevamente.");
      setLoading(false);
      return false;
    }
  };

  // Eliminar una entrega
  const eliminarEntrega = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/api/entregas/${id}/`);

      // Actualizamos la lista de entregas
      await obtenerEntregas();
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al eliminar entrega:", error);
      setError("No se pudo eliminar la entrega. Intente nuevamente.");
      setLoading(false);
      return false;
    }
  };

  // Obtener repartidores disponibles
  const obtenerRepartidores = async () => {
    try {
      const response = await axiosInstance.get('/api/perfiles/?rol=repartidor');
      return response.data;
    } catch (error) {
      console.error("Error al obtener repartidores:", error);
      return [];
    }
  };

  return (
    <EntregasContext.Provider
      value={{
        entregas,
        loading,
        error,
        obtenerEntregas,
        crearEntrega,
        actualizarEntrega,
        eliminarEntrega,
        obtenerRepartidores
      }}
    >
      {children}
    </EntregasContext.Provider>
  );
};

// Hook para consumir el contexto
export const useEntregas = () => useContext(EntregasContext);
