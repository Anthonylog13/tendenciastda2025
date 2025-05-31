import React, { useState } from 'react';
import { useProductos } from '../context/ProductosContext';
import { Container, Table, Button, Form, Modal } from 'react-bootstrap';

const GestionProductos = () => {
  const { productos, agregarProducto, editarProducto, eliminarProducto } = useProductos();

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoForm, setProductoForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '' });
  const [editId, setEditId] = useState(null);

  const abrirModalParaNuevo = () => {
    setModoEdicion(false);
    setProductoForm({ nombre: '', descripcion: '', precio: '', stock: '' });
    setShowModal(true);
  };

  const abrirModalParaEditar = (producto) => {
    setModoEdicion(true);
    setProductoForm({ 
      nombre: producto.nombre, 
      descripcion: producto.descripcion, 
      precio: producto.precio, 
      stock: producto.stock 
    });
    setEditId(producto._id);
    setShowModal(true);
  };

  const cerrarModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductoForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const precioNum = parseFloat(productoForm.precio);
    const stockNum = parseInt(productoForm.stock, 10);

    if (
      !productoForm.nombre.trim() ||
      !productoForm.descripcion.trim() ||
      isNaN(precioNum) ||
      isNaN(stockNum)
    ) {
      alert('Por favor, ingresa todos los campos correctamente.');
      return;
    }

    if (modoEdicion) {
      editarProducto(editId, { 
        nombre: productoForm.nombre, 
        descripcion: productoForm.descripcion,
        precio: precioNum, 
        stock: stockNum 
      });
    } else {
      agregarProducto({ 
        nombre: productoForm.nombre, 
        descripcion: productoForm.descripcion,
        precio: precioNum, 
        stock: stockNum 
      });
    }
    cerrarModal();
  };

  return (
    <Container className="mt-4">
      <h2>Gestión de Productos</h2><br/>

      <Table bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(prod => (
            <tr key={prod._id}>
              <td>{prod.nombre}</td>
              <td>{prod.descripcion}</td>
              <td>${prod.precio}</td>
              <td>{prod.stock}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => abrirModalParaEditar(prod)}>
                  Editar
                </Button>{' '}
                <Button variant="danger" size="sm" onClick={() => eliminarProducto(prod._id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Contenedor para botón a la derecha debajo de la tabla */}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="dark" onClick={abrirModalParaNuevo}>
          Nuevo Producto
        </Button>
      </div>

      <Modal show={showModal} onHide={cerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={productoForm.nombre}
                onChange={handleChange}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="descripcion">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={productoForm.descripcion}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="precio">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                name="precio"
                value={productoForm.precio}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="stock">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={productoForm.stock}
                onChange={handleChange}
                min="0"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {modoEdicion ? 'Guardar Cambios' : 'Agregar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default GestionProductos;
