from django.contrib import admin
from .models import ItemPedido

@admin.register(ItemPedido)
class ItemPedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'pedido', 'producto', 'cantidad', 'precio_al_comprar')
    list_filter = ('pedido',)
    search_fields = ('pedido__id', 'producto__nombre')