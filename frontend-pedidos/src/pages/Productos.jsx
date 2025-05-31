import React from "react";
import { useCarrito } from "../context/CarritoContext";
import { useProductos } from '../context/ProductosContext';
import { Card, Button, Container, Row, Col } from "react-bootstrap";

const Productos = () => {
  const { agregarAlCarrito } = useCarrito();
  const { productos } = useProductos();

  return (
    <Container className="mt-4">
      <h2>Productos disponibles</h2>
      <br />
      <Row>
        {productos.map((producto) => (
          <Col key={producto._id} md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{producto.nombre}</Card.Title>
                <Card.Text>{producto.descripcion}</Card.Text>
                <Card.Text> ${producto.precio}</Card.Text>
                <Button
                  variant="dark"
                  onClick={() => agregarAlCarrito({ ...producto, cantidad: 1 })}
                >
                  Agregar al carrito
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Productos;
