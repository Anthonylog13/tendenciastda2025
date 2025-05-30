
from django.contrib import admin
from django.urls import path, include
from models.pedido.views import PedidoViewSet
from models.entrega.views import EntregaViewSet
from models.itemPedido.views import ItemPedidoViewSet
from models.perfil.views import PerfilUsuarioViewSet
from models.producto.views import ProductoViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from models.perfil.views import RegistroAPIView

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

router = routers.DefaultRouter()
router.register(r'entregas', EntregaViewSet, basename='entrega')
router.register(r'items-pedido', ItemPedidoViewSet, basename='itempedido')
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'perfiles', PerfilUsuarioViewSet, basename='perfilusuario')
router.register(r'productos', ProductoViewSet, basename='producto')

schema_view = get_schema_view(
    openapi.Info(
        title="Documentacion API Gestión de Pedidos",
        default_version="v1.0",
        description="Documentación para la API de Gestión de Pedidos",
        terms_of_service="https://www.google.com/policies/terms",
        contact=openapi.Contact(email="contact@management.local"),
        license=openapi.License(name="BDS license"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/registro/', RegistroAPIView.as_view(), name='registro_usuario'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui' ),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
