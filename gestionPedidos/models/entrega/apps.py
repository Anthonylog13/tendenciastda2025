from django.apps import AppConfig


class EntregaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'models.entrega'

    def ready(self):
        import models.entrega.signals

