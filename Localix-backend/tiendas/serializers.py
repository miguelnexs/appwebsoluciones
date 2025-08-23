from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TiendaVirtual, ConfiguracionTienda
from productos.models import Producto
from categorias.models import CategoriaProducto

User = get_user_model()

class TiendaVirtualSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo TiendaVirtual
    """
    total_productos = serializers.ReadOnlyField()
    total_categorias = serializers.ReadOnlyField()
    url_tienda = serializers.ReadOnlyField()
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = TiendaVirtual
        fields = [
            'id', 'usuario', 'usuario_nombre', 'nombre_tienda', 'slug', 'descripcion',
            'logo', 'favicon', 'imagen_banner', 'colores_tema', 'email_contacto',
            'telefono', 'direccion', 'facebook_url', 'instagram_url', 'twitter_url',
            'whatsapp', 'configuracion_pagos', 'configuracion_envios', 'meta_titulo',
            'meta_descripcion', 'estado', 'plan', 'mostrar_precios', 'permitir_compras',
            'mostrar_stock', 'dominio_personalizado', 'fecha_creacion', 'fecha_actualizacion',
            'fecha_ultima_actividad', 'total_productos', 'total_categorias', 'url_tienda'
        ]
        read_only_fields = ['usuario', 'fecha_creacion', 'fecha_actualizacion']
    
    def create(self, validated_data):
        # Asignar el usuario actual
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_slug(self, value):
        """
        Validar que el slug sea único
        """
        if self.instance:
            # Si estamos actualizando, excluir la instancia actual
            if TiendaVirtual.objects.filter(slug=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Este slug ya está en uso.")
        else:
            # Si estamos creando, verificar que no exista
            if TiendaVirtual.objects.filter(slug=value).exists():
                raise serializers.ValidationError("Este slug ya está en uso.")
        return value
    
    def validate_nombre_tienda(self, value):
        """
        Validar el nombre de la tienda
        """
        if len(value.strip()) < 3:
            raise serializers.ValidationError("El nombre de la tienda debe tener al menos 3 caracteres.")
        return value.strip()

class TiendaVirtualPublicaSerializer(serializers.ModelSerializer):
    """
    Serializer público para mostrar información básica de la tienda
    """
    total_productos = serializers.ReadOnlyField()
    total_categorias = serializers.ReadOnlyField()
    
    class Meta:
        model = TiendaVirtual
        fields = [
            'id', 'nombre_tienda', 'slug', 'descripcion', 'logo', 'favicon',
            'imagen_banner', 'colores_tema', 'email_contacto', 'telefono',
            'direccion', 'facebook_url', 'instagram_url', 'twitter_url',
            'whatsapp', 'meta_titulo', 'meta_descripcion', 'mostrar_precios',
            'permitir_compras', 'mostrar_stock', 'total_productos', 'total_categorias'
        ]

class ConfiguracionTiendaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo ConfiguracionTienda
    """
    class Meta:
        model = ConfiguracionTienda
        fields = '__all__'
        read_only_fields = ['tienda']

class TiendaVirtualConProductosSerializer(serializers.ModelSerializer):
    """
    Serializer que incluye productos y categorías de la tienda
    """
    productos = serializers.SerializerMethodField()
    categorias = serializers.SerializerMethodField()
    total_productos = serializers.ReadOnlyField()
    total_categorias = serializers.ReadOnlyField()
    
    class Meta:
        model = TiendaVirtual
        fields = [
            'id', 'nombre_tienda', 'slug', 'descripcion', 'logo', 'favicon',
            'imagen_banner', 'colores_tema', 'email_contacto', 'telefono',
            'direccion', 'facebook_url', 'instagram_url', 'twitter_url',
            'whatsapp', 'meta_titulo', 'meta_descripcion', 'mostrar_precios',
            'permitir_compras', 'mostrar_stock', 'total_productos', 'total_categorias',
            'productos', 'categorias'
        ]
    
    def get_productos(self, obj):
        """
        Obtener productos activos de la tienda
        """
        from productos.serializers import ProductoSerializer
        productos = obj.productos_activos[:12]  # Limitar a 12 productos
        return ProductoSerializer(productos, many=True, context=self.context).data
    
    def get_categorias(self, obj):
        """
        Obtener categorías activas de la tienda
        """
        from categorias.serializers import CategoriaSerializer
        categorias = obj.categorias_activas
        return CategoriaSerializer(categorias, many=True, context=self.context).data

class TiendaVirtualResumenSerializer(serializers.ModelSerializer):
    """
    Serializer con información resumida de la tienda
    """
    total_productos = serializers.ReadOnlyField()
    total_categorias = serializers.ReadOnlyField()
    url_tienda = serializers.ReadOnlyField()
    
    class Meta:
        model = TiendaVirtual
        fields = [
            'id', 'nombre_tienda', 'slug', 'descripcion', 'logo',
            'estado', 'plan', 'total_productos', 'total_categorias',
            'url_tienda', 'fecha_creacion', 'fecha_actualizacion'
        ]

class CrearTiendaVirtualSerializer(serializers.ModelSerializer):
    """
    Serializer específico para crear una nueva tienda virtual
    """
    class Meta:
        model = TiendaVirtual
        fields = [
            'nombre_tienda', 'descripcion', 'email_contacto', 'telefono',
            'direccion', 'colores_tema', 'meta_titulo', 'meta_descripcion'
        ]
    
    def create(self, validated_data):
        # Asignar el usuario actual
        validated_data['usuario'] = self.context['request'].user
        
        # Crear la tienda
        tienda = super().create(validated_data)
        
        # Crear la configuración por defecto
        ConfiguracionTienda.objects.create(tienda=tienda)
        
        return tienda
    
    def validate(self, data):
        """
        Validar que el usuario no tenga ya una tienda
        """
        user = self.context['request'].user
        if hasattr(user, 'tienda_virtual'):
            raise serializers.ValidationError("Ya tienes una tienda virtual creada.")
        return data