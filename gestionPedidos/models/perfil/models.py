from django.contrib.auth.models import User
from django.db import models

class PerfilUsuario(models.Model):
    ROLES_USUARIO = [
        ('admin', 'Administrador'),
        ('cliente', 'Cliente'),
        ('repartidor', 'Repartidor'),
    ]
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=10, choices=ROLES_USUARIO, default='cliente')
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True) 

    def __str__(self):
        return self.usuario.username
