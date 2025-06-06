import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance, { API_URL } from "../utils/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado inicial intenta cargar sesión guardada
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // Guardar sesión en localStorage cuando cambia user
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Función login real que conecta con el backend
  const login = async ({ username, password }) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/token/', {
        username,
        password
      });

      // Si la petición es exitosa, guardamos el token y la información del usuario
      const { access, refresh } = response.data;

      // Decodificar el token para obtener información del usuario
      // En un JWT, la información del usuario está en la segunda parte (payload)
      const payload = JSON.parse(atob(access.split('.')[1]));

      // Extraer el rol del usuario del token (si está disponible)
      // Si no está disponible en el token, asignamos un rol por defecto
      const rol = payload.rol || "cliente";

      const userData = {
        username,
        id: payload.user_id,
        rol,
        token: access,
        refreshToken: refresh
      };

      setUser(userData);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error de autenticación:", error);
      setLoading(false);
      return false;
    }
  };

  // Función logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para consumir el contexto
export const useAuth = () => useContext(AuthContext);
