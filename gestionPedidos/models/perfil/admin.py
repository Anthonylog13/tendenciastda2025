from django.contrib import admin
from .models import PerfilUsuario

@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'rol', 'telefono')
    list_filter = ('rol',)
    search_fields = ('usuario__username', 'telefono')