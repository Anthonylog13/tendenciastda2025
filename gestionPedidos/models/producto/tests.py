import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Producto

@pytest.fixture
def api_cliente():
    return APIClient()

@pytest.fixture
def crear_producto():
    return Producto.objects.create(
        nombre='Prodcto Test',
        descripcion='Descripcion Test',
        precio=10000,
        stock=10
    )

@pytest.mark.django_db
def test_crear_producto(api_cliente):
    url=reverse('producto-list')
    data={
        "nombre":"Producto prueba",
        "descripcion":"Descripcion prueba",
        "precio":20000,
        "stock":5
    }
    response=api_cliente.post(url, data, format='json')
    assert response.status_code==201
    assert response.data['nombre']==data["nombre"]
    assert response.data['descripcion']==data["descripcion"]
    assert response.data['precio']==str(data["precio"]) + ".00"
    assert response.data['stock']==data["stock"]

@pytest.mark.django_db
def test_listar_productos(api_cliente, crear_producto):
    url = reverse('producto-list')
    response=api_cliente.get(url)
    assert response.status_code==200
    assert response.data[0]['nombre']==crear_producto.nombre

@pytest.mark.django_db
def test_obtener_producto(api_cliente, crear_producto):
    url =reverse('producto-detail', args=[crear_producto.id])
    response=api_cliente.get(url)
    assert response.status_code==200
    assert response.data['nombre']==crear_producto.nombre
    assert response.data['descripcion']==crear_producto.descripcion

@pytest.mark.django_db
def test_actualizar_producto(api_cliente, crear_producto):
    url = reverse('producto-detail', args=[crear_producto.id])
    data={
        "nombre":"Producto actualizado",
        "descripcion":"Descripcion actualizada",
        "precio":15500,
        "stock":20
    }
    response=api_cliente.put(url, data, format='json')
    assert response.status_code==200
    assert response.data['nombre']==data["nombre"]

@pytest.mark.django_db
def test_eliminar_producto(api_cliente, crear_producto):
    url = reverse('producto-detail', args=[crear_producto.id])
    response=api_cliente.delete(url)
    assert response.status_code==204
    assert not Producto.objects.filter(id=crear_producto.id).exists()