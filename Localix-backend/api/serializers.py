from rest_framework import serializers
from productos.models import Producto, VarianteProducto, ColorProducto, CaracteristicaProducto, ImagenProducto
from categorias.models import CategoriaProducto

class PublicCategoriaSerializer(serializers.ModelSerializer):
    """
    Serializer público para categorías
    """
    cantidad_productos = serializers.ReadOnlyField()
    
    class Meta:
        model = CategoriaProducto
        fields = [
            'id', 'nombre', 'slug', 'descripcion', 
            'imagen', 'activa', 'orden', 'cantidad_productos'
        ]

class PublicImagenProductoSerializer(serializers.ModelSerializer):
    """
    Serializer para imágenes de productos
    """
    url_imagen = serializers.ReadOnlyField()
    
    class Meta:
        model = ImagenProducto
        fields = ['id', 'imagen', 'orden', 'es_principal', 'url_imagen']

class PublicColorProductoSerializer(serializers.ModelSerializer):
    """
    Serializer para colores de productos
    """
    imagenes = PublicImagenProductoSerializer(many=True, read_only=True)
    disponible_para_venta = serializers.ReadOnlyField()
    
    class Meta:
        model = ColorProducto
        fields = [
            'id', 'nombre', 'hex_code', 'stock', 'orden', 
            'activo', 'disponible_para_venta', 'imagenes'
        ]

class PublicVarianteProductoSerializer(serializers.ModelSerializer):
    """
    Serializer para variantes de productos
    """
    precio_final = serializers.ReadOnlyField()
    
    class Meta:
        model = VarianteProducto
        fields = [
            'id', 'nombre', 'valor', 'sku', 'precio_extra', 
            'stock', 'orden', 'precio_final'
        ]

class PublicCaracteristicaProductoSerializer(serializers.ModelSerializer):
    """
    Serializer para características de productos
    """
    class Meta:
        model = CaracteristicaProducto
        fields = ['id', 'nombre', 'valor', 'orden', 'activo']

class PublicProductoListSerializer(serializers.ModelSerializer):
    """
    Serializer para lista de productos (vista resumida)
    """
    categoria = PublicCategoriaSerializer(read_only=True)
    margen_ganancia = serializers.ReadOnlyField()
    disponible_para_venta = serializers.ReadOnlyField()
    precio_display = serializers.SerializerMethodField()
    precio_comparacion_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = [
            'id', 'sku', 'nombre', 'slug', 'imagen_principal',
            'descripcion_corta', 'tipo', 'estado', 'categoria',
            'precio', 'precio_comparacion', 'precio_display', 
            'precio_comparacion_display', 'stock', 'vendidos',
            'margen_ganancia', 'disponible_para_venta',
            'fecha_publicacion'
        ]
    
    def get_precio_display(self, obj):
        """Convierte precio de centavos a formato decimal"""
        return obj.precio / 100 if obj.precio else 0
    
    def get_precio_comparacion_display(self, obj):
        """Convierte precio de comparación de centavos a formato decimal"""
        return obj.precio_comparacion / 100 if obj.precio_comparacion else None

class PublicProductoDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para detalle completo de productos
    """
    categoria = PublicCategoriaSerializer(read_only=True)
    variantes = PublicVarianteProductoSerializer(many=True, read_only=True)
    colores = PublicColorProductoSerializer(many=True, read_only=True)
    caracteristicas = PublicCaracteristicaProductoSerializer(many=True, read_only=True)
    margen_ganancia = serializers.ReadOnlyField()
    disponible_para_venta = serializers.ReadOnlyField()
    precio_display = serializers.SerializerMethodField()
    precio_comparacion_display = serializers.SerializerMethodField()
    costo_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = [
            'id', 'sku', 'nombre', 'slug', 'imagen_principal',
            'descripcion_corta', 'descripcion_larga', 'tipo', 'estado',
            'categoria', 'precio', 'precio_comparacion', 'costo',
            'precio_display', 'precio_comparacion_display', 'costo_display',
            'gestion_stock', 'stock', 'stock_minimo', 'vendidos',
            'peso', 'dimensiones', 'margen_ganancia', 'disponible_para_venta',
            'fecha_creacion', 'fecha_publicacion', 'fecha_actualizacion',
            'variantes', 'colores', 'caracteristicas'
        ]
    
    def get_precio_display(self, obj):
        """Convierte precio de centavos a formato decimal"""
        return obj.precio / 100 if obj.precio else 0
    
    def get_precio_comparacion_display(self, obj):
        """Convierte precio de comparación de centavos a formato decimal"""
        return obj.precio_comparacion / 100 if obj.precio_comparacion else None
    
    def get_costo_display(self, obj):
        """Convierte costo de centavos a formato decimal"""
        return obj.costo / 100 if obj.costo else 0