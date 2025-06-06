import React, { useState } from "react";
import { useCarrito } from "../context/CarritoContext";
import { useProductos } from '../context/ProductosContext';
import { Card, Button, Container, Row, Col, Form, Alert, Spinner } from "react-bootstrap";

const Productos = () => {
  const { agregarAlCarrito } = useCarrito();
  const { productos, loading, error } = useProductos();

  // Estado para manejar la cantidad de cada producto
  const [cantidades, setCantidades] = useState({});

  const handleCantidadChange = (id, valor) => {
    setCantidades({
      ...cantidades,
      [id]: Math.max(1, parseInt(valor) || 1)
    });
  };

  const handleAgregarAlCarrito = (producto) => {
    const cantidad = cantidades[producto.id] || 1;
    agregarAlCarrito({ ...producto, cantidad });

    // Opcional: Mostrar mensaje de confirmación
    alert(`${producto.nombre} (${cantidad}) agregado al carrito`);
  };

  return (
    <Container className="mt-4">
      <h2>Productos disponibles</h2>
      <br />

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando productos...</p>
        </div>
      ) : (
        <Row>
          {productos.length === 0 ? (
            <Col>
              <Alert variant="info">No hay productos disponibles</Alert>
            </Col>
          ) : (
            productos.map((producto) => (
              <Col key={producto.id} md={4} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{producto.nombre}</Card.Title>
                    <Card.Text>{producto.descripcion}</Card.Text>
                    <Card.Text className="fw-bold">${parseFloat(producto.precio).toFixed(2)}</Card.Text>
                    <Card.Text className="text-muted">Stock: {producto.stock}</Card.Text>

                    <div className="d-flex align-items-center mb-3">
                      <Form.Label className="me-2 mb-0">Cantidad:</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={producto.stock}
                        value={cantidades[producto.id] || 1}
                        onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
                        style={{ width: '70px' }}
                      />
                    </div>

                    <Button
                      variant="dark"
                      onClick={() => handleAgregarAlCarrito(producto)}
                      disabled={producto.stock <= 0}
                    >
                      {producto.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
};

export default Productos;
