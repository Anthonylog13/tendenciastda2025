import React, { useState, useEffect } from 'react';
import { useProductos } from '../context/ProductosContext';
import { Container, Table, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';

const GestionProductos = () => {
  const { productos, loading, error, obtenerProductos, agregarProducto, editarProducto, eliminarProducto } = useProductos();

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoForm, setProductoForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '' });
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Cargar productos al iniciar
  useEffect(() => {
    obtenerProductos();
  }, []);

  const abrirModalParaNuevo = () => {
    setModoEdicion(false);
    setProductoForm({ nombre: '', descripcion: '', precio: '', stock: '' });
    setFormError('');
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
    setEditId(producto.id);
    setFormError('');
    setShowModal(true);
  };

  const cerrarModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductoForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    const precioNum = parseFloat(productoForm.precio);
    const stockNum = parseInt(productoForm.stock, 10);

    if (
      !productoForm.nombre.trim() ||
      !productoForm.descripcion.trim() ||
      isNaN(precioNum) ||
      isNaN(stockNum)
    ) {
      setFormError('Por favor, ingresa todos los campos correctamente.');
      setFormSubmitting(false);
      return;
    }

    const productoData = {
      nombre: productoForm.nombre,
      descripcion: productoForm.descripcion,
      precio: precioNum,
      stock: stockNum
    };

    let success;
    if (modoEdicion) {
      success = await editarProducto(editId, productoData);
    } else {
      success = await agregarProducto(productoData);
    }

    setFormSubmitting(false);
    if (success) {
      cerrarModal();
    } else {
      setFormError('Error al guardar el producto. Intente nuevamente.');
    }
  };

  return (
    <Container className="mt-4">
      <h2>Gestión de Productos</h2><br/>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && !showModal ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando productos...</p>
        </div>
      ) : (
        <>
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
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No hay productos disponibles</td>
                </tr>
              ) : (
                productos.map(prod => (
                  <tr key={prod.id}>
                    <td>{prod.nombre}</td>
                    <td>{prod.descripcion}</td>
                    <td>${parseFloat(prod.precio).toFixed(2)}</td>
                    <td>{prod.stock}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => abrirModalParaEditar(prod)}
                        disabled={loading}
                      >
                        Editar
                      </Button>{' '}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('¿Seguro que quieres eliminar este producto?')) {
                            eliminarProducto(prod.id);
                          }
                        }}
                        disabled={loading}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Contenedor para botón a la derecha debajo de la tabla */}
          <div className="d-flex justify-content-end mb-3">
            <Button variant="dark" onClick={abrirModalParaNuevo} disabled={loading}>
              Nuevo Producto
            </Button>
          </div>
        </>
      )}

      <Modal show={showModal} onHide={cerrarModal} backdrop="static" keyboard={!formSubmitting}>
        <Modal.Header closeButton={!formSubmitting}>
          <Modal.Title>{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}

            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={productoForm.nombre}
                onChange={handleChange}
                disabled={formSubmitting}
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
                disabled={formSubmitting}
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
                disabled={formSubmitting}
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
                disabled={formSubmitting}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModal} disabled={formSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={formSubmitting}>
              {formSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Guardando...</span>
                </>
              ) : (
                modoEdicion ? 'Guardar Cambios' : 'Agregar'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default GestionProductos;
