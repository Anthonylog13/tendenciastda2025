import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { Container, Row, Col, Card, Badge, Button, Form } from 'react-bootstrap';

const Perfiles = () => {
  const { user } = useAuth();
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rolFiltro, setRolFiltro] = useState('');

  useEffect(() => {
    const fetchPerfiles = async () => {
      try {
        setLoading(true);
        let url = '/api/perfiles/';
        if (rolFiltro) {
          url += `?rol=${rolFiltro}`;
        }
        const response = await axiosInstance.get(url);
        setPerfiles(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar perfiles:', err);
        setError('No se pudieron cargar los perfiles. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfiles();
  }, [rolFiltro]);

  const getBadgeColor = (rol) => {
    switch (rol) {
      case 'admin':
        return 'danger';
      case 'cliente':
        return 'success';
      case 'repartidor':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const handleFiltroChange = (e) => {
    setRolFiltro(e.target.value);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <h2>Cargando perfiles...</h2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <h2>Error</h2>
        <p className="text-danger">{error}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Perfiles de Usuario</h2>

      {/* Filtros - Solo visible para administradores */}
      {user.rol === 'admin' && (
        <Form className="mb-4">
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Filtrar por rol:</Form.Label>
            <Col sm={4}>
              <Form.Select value={rolFiltro} onChange={handleFiltroChange}>
                <option value="">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="cliente">Cliente</option>
                <option value="repartidor">Repartidor</option>
              </Form.Select>
            </Col>
          </Form.Group>
        </Form>
      )}

      {/* Filtros - Solo visible para repartidores */}
      {user.rol === 'repartidor' && (
        <Form className="mb-4">
          <Form.Group as={Row}>
            <Form.Label column sm={2}>Filtrar por rol:</Form.Label>
            <Col sm={4}>
              <Form.Select value={rolFiltro} onChange={handleFiltroChange}>
                <option value="">Todos</option>
                <option value="cliente">Cliente</option>
                <option value="repartidor">Repartidor</option>
              </Form.Select>
            </Col>
          </Form.Group>
        </Form>
      )}

      {perfiles.length === 0 ? (
        <p>No se encontraron perfiles con los criterios seleccionados.</p>
      ) : (
        <Row>
          {perfiles.map((perfil) => (
            <Col key={perfil.id} md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{perfil.username}</Card.Title>
                  <Badge bg={getBadgeColor(perfil.rol)} className="mb-2">
                    {perfil.rol === 'admin' && 'Administrador'}
                    {perfil.rol === 'cliente' && 'Cliente'}
                    {perfil.rol === 'repartidor' && 'Repartidor'}
                  </Badge>

                  <Card.Text>
                    <strong>Email:</strong> {perfil.email || "Sin información"}<br />
                    {perfil.telefono && (
                      <>
                        <strong>Teléfono:</strong> {perfil.telefono}<br />
                      </>
                    )}
                    {perfil.direccion && (
                      <>
                        <strong>Dirección:</strong> {perfil.direccion}
                      </>
                    )}
                  </Card.Text>

                  {user.rol === 'repartidor' && perfil.rol === 'cliente' && (
                    <Button variant="outline-primary" size="sm" className="mt-3">
                      Ver Pedidos
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Perfiles;
