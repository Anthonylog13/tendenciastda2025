from rest_framework import serializers
from .models import Pedido
from ..itemPedido.serializers import ItemPedidoSerializer
from ..perfil.serializers import PerfilUsuarioSerializer
from django.contrib.auth.models import User

class PedidoSerializer(serializers.ModelSerializer):
    items = ItemPedidoSerializer(many=True, read_only=True)
    cliente_detalle = PerfilUsuarioSerializer(read_only=True, source='cliente.profile')
    cliente = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Pedido
        fields = ['id', 'cliente', 'cliente_detalle', 'fecha_pedido', 'estado', 'direccion_envio', 'monto_total', 'items']