from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction
from django.utils import timezone
from django.db import models
import json
from decimal import Decimal
from datetime import datetime
from typing import List, Dict, Any, Optional

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import serializers

from .models import Venta, ItemVenta, Cliente, Reserva, ItemReserva, PagoReserva
from .serializers import ClienteSerializer, VentaSerializer, VentaCreateSerializer, ItemVentaSerializer, ProductoVentaSerializer, ReservaSerializer, ReservaCreateSerializer, PagoReservaSerializer
from productos.models import Producto, VarianteProducto, ColorProducto
from django.db.models import Q
# import mercadopago  # Eliminado
from django.conf import settings

from rest_framework.decorators import api_view

from pedidos.models import Pedido, ItemPedido


class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar clientes
    """
    queryset = Cliente.objects.all().order_by('-fecha_registro')  # type: ignore[attr-defined]
    serializer_class = ClienteSerializer
    
    def get_queryset(self):
        """
        Permite filtrar por estado activo/inactivo y multi-tenancy
        Por defecto muestra todos los clientes del usuario
        """
        print(f"🔍 [CLIENTE VIEWSET] get_queryset - Usuario: {self.request.user}")
        print(f"🔍 [CLIENTE VIEWSET] get_queryset - Autenticado: {self.request.user.is_authenticated}")
        
        queryset = Cliente.objects.filter(usuario=self.request.user).order_by('-fecha_registro')  # type: ignore[attr-defined]
        activo = self.request.query_params.get('activo', None)
        
        if activo is not None:
            if str(activo).lower() == 'true':
                queryset = queryset.filter(activo=True)
            elif str(activo).lower() == 'false':
                queryset = queryset.filter(activo=False)
        
        print(f"🔍 [CLIENTE VIEWSET] get_queryset - Clientes encontrados: {queryset.count()}")
        return queryset

    def perform_create(self, serializer):
        """
        Crear cliente y asignar usuario
        """
        print(f"🔍 [CLIENTE VIEWSET] perform_create - Usuario: {self.request.user}")
        print(f"🔍 [CLIENTE VIEWSET] perform_create - Autenticado: {self.request.user.is_authenticated}")
        return serializer.save(usuario=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """
        Crear cliente con debugging
        """
        print(f"🔍 [CLIENTE VIEWSET] create - Usuario: {request.user}")
        print(f"🔍 [CLIENTE VIEWSET] create - Autenticado: {request.user.is_authenticated}")
        print(f"🔍 [CLIENTE VIEWSET] create - Datos recibidos: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cliente = self.perform_create(serializer)
        
        print(f"✅ [CLIENTE VIEWSET] create - Cliente creado exitosamente: {cliente.id}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def ventas(self, request, pk=None):
        """Obtener todas las ventas de un cliente específico"""
        try:
            cliente = self.get_object()
            ventas = Venta.objects.filter(cliente=cliente).select_related('cliente').prefetch_related('items__producto').order_by('-fecha_venta')
            
            # Serializar las ventas con información detallada
            ventas_data = []
            for venta in ventas:
                venta_info = {
                    'id': venta.id,
                    'numero_venta': venta.numero_venta,
                    'fecha_venta': venta.fecha_venta,
                    'total': str(venta.total),
                    'estado': venta.estado,
                    'metodo_pago': venta.metodo_pago,
                    'items': []
                }
                
                # Agregar información de cada item
                for item in venta.items.all():
                    # Obtener URL de la imagen del producto
                    imagen_url = None
                    if item.producto.imagen_principal:
                        request = self.request
                        if request is not None:
                            imagen_url = request.build_absolute_uri(item.producto.imagen_principal.url)
                        else:
                            imagen_url = item.producto.imagen_principal.url
                    
                    # Agregar información del color si existe
                    color_info = None
                    if item.color:
                        color_info = {
                            'id': item.color.id,
                            'nombre': item.color.nombre,
                            'hex_code': item.color.hex_code
                        }
                    
                    item_info = {
                        'producto_id': item.producto.id,
                        'producto_nombre': item.producto.nombre,
                        'producto_sku': item.producto.sku,
                        'producto_imagen_url': imagen_url,
                        'cantidad': item.cantidad,
                        'precio_unitario': str(item.precio_unitario),
                        'subtotal': str(item.subtotal),
                        'color': color_info
                    }
                    if item.variante:
                        item_info['variante_nombre'] = item.variante.nombre
                        item_info['variante_id'] = item.variante.id
                    venta_info['items'].append(item_info)
                
                ventas_data.append(venta_info)
            
            return Response({
                'cliente': ClienteSerializer(cliente).data,
                'ventas': ventas_data,
                'total_ventas': len(ventas_data),
                'total_gastado': sum(float(venta['total']) for venta in ventas_data)
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def buscar(self, request):
        """Buscar clientes por nombre o email"""
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'error': 'Query parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        clientes = self.get_queryset().filter(
            Q(nombre__icontains=query) |  # type: ignore[operator]
            Q(email__icontains=query) |  # type: ignore[operator]
            Q(telefono__icontains=query)  # type: ignore[operator]
        )[:10]
        
        serializer = self.get_serializer(clientes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def crear_rapido(self, request):
        """Crear cliente de forma rápida para ventas"""
        try:
            data = request.data
            
            # Validar datos mínimos
            if not data.get('nombre'):
                return Response(
                    {'error': 'El nombre es obligatorio'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Usar serializer para crear cliente y asignar usuario
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            cliente = self.perform_create(serializer)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VentaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar ventas
    """
    queryset = Venta.objects.select_related('cliente').prefetch_related('items__producto').order_by('-fecha_venta')  # type: ignore[attr-defined]
    serializer_class = VentaSerializer

    def get_queryset(self):
        """
        Filtra las ventas por usuario autenticado
        """
        return Venta.objects.filter(usuario=self.request.user).select_related('cliente').prefetch_related('items__producto').order_by('-fecha_venta')

    def perform_create(self, serializer):
        """
        Crear venta y asignar usuario
        """
        serializer.save(usuario=self.request.user)
    
    @action(detail=False, methods=['post'])
    def crear_venta_rapida(self, request):
        """Crear una venta rápida con items"""
        try:
            data = request.data
            with transaction.atomic():  # type: ignore[attr-defined]
                # Manejar cliente
                cliente = None
                cliente_nombre = data.get('cliente_nombre', '').strip()
                if data.get('cliente_id'):
                    try:
                        cliente = Cliente.objects.get(id=data['cliente_id'])  # type: ignore[attr-defined]
                    except Cliente.DoesNotExist:  # type: ignore[attr-defined]
                        return Response({'error': f'Cliente con id {data["cliente_id"]} no existe'}, status=status.HTTP_400_BAD_REQUEST)
                elif data.get('crear_cliente') and data.get('cliente_data'):
                    cliente_data = data['cliente_data']
                    # Usar serializer para crear cliente y asignar usuario
                    cliente_serializer = ClienteSerializer(data=cliente_data)
                    cliente_serializer.is_valid(raise_exception=True)
                    cliente = cliente_serializer.save(usuario=request.user)

                # Validar que haya cliente o nombre de cliente
                if not cliente and not cliente_nombre:
                    return Response({'error': 'Debe especificar un cliente (cliente_id) o un nombre para venta anónima (cliente_nombre).'}, status=status.HTTP_400_BAD_REQUEST)

                # Crear la venta usando serializer para asignar usuario
                venta_data = {
                    'cliente': cliente.id if cliente else None,
                    'cliente_nombre': cliente_nombre,
                    'porcentaje_descuento': int(data.get('porcentaje_descuento', 0)),
                    'metodo_pago': data.get('metodo_pago', 'efectivo'),
                    'observaciones': data.get('observaciones', ''),
                    'vendedor': data.get('vendedor', 'Sistema'),
                    'estado': 'completada'
                }
                venta_serializer = VentaSerializer(data=venta_data)
                venta_serializer.is_valid(raise_exception=True)
                venta = venta_serializer.save(usuario=request.user)

                # Crear los items de la venta
                items_data = data.get('items', [])
                if not items_data or not isinstance(items_data, list):
                    return Response({'error': 'La venta debe tener al menos un item'}, status=status.HTTP_400_BAD_REQUEST)

                # ✅ Validar que no haya productos duplicados
                items_unicos = {}
                for item_data in items_data:
                    producto_id = item_data.get('producto_id')
                    variante_id = item_data.get('variante_id')
                    color_id = item_data.get('color_id')
                    
                    # Crear clave única para el item
                    clave = f"{producto_id}_{variante_id or 'null'}_{color_id or 'null'}"
                    
                    if clave in items_unicos:
                        return Response({
                            'error': f'Producto duplicado detectado. Cada combinación de producto, variante y color debe ser única.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    items_unicos[clave] = item_data

                for item_data in items_data:
                    producto_id = item_data.get('producto_id')
                    if not producto_id:
                        return Response({'error': 'Falta producto_id en un item'}, status=status.HTTP_400_BAD_REQUEST)
                    try:
                        producto = Producto.objects.get(id=producto_id)
                    except Producto.DoesNotExist:  # type: ignore[attr-defined]
                        return Response({'error': f'Producto con id {producto_id} no existe'}, status=status.HTTP_400_BAD_REQUEST)

                    # Determinar precio unitario (no se almacena, solo se usa para el cálculo)
                    precio_unitario = producto.precio
                    variante_id = item_data.get('variante_id')
                    variante = None
                    if variante_id:
                        try:
                            variante = VarianteProducto.objects.get(id=variante_id)  # type: ignore[attr-defined]
                            precio_unitario += variante.precio_extra
                        except VarianteProducto.DoesNotExist:  # type: ignore[attr-defined]
                            return Response({'error': f'Variante con id {variante_id} no existe'}, status=status.HTTP_400_BAD_REQUEST)

                    # ✅ Manejar color específico
                    color_id = item_data.get('color_id')
                    color = None
                    
                    # Verificar si el producto tiene colores configurados
                    colores_activos = producto.colores.filter(activo=True)
                    tiene_colores = colores_activos.exists()
                    
                    if tiene_colores:
                        # Si el producto tiene colores, es obligatorio especificar uno
                        if not color_id:
                            colores_disponibles = [f"{c.nombre} (Stock: {c.stock})" for c in colores_activos]
                            return Response({
                                'error': f'El producto "{producto.nombre}" tiene colores configurados. Debe seleccionar un color específico. Colores disponibles: {", ".join(colores_disponibles)}'
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Validar que el color existe y está activo
                        try:
                            color = ColorProducto.objects.get(id=color_id, producto=producto, activo=True)  # type: ignore[attr-defined]
                        except ColorProducto.DoesNotExist:  # type: ignore[attr-defined]
                            return Response({
                                'error': f'El color seleccionado no existe o no está disponible para el producto "{producto.nombre}"'
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Verificar stock del color
                        if color.stock < item_data['cantidad']:
                            return Response({
                                'error': f'Stock insuficiente para el color "{color.nombre}" del producto "{producto.nombre}". Disponible: {color.stock}, Solicitado: {item_data["cantidad"]}'
                            }, status=status.HTTP_400_BAD_REQUEST)
                    elif color_id:
                        # Si el producto no tiene colores pero se especificó uno, es un error
                        return Response({
                            'error': f'El producto "{producto.nombre}" no tiene colores configurados, pero se especificó un color'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # Crear item de venta
                    ItemVenta.objects.create(  # type: ignore[attr-defined]
                        venta=venta,
                        producto=producto,
                        variante=variante,
                        color=color,
                        cantidad=item_data['cantidad'],
                        descuento_item=int(item_data.get('descuento_item', 0))
                    )

                    # ✅ El descuento de stock ahora se maneja automáticamente en el modelo ItemVenta
                    # No es necesario duplicar la lógica aquí

                # Calcular totales
                venta.calcular_totales()

                # ✅ Crear pedido automáticamente después de la venta
                # Determinar tipo de venta basado en el método de pago
                tipo_venta = 'fisica' if venta.metodo_pago in ['efectivo', 'tarjeta'] else 'digital'
                
                # Determinar estado del pedido basado en el método de pago
                if venta.metodo_pago == 'separado':
                    estado_pedido = 'separado'
                    estado_pago = 'pendiente'
                else:
                    estado_pedido = 'pendiente'
                    estado_pago = 'pagado' if venta.estado == 'completada' else 'pendiente'
                
                # Crear el pedido
                pedido = Pedido.objects.create(
                    usuario=request.user,  # Asignar el usuario autenticado
                    cliente=cliente,
                    venta=venta,
                    tipo_venta=tipo_venta,
                    estado_pago=estado_pago,
                    estado_pedido=estado_pedido,
                    direccion_entrega=cliente.direccion if cliente else '',
                    telefono_contacto=cliente.telefono if cliente else '',
                    metodo_pago=venta.metodo_pago,
                    notas=venta.observaciones
                )
                
                # Crear items del pedido basados en los items de la venta
                for item_venta in venta.items.all():
                    precio_unitario = item_venta.producto.precio
                    if item_venta.variante:
                        precio_unitario += item_venta.variante.precio_extra
                    ItemPedido.objects.create(
                        pedido=pedido,
                        producto=item_venta.producto,
                        cantidad=item_venta.cantidad,
                        precio_unitario=precio_unitario,
                        subtotal=item_venta.subtotal,
                        color=item_venta.color  # Guardar el color seleccionado
                    )

                # ✅ Crear estado inicial si el método de pago es 'separado'
                if venta.metodo_pago == 'separado':
                    from pedidos.models import EstadoPedido
                    
                    # Crear estado inicial del pedido
                    EstadoPedido.objects.create(
                        pedido=pedido,
                        estado='separado',
                        usuario=request.user,
                        notas=f'Pedido creado con método de pago separado - Venta #{venta.id}'
                    )
                    
                    # No crear abono inicial de $0.00 - los abonos se crearán cuando se registren pagos reales

                # Serializar la venta completa
                serializer = self.get_serializer(venta)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Obtener resumen de ventas del usuario autenticado"""
        # Usar get_queryset() que ya filtra por usuario
        user_ventas = self.get_queryset()
        ventas = user_ventas[:20]
        serializer = self.get_serializer(ventas, many=True)
        
        # Calcular totales solo para el usuario autenticado
        total_ventas = user_ventas.count()
        total_ingresos = sum(float(venta.total) for venta in user_ventas)
        
        return Response({
            'ventas': serializer.data,
            'resumen': {
                'total_ventas': total_ventas,
                'total_ingresos': total_ingresos
            }
        })
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas detalladas de ventas del usuario autenticado"""
        from django.db.models import Sum, Count, Avg
        from datetime import datetime, timedelta
        
        # Usar get_queryset() que ya filtra por usuario
        user_ventas = self.get_queryset()
        
        # Estadísticas generales
        total_ventas = user_ventas.count()
        total_ingresos = user_ventas.aggregate(total=Sum('total'))['total'] or 0
        promedio_venta = user_ventas.aggregate(promedio=Avg('total'))['promedio'] or 0
        
        # Ventas del mes actual
        hoy = timezone.now()
        inicio_mes = hoy.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        ventas_mes = user_ventas.filter(fecha_venta__gte=inicio_mes)
        total_ventas_mes = ventas_mes.count()
        ingresos_mes = ventas_mes.aggregate(total=Sum('total'))['total'] or 0
        
        # Ventas de la semana actual
        inicio_semana = hoy - timedelta(days=hoy.weekday())
        inicio_semana = inicio_semana.replace(hour=0, minute=0, second=0, microsecond=0)
        ventas_semana = user_ventas.filter(fecha_venta__gte=inicio_semana)
        total_ventas_semana = ventas_semana.count()
        ingresos_semana = ventas_semana.aggregate(total=Sum('total'))['total'] or 0
        
        # Ventas de hoy
        inicio_dia = hoy.replace(hour=0, minute=0, second=0, microsecond=0)
        ventas_hoy = user_ventas.filter(fecha_venta__gte=inicio_dia)
        total_ventas_hoy = ventas_hoy.count()
        ingresos_hoy = ventas_hoy.aggregate(total=Sum('total'))['total'] or 0
        
        # Top productos más vendidos
        from django.db.models import F
        top_productos = ItemVenta.objects.filter(
            venta__usuario=request.user
        ).values(
            'producto__nombre'
        ).annotate(
            total_vendido=Sum('cantidad')
        ).order_by('-total_vendido')[:5]
        
        # Calcular ingresos manualmente para cada producto
        top_productos_list = list(top_productos)
        for producto in top_productos_list:
            items = ItemVenta.objects.filter(
                venta__usuario=request.user,
                producto__nombre=producto['producto__nombre']
            ).select_related('producto', 'variante')
            
            ingresos_total = 0
            for item in items_completados:
                precio_base = item.producto.precio if item.producto else 0
                precio_extra = item.variante.precio_extra if item.variante else 0
                precio_unitario = precio_base + precio_extra
                ingresos_total += precio_unitario * item.cantidad
            
            producto['ingresos_producto'] = float(ingresos_total)
        
        return Response({
            'estadisticas_generales': {
                'total_ventas': total_ventas,
                'total_ingresos': float(total_ingresos),
                'promedio_venta': float(promedio_venta)
            },
            'periodo_actual': {
                'mes': {
                    'ventas': total_ventas_mes,
                    'ingresos': float(ingresos_mes)
                },
                'semana': {
                    'ventas': total_ventas_semana,
                    'ingresos': float(ingresos_semana)
                },
                'hoy': {
                    'ventas': total_ventas_hoy,
                    'ingresos': float(ingresos_hoy)
                }
            },
            'top_productos': list(top_productos)
        })


class ReservaViewSet(viewsets.ModelViewSet):
	queryset = Reserva.objects.select_related('cliente').prefetch_related('items__producto', 'pagos').order_by('-fecha_creacion')
	serializer_class = ReservaSerializer

	def get_queryset(self):
		return Reserva.objects.filter(usuario=self.request.user).select_related('cliente').prefetch_related('items__producto', 'pagos').order_by('-fecha_creacion')

	def perform_create(self, serializer):
		serializer.save(usuario=self.request.user)

	@action(detail=False, methods=['post'])
	def crear(self, request):
		"""Crear una reserva con items y abono opcional"""
		data = request.data
		serializer_in = ReservaCreateSerializer(data=data)
		serializer_in.is_valid(raise_exception=True)
		items = serializer_in.validated_data['items']
		if not items:
			return Response({'error': 'La reserva debe tener al menos un item'}, status=status.HTTP_400_BAD_REQUEST)
		cliente = None
		cliente_id = serializer_in.validated_data.get('cliente_id')
		if cliente_id:
			cliente = Cliente.objects.filter(id=cliente_id).first()
		with transaction.atomic():
			reserva = Reserva.objects.create(
				usuario=request.user,
				cliente=cliente,
				fecha_vencimiento=serializer_in.validated_data.get('fecha_vencimiento'),
				notas=serializer_in.validated_data.get('notas', '')
			)
			for item in items:
				producto = Producto.objects.get(id=item['producto_id'])
				variante = None
				color = None
				if item.get('variante_id'):
					variante = VarianteProducto.objects.get(id=item['variante_id'])
				if item.get('color_id'):
					color = ColorProducto.objects.get(id=item['color_id'], producto=producto, activo=True)
				ItemReserva.objects.create(
					reserva=reserva,
					producto=producto,
					variante=variante,
					color=color,
					cantidad=item['cantidad'],
					descuento_item=item.get('descuento_item', '0.00')
				)
			monto_deposito = int(serializer_in.validated_data.get('monto_deposito', 0))
			if monto_deposito and monto_deposito > 0:
				PagoReserva.objects.create(reserva=reserva, monto=monto_deposito, metodo='efectivo', usuario=request.user)
			reserva.refresh_from_db()
			# Crear Pedido asociado con estado 'separado'
			pedido = Pedido.objects.create(
				usuario=request.user,
				cliente=cliente,
				venta=None,
				reserva=reserva,
				tipo_venta='fisica',
				estado_pago='pendiente',
				estado_pedido='separado',
				direccion_entrega=cliente.direccion if cliente else '',
				telefono_contacto=cliente.telefono if cliente else '',
				notas=f'Reserva #{reserva.id}',
				metodo_pago='efectivo',
				monto_abono=reserva.monto_deposito,
				monto_pendiente=reserva.monto_pendiente,
			)
			# Items del pedido (precios referenciales)
			for item in reserva.items.all():
				precio_unitario = item.producto.precio
				if item.variante:
					precio_unitario += item.variante.precio_extra
				ItemPedido.objects.create(
					pedido=pedido,
					producto=item.producto,
					cantidad=item.cantidad,
					precio_unitario=precio_unitario,
					subtotal=item.subtotal,
					color=item.color
				)
			return Response(ReservaSerializer(reserva).data, status=status.HTTP_201_CREATED)

	@action(detail=True, methods=['post'])
	def pago(self, request, pk=None):
		reserva = self.get_object()
		serializer = PagoReservaSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		PagoReserva.objects.create(reserva=reserva, monto=serializer.validated_data['monto'], metodo=serializer.validated_data.get('metodo', 'efectivo'), usuario=request.user)
		reserva.refresh_from_db()
		# Actualizar pedido asociado si existe
		if hasattr(reserva, 'pedido'):
			pedido = reserva.pedido
			pedido.monto_abono = reserva.monto_deposito
			pedido.monto_pendiente = reserva.monto_pendiente
			pedido.save(update_fields=['monto_abono', 'monto_pendiente'])
		return Response(ReservaSerializer(reserva).data)

	@action(detail=True, methods=['post'])
	def cancelar(self, request, pk=None):
		with transaction.atomic():
			reserva = self.get_object()
			# Liberar stock reservado
			for item in reserva.items.select_related('variante', 'color'):
				if item.color:
					item.color.stock_reservado = max(0, item.color.stock_reservado - item.cantidad)
					item.color.save(update_fields=['stock_reservado'])
				elif item.variante:
					item.variante.stock_reservado = max(0, item.variante.stock_reservado - item.cantidad)
					item.variante.save(update_fields=['stock_reservado'])
			reserva.estado = 'cancelada'
			reserva.save(update_fields=['estado'])
			# Actualizar pedido
			if hasattr(reserva, 'pedido'):
				pedido = reserva.pedido
				pedido.estado_pedido = 'cancelado'
				pedido.save(update_fields=['estado_pedido'])
			return Response({'status': 'cancelada'})

	@action(detail=True, methods=['post'])
	def finalizar(self, request, pk=None):
		"""Convertir reserva en venta: descuenta stock real, libera reservado"""
		with transaction.atomic():
			reserva = self.get_object()
			if reserva.monto_pendiente > 0:
				return Response({'error': 'La reserva aún tiene saldo pendiente'}, status=400)
			# Crear venta
			venta = Venta.objects.create(
				usuario=request.user,
				cliente=reserva.cliente,
				estado='completada',
				metodo_pago='efectivo',
				observaciones=f'Conversión de reserva #{reserva.id}'
			)
			for item in reserva.items.select_related('producto', 'variante', 'color'):
				ItemVenta.objects.create(
					venta=venta,
					producto=item.producto,
					variante=item.variante,
					color=item.color,
					cantidad=item.cantidad,
					descuento_item=item.descuento_item
				)
				# Liberar reservado
				if item.color:
					item.color.stock_reservado = max(0, item.color.stock_reservado - item.cantidad)
					item.color.save(update_fields=['stock_reservado'])
				elif item.variante:
					item.variante.stock_reservado = max(0, item.variante.stock_reservado - item.cantidad)
					item.variante.save(update_fields=['stock_reservado'])
			venta.calcular_totales()
			reserva.estado = 'completada'
			reserva.save(update_fields=['estado'])
			# Actualizar pedido a pagado/confirmado y vincular venta
			if hasattr(reserva, 'pedido'):
				pedido = reserva.pedido
				pedido.venta = venta
				pedido.estado_pago = 'pagado'
				pedido.estado_pedido = 'confirmado'
				pedido.monto_pendiente = 0
				pedido.save(update_fields=['venta','estado_pago','estado_pedido','monto_pendiente'])
			return Response(VentaSerializer(venta).data)

# Vistas adicionales para productos (para la interfaz de DRF)
class ProductoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para productos en ventas - Filtra por usuario autenticado
    """
    queryset = Producto.objects.filter(estado='publicado').select_related('categoria').prefetch_related('variantes')
    serializer_class = ProductoVentaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtra productos por usuario autenticado
        """
        return Producto.objects.filter(
            usuario=self.request.user,
            estado='publicado'
        ).select_related('categoria').prefetch_related('variantes')
    
    def list(self, request):
        """Listar productos con información completa"""
        productos = self.get_queryset()
        serializer = self.get_serializer(productos, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def buscar(self, request):
        """Buscar productos por nombre o SKU - Solo del usuario autenticado"""
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'error': 'Query parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        productos = self.get_queryset().filter(
            Q(nombre__icontains=query) |  # type: ignore[operator]
            Q(sku__icontains=query)  # type: ignore[operator]
        ).select_related('categoria')[:10]  # type: ignore[attr-defined]
        
        serializer = self.get_serializer(productos, many=True, context={'request': request})
        return Response(serializer.data)

# Endpoint para Mercado Pago
# @api_view(['POST'])
# def crear_preferencia_mercadopago(request):
#     """
#     Crea una preferencia de pago en Mercado Pago y devuelve la URL de pago.
#     Espera un JSON con los items y datos del comprador.
#     """
#     sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
#     data = request.data
#     items = data.get('items', [])
#     payer = data.get('payer', {})
#     # Crear la venta en estado pendiente y obtener su ID
#     venta = Venta.objects.create(
#         cliente_nombre=payer.get('email', ''),
#         estado='pendiente',
#         metodo_pago='mercadopago',
#         total=sum(float(item.get('unit_price', 0)) * int(item.get('quantity', 1)) for item in items)
#     )
#     venta.save()
#     # Crear los items de la venta
#     for item in items:
#         producto_id = item.get('producto_id')
#         if not producto_id:
#             continue  # O podrías lanzar un error si es obligatorio
#         try:
#             producto = Producto.objects.get(id=producto_id)
#         except Producto.DoesNotExist:
#             continue  # O podrías lanzar un error si es obligatorio
#         variante_id = item.get('variante_id')
#         variante = None
#         if variante_id:
#             try:
#                 variante = VarianteProducto.objects.get(id=variante_id)
#             except VarianteProducto.DoesNotExist:
#                 variante = None
#         ItemVenta.objects.create(
#             venta=venta,
#             producto=producto,
#             variante=variante,
#             cantidad=int(item.get('quantity', 1)),
#             descuento_item=Decimal(str(item.get('descuento_item', 0)))
#         )
#     preference_data = {
#         "items": [
#             {
#                 "title": item.get("title", "Producto"),
#                 "quantity": int(item.get("quantity", 1)),
#                 "currency_id": "COP",
#                 "unit_price": float(item.get("unit_price", 0)),
#             }
#             for item in items
#         ],
#         "payer": payer,
#         "back_urls": {
#             "success": f"{settings.FRONTEND_URL}/checkout/success",
#             "failure": f"{settings.FRONTEND_URL}/checkout/failure",
#             "pending": f"{settings.FRONTEND_URL}/checkout/pending",
#         },
#         "auto_return": "approved",
#         "external_reference": str(venta.id),
#     }
#     # Guardar el external_reference en la venta
#     venta.external_reference = str(venta.id)
#     venta.save(update_fields=["external_reference"])
#     try:
#         preference_response = sdk.preference().create(preference_data)
#         print('=== Mercado Pago response ===')
#         print(preference_response)
#         init_point = preference_response["response"].get("init_point")
#         return Response({"init_point": init_point})
#     except Exception as e:
#         return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
def mercadopago_webhook(request):
    """
    Webhook para recibir notificaciones de Mercado Pago.
    Actualiza la venta y descuenta stock si el pago es aprobado.
    """
    import requests
    import os
    data = request.data
    payment_id = data.get('data', {}).get('id') or data.get('id')
    if not payment_id:
        return Response({'error': 'No payment id'}, status=400)
    access_token = getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', os.environ.get('MERCADOPAGO_ACCESS_TOKEN'))
    url = f'https://api.mercadopago.com/v1/payments/{payment_id}'
    headers = {'Authorization': f'Bearer {access_token}'}
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        return Response({'error': 'No se pudo consultar el pago'}, status=400)
    pago = resp.json()
    if pago.get('status') == 'approved':
        external_reference = pago.get('external_reference')
        from .models import Venta
        venta = Venta.objects.filter(external_reference=external_reference).first()
        if venta and venta.estado != 'completada':
            venta.estado = 'completada'
            venta.save()
            # ✅ El descuento de stock ya se realizó cuando se crearon los items
            # No es necesario duplicar la lógica aquí
            return Response({'status': 'venta actualizada'})
        return Response({'status': 'pago aprobado, pero venta no encontrada o ya completada'})
    return Response({'status': f'ignorado, status={pago.get("status")}'} )
