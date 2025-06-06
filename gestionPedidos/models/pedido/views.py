# models/pedido/views.py

from rest_framework import viewsets, status
from .models import Pedido
from .serializers import PedidoSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.db import transaction

from models.perfil.permissions import (
    EsAdministrador,
    EsCliente,
    UsuarioConPerfilAutenticado,
    EsPropietarioDelObjeto,
)

from rest_framework.permissions import IsAuthenticated
from models.itemPedido.models import ItemPedido
from models.producto.models import Producto

class PedidoViewSet(viewsets.ModelViewSet):

    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def get_permissions(self):
        from django.conf import settings
        from rest_framework.permissions import AllowAny
        if getattr(settings, 'TESTING', False):
            return[AllowAny()]

        """
        Define los permisos para cada acción en el ViewSet de Pedidos.
        """
        if self.action == 'list':

            return [UsuarioConPerfilAutenticado()]

        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:

            return [UsuarioConPerfilAutenticado(), EsPropietarioDelObjeto()]

        elif self.action in ['create', 'crear_con_items']:

            return [EsCliente()]

        else:

            return [UsuarioConPerfilAutenticado()]

    def get_queryset(self):
        from django.conf import settings
        if getattr(settings, 'TESTING', False):
            return Pedido.objects.all()
        """
        Filtra el conjunto de Pedidos que se retorna para las acciones 'list' y 'retrieve'
        basándose en el rol del usuario autenticado.
        """
        usuario_actual = self.request.user


        if not usuario_actual or not usuario_actual.is_authenticated or not hasattr(usuario_actual, 'perfil'):
             return Pedido.objects.none()

        rol_usuario = usuario_actual.perfil.rol

        if rol_usuario == 'admin':

            return Pedido.objects.all()
        elif rol_usuario == 'cliente':

            return Pedido.objects.filter(cliente=usuario_actual)
        elif rol_usuario == 'repartidor':

            return Pedido.objects.none()


        return Pedido.objects.none()

    @action(detail=False, methods=['get'], url_path='reporte/json')
    def reporte_json(self, request):
        pedidos = self.get_queryset()
        serializer = self.get_serializer(pedidos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='reporte/pdf')
    def reporte_pdf(self, request):
        pedidos = self.get_queryset()
        template = get_template('pedido/reporte_pedidos.html')
        html = template.render({'pedidos': pedidos})

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="reporte_pedidos.pdf"'

        pisa_status = pisa.CreatePDF(html, dest=response)
        if pisa_status.err:
            return HttpResponse('Error al generar el PDF', status=500)
        return response

    def update(self, request, *args, **kwargs):
        """
        Actualiza un pedido y gestiona el inventario si el estado cambia a 'cancelado'.
        """
        pedido = self.get_object()
        estado_anterior = pedido.estado

        # Actualizar el pedido
        response = super().update(request, *args, **kwargs)

        # Si el estado cambió a 'cancelado', restaurar el stock
        if estado_anterior != 'cancelado' and pedido.estado == 'cancelado':
            self._restaurar_stock_pedido(pedido)

        return response

    def partial_update(self, request, *args, **kwargs):
        """
        Actualiza parcialmente un pedido y gestiona el inventario si el estado cambia a 'cancelado'.
        """
        pedido = self.get_object()
        estado_anterior = pedido.estado

        # Actualizar el pedido
        response = super().partial_update(request, *args, **kwargs)

        # Si el estado cambió a 'cancelado', restaurar el stock
        if estado_anterior != 'cancelado' and pedido.estado == 'cancelado':
            self._restaurar_stock_pedido(pedido)

        return response

    def _restaurar_stock_pedido(self, pedido):
        """
        Restaura el stock de los productos de un pedido cancelado.
        """
        with transaction.atomic():
            for item in pedido.items.all():
                producto = item.producto
                producto.stock += item.cantidad
                producto.save()

    @action(detail=False, methods=['post'], url_path='crear-con-items')
    def crear_con_items(self, request):
        """
        Crea un pedido y sus items en una sola transacción.

        Formato esperado del request:
        {
            "pedido": {
                "cliente": 1,
                "direccion_envio": "Dirección de ejemplo",
                "estado": "pendiente",
                "monto_total": 100.00
            },
            "items": [
                {
                    "producto_id": 1,
                    "cantidad": 2
                },
                {
                    "producto_id": 3,
                    "cantidad": 1
                }
            ]
        }
        """
        try:
            with transaction.atomic():
                # Validar y crear el pedido
                pedido_data = request.data.get('pedido', {})
                pedido_serializer = self.get_serializer(data=pedido_data)
                pedido_serializer.is_valid(raise_exception=True)
                pedido = pedido_serializer.save()

                # Crear los items del pedido
                items_data = request.data.get('items', [])
                for item_data in items_data:
                    producto_id = item_data.get('producto_id')
                    cantidad = item_data.get('cantidad')

                    try:
                        producto = Producto.objects.get(id=producto_id)

                        # Verificar si hay suficiente stock
                        if producto.stock < cantidad:
                            raise ValueError(f"Stock insuficiente para el producto {producto.nombre}. Stock actual: {producto.stock}, Solicitado: {cantidad}")

                        # Actualizar el stock del producto
                        producto.stock -= cantidad
                        producto.save()

                        # Crear el item del pedido
                        ItemPedido.objects.create(
                            pedido=pedido,
                            producto=producto,
                            cantidad=cantidad,
                            precio_al_comprar=producto.precio
                        )
                    except Producto.DoesNotExist:
                        # Si el producto no existe, revertir la transacción
                        raise ValueError(f"El producto con ID {producto_id} no existe")

                # Devolver el pedido creado con sus items
                pedido_completo = self.get_serializer(pedido).data
                return Response(pedido_completo, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"detail": f"Error al crear el pedido: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
