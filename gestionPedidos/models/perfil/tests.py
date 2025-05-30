import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from .models import PerfilUsuario
from django.contrib.auth.models import User

@pytest.fixture
def api_cliente():
    return APIClient()

@pytest.fixture
def crear_usuario():
    user = User.objects.create_user(username='testuser', password='testpassword')
    return user

@pytest.mark.django_db
def test_crear_perfil_usuario(api_cliente, crear_usuario):
    url = reverse('perfilusuario-list')
    data = {
        "usuario_id": crear_usuario.id,
        "rol": 'admin',
        "telefono": '987654321'
    }
    response = api_cliente.post(url, data, format='json')
    assert response.status_code == 201

@pytest.mark.django_db
def test_listar_perfil_usuario(api_cliente):
    url=reverse('perfilusuario-list')
    response=api_cliente.get(url)
    assert response.status_code == 200

@pytest.mark.django_db
def test_actualizar_perfil(api_cliente):
    user = User.objects.create_user(username='testuser', password='testpassword')
    perfil = PerfilUsuario.objects.create(usuario=user, rol='admin', telefono='987654321')
    url=reverse('perfilusuario-detail', args=[perfil.id])
    data = {
        "usuario_id": user.id,
        "rol": 'admin',
        "telefono": '123456789'
    }
    response=api_cliente.put(url, data, format='json')
    assert response.status_code == 200

@pytest.mark.django_db
def test_eliminar_perfil(api_cliente, crear_usuario):
    perfil = PerfilUsuario.objects.create(usuario=crear_usuario, rol='admin', telefono='987654321')
    url=reverse('perfilusuario-detail', args=[perfil.id])
    response=api_cliente.delete(url)
    assert response.status_code == 204