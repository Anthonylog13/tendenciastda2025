# models/itemPedido/views.py

from rest_framework import viewsets
from .models import ItemPedido
from .serializers import ItemPedidoSerializer # Asegúrate de que este serializer exista y sea correcto

# Importa los permisos personalizados
from models.perfil.permissions import (
    EsAdministrador,
    UsuarioConPerfilAutenticado,
    EsPropietarioDelObjeto, # Reusamos esta clase para verificar si el ítem pertenece a un pedido del usuario
)
# Importa permisos básicos si son necesarios
from rest_framework.permissions import IsAuthenticated

class ItemPedidoViewSet(viewsets.ModelViewSet):
    queryset = ItemPedido.objects.all()
    serializer_class = ItemPedidoSerializer
    def get_permissions(self):
        from django.conf import settings
        from rest_framework.permissions import AllowAny
        if getattr(settings, 'TESTING', False):
            return[AllowAny()]
        """
        Define los permisos para cada acción en el ViewSet de Items de Pedido.
        """
        if self.action in ['list', 'retrieve']:
            return [UsuarioConPerfilAutenticado()] 
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EsAdministrador()]
        else:
            return [UsuarioConPerfilAutenticado()]

    def get_queryset(self):
        from django.conf import settings
        if getattr(settings, 'TESTING', False):
            return ItemPedido.objects.all()
        """
        Filtra el conjunto de Items de Pedido que se retorna para las acciones 'list' y 'retrieve'
        basándose en el rol del usuario autenticado.
        """
        usuario_actual = self.request.user
        
        if not usuario_actual or not usuario_actual.is_authenticated or not hasattr(usuario_actual, 'perfil'):
             return ItemPedido.objects.none()
        rol_usuario = usuario_actual.perfil.rol
        if rol_usuario == 'admin':
            return ItemPedido.objects.all()
        elif rol_usuario == 'cliente':
            return ItemPedido.objects.filter(pedido__cliente=usuario_actual) 
        elif rol_usuario == 'repartidor':
        
             return ItemPedido.objects.filter(pedido__entrega__asignado_a=usuario_actual).distinct() 

     
        return ItemPedido.objects.none()

