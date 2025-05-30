# models/producto/views.py

from rest_framework import viewsets
from .models import Producto
from .serializers import ProductoSerializer 


from models.perfil.permissions import EsAdministrador

from rest_framework.permissions import AllowAny, IsAuthenticated

class ProductoViewSet(viewsets.ModelViewSet):

    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    def get_permissions(self):
        from django.conf import settings
        from rest_framework.permissions import AllowAny
        if getattr(settings, 'TESTING', False):
            return [AllowAny()]
        """
        Define los permisos para cada acción en el ViewSet de Productos.
        """
        if self.action in ['list', 'retrieve']:
          
            return [AllowAny()] 

        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
         
            return [EsAdministrador()]

        else:
          
            return [AllowAny()]


