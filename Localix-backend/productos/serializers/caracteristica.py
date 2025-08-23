from rest_framework import serializers
from productos.models import CaracteristicaProducto


class CaracteristicaProductoSerializer(serializers.ModelSerializer):
    """
    Serializer para características de productos
    """
    
    class Meta:
        model = CaracteristicaProducto
        fields = [
            'id', 'nombre', 'valor', 'orden', 'activo',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def validate(self, data):
        """
        Validación personalizada para características
        """
        producto = data.get('producto')
        nombre = data.get('nombre')
        
        # Verificar que no exista otra característica con el mismo nombre para el producto
        if producto and nombre:
            existing_caracteristica = CaracteristicaProducto.objects.filter(
                producto=producto, nombre=nombre
            ).exclude(id=self.instance.id if self.instance else None)
            
            if existing_caracteristica.exists():
                raise serializers.ValidationError(
                    f"Ya existe una característica con el nombre '{nombre}' para este producto"
                )
        
        return data


class CaracteristicaProductoCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear características
    """
    
    class Meta:
        model = CaracteristicaProducto
        fields = [
            'id', 'nombre', 'valor', 'orden', 'activo'
        ]

    def create(self, validated_data):
        """
        Crear característica
        """
        caracteristica = CaracteristicaProducto.objects.create(**validated_data)
        return caracteristica

    def update(self, instance, validated_data):
        """
        Actualizar característica
        """
        # Actualizar característica
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class CaracteristicaProductoListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar características
    """
    
    class Meta:
        model = CaracteristicaProducto
        fields = [
            'id', 'nombre', 'valor', 'orden', 'activo'
        ]