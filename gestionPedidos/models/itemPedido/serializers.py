from rest_framework import serializers
from .models import ItemPedido
from ..producto.serializers import ProductoSerializer 
from ..producto.models import Producto

class ItemPedidoSerializer(serializers.ModelSerializer):
    producto = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.all())

    producto_detalle = ProductoSerializer(read_only=True, source='producto')
    producto_id = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.all(), source='producto', write_only=True)

    class Meta:
        model = ItemPedido
        fields = ['id', 'pedido', 'producto','producto_detalle', 'producto_id', 'cantidad', 'precio_al_comprar']