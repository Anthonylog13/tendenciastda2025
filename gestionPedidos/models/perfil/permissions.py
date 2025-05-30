

from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.contrib.auth import get_user_model


from .models import PerfilUsuario


Usuario = get_user_model()


class UsuarioConPerfilAutenticado(BasePermission):
    """
    Permiso para asegurar que el usuario está autenticado y tiene un perfil asociado.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            request.user.perfil
            return True
        except PerfilUsuario.DoesNotExist:
            print(f"Usuario {request.user.username} autenticado pero sin PerfilUsuario.")
            return False
        except Exception as error:
            print(f"Error accediendo al perfil del usuario {request.user.username}: {error}")
            return False

class EsAdministrador(UsuarioConPerfilAutenticado):
    """ Permiso para permitir acceso solo a usuarios con rol 'admin'. """
    def has_permission(self, request, view):
        if not super().has_permission(request, view): return False
        return request.user.perfil.rol == 'admin'

class EsCliente(UsuarioConPerfilAutenticado):
    """ Permiso para permitir acceso solo a usuarios con rol 'cliente'. """
    def has_permission(self, request, view):
        if not super().has_permission(request, view): return False
        return request.user.perfil.rol == 'cliente'

class EsRepartidor(UsuarioConPerfilAutenticado):
    """ Permiso para permitir acceso solo a usuarios con rol 'repartidor'. """
    def has_permission(self, request, view):
        if not super().has_permission(request, view): return False
        return request.user.perfil.rol == 'repartidor'

class EsPropietarioDelObjeto(BasePermission):
    """
    Permiso a nivel de objeto: permite acceso si el usuario es el 'propietario' del objeto o es Admin.
    Verifica la propiedad intentando acceder a campos comunes como 'cliente', 'usuario_destino' o siguiendo relaciones (ej. obj.pedido.cliente).
    """
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated and hasattr(request.user, 'perfil') and request.user.perfil.rol == 'admin':
             return True
        try:
             if hasattr(obj, 'cliente') and obj.cliente == request.user:
                 return True
        except Exception: pass 

        try:
             if hasattr(obj, 'usuario') and obj.usuario == request.user:
                 return True
        except Exception: pass

        try:
             if hasattr(obj, 'usuario_destino') and obj.usuario_destino == request.user:
                 return True
        except Exception: pass

        try:
             if isinstance(obj, PerfilUsuario) and obj.usuario == request.user:
                  return True
        except Exception: pass

        try:
        
            if hasattr(obj, 'pedido') and hasattr(obj.pedido, 'cliente') and obj.pedido.cliente == request.user:
                return True
        except Exception: pass

        return False


class EsRepartidorAsignado(BasePermission):
    """
    Permiso a nivel de objeto: permite acceso si el usuario es el 'repartidor' asignado al objeto (Entrega) o es Admin.
    Asume que el objeto (obj) es una instancia de Entrega y tiene un campo 'asignado_a' que es un ForeignKey al modelo User.
    """
    def has_object_permission(self, request, view, obj):
    
        if request.user and request.user.is_authenticated and hasattr(request.user, 'perfil') and request.user.perfil.rol == 'admin':
             return True

   
        if hasattr(obj, 'asignado_a') and obj.asignado_a == request.user:
            return True

  
        return False

class EsAdminOPropietarioOOAsignado(BasePermission):
     """
     Permiso a nivel de objeto: permite acceso si el usuario es Admin, el propietario del objeto,
     o el repartidor asignado (si aplica al objeto).
     Combina lógicas de EsAdministrador, EsPropietarioDelObjeto y EsRepartidorAsignado.
     """
     def has_object_permission(self, request, view, obj):
         if request.user and request.user.is_authenticated and hasattr(request.user, 'perfil') and request.user.perfil.rol == 'admin':
              return True
    
         if EsPropietarioDelObjeto().has_object_permission(request, view, obj):
             return True

         if EsRepartidorAsignado().has_object_permission(request, view, obj):
             return True

         return False