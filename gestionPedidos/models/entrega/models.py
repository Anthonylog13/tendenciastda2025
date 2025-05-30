from django.db import models
from models.pedido.models import Pedido
from django.contrib.auth.models import User

class Entrega(models.Model):
    ESTADOS_ENTREGA = [
        ('pendiente', 'Pendiente'),
        ('en_camino', 'En Camino'),
        ('entregado', 'Entregado'),
        ('problema', 'Problema'),
    ]
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE, related_name='entrega')
    asignado_a = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='entregas')
    estado = models.CharField(max_length=20, choices=ESTADOS_ENTREGA, default='pendiente')
    fecha_entrega = models.DateTimeField(null=True, blank=True)
    numero_seguimiento = models.CharField(max_length=100, blank=True, null=True)
    vehiculo = models.CharField(max_length=50, blank=True, null=True)
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return f"Entrega para el Pedido #{self.pedido.id}"