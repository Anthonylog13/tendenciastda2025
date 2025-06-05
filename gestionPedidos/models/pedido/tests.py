import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Pedido
from django.contrib.auth.models import User
from models.producto.models import Producto
from models.itemPedido.models import ItemPedido

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def crear_cliente():
    user = User.objects.create_user(username='testuser', password='testpassword')
    return user

@pytest.fixture
def crear_producto():
    return Producto.objects.create(
        nombre='Producto de prueba',
        descripcion='Descripción de prueba',
        precio=100.00,
        stock=10
    )

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

@pytest.mark.django_db
def test_crear_pedido_reduce_stock(api_client, crear_cliente, crear_producto):
    """Test that creating an order reduces the product stock."""
    url = reverse('pedido-crear-con-items')

    # Stock inicial
    stock_inicial = crear_producto.stock

    data = {
        "pedido": {
            "cliente": crear_cliente.id,
            "estado": "pendiente",
            "direccion_envio": "Dirección de prueba",
            "monto_total": 200.00
        },
        "items": [
            {
                "producto_id": crear_producto.id,
                "cantidad": 2
            }
        ]
    }

    response = api_client.post(url, data, format='json')
    assert response.status_code == 201

    # Verificar que el stock se redujo
    crear_producto.refresh_from_db()
    assert crear_producto.stock == stock_inicial - 2

@pytest.mark.django_db
def test_cancelar_pedido_restaura_stock(api_client, crear_cliente, crear_producto):
    """Test that canceling an order restores the product stock."""
    # Crear pedido
    url_crear = reverse('pedido-crear-con-items')
    data_crear = {
        "pedido": {
            "cliente": crear_cliente.id,
            "estado": "pendiente",
            "direccion_envio": "Dirección de prueba",
            "monto_total": 200.00
        },
        "items": [
            {
                "producto_id": crear_producto.id,
                "cantidad": 3
            }
        ]
    }

    response_crear = api_client.post(url_crear, data_crear, format='json')
    assert response_crear.status_code == 201

    # Stock después de crear el pedido
    crear_producto.refresh_from_db()
    stock_despues_crear = crear_producto.stock

    # Cancelar pedido
    pedido_id = response_crear.data['id']
    url_actualizar = reverse('pedido-detail', args=[pedido_id])
    data_actualizar = {
        "cliente": crear_cliente.id,
        "estado": "cancelado",
        "direccion_envio": "Dirección de prueba",
        "monto_total": 200.00
    }

    response_actualizar = api_client.put(url_actualizar, data_actualizar, format='json')
    assert response_actualizar.status_code == 200

    # Verificar que el stock se restauró
    crear_producto.refresh_from_db()
    assert crear_producto.stock == stock_despues_crear + 3

@pytest.mark.django_db
def test_crear_pedido_stock_insuficiente(api_client, crear_cliente, crear_producto):
    """Test that trying to create an order with insufficient stock raises an error."""
    url = reverse('pedido-crear-con-items')

    # Intentar crear un pedido con más unidades que el stock disponible
    data = {
        "pedido": {
            "cliente": crear_cliente.id,
            "estado": "pendiente",
            "direccion_envio": "Dirección de prueba",
            "monto_total": 1500.00
        },
        "items": [
            {
                "producto_id": crear_producto.id,
                "cantidad": 15  # Stock es solo 10
            }
        ]
    }

    response = api_client.post(url, data, format='json')
    assert response.status_code == 400
    assert "Stock insuficiente" in response.data['detail']
