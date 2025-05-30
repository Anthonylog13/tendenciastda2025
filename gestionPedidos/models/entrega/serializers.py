from rest_framework import serializers
from ..pedido.models import Pedido
from .models import Entrega
from ..pedido.serializers import PedidoSerializer
from ..perfil.serializers import PerfilUsuarioSerializer
from django.contrib.auth.models import User

class EntregaSerializer(serializers.ModelSerializer):
    pedido = serializers.PrimaryKeyRelatedField(queryset=Pedido.objects.all())
    pedido_detalle = PedidoSerializer(read_only=True, source='pedido')
    repartidor_detalle = PerfilUsuarioSerializer(read_only=True, source='asignado_a.profile')
    asignado_a = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Entrega
        fields = ['id', 'pedido','pedido_detalle', 'asignado_a', 'repartidor_detalle', 'estado', 'fecha_entrega', 'numero_seguimiento', 'vehiculo', 'disponible']