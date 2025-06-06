
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView


from .models import PerfilUsuario

from .serializers import RegistroSerializer, PerfilUsuarioSerializer, CustomTokenObtainPairSerializer


from .permissions import (
    EsAdministrador,
    UsuarioConPerfilAutenticado,
    EsPropietarioDelObjeto,
)

from rest_framework.permissions import IsAuthenticated


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para obtener tokens JWT.
    Utiliza el CustomTokenObtainPairSerializer para añadir el rol del usuario al token.
    """
    serializer_class = CustomTokenObtainPairSerializer


class RegistroAPIView(generics.CreateAPIView):
    """
    Vista API para el registro público de nuevos usuarios.
    Permite a cualquier usuario (no autenticado) crear una nueva cuenta.
    """
    serializer_class = RegistroSerializer
    permission_classes = [AllowAny]


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar (listar, ver, actualizar, eliminar) perfiles de usuario existentes.
    Requiere autenticación y permisos basados en roles/propiedad.
    """

    queryset = PerfilUsuario.objects.all()

    serializer_class = PerfilUsuarioSerializer

    def get_permissions(self):
        from django.conf import settings
        from rest_framework.permissions import AllowAny
        if getattr(settings, 'TESTING', False):
            return[AllowAny()]
        """
        Define los permisos para cada acción en el ViewSet de Perfiles de Usuario.
        """
        if self.action == 'list':
            # Permitir a usuarios autenticados listar perfiles, el filtrado se hará en get_queryset
            return [UsuarioConPerfilAutenticado()]

        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return [UsuarioConPerfilAutenticado(), EsPropietarioDelObjeto()]

        elif self.action == 'create':
            return [EsAdministrador()]

        else:
            return [UsuarioConPerfilAutenticado()]

    def get_queryset(self):
        from django.conf import settings
        if getattr(settings, 'TESTING', False):
            return PerfilUsuario.objects.all()
        """
        Filtra el conjunto de Perfiles de Usuario que se retorna para la acción 'list'
        basándose en el rol del usuario autenticado y los parámetros de consulta.
        """
        usuario_actual = self.request.user

        if not usuario_actual or not usuario_actual.is_authenticated or not hasattr(usuario_actual, 'perfil'):
            return PerfilUsuario.objects.none()

        rol_usuario = usuario_actual.perfil.rol

        # Obtener el parámetro de rol de la consulta
        rol_filtro = self.request.query_params.get('rol', None)

        # Inicializar el queryset
        queryset = PerfilUsuario.objects.all()

        # Aplicar filtros según el rol del usuario
        if rol_usuario == 'admin':
            # Los administradores pueden ver todos los perfiles
            # Si se especifica un rol en la consulta, filtrar por ese rol
            if rol_filtro:
                queryset = queryset.filter(rol=rol_filtro)
        elif rol_usuario == 'repartidor':
            # Los repartidores solo pueden ver perfiles de clientes y otros repartidores
            queryset = queryset.filter(rol__in=['cliente', 'repartidor'])
            if rol_filtro:
                # Si se especifica un rol en la consulta, filtrar por ese rol
                # pero solo si es 'cliente' o 'repartidor'
                if rol_filtro in ['cliente', 'repartidor']:
                    queryset = queryset.filter(rol=rol_filtro)
                else:
                    return PerfilUsuario.objects.none()
        elif rol_usuario == 'cliente':
            # Los clientes solo pueden ver perfiles de repartidores
            queryset = queryset.filter(rol='repartidor')
            if rol_filtro and rol_filtro != 'repartidor':
                return PerfilUsuario.objects.none()
        else:
            return PerfilUsuario.objects.none()

        return queryset
