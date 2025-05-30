from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings

def enviar_notificacion_entrega(entrega):
    cliente = entrega.pedido.cliente
    email_cliente = cliente.email

    if not email_cliente:
        print("Cliente sin correo electrónico.")
        return

    asunto = f"Estado de tu entrega del pedido #{entrega.pedido.id}"

    mensaje_html = render_to_string('emails/notificacionEstado.html', {
        'cliente': {
            'nombre': cliente.get_full_name() or cliente.username,
            'email': cliente.email,
            'telefono': getattr(cliente.perfil, 'telefono', 'No proporcionado'),
        },
        'estado': entrega.estado,
        'fecha_pedido': entrega.pedido.fecha_pedido.strftime('%d/%m/%Y %H:%M'),
        'direccion': entrega.pedido.direccion_envio,
        'monto_total': entrega.pedido.monto_total,
    })

    email = EmailMessage(
        subject=asunto,
        body=mensaje_html,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email_cliente],
    )
    email.content_subtype = 'html'

    try:
        email.send()
        print(f"Correo HTML enviado a {email_cliente}")
    except Exception as e:
        print(f"Error al enviar correo: {e}")
