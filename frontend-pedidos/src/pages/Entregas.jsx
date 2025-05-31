import React, { useState } from 'react';

const ESTADOS_ENTREGA = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_camino', label: 'En Camino' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'problema', label: 'Problema' },
];

const repartidoresDemo = [
  { id: 1, username: 'repartidor1' },
  { id: 2, username: 'repartidor2' },
];

const entregasDemoPedidos = [
  { id: 1, cliente: { username: 'cliente_demo' } },
  { id: 2, cliente: { username: 'otro_cliente' } },
];

const Entregas = () => {
  // Estado local: lista de entregas
  const [entregas, setEntregas] = useState([]);

  // Formulario nueva entrega
  const [nuevaEntrega, setNuevaEntrega] = useState({
    pedidoId: '',
    asignadoId: '',
    estado: 'pendiente',
    fecha_entrega: '',
    numero_seguimiento: '',
    vehiculo: '',
    disponible: true,
  });

  // Crear nueva entrega
  const handleCrearEntrega = (e) => {
    e.preventDefault();
    if (!nuevaEntrega.pedidoId) {
      alert('Selecciona un pedido');
      return;
    }

    const pedidoAsignado = entregasDemoPedidos.find(
      (p) => p.id === parseInt(nuevaEntrega.pedidoId)
    );
    if (!pedidoAsignado) {
      alert('Pedido inválido');
      return;
    }

    const nuevo = {
      id: entregas.length + 1,
      pedido: pedidoAsignado,
      asignado_a: repartidoresDemo.find((r) => r.id === parseInt(nuevaEntrega.asignadoId)) || null,
      estado: nuevaEntrega.estado,
      fecha_entrega: nuevaEntrega.fecha_entrega,
      numero_seguimiento: nuevaEntrega.numero_seguimiento,
      vehiculo: nuevaEntrega.vehiculo,
      disponible: nuevaEntrega.disponible,
    };

    setEntregas([...entregas, nuevo]);
    setNuevaEntrega({
      pedidoId: '',
      asignadoId: '',
      estado: 'pendiente',
      fecha_entrega: '',
      numero_seguimiento: '',
      vehiculo: '',
      disponible: true,
    });
  };

  // Cambiar estado o asignado de una entrega
  const handleCambiarCampo = (id, campo, valor) => {
    setEntregas(
      entregas.map((ent) =>
        ent.id === id ? { ...ent, [campo]: valor } : ent
      )
    );
  };

  // Eliminar entrega
  const handleEliminarEntrega = (id) => {
    if (window.confirm('¿Seguro que quieres eliminar esta entrega?')) {
      setEntregas(entregas.filter((e) => e.id !== id));
    }
  };

  return (
    <div>
      <h2>Entregas</h2><br/>

      <form onSubmit={handleCrearEntrega} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Pedido</label>
          <select
            className="form-select"
            value={nuevaEntrega.pedidoId}
            onChange={(e) =>
              setNuevaEntrega({ ...nuevaEntrega, pedidoId: e.target.value })
            }
          >
            <option value="">Selecciona un pedido</option>
            {entregasDemoPedidos.map((p) => (
              <option key={p.id} value={p.id}>
                Pedido #{p.id} - Cliente: {p.cliente.username}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Asignado a (Repartidor)</label>
          <select
            className="form-select"
            value={nuevaEntrega.asignadoId}
            onChange={(e) =>
              setNuevaEntrega({ ...nuevaEntrega, asignadoId: e.target.value })
            }
          >
            <option value="">Selecciona un repartidor</option>
            {repartidoresDemo.map((r) => (
              <option key={r.id} value={r.id}>
                {r.username}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            value={nuevaEntrega.estado}
            onChange={(e) =>
              setNuevaEntrega({ ...nuevaEntrega, estado: e.target.value })
            }
          >
            {ESTADOS_ENTREGA.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Fecha de entrega</label>
          <input
            type="datetime-local"
            className="form-control"
            value={nuevaEntrega.fecha_entrega}
            onChange={(e) =>
              setNuevaEntrega({ ...nuevaEntrega, fecha_entrega: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Número de seguimiento</label>
          <input
            type="text"
            className="form-control"
            value={nuevaEntrega.numero_seguimiento}
            onChange={(e) =>
              setNuevaEntrega({ ...nuevaEntrega, numero_seguimiento: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Vehículo</label>
          <input
            type="text"
            className="form-control"
            value={nuevaEntrega.vehiculo}
            onChange={(e) =>
              setNuevaEntrega({ ...nuevaEntrega, vehiculo: e.target.value })
            }
          />
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={nuevaEntrega.disponible}
            onChange={(e) =>
              setNuevaEntrega({ ...nuevaEntrega, disponible: e.target.checked })
            }
            id="disponibleCheck"
          />
          <label className="form-check-label" htmlFor="disponibleCheck">
            Disponible
          </label>
        </div>

        <button type="submit" className="btn btn-dark">
          Crear Entrega
        </button>
      </form>

      <table className="table table-striped">
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
          {entregas.map((ent) => (
            <tr key={ent.id}>
              <td>{ent.id}</td>
              <td>{ent.pedido.id}</td>
              <td>{ent.pedido.cliente.username}</td>
              <td>
                <select
                  className="form-select"
                  value={ent.asignado_a ? ent.asignado_a.id : ''}
                  onChange={(e) =>
                    handleCambiarCampo(ent.id, 'asignado_a', repartidoresDemo.find(r => r.id === parseInt(e.target.value)) || null)
                  }
                >
                  <option value="">Sin asignar</option>
                  {repartidoresDemo.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.username}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className="form-select"
                  value={ent.estado}
                  onChange={(e) => handleCambiarCampo(ent.id, 'estado', e.target.value)}
                >
                  {ESTADOS_ENTREGA.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{ent.fecha_entrega || '-'}</td>
              <td>{ent.numero_seguimiento || '-'}</td>
              <td>{ent.vehiculo || '-'}</td>
              <td>
                <input
                  type="checkbox"
                  checked={ent.disponible}
                  onChange={(e) => handleCambiarCampo(ent.id, 'disponible', e.target.checked)}
                />
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleEliminarEntrega(ent.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {entregas.length === 0 && (
            <tr>
              <td colSpan="10" className="text-center">
                No hay entregas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Entregas;
