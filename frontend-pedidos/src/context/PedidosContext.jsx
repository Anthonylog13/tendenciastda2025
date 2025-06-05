import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { useAuth } from "./AuthContext";

const PedidosContext = createContext();

export const PedidosProvider = ({ children }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cargar pedidos al iniciar o cuando cambia el usuario
  useEffect(() => {
    if (user) {
      obtenerPedidos();
    }
  }, [user]);

  // Obtener todos los pedidos del usuario
  const obtenerPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/pedidos/');
      setPedidos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
     //setError("No se pudieron cargar los pedidos. Intente nuevamente.");
      setLoading(false);
    }
  };

  // Crear un nuevo pedido
  const crearPedido = async (pedidoData, itemsData) => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Preparamos los datos completos del pedido incluyendo los items
      const pedidoCompleto = {
        pedido: {
          cliente: user.id,
          direccion_envio: pedidoData.direccion_envio,
          estado: pedidoData.estado,
          monto_total: parseInt(pedidoData.monto_total)
        },
        items: itemsData.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad
        }))
      };
      // Enviamos todo en una sola petición
      await axiosInstance.post('/api/pedidos/crear-con-items/', pedidoCompleto);

      // Actualizamos la lista de pedidos
      await obtenerPedidos();
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al crear pedido:", error);

      // Manejo de errores más específico
      if (error.response) {
        if (error.response.status === 401) {
          setError("No tienes permiso para crear pedidos. Por favor inicia sesión nuevamente.");
        } else if (error.response.status === 403) {
          setError("No tienes permiso para crear pedidos. Tu cuenta no tiene el rol de cliente.");
          console.error("Error 403: El usuario no tiene el rol de cliente necesario para crear pedidos.");
        } else if (error.response.data && error.response.data.detail) {
          setError(error.response.data.detail);
        } else {
          setError("Error del servidor al crear el pedido. Intente nuevamente.");
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("No se pudo crear el pedido. Intente nuevamente.");
      }

      setLoading(false);
      return false;
    }
  };

  // Actualizar el estado de un pedido
  const actualizarEstadoPedido = async (id, nuevoEstado) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/api/pedidos/${id}/`, {
        estado: nuevoEstado
      });

      // Actualizamos la lista de pedidos
      await obtenerPedidos();
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al actualizar estado del pedido:", error);
      setError("No se pudo actualizar el estado del pedido. Intente nuevamente.");
      setLoading(false);
      return false;
    }
  };

  // Eliminar un pedido
  const eliminarPedido = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/api/pedidos/${id}/`);

      // Actualizamos la lista de pedidos
      await obtenerPedidos();
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      setError("No se pudo eliminar el pedido. Intente nuevamente.");
      setLoading(false);
      return false;
    }
  };

  return (
    <PedidosContext.Provider
      value={{
        pedidos,
        loading,
        error,
        obtenerPedidos,
        crearPedido,
        setError,
        actualizarEstadoPedido,
        eliminarPedido
      }}
    >
      {children}
    </PedidosContext.Provider>
  );
};

// Hook para consumir el contexto
export const usePedidos = () => useContext(PedidosContext);
