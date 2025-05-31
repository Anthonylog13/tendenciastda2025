import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { carrito } = useCarrito();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Gestión de Pedidos
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {user ? (
            <>
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/pedidos">
                    Pedidos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/entregas">
                    Entregas
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/gestion-productos">
                    Productos
                  </Link>
                </li>
              </ul>
              <Link
                className="nav-link position-relative me-3"
                to="/carrito"
                aria-label="Carrito de compras"
                style={{ color: "white" }}
              >
                <i className="bi bi-cart" style={{ fontSize: "1.5rem" }}></i>
                {totalItems > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-light text-dark"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {totalItems}
                    <span className="visually-hidden">
                      artículos en carrito
                    </span>
                  </span>
                )}
              </Link>

              <span className="navbar-text me-3">{user.username}</span>
              <button
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
