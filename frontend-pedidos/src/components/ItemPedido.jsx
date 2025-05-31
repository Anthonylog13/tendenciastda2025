import React from 'react';

const ItemPedido = ({ items, onActualizarCantidad, onEliminarItem }) => {
  const total = items.reduce(
    (acc, item) => acc + item.precio_al_comprar * item.cantidad,
    0
  );

  return (
    <div>
      <h2>Carrito (Items Pedido)</h2>
      {items.length === 0 ? (
        <p>No hay productos en el carrito</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.producto.nombre}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) =>
                        onActualizarCantidad(idx, parseInt(e.target.value) || 1)
                      }
                      style={{ width: '60px' }}
                    />
                  </td>
                  <td>${item.precio_al_comprar.toFixed(2)}</td>
                  <td>${(item.precio_al_comprar * item.cantidad).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onEliminarItem(idx)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" className="text-end fw-bold">
                  Total:
                </td>
                <td colSpan="2" className="fw-bold">
                  ${total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ItemPedido;
