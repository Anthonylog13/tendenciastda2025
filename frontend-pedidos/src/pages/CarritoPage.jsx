import React, { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { usePedidos } from '../context/PedidosContext';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Container, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';

const CarritoPage = () => {
  const { carrito, eliminarDelCarrito, actualizarCantidad, limpiarCarrito, total } = useCarrito();
  const { crearPedido, loading, error } = usePedidos();
  const navigate = useNavigate();

  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const handleCantidadChange = (id, cantidad) => {
    actualizarCantidad(id, parseInt(cantidad));
  };

  const handleCheckout = async () => {
    if (!direccionEnvio.trim()) {
      setCheckoutError('Por favor ingresa una dirección de envío');
      return;
    }

    if (carrito.length === 0) {
      setCheckoutError('Tu carrito está vacío');
      return;
    }

    setProcesando(true);
    setCheckoutError('');

    // Calcular el monto total
    const montoTotal = carrito.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );

    // Preparar datos del pedido
    const pedidoData = {
      direccion_envio: direccionEnvio,
      estado: 'pendiente',
      monto_total: montoTotal
    };

    // Preparar datos de los items del pedido
    const itemsData = carrito.map(item => ({
      id: item.id,
      cantidad: item.cantidad
    }));

    try {
      const success = await crearPedido(pedidoData, itemsData);

      if (success) {
        limpiarCarrito();
        setDireccionEnvio('');
        alert('¡Pedido creado con éxito!');
        navigate('/pedidos');
      } else {
        setCheckoutError('Error al crear el pedido. Intente nuevamente.');
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setCheckoutError('Error al crear el pedido. Intente nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Carrito de Compras</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {checkoutError && <Alert variant="danger">{checkoutError}</Alert>}

      {carrito.length === 0 ? (
        <Alert variant="info">No hay productos en el carrito.</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
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
              {carrito.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>${parseFloat(item.precio).toFixed(2)}</td>
                  <td>
                    <InputGroup size="sm">
                      <Button
                        variant="outline-secondary"
                        onClick={() => handleCantidadChange(item.id, item.cantidad - 1)}
                      >
                        -
                      </Button>
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => handleCantidadChange(item.id, e.target.value)}
                        style={{ width: '60px', textAlign: 'center' }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => handleCantidadChange(item.id, item.cantidad + 1)}
                      >
                        +
                      </Button>
                    </InputGroup>
                  </td>
                  <td>${(item.precio * item.cantidad).toFixed(2)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => eliminarDelCarrito(item.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
            <h4>Total: ${total.toFixed(2)}</h4>
            <Button
              variant="outline-secondary"
              onClick={limpiarCarrito}
              disabled={procesando}
            >
              Vaciar carrito
            </Button>
          </div>

          <h4>Finalizar Compra</h4>
          <Form className="mt-3">
            <Form.Group className="mb-3">
              <Form.Label>Dirección de envío</Form.Label>
              <Form.Control
                type="text"
                value={direccionEnvio}
                onChange={(e) => setDireccionEnvio(e.target.value)}
                placeholder="Ingresa tu dirección completa"
                disabled={procesando}
              />
            </Form.Group>

            <Button
              variant="success"
              size="lg"
              onClick={handleCheckout}
              disabled={procesando || loading}
              className="w-100"
            >
              {procesando || loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Procesando...</span>
                </>
              ) : (
                'Realizar Pedido'
              )}
            </Button>
          </Form>
        </>
      )}
    </Container>
  );
};

export default CarritoPage;
