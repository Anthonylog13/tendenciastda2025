from django.db import models
from models.producto.models import Producto
from models.pedido.models import Pedido

class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    precio_al_comprar = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} en el Pedido #{self.pedido.id}"

    def save(self, *args, **kwargs):
        self.precio_al_comprar = self.producto.precio
        super().save(*args, **kwargs)