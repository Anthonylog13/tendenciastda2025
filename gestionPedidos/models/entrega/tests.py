import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth.models import User
from models.pedido.models import Pedido
from models.entrega.models import Entrega

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def crear_entrega(crear_pedido, crear_cliente):
    return Entrega.objects.create(
        pedido=crear_pedido,
        asignado_a=crear_cliente,
        estado='pendiente',
        fecha_entrega=None,
        numero_seguimiento='123456',
        vehiculo='Camioneta',
        disponible=True
    )

@pytest.fixture
def crear_pedido(crear_cliente):
    return Pedido.objects.create(
        cliente=crear_cliente,
        estado='pendiente',
        direccion_envio='San Juan Oriental',
        monto_total=1000.00
    )

@pytest.fixture
def crear_cliente():
    user = User.objects.create_user(username='testuser', password='testpassword')
    return user

@pytest.mark.django_db
def test_crear_entrega(api_client, crear_pedido, crear_cliente):
    url=reverse('entrega-list')
    data={
        "pedido": crear_pedido.id,
        "asignado_a": crear_cliente.id,
        "estado": "pendiente",
        "fecha_entrega": None,
        "numero_seguimiento": "123456",
        "vehiculo": "Camioneta",
        "disponible": True
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == 201

@pytest.mark.django_db
def test_listar_entregas(api_client, crear_pedido, crear_cliente):
    url = reverse('entrega-list')
    data = {
        "pedido": crear_pedido.id,
        "asignado_a": crear_cliente.id,
        "estado": "pendiente",
        "fecha_entrega": None,
        "numero_seguimiento": "123456",
        "vehiculo": "Camioneta",
        "disponible": True
    }
    api_client.post(url, data, format='json')
    response = api_client.get(url)
    assert response.status_code == 200

@pytest.mark.django_db
def test_actualizar_entrega(api_client, crear_entrega,crear_pedido, crear_cliente):
    url = reverse('entrega-detail', args=[crear_entrega.id])
    data = {
        "pedido": crear_pedido.id,
        "asignado_a": crear_cliente.id,
        "estado": "entregado",
        "fecha_entrega": None,
        "numero_seguimiento": "123456",
        "vehiculo": "Camioneta",
        "disponible": True
    }
    response = api_client.put(url, data, format='json')
    assert response.status_code == 200
    assert response.data['estado'] == 'entregado'

@pytest.mark.django_db
def test_eliminar_entrega(api_client, crear_entrega):
    url = reverse('entrega-detail', args=[crear_entrega.id])
    response = api_client.delete(url)
    assert response.status_code == 204
    assert not Entrega.objects.filter(id=crear_entrega.id).exists()