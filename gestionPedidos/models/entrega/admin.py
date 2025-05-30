from django.contrib import admin
from models.entrega.models import Entrega

@admin.register(Entrega)
class EntregaAdmin(admin.ModelAdmin):
    list_display = ('id', 'pedido', 'asignado_a', 'estado', 'fecha_entrega')
    list_filter = ('estado', 'asignado_a')
    search_fields = ('id', 'pedido__id', 'asignado_a__username', 'numero_seguimiento')
    date_hierarchy = 'fecha_entrega'
