import React, { useState, useEffect } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePedidos } from '../context/PedidosContext';

const ESTADOS_PEDIDO = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const Pedidos = () => {
  const { carrito, limpiarCarrito } = useCarrito();
  const {
    pedidos,
    loading,
    error,
    setError,
    crearPedido,
    actualizarEstadoPedido,
    eliminarPedido
  } = usePedidos();

  const [nuevoPedido, setNuevoPedido] = useState({
    direccion_envio: '',
    estado: 'pendiente',
  });

  // Estado para mensajes de éxito
  const [successMessage, setSuccessMessage] = useState('');

  const handleCrearPedido = async (e) => {
    e.preventDefault();

    // Limpiar mensajes previos
    setSuccessMessage('');

    // Validaciones
    if (!nuevoPedido.direccion_envio.trim()) {
      setError('Por favor completa la dirección de envío');
      return;
    }

    if (carrito.length === 0) {
      setError('Tu carrito está vacío. Agrega productos antes de crear un pedido.');
      return;
    }

    // Calcular el monto total
    const montoTotal = carrito.reduce(
      (total, prod) => total + prod.precio * prod.cantidad,
      0
    );

    // Preparar datos del pedido
    const pedidoData = {
      direccion_envio: nuevoPedido.direccion_envio,
      estado: nuevoPedido.estado,
      monto_total: montoTotal
    };

    // Preparar datos de los items del pedido
    const itemsData = carrito.map(item => ({
      id: item.id,
      cantidad: item.cantidad
    }));

    // Crear el pedido
    const success = await crearPedido(pedidoData, itemsData);

    if (success) {
      // Resetear el formulario
      setNuevoPedido({ direccion_envio: '', estado: 'pendiente' });
      // Limpiar el carrito
      limpiarCarrito();
      // Mostrar mensaje de éxito
      setSuccessMessage('¡Pedido creado con éxito! Tu pedido ha sido registrado y está siendo procesado.');

      // Desplazarse al inicio de la página para ver el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Si hay error, se mostrará automáticamente desde el contexto
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    // Limpiar mensajes previos
    setSuccessMessage('');

    const success = await actualizarEstadoPedido(id, nuevoEstado);
    if (success) {
      setSuccessMessage(`Estado del pedido #${id} actualizado correctamente.`);
      // Desplazarse al inicio de la página para ver el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Si hay error, se mostrará automáticamente desde el contexto
  };

  const handleEliminarPedido = async (id) => {
    // Limpiar mensajes previos
    setSuccessMessage('');

    if (window.confirm('¿Seguro que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
      const success = await eliminarPedido(id);
      if (success) {
        setSuccessMessage(`Pedido #${id} eliminado correctamente.`);
        // Desplazarse al inicio de la página para ver el mensaje
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Si hay error, se mostrará automáticamente desde el contexto
    }
  };

  return (
    <div>
      <h2>Pedidos</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="row mb-4">
        <div className="col-md-6">
          <form onSubmit={handleCrearPedido}>
            <div className="card">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">Crear Nuevo Pedido</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Dirección de envío</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nuevoPedido.direccion_envio}
                    onChange={(e) =>
                      setNuevoPedido({ ...nuevoPedido, direccion_envio: e.target.value })
                    }
                    disabled={loading}
                    placeholder="Ingresa la dirección completa de entrega"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Estado inicial</label>
                  <select
                    className="form-select"
                    value={nuevoPedido.estado}
                    onChange={(e) =>
                      setNuevoPedido({ ...nuevoPedido, estado: e.target.value })
                    }
                    disabled={loading}
                  >
                    {ESTADOS_PEDIDO.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-dark w-100" disabled={loading || carrito.length === 0}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creando pedido...
                    </>
                  ) : (
                    'Crear Pedido'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Resumen del Carrito</h5>
            </div>
            <div className="card-body">
              {carrito.length === 0 ? (
                <div className="alert alert-warning">
                  Tu carrito está vacío. Agrega productos antes de crear un pedido.
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <h6>Productos en el carrito:</h6>
                    <ul className="list-group">
                      {carrito.map((item) => (
                        <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{item.nombre}</strong>
                            <div className="text-muted">Cantidad: {item.cantidad}</div>
                          </div>
                          <span className="badge bg-dark rounded-pill">
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>${carrito.reduce((total, item) => total + item.precio * item.cantidad, 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
          {loading && (
            <tr>
              <td colSpan="8" className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando pedidos...</p>
              </td>
            </tr>
          )}

          {!loading && pedidos.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center">
                No hay pedidos
              </td>
            </tr>
          )}

          {!loading && pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.id}</td>
              <td>{pedido.cliente_detalle ? pedido.cliente_detalle.username : 'Usuario'}</td>
              <td>{new Date(pedido.fecha_pedido).toLocaleString()}</td>
              <td>{pedido.direccion_envio}</td>
              <td>${parseFloat(pedido.monto_total).toFixed(2)}</td>
              <td>
                {pedido.items && pedido.items.map((item, index) => (
                  <div key={index}>
                    {item.producto_detalle.nombre} x{item.cantidad} (${parseFloat(item.precio_al_comprar).toFixed(2)})
                  </div>
                ))}
              </td>
              <td>
                <select
                  className="form-select"
                  value={pedido.estado}
                  onChange={(e) => handleCambiarEstado(pedido.id, e.target.value)}
                  disabled={loading}
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
                  disabled={loading}
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
