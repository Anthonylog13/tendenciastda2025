from django.contrib import admin
from .models import Pedido

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'fecha_pedido', 'estado', 'monto_total', 'direccion_envio')
    list_filter = ('estado', 'fecha_pedido')
    search_fields = ('id', 'cliente__username', 'direccion_envio')
    date_hierarchy = 'fecha_pedido'
