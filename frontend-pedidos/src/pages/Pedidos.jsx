import React, { useState } from 'react';
import { useCarrito } from '../context/CarritoContext'; 
import { useAuth } from '../context/AuthContext'; 

const ESTADOS_PEDIDO = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const Pedidos = () => {
  const { carrito, limpiarCarrito } = useCarrito();
  const { user } = useAuth();

  const [pedidos, setPedidos] = useState([]);

  const [nuevoPedido, setNuevoPedido] = useState({
    direccion_envio: '',
    estado: 'pendiente',
  });

  const handleCrearPedido = (e) => {
    e.preventDefault();

    if (!nuevoPedido.direccion_envio) {
      alert('Completa la dirección de envío');
      return;
    }

    if (carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    const montoTotal = carrito.reduce(
      (total, prod) => total + prod.precio * prod.cantidad,
      0
    );

    const productosDelPedido = carrito.map((prod) => ({ ...prod }));

    const clienteActual = user ? user.username : 'Invitado';

    const nuevo = {
      id: pedidos.length + 1,
      cliente: { username: clienteActual },
      fecha_pedido: new Date().toLocaleString(),
      estado: nuevoPedido.estado,
      direccion_envio: nuevoPedido.direccion_envio,
      monto_total: montoTotal,
      productos: productosDelPedido,
    };

    setPedidos([...pedidos, nuevo]);
    setNuevoPedido({ direccion_envio: '', estado: 'pendiente' });
    limpiarCarrito();
    alert('¡Pedido creado con éxito!');
  };

  const handleCambiarEstado = (id, nuevoEstado) => {
    setPedidos(
      pedidos.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
    );
  };

  const handleEliminarPedido = (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este pedido?')) {
      setPedidos(pedidos.filter((p) => p.id !== id));
    }
  };

  return (
    <div>
      <h2>Pedidos</h2>

      <form onSubmit={handleCrearPedido} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Dirección de envío</label>
          <input
            type="text"
            className="form-control"
            value={nuevoPedido.direccion_envio}
            onChange={(e) =>
              setNuevoPedido({ ...nuevoPedido, direccion_envio: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            value={nuevoPedido.estado}
            onChange={(e) =>
              setNuevoPedido({ ...nuevoPedido, estado: e.target.value })
            }
          >
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-dark">
          Crear Pedido con Carrito
        </button>
      </form>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Dirección</th>
            <th>Monto</th>
            <th>Productos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center">
                No hay pedidos
              </td>
            </tr>
          )}

          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.id}</td>
              <td>{pedido.cliente.username}</td>
              <td>{pedido.fecha_pedido}</td>
              <td>{pedido.direccion_envio}</td>
              <td>${pedido.monto_total.toFixed(2)}</td>
              <td>
                {pedido.productos.map((prod, index) => (
                  <div key={index}>
                    {prod.nombre} x{prod.cantidad} (${(prod.precio * prod.cantidad).toFixed(2)})
                  </div>
                ))}
              </td>
              <td>
                <select
                  className="form-select"
                  value={pedido.estado}
                  onChange={(e) => handleCambiarEstado(pedido.id, e.target.value)}
                >
                  {ESTADOS_PEDIDO.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleEliminarPedido(pedido.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pedidos;
