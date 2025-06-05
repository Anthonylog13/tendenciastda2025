import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import { ProductosProvider } from "./context/ProductosContext";
import { PedidosProvider } from "./context/PedidosContext";
import { EntregasProvider } from "./context/EntregasContext";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Entregas from "./pages/Entregas";
import Productos from "./pages/Productos";
import CarritoPage from "./pages/CarritoPage";
import GestionProductos from "./pages/GestionProductos";
import Perfiles from "./pages/Perfiles";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AuthGate = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route
            path="/pedidos"
            element={
              <PrivateRoute>
                <Pedidos />
              </PrivateRoute>
            }
          />
          <Route
            path="/entregas"
            element={
              <PrivateRoute>
                <Entregas />
              </PrivateRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <PrivateRoute>
                <Productos />
              </PrivateRoute>
            }
          />
          <Route
            path="/carrito"
            element={
              <PrivateRoute>
                <CarritoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestion-productos"
            element={
              <PrivateRoute>
                <GestionProductos />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfiles"
            element={
              <PrivateRoute>
                <Perfiles />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/productos" />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProductosProvider>
        <CarritoProvider>
          <PedidosProvider>
            <EntregasProvider>
              <Router>
                <AuthGate />
              </Router>
            </EntregasProvider>
          </PedidosProvider>
        </CarritoProvider>
      </ProductosProvider>
    </AuthProvider>
  );
}

export default App;
