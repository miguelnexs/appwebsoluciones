from rest_framework import serializers
from .models import Cliente, Venta, ItemVenta, Reserva, ItemReserva, PagoReserva
from productos.models import Producto, VarianteProducto, ColorProducto

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'id', 'nombre', 'email', 'telefono', 'tipo_documento',
            'numero_documento', 'direccion', 'fecha_registro', 'activo', 'usuario'
        ]
        read_only_fields = ['usuario']

class ProductoVentaSerializer(serializers.ModelSerializer):
    categoria = serializers.StringRelatedField(read_only=True)
    imagen_principal_url = serializers.SerializerMethodField()
    colores_disponibles = serializers.SerializerMethodField()  # hola
    
    class Meta:
        model = Producto
        fields = ['id', 'sku', 'nombre', 'precio', 'stock', 'categoria', 'imagen_principal_url', 'colores_disponibles']
    
    def get_imagen_principal_url(self, obj):
        if obj.imagen_principal:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.imagen_principal.url)
            return obj.imagen_principal.url
        return None
    
    def get_colores_disponibles(self, obj):
        """Obtiene los colores disponibles del producto"""
        colores = obj.colores.filter(activo=True).values('id', 'nombre', 'hex_code', 'stock')
        return list(colores)

class ColorProductoSerializer(serializers.ModelSerializer):
    """Serializer para información básica de colores en ventas"""
    class Meta:
        model = ColorProducto
        fields = ['id', 'nombre', 'hex_code', 'stock', 'activo']

class ItemVentaSerializer(serializers.ModelSerializer):
    producto = serializers.StringRelatedField(read_only=True)
    producto_detalle = serializers.SerializerMethodField()
    variante = serializers.StringRelatedField(read_only=True)
    color = ColorProductoSerializer(read_only=True)
    precio_unitario = serializers.IntegerField(read_only=True)

    class Meta:
        model = ItemVenta
        fields = [
            'id', 'producto', 'producto_detalle', 'variante', 'color', 'cantidad',
            'precio_unitario', 'descuento_item', 'subtotal'
        ]

    def get_producto_detalle(self, obj):
        """Incluye información detallada del producto para cálculo de ganancias"""
        if obj.producto:
            return {
                'id': obj.producto.id,
                'nombre': obj.producto.nombre,
                'precio': obj.producto.precio,
                'costo': obj.producto.costo,
                'margen_ganancia': obj.producto.margen_ganancia
            }
        return None

class VentaSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    items = ItemVentaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(read_only=True)

    class Meta:
        model = Venta
        fields = [
            'id', 'numero_venta', 'fecha_venta', 'cliente', 'cliente_nombre',
            'subtotal', 'porcentaje_descuento', 'descuento', 'total', 'estado', 'metodo_pago',
            'observaciones', 'vendedor', 'items', 'usuario'
        ]
        read_only_fields = ['usuario']

class VentaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = [
            'cliente', 'cliente_nombre', 'estado', 'metodo_pago',
            'observaciones', 'vendedor', 'porcentaje_descuento', 'usuario'
        ]
        read_only_fields = ['numero_venta', 'fecha_venta', 'subtotal', 'descuento', 'igv', 'total', 'usuario']

# Serializers para Reservas
class ItemReservaSerializer(serializers.ModelSerializer):
    producto = serializers.StringRelatedField(read_only=True)
    producto_detalle = serializers.SerializerMethodField()
    variante = serializers.StringRelatedField(read_only=True)
    color = ColorProductoSerializer(read_only=True)
    precio_unitario = serializers.SerializerMethodField()

    class Meta:
        model = ItemReserva
        fields = [
            'id', 'producto', 'producto_detalle', 'variante', 'color', 'cantidad',
            'precio_unitario', 'descuento_item', 'subtotal'
        ]

    def get_producto_detalle(self, obj):
        if obj.producto:
            return {
                'id': obj.producto.id,
                'nombre': obj.producto.nombre,
                'precio': obj.producto.precio,
                'costo': obj.producto.costo,
                'margen_ganancia': obj.producto.margen_ganancia
            }
        return None

    def get_precio_unitario(self, obj):
        if obj.producto:
            return obj.producto.precio
        return 0

class PagoReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PagoReserva
        fields = ['id', 'monto', 'fecha', 'metodo', 'usuario']
        read_only_fields = ['usuario', 'fecha']

class ReservaSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    items = ItemReservaSerializer(many=True, read_only=True)
    pagos = PagoReservaSerializer(many=True, read_only=True)

    class Meta:
        model = Reserva
        fields = [
            'id', 'cliente', 'fecha_creacion', 'fecha_vencimiento', 'estado',
            'monto_total', 'monto_deposito', 'monto_pendiente', 'notas',
            'items', 'pagos', 'usuario'
        ]
        read_only_fields = ['usuario', 'monto_total', 'monto_deposito', 'monto_pendiente']

class ReservaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = [
            'cliente', 'fecha_vencimiento', 'estado', 'notas', 'usuario'
        ]
        read_only_fields = ['usuario', 'monto_total', 'monto_deposito', 'monto_pendiente']