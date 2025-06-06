import React, { useState, useEffect } from 'react';
import { useEntregas } from '../context/EntregasContext';
import { usePedidos } from '../context/PedidosContext';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner, Card, Form, Button, Row, Col } from 'react-bootstrap';

const ESTADOS_ENTREGA = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_camino', label: 'En Camino' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'problema', label: 'Problema' },
];

const Entregas = () => {
  // Usar contextos
  const {
    entregas,
    loading,
    error,
    crearEntrega,
    actualizarEntrega,
    eliminarEntrega,
    obtenerRepartidores
  } = useEntregas();

  const { pedidos, loading: loadingPedidos } = usePedidos();
  const { user } = useAuth();

  // Estado para repartidores
  const [repartidores, setRepartidores] = useState([]);
  const [loadingRepartidores, setLoadingRepartidores] = useState(false);

  // Estado para mensajes de éxito
  const [successMessage, setSuccessMessage] = useState('');

  // Estado para errores de formulario
  const [formError, setFormError] = useState('');

  // Formulario nueva entrega
  const [nuevaEntrega, setNuevaEntrega] = useState({
    pedido: '',
    asignado_a: '',
    estado: 'pendiente',
    fecha_entrega: '',
    numero_seguimiento: '',
    vehiculo: '',
    disponible: true,
  });

  // Cargar repartidores al iniciar
  useEffect(() => {
    const cargarRepartidores = async () => {
      setLoadingRepartidores(true);
      try {
        const data = await obtenerRepartidores();
        setRepartidores(data);
      } catch (error) {
        console.error("Error al cargar repartidores:", error);
      } finally {
        setLoadingRepartidores(false);
      }
    };

    cargarRepartidores();
  }, []);

  // Crear nueva entrega
  const handleCrearEntrega = async (e) => {
    e.preventDefault();

    // Limpiar mensajes previos
    setSuccessMessage('');
    setFormError('');

    // Validación
    if (!nuevaEntrega.pedido) {
      setFormError('Por favor selecciona un pedido');
      return;
    }

    // Preparar datos para la API
    const entregaData = {
      pedido: nuevaEntrega.pedido,
      asignado_a: nuevaEntrega.asignado_a || null,
      estado: nuevaEntrega.estado,
      fecha_entrega: nuevaEntrega.fecha_entrega || null,
      numero_seguimiento: nuevaEntrega.numero_seguimiento,
      vehiculo: nuevaEntrega.vehiculo,
      disponible: nuevaEntrega.disponible,
    };

    const success = await crearEntrega(entregaData);

    if (success) {
      setNuevaEntrega({
        pedido: '',
        asignado_a: '',
        estado: 'pendiente',
        fecha_entrega: '',
        numero_seguimiento: '',
        vehiculo: '',
        disponible: true,
      });
      setSuccessMessage('¡Entrega creada con éxito!');

      // Desplazarse al inicio de la página para ver el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Cambiar estado o asignado de una entrega
  const handleCambiarCampo = async (id, campo, valor) => {
    // Limpiar mensajes previos
    setSuccessMessage('');

    const success = await actualizarEntrega(id, { [campo]: valor });

    if (success) {
      setSuccessMessage(`Entrega #${id} actualizada correctamente`);
      // Desplazarse al inicio de la página para ver el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Eliminar entrega
  const handleEliminarEntrega = async (id) => {
    // Limpiar mensajes previos
    setSuccessMessage('');

    if (window.confirm('¿Seguro que quieres eliminar esta entrega? Esta acción no se puede deshacer.')) {
      const success = await eliminarEntrega(id);

      if (success) {
        setSuccessMessage(`Entrega #${id} eliminada correctamente`);
        // Desplazarse al inicio de la página para ver el mensaje
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  console.log('repartidores',repartidores);
  console.log('entregas',entregas);
  console.log('pedidos',pedidos);

  return (
    <div>
      <h2>Gestión de Entregas</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {formError && <Alert variant="danger">{formError}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Solo mostrar el formulario de creación a administradores */}
      {user && user.rol === 'admin' && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-dark text-white">
            <h5 className="mb-0">Crear Nueva Entrega</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleCrearEntrega}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pedido</Form.Label>
                    <Form.Select
                      value={nuevaEntrega.pedido}
                      onChange={(e) =>
                        setNuevaEntrega({ ...nuevaEntrega, pedido: e.target.value })
                      }
                      disabled={loading || loadingPedidos}
                    >
                      <option value="">Selecciona un pedido</option>
                      {pedidos.map((p) => (
                        <option key={p.id} value={p.id}>
                          Pedido #{p.id} - Cliente: {p.cliente_detalle ? p.cliente_detalle.username : 'Usuario'}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingPedidos && <Form.Text className="text-muted">Cargando pedidos...</Form.Text>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Asignado a (Repartidor)</Form.Label>
                    <Form.Select
                      value={nuevaEntrega.asignado_a}
                      onChange={(e) =>
                        setNuevaEntrega({ ...nuevaEntrega, asignado_a: e.target.value })
                      }
                      disabled={loading || loadingRepartidores}
                    >
                      <option value="">Selecciona un repartidor</option>
                      {repartidores.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.username}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingRepartidores && <Form.Text className="text-muted">Cargando repartidores...</Form.Text>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={nuevaEntrega.estado}
                      onChange={(e) =>
                        setNuevaEntrega({ ...nuevaEntrega, estado: e.target.value })
                      }
                      disabled={loading}
                    >
                      {ESTADOS_ENTREGA.map((e) => (
                        <option key={e.value} value={e.value}>
                          {e.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de entrega</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={nuevaEntrega.fecha_entrega}
                      onChange={(e) =>
                        setNuevaEntrega({ ...nuevaEntrega, fecha_entrega: e.target.value })
                      }
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Número de seguimiento</Form.Label>
                    <Form.Control
                      type="text"
                      value={nuevaEntrega.numero_seguimiento}
                      onChange={(e) =>
                        setNuevaEntrega({ ...nuevaEntrega, numero_seguimiento: e.target.value })
                      }
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Vehículo</Form.Label>
                    <Form.Control
                      type="text"
                      value={nuevaEntrega.vehiculo}
                      onChange={(e) =>
                        setNuevaEntrega({ ...nuevaEntrega, vehiculo: e.target.value })
                      }
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="disponibleCheck"
                      label="Disponible"
                      checked={nuevaEntrega.disponible}
                      onChange={(e) =>
                        setNuevaEntrega({ ...nuevaEntrega, disponible: e.target.checked })
                      }
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid">
                <Button
                  variant="dark"
                  type="submit"
                  disabled={loading}
                  className="mt-3"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Creando entrega...</span>
                    </>
                  ) : (
                    'Crear Entrega'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">Lista de Entregas</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Asignado a</th>
                  <th>Estado</th>
                  <th>Fecha entrega</th>
                  <th>Número seguimiento</th>
                  <th>Vehículo</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Cargando...</span>
                      </Spinner>
                      <p className="mt-2">Cargando entregas...</p>
                    </td>
                  </tr>
                )}

                {!loading && entregas.length === 0 && (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <Alert variant="info" className="mb-0">
                        No hay entregas disponibles
                      </Alert>
                    </td>
                  </tr>
                )}

                {!loading && entregas.map((ent) => (
                  <tr key={ent.id}>
                    <td>{ent.id}</td>
                    <td>{ent.pedido_detalle ? ent.pedido_detalle.id : ent.pedido}</td>
                    <td>
                      {ent.pedido_detalle && ent.pedido_detalle.cliente_detalle
                        ? ent.pedido_detalle.cliente_detalle.username || "Usuario"
                        : 'Usuario'}
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={ent.asignado_a || ''}
                        onChange={(e) =>
                          handleCambiarCampo(ent.id, 'asignado_a', e.target.value || null)
                        }
                        disabled={loading || user?.rol !== 'admin'}
                      >
                        <option value="">Sin asignar</option>
                        {repartidores.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.username}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={ent.estado}
                        onChange={(e) => handleCambiarCampo(ent.id, 'estado', e.target.value)}
                        disabled={loading || (user?.rol !== 'admin' && user?.rol !== 'repartidor')}
                      >
                        {ESTADOS_ENTREGA.map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>{ent.fecha_entrega ? new Date(ent.fecha_entrega).toLocaleString() : '-'}</td>
                    <td>{ent.numero_seguimiento || '-'}</td>
                    <td>{ent.vehiculo || '-'}</td>
                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={ent.disponible}
                        onChange={(e) => handleCambiarCampo(ent.id, 'disponible', e.target.checked)}
                        disabled={loading || user?.rol !== 'admin'}
                      />
                    </td>
                    <td>
                      {user?.rol === 'admin' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleEliminarEntrega(ent.id)}
                          disabled={loading}
                        >
                          Eliminar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Entregas;
