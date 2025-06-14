# Generated by Django 5.1.7 on 2025-05-08 01:59

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('pedido', '0003_remove_pedido_descripcion_remove_pedido_direccion_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Entrega',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('estado', models.CharField(choices=[('pendiente', 'Pendiente'), ('en_camino', 'En Camino'), ('entregado', 'Entregado'), ('problema', 'Problema')], default='pendiente', max_length=20)),
                ('fecha_entrega', models.DateTimeField(blank=True, null=True)),
                ('numero_seguimiento', models.CharField(blank=True, max_length=100, null=True)),
                ('vehiculo', models.CharField(blank=True, max_length=50, null=True)),
                ('disponible', models.BooleanField(default=True)),
                ('asignado_a', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='entregas', to=settings.AUTH_USER_MODEL)),
                ('pedido', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='entrega', to='pedido.pedido')),
            ],
        ),
    ]
