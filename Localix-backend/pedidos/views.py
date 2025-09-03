from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Pedido, ItemPedido, HistorialPedido, EstadoPedido, Abono
from .serializers import (
    PedidoSerializer, PedidoCreateSerializer, PedidoUpdateSerializer,
    ItemPedidoSerializer, HistorialPedidoSerializer, EstadoPedidoSerializer,
    AbonoSerializer, AbonoCreateSerializer
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from ventas.models import Cliente, Venta, ItemVenta
from productos.models import Producto, ColorProducto
from decimal import Decimal
import uuid

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().select_related('cliente', 'venta')
    serializer_class = PedidoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['tipo_venta', 'estado_pago', 'estado_pedido', 'cliente']
    search_fields = ['numero_pedido', 'cliente__nombre', 'cliente__email']
    ordering_fields = ['fecha_creacion', 'numero_pedido', 'total_pedido']
    ordering = ['-fecha_creacion']

    def get_queryset(self):
        """
        Filtra los pedidos por usuario autenticado
        """
        return Pedido.objects.filter(usuario=self.request.user).select_related('cliente', 'venta')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PedidoCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PedidoUpdateSerializer
        return PedidoSerializer
    
    def perform_create(self, serializer):
        try:
            pedido = serializer.save(usuario=self.request.user)
            # Crear historial inicial
            HistorialPedido.objects.create(
                pedido=pedido,
                estado_nuevo=pedido.estado_pedido,
                notas='Pedido creado'
            )
        except Exception as e:
            raise
    
    def update(self, request, *args, **kwargs):
        # Solo permitir actualizar el estado del pedido
        if set(request.data.keys()) - {'estado_pedido'}:
            return Response({'error': 'Solo se permite modificar el estado del pedido.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Solo permitir actualizar el estado del pedido
        if set(request.data.keys()) - {'estado_pedido'}:
            return Response({'error': 'Solo se permite modificar el estado del pedido.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().partial_update(request, *args, **kwargs)
    
    def perform_update(self, serializer):
        instance = self.get_object()
        old_estado = instance.estado_pedido
        pedido = serializer.save()
        
        # Registrar cambio de estado si es necesario
        if old_estado != pedido.estado_pedido:
            HistorialPedido.objects.create(
                pedido=pedido,
                estado_anterior=old_estado,
                estado_nuevo=pedido.estado_pedido,
                usuario=self.request.user if self.request else None
            )
    
    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """
        Cambia el estado del pedido.
        
        Endpoint: POST /pedidos/{id}/cambiar_estado/
        
        Parámetros en el body (JSON):
            - estado_pedido: (str) Nuevo estado del pedido. Debe ser uno de los valores válidos:
                ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado']
            - notas: (opcional, str) Notas para el historial.
            - estado_anterior: (opcional, str) Estado anterior (usualmente no es necesario, se calcula automáticamente).
        
        Ejemplo de petición:
            {
                "estado_pedido": "enviado",
                "notas": "Pedido despachado por mensajería."
            }
        
        Respuesta: Pedido actualizado (JSON)
        """
        pedido = self.get_object()
        nuevo_estado = request.data.get('estado_pedido')
        
        if not nuevo_estado:
            return Response(
                {'error': 'El estado del pedido es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if nuevo_estado not in dict(Pedido.ESTADO_PEDIDO_CHOICES):
            return Response(
                {'error': 'Estado de pedido inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar estado
        pedido.estado_pedido = nuevo_estado
        
        # Actualizar fechas según el estado
        if nuevo_estado == 'confirmado' and not pedido.fecha_confirmacion:
            from django.utils import timezone
            pedido.fecha_confirmacion = timezone.now()
        elif nuevo_estado == 'enviado' and not pedido.fecha_envio:
            from django.utils import timezone
            pedido.fecha_envio = timezone.now()
        elif nuevo_estado == 'entregado' and not pedido.fecha_entrega:
            from django.utils import timezone
            pedido.fecha_entrega = timezone.now()
        
        pedido.save()
        
        # Registrar en historial
        usuario = request.user if request and request.user and request.user.is_authenticated else None
        HistorialPedido.objects.create(
            pedido=pedido,
            estado_anterior=request.data.get('estado_anterior', ''),
            estado_nuevo=nuevo_estado,
            notas=request.data.get('notas', ''),
            usuario=usuario
        )
        
        serializer = self.get_serializer(pedido)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        pedido = self.get_object()
        historial = pedido.historial.all()
        serializer = HistorialPedidoSerializer(historial, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        from django.db.models import Count, Sum
        from django.utils import timezone
        from datetime import timedelta
        
        # Estadísticas generales
        total_pedidos = Pedido.objects.count()
        pedidos_pendientes = Pedido.objects.filter(estado_pedido='pendiente').count()
        pedidos_en_proceso = Pedido.objects.filter(estado_pedido__in=['confirmado', 'en_preparacion']).count()
        pedidos_enviados = Pedido.objects.filter(estado_pedido='enviado').count()
        pedidos_entregados = Pedido.objects.filter(estado_pedido='entregado').count()
        
        # Ventas por tipo
        ventas_fisicas = Pedido.objects.filter(tipo_venta='fisica').count()
        ventas_digitales = Pedido.objects.filter(tipo_venta='digital').count()
        
        # Total de ingresos
        total_ingresos = Pedido.objects.aggregate(
            total=Sum('venta__total')
        )['total'] or 0
        
        # Pedidos del último mes
        hace_30_dias = timezone.now() - timedelta(days=30)
        pedidos_ultimo_mes = Pedido.objects.filter(fecha_creacion__gte=hace_30_dias).count()
        
        return Response({
            'total_pedidos': total_pedidos,
            'pedidos_pendientes': pedidos_pendientes,
            'pedidos_en_proceso': pedidos_en_proceso,
            'pedidos_enviados': pedidos_enviados,
            'pedidos_entregados': pedidos_entregados,
            'ventas_fisicas': ventas_fisicas,
            'ventas_digitales': ventas_digitales,
            'total_ingresos': float(total_ingresos),
            'pedidos_ultimo_mes': pedidos_ultimo_mes
        })

class ItemPedidoViewSet(viewsets.ModelViewSet):
    queryset = ItemPedido.objects.all().select_related('pedido', 'producto')
    serializer_class = ItemPedidoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pedido']

class HistorialPedidoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HistorialPedido.objects.all().select_related('pedido', 'usuario')
    serializer_class = HistorialPedidoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pedido'] 

@api_view(['POST'])
def recibir_mensaje_whatsapp(request):
    """
    Endpoint de prueba para recibir mensajes del bot de WhatsApp.
    Solo imprime el mensaje recibido y responde con éxito.
    """
    mensaje = request.data.get('mensaje')
    numero = request.data.get('numero')
    print(f"Mensaje recibido de WhatsApp: {mensaje} (de {numero})")
    return Response({'status': 'ok', 'mensaje': mensaje, 'numero': numero})

class EstadoPedidoViewSet(viewsets.ModelViewSet):
    queryset = EstadoPedido.objects.all().select_related('pedido', 'usuario')
    serializer_class = EstadoPedidoSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['pedido', 'estado', 'activo']
    ordering_fields = ['fecha_cambio']
    ordering = ['-fecha_cambio']
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    @action(detail=False, methods=['get'])
    def por_pedido(self, request):
        """Obtiene todos los estados de un pedido específico"""
        pedido_id = request.query_params.get('pedido_id')
        if not pedido_id:
            return Response({'error': 'pedido_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        estados = self.queryset.filter(pedido_id=pedido_id)
        serializer = self.get_serializer(estados, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estado_actual(self, request):
        """Obtiene el estado actual de un pedido"""
        pedido_id = request.query_params.get('pedido_id')
        if not pedido_id:
            return Response({'error': 'pedido_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        estado_actual = self.queryset.filter(pedido_id=pedido_id, activo=True).first()
        if estado_actual:
            serializer = self.get_serializer(estado_actual)
            return Response(serializer.data)
        return Response({'error': 'No se encontró estado activo'}, status=status.HTTP_404_NOT_FOUND)

class AbonoViewSet(viewsets.ModelViewSet):
    queryset = Abono.objects.all().select_related('pedido', 'usuario')
    serializer_class = AbonoSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['pedido', 'estado_abono', 'metodo_pago']
    ordering_fields = ['fecha_abono', 'monto']
    ordering = ['-fecha_abono']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AbonoCreateSerializer
        return AbonoSerializer
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    @action(detail=False, methods=['get'])
    def por_pedido(self, request):
        """Obtiene todos los abonos de un pedido específico"""
        pedido_id = request.query_params.get('pedido_id')
        if not pedido_id:
            return Response({'error': 'pedido_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        abonos = self.queryset.filter(pedido_id=pedido_id)
        serializer = self.get_serializer(abonos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        """Confirma un abono"""
        abono = self.get_object()
        if abono.estado_abono != 'pendiente':
            return Response(
                {'error': 'Solo se pueden confirmar abonos pendientes'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        abono.estado_abono = 'confirmado'
        abono.save()
        
        serializer = self.get_serializer(abono)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Rechaza un abono"""
        abono = self.get_object()
        if abono.estado_abono not in ['pendiente', 'confirmado']:
            return Response(
                {'error': 'Solo se pueden rechazar abonos pendientes o confirmados'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        abono.estado_abono = 'rechazado'
        abono.save()
        
        serializer = self.get_serializer(abono)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def registrar_pago_separado(self, request):
        """Registra un pago para un pedido separado"""
        pedido_id = request.data.get('pedido_id')
        monto = request.data.get('monto')
        metodo_pago = request.data.get('metodo_pago', 'efectivo')
        referencia_pago = request.data.get('referencia_pago', '')
        notas = request.data.get('notas', '')
        
        if not pedido_id:
            return Response({'error': 'pedido_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not monto or float(monto) <= 0:
            return Response({'error': 'El monto debe ser mayor a 0'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            pedido = Pedido.objects.get(id=pedido_id, usuario=request.user)
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        if pedido.estado_pedido != 'separado':
            return Response(
                {'error': 'Solo se pueden registrar pagos en pedidos separados'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear el abono
        abono = Abono.objects.create(
            pedido=pedido,
            monto=monto,
            metodo_pago=metodo_pago,
            referencia_pago=referencia_pago,
            estado_abono='confirmado',  # Los pagos registrados se confirman automáticamente
            usuario=request.user,
            notas=notas or f'Pago registrado para pedido separado #{pedido.numero_pedido}'
        )
        
        # Verificar si el pedido está completamente pagado
        total_abonado = sum(a.monto for a in pedido.abonos.filter(estado_abono='confirmado'))
        if total_abonado >= pedido.total_pedido:
            # Cambiar estado del pedido a pendiente (ya está pagado)
            pedido.estado_pedido = 'pendiente'
            pedido.estado_pago = 'pagado'
            pedido.save()
            
            # Crear registro de cambio de estado
            EstadoPedido.objects.create(
                pedido=pedido,
                estado='pendiente',
                usuario=request.user,
                notas=f'Pedido completamente pagado. Total abonado: ${total_abonado}'
            )
        
        serializer = self.get_serializer(abono)
        return Response({
            'abono': serializer.data,
            'pedido_completamente_pagado': total_abonado >= pedido.total_pedido,
            'total_abonado': float(total_abonado),
            'total_pedido': float(pedido.total_pedido)
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def resumen_abonos(self, request):
        """Obtiene un resumen de abonos por pedido"""
        pedido_id = request.query_params.get('pedido_id')
        if not pedido_id:
            return Response({'error': 'pedido_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        abonos = self.queryset.filter(pedido_id=pedido_id)
        
        resumen = {
            'total_abonos': abonos.count(),
            'total_confirmado': sum(a.monto for a in abonos.filter(estado_abono='confirmado')),
            'total_pendiente': sum(a.monto for a in abonos.filter(estado_abono='pendiente')),
            'total_rechazado': sum(a.monto for a in abonos.filter(estado_abono='rechazado')),
            'abonos_por_metodo': {}
        }
        
        # Agrupar por método de pago
        for metodo, _ in Abono.METODO_PAGO_CHOICES:
            abonos_metodo = abonos.filter(metodo_pago=metodo, estado_abono='confirmado')
            if abonos_metodo.exists():
                resumen['abonos_por_metodo'][metodo] = {
                    'cantidad': abonos_metodo.count(),
                    'total': sum(a.monto for a in abonos_metodo)
                }
        
        return Response(resumen)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def procesar_pedido(request):
    """
    Procesa un pedido completo con validación de cliente por DNI.
    
    Endpoint: POST /api/pedidos/procesar/
    
    Parámetros en el body (JSON):
    {
        "cliente": {
            "nombre": "string",
            "email": "string" (opcional),
            "telefono": "string" (opcional),
            "tipo_documento": "dni|ruc|ce|pasaporte" (default: "dni"),
            "numero_documento": "string",
            "direccion": "string" (opcional)
        },
        "pedido": {
            "tipo_venta": "fisica|digital" (default: "digital"),
            "direccion_entrega": "string" (opcional),
            "telefono_contacto": "string" (opcional),
            "instrucciones_entrega": "string" (opcional),
            "metodo_pago": "efectivo|tarjeta|transferencia|yape|plin|otro" (default: "efectivo"),
            "notas": "string" (opcional)
        },
        "items": [
            {
                "producto_id": int,
                "color_id": int (opcional),
                "cantidad": int,
                "precio_unitario": float (opcional, se toma del producto si no se especifica)
            }
        ]
    }
    
    Respuesta exitosa:
    {
        "success": true,
        "cliente": {...},  // Datos del cliente (existente o creado)
        "venta": {...},    // Datos de la venta creada
        "pedido": {...}    // Datos del pedido creado
    }
    """
    try:
        with transaction.atomic():
            data = request.data
            
            # Validar datos requeridos
            if 'cliente' not in data:
                return Response(
                    {'error': 'Los datos del cliente son requeridos'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if 'items' not in data or not data['items']:
                return Response(
                    {'error': 'Los items del pedido son requeridos'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cliente_data = data['cliente']
            pedido_data = data.get('pedido', {})
            items_data = data['items']
            
            # Validar datos mínimos del cliente
            if not cliente_data.get('nombre'):
                return Response(
                    {'error': 'El nombre del cliente es requerido'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not cliente_data.get('numero_documento'):
                return Response(
                    {'error': 'El número de documento del cliente es requerido'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 1. Verificar si el cliente ya existe por DNI
            numero_documento = cliente_data['numero_documento']
            tipo_documento = cliente_data.get('tipo_documento', 'dni')
            
            cliente = Cliente.objects.filter(
                usuario=request.user,
                numero_documento=numero_documento,
                tipo_documento=tipo_documento
            ).first()
            
            # 2. Crear cliente si no existe
            if not cliente:
                cliente = Cliente.objects.create(
                    usuario=request.user,
                    nombre=cliente_data['nombre'],
                    email=cliente_data.get('email', ''),
                    telefono=cliente_data.get('telefono', ''),
                    tipo_documento=tipo_documento,
                    numero_documento=numero_documento,
                    direccion=cliente_data.get('direccion', '')
                )
            else:
                # Actualizar datos del cliente existente si se proporcionan
                if cliente_data.get('email'):
                    cliente.email = cliente_data['email']
                if cliente_data.get('telefono'):
                    cliente.telefono = cliente_data['telefono']
                if cliente_data.get('direccion'):
                    cliente.direccion = cliente_data['direccion']
                cliente.save()
            
            # 3. Validar y procesar items
            items_venta = []
            subtotal_centavos = 0
            
            for item_data in items_data:
                if 'producto_id' not in item_data:
                    return Response(
                        {'error': 'El producto_id es requerido para cada item'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if 'cantidad' not in item_data or item_data['cantidad'] <= 0:
                    return Response(
                        {'error': 'La cantidad debe ser mayor a 0 para cada item'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    producto = Producto.objects.get(
                        id=item_data['producto_id'],
                        usuario=request.user
                    )
                except Producto.DoesNotExist:
                    return Response(
                        {'error': f'Producto con ID {item_data["producto_id"]} no encontrado'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Validar color si se especifica
                color = None
                if item_data.get('color_id'):
                    try:
                        color = ColorProducto.objects.get(
                            id=item_data['color_id'],
                            producto=producto
                        )
                    except ColorProducto.DoesNotExist:
                        return Response(
                            {'error': f'Color con ID {item_data["color_id"]} no encontrado para el producto'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                # Calcular precio unitario
                precio_unitario = item_data.get('precio_unitario')
                if precio_unitario is None:
                    precio_unitario = producto.precio
                
                # Convertir a centavos
                precio_unitario_centavos = int(precio_unitario * 100)
                cantidad = item_data['cantidad']
                subtotal_item_centavos = precio_unitario_centavos * cantidad
                
                items_venta.append({
                    'producto': producto,
                    'color': color,
                    'cantidad': cantidad,
                    'precio_unitario_centavos': precio_unitario_centavos,
                    'subtotal_centavos': subtotal_item_centavos
                })
                
                subtotal_centavos += subtotal_item_centavos
            
            # 4. Crear la venta
            numero_venta = f'V-{uuid.uuid4().hex[:8].upper()}'
            
            venta = Venta.objects.create(
                usuario=request.user,
                numero_venta=numero_venta,
                cliente=cliente,
                subtotal=subtotal_centavos,
                total=subtotal_centavos,
                estado='completada',
                metodo_pago=pedido_data.get('metodo_pago', 'efectivo')
            )
            
            # 5. Crear items de venta
            for item_data in items_venta:
                ItemVenta.objects.create(
                    venta=venta,
                    producto=item_data['producto'],
                    color=item_data['color'],
                    cantidad=item_data['cantidad'],
                    subtotal=item_data['subtotal_centavos']
                )
            
            # 6. Crear el pedido
            numero_pedido = f'PED-{uuid.uuid4().hex[:8].upper()}'
            
            pedido = Pedido.objects.create(
                usuario=request.user,
                numero_pedido=numero_pedido,
                cliente=cliente,
                venta=venta,
                tipo_venta=pedido_data.get('tipo_venta', 'digital'),
                estado_pago='pagado',
                estado_pedido='confirmado',
                direccion_entrega=pedido_data.get('direccion_entrega', ''),
                telefono_contacto=pedido_data.get('telefono_contacto', ''),
                instrucciones_entrega=pedido_data.get('instrucciones_entrega', ''),
                metodo_pago=pedido_data.get('metodo_pago', 'efectivo'),
                notas=pedido_data.get('notas', '')
            )
            
            # 7. Crear items de pedido
            for item_data in items_venta:
                ItemPedido.objects.create(
                    pedido=pedido,
                    producto=item_data['producto'],
                    color=item_data['color'],
                    cantidad=item_data['cantidad'],
                    precio_unitario=Decimal(item_data['precio_unitario_centavos']) / 100,
                    subtotal=Decimal(item_data['subtotal_centavos']) / 100
                )
            
            # 8. Crear historial inicial del pedido
            HistorialPedido.objects.create(
                pedido=pedido,
                estado_nuevo='confirmado',
                notas='Pedido creado y confirmado automáticamente',
                usuario=request.user
            )
            
            # 9. Serializar respuesta
            from ventas.serializers import ClienteSerializer, VentaSerializer
            
            return Response({
                'success': True,
                'message': 'Pedido procesado exitosamente',
                'cliente': ClienteSerializer(cliente).data,
                'venta': VentaSerializer(venta).data,
                'pedido': PedidoSerializer(pedido).data
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response(
            {'error': f'Error interno del servidor: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )