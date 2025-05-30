
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from .models import PerfilUsuario

User = get_user_model()


class RegistroSerializer(serializers.ModelSerializer):
    """
    Serializer para el registro de nuevos usuarios.
    Maneja la creación del usuario (User) y su perfil (PerfilUsuario) asociado,
    incluyendo email (obligatorio), teléfono y dirección (opcionales),
    con validación de unicidad para username y email.
    """
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Ya existe un usuario con este correo electrónico.")]
    )

    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True) 
    direccion = serializers.CharField(style={'base_template': 'textarea.html'}, required=False, allow_blank=True) 
    class Meta:
        model = User 
        fields = ('username', 'password', 'email', 'telefono', 'direccion', 'id') 

    def create(self, validated_data):
        """
        Crea una nueva instancia de User y PerfilUsuario a partir de los datos validados.
        """
        telefono = validated_data.pop('telefono', '')
        direccion = validated_data.pop('direccion', '')
        password = validated_data.pop('password')
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data.get('email', '') 
        )

        user.set_password(password)
        user.save()

        perfil = PerfilUsuario.objects.create(
            usuario=user,
            rol='cliente', 
            telefono=telefono, 
            direccion=direccion
        )

        return user

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para la gestión (lectura/actualización) de Perfiles de Usuario.
    Incluye el campo 'direccion'.
    """
    username = serializers.CharField(read_only=True, source='usuario.username')
    email = serializers.EmailField(read_only=True, source='usuario.email')

    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='usuario',
        write_only=True,
    )

    class Meta:
        model = PerfilUsuario
        fields = ['id', 'usuario_id', 'username', 'email', 'rol', 'telefono', 'direccion']


