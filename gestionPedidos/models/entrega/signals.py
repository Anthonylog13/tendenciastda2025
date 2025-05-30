from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Entrega
from .utils import enviar_notificacion_entrega

@receiver(post_save, sender=Entrega)
def notificar_cambio_estado(sender, instance, **kwargs):
    enviar_notificacion_entrega(instance)
