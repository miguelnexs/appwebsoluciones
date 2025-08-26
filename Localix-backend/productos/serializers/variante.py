from rest_framework import serializers
from productos.models import VarianteProducto
from decimal import Decimal

class VarianteProductoSerializer(serializers.ModelSerializer):
    precio_final = serializers.IntegerField(
        read_only=True
    )
    sku = serializers.CharField(
        required=True,
        max_length=50,
        help_text="Código único para esta variante"
    )
    
    class Meta:
        model = VarianteProducto
        fields = [
            'id', 'producto', 'nombre', 'valor', 
            'sku', 'precio_extra', 'precio_final', 
            'stock', 'orden'
        ]
        read_only_fields = ('id', 'precio_final')

    def validate_nombre(self, value):
        """Valida que el nombre sea único para el producto"""
        producto = self.context.get('producto') or self.initial_data.get('producto')
        
        if producto and self.instance and self.instance.nombre == value:
            return value
            
        if producto and VarianteProducto.objects.filter(
            producto=producto, 
            nombre__iexact=value
        ).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError(
                "Ya existe una variante con este nombre para el producto"
            )
        return value

    def validate_valor(self, value):
        """Valida que la combinación nombre-valor sea única"""
        producto = self.context.get('producto') or self.initial_data.get('producto')
        nombre = self.initial_data.get('nombre')
        
        if producto and nombre and self.instance:
            if self.instance.nombre == nombre and self.instance.valor == value:
                return value
                
        if producto and nombre and VarianteProducto.objects.filter(
            producto=producto,
            nombre=nombre,
            valor__iexact=value
        ).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError(
                "Ya existe esta combinación de nombre y valor para el producto"
            )
        return value

    def validate_sku(self, value):
        """Valida que el SKU sea único"""
        if self.instance and self.instance.sku == value:
            return value
            
        if VarianteProducto.objects.filter(sku__iexact=value).exists():
            raise serializers.ValidationError(
                "Ya existe una variante con este SKU"
            )
        return value

    def validate_stock(self, value):
        """Valida que el stock no sea negativo"""
        if value < 0:
            raise serializers.ValidationError(
                "El stock no puede ser negativo"
            )
        return value

    def validate_precio_extra(self, value):
        """Valida que el precio extra no sea negativo"""
        if value < 0:
            raise serializers.ValidationError(
                "El precio adicional no puede ser negativo"
            )
        return value