import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado inicial intenta cargar sesión guardada
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Guardar sesión en localStorage cuando cambia user
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Función login simulada
  const login = ({ username, password }) => {
    // Simula la validación
    if (username.trim() !== "" && password.trim() !== "") {
      const rol = "cliente";

      const token = "fake-jwt-token";
      const userData = { username, rol, token };
      setUser(userData);
      return true;
    }
    return false;
  };

  // Función logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para consumir el contexto
export const useAuth = () => useContext(AuthContext);
