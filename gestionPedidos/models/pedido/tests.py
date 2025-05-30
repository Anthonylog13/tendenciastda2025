import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Pedido
from django.contrib.auth.models import User
from models.producto.models import Producto

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def crear_cliente():
    user = User.objects.create_user(username='testuser', password='testpassword')
    return user

@pytest.fixture
def crear_item_pedido(crear_cliente):
    return Pedido.objects.create(
        cliente=crear_cliente,
        estado='pendiente',
        direccion_envio='San Juan Oriental',
        monto_total=1000.00
    )

@pytest.mark.django_db
def test_crear_pedido(api_client, crear_cliente):   
    url = reverse('pedido-list')
    data = {
        "cliente": crear_cliente.id,
        "estado": "cancelado",
        "direccion_envio": "Av. Carabobo",
        "monto_total": 50000.00
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == 201

@pytest.mark.django_db
def test_listar_pedidos(api_client):
    url = reverse('pedido-list')
    response = api_client.get(url)
    assert response.status_code == 200

@pytest.mark.django_db
def test_actualizar_pedido(api_client, crear_item_pedido):
    url = reverse('pedido-detail', args=[crear_item_pedido.id])
    data = {
        "cliente": crear_item_pedido.id,
        "estado": "cancelado",
        "direccion_envio": "Ayacucho con Palo",
        "monto_total": 2000.00
    }
    response = api_client.put(url, data, format='json')
    assert response.status_code == 200
    assert response.data['estado'] == data['estado']

@pytest.mark.django_db
def test_eliminar_pedido(api_client, crear_item_pedido):
    url = reverse('pedido-detail', args=[crear_item_pedido.id])
    response = api_client.delete(url)
    assert response.status_code == 204
    assert not Pedido.objects.filter(id=crear_item_pedido.id).exists()
