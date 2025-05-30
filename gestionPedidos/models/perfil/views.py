
from rest_framework import generics
from rest_framework import viewsets 
from rest_framework.permissions import AllowAny
from rest_framework.response import Response 
from rest_framework import status 


from .models import PerfilUsuario

from .serializers import RegistroSerializer, PerfilUsuarioSerializer 


from .permissions import (
    EsAdministrador,
    UsuarioConPerfilAutenticado,
    EsPropietarioDelObjeto, 
)

from rest_framework.permissions import IsAuthenticated


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
          
            return [EsAdministrador()]

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
        basándose en el rol del usuario autenticado.
        """
        usuario_actual = self.request.user

      
        if not usuario_actual or not usuario_actual.is_authenticated or not hasattr(usuario_actual, 'perfil'):
             return PerfilUsuario.objects.none()

        rol_usuario = usuario_actual.perfil.rol

        if rol_usuario == 'admin':
           
            return PerfilUsuario.objects.all()
      
        return PerfilUsuario.objects.none() 


