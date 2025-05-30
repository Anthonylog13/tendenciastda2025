import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from .models import ItemPedido
from models.producto.models import Producto
from models.pedido.models import Pedido
from django.contrib.auth.models import User

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def crear_cliente():
    user = User.objects.create_user(username='testuser', password='testpassword')
    return user

@pytest.fixture
def crear_pedido(crear_cliente):
   return Pedido.objects.create(
        cliente=crear_cliente,
        estado='pendiente',
        direccion_envio='San Juan Oriental',
        monto_total=1000.00
    )

@pytest.fixture
def crear_producto():
    return Producto.objects.create(
        nombre='Producto Test',
        descripcion='Descripcion Test',
        precio=10000,
        stock=10
    )

@pytest.mark.django_db
def test_crear_item_pedido(api_client, crear_pedido, crear_producto):
    url = reverse('itempedido-list')
    data = {
        "pedido": crear_pedido.id,
        "producto": crear_producto.id,
        "producto_id": crear_producto.id,
        "cantidad": 2,
        "precio_al_comprar": 10000
    }
    response = api_client.post(url, data, format='json')
    print(response.data)
    assert response.status_code == 201
    assert response.data['pedido'] == crear_pedido.id
    assert response.data['producto'] == crear_producto.id
    assert response.data['cantidad'] == 2

@pytest.mark.django_db
def test_listar_items_pedido(api_client, crear_pedido, crear_producto):
    url = reverse('itempedido-list')
    ItemPedido.objects.create(
        pedido=crear_pedido,
        producto=crear_producto,
        cantidad=2,
        precio_al_comprar=10000
    )
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.data) > 0
    assert response.data[0]['pedido'] == crear_pedido.id
    assert response.data[0]['producto'] == crear_producto.id

@pytest.mark.django_db
def test_actualizar_item_pedido(api_client, crear_pedido, crear_producto):
    item = ItemPedido.objects.create(
        pedido=crear_pedido,
        producto=crear_producto,
        cantidad=2,
        precio_al_comprar=10000
    )
    url = reverse('itempedido-detail', args=[item.id])
    data = {
        "cantidad": 3
    }
    response = api_client.patch(url, data, format='json')
    assert response.status_code == 200
    item.refresh_from_db()
    assert item.cantidad == 3

@pytest.mark.django_db
def test_eliminar_item_pedido(api_client, crear_pedido, crear_producto):
    item = ItemPedido.objects.create(
        pedido=crear_pedido,
        producto=crear_producto,
        cantidad=2,
        precio_al_comprar=10000
    )
    url = reverse('itempedido-detail', args=[item.id])
    response = api_client.delete(url)
    assert response.status_code == 204
    assert ItemPedido.objects.filter(id=item.id).count() == 0