import React from 'react';
import { useCarrito } from '../context/CarritoContext';
import { Table, Button, Container } from 'react-bootstrap';

const CarritoPage = () => {
  const { carrito, eliminarDelCarrito, limpiarCarrito } = useCarrito();

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <Container className="mt-4">
      <h2>Carrito de Compras</h2>

      {carrito.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.nombre}</td>
                  <td>${item.precio.toFixed(2)}</td>
                  <td>{item.cantidad}</td>
                  <td>${(item.precio * item.cantidad).toFixed(2)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => eliminarDelCarrito(item._id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <h4>Total: ${total.toFixed(2)}</h4>
            <Button variant="secondary" onClick={limpiarCarrito}>
              Vaciar carrito
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default CarritoPage;
