# Endpoint para Procesar Pedidos

## Descripción
Este endpoint permite procesar un pedido completo, incluyendo la verificación/creación del cliente por DNI, la creación de la venta con sus items y la creación del pedido asociado.

## URL
```
POST /api/pedidos/procesar/
```

## Autenticación
Requiere autenticación con token de usuario.

## Estructura del Request

```json
{
  "cliente": {
    "nombre": "Juan Pérez",
    "email": "juan.perez@email.com",
    "telefono": "+57 300 123 4567",
    "tipo_documento": "dni",
    "numero_documento": "12345678",
    "direccion": "Calle 123 #45-67, Bogotá"
  },
  "pedido": {
    "tipo_venta": "digital",
    "direccion_entrega": "Calle 123 #45-67, Bogotá",
    "telefono_contacto": "+57 300 123 4567",
    "instrucciones_entrega": "Entregar en horario de oficina",
    "metodo_pago": "transferencia",
    "notas": "Cliente preferencial"
  },
  "items": [
    {
      "producto_id": 1,
      "color_id": 2,
      "cantidad": 2,
      "precio_unitario": 150000
    },
    {
      "producto_id": 3,
      "cantidad": 1,
      "precio_unitario": 75000
    }
  ]
}
```

## Campos Requeridos

### Cliente
- `nombre`: Nombre completo del cliente
- `numero_documento`: DNI/documento de identidad

### Items
- `producto_id`: ID del producto
- `cantidad`: Cantidad a comprar (mayor a 0)

## Campos Opcionales

### Cliente
- `email`: Correo electrónico
- `telefono`: Número de teléfono
- `tipo_documento`: Tipo de documento (dni, ruc, ce, pasaporte) - default: "dni"
- `direccion`: Dirección del cliente

### Pedido
- `tipo_venta`: Tipo de venta (fisica, digital) - default: "digital"
- `direccion_entrega`: Dirección de entrega
- `telefono_contacto`: Teléfono de contacto
- `instrucciones_entrega`: Instrucciones especiales
- `metodo_pago`: Método de pago (efectivo, tarjeta, transferencia, yape, plin, otro) - default: "efectivo"
- `notas`: Notas adicionales

### Items
- `color_id`: ID del color específico del producto
- `precio_unitario`: Precio unitario (si no se especifica, se toma del producto)

## Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "message": "Pedido procesado exitosamente",
  "cliente": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan.perez@email.com",
    "telefono": "+57 300 123 4567",
    "tipo_documento": "dni",
    "numero_documento": "12345678",
    "direccion": "Calle 123 #45-67, Bogotá",
    "fecha_registro": "2024-01-15T10:30:00Z"
  },
  "venta": {
    "id": 1,
    "numero_venta": "V-A1B2C3D4",
    "fecha_venta": "2024-01-15T10:30:00Z",
    "subtotal": 37500000,
    "total": 37500000,
    "estado": "completada",
    "metodo_pago": "transferencia"
  },
  "pedido": {
    "id": 1,
    "numero_pedido": "PED-000001",
    "fecha_creacion": "2024-01-15T10:30:00Z",
    "estado_pedido": "confirmado",
    "estado_pago": "pagado",
    "tipo_venta": "digital",
    "total_pedido": 375000.0
  }
}
```

## Respuestas de Error

### 400 Bad Request
```json
{
  "error": "Los datos del cliente son requeridos"
}
```

```json
{
  "error": "El nombre del cliente es requerido"
}
```

```json
{
  "error": "Producto con ID 999 no encontrado"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error interno del servidor: [detalle del error]"
}
```

## Funcionalidad

1. **Verificación de Cliente**: Busca si existe un cliente con el DNI proporcionado
2. **Creación/Actualización**: Si no existe, crea un nuevo cliente. Si existe, actualiza sus datos
3. **Validación de Productos**: Verifica que todos los productos existan y pertenezcan al usuario
4. **Validación de Colores**: Si se especifican colores, verifica que pertenezcan al producto
5. **Cálculo de Precios**: Calcula automáticamente los subtotales y total
6. **Creación de Venta**: Crea el registro de venta con todos los items
7. **Creación de Pedido**: Crea el pedido asociado a la venta
8. **Historial**: Registra el estado inicial del pedido
9. **Transacciones**: Todo el proceso se ejecuta en una transacción atómica

## Ejemplo de Uso con cURL

```bash
curl -X POST http://localhost:8000/api/pedidos/procesar/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "cliente": {
      "nombre": "María García",
      "email": "maria.garcia@email.com",
      "telefono": "+57 301 987 6543",
      "numero_documento": "87654321",
      "direccion": "Carrera 45 #12-34, Medellín"
    },
    "pedido": {
      "tipo_venta": "digital",
      "metodo_pago": "yape",
      "notas": "Entrega urgente"
    },
    "items": [
      {
        "producto_id": 5,
        "cantidad": 1,
        "precio_unitario": 200000
      }
    ]
  }'
```

## Notas Importantes

- Los precios en la base de datos se almacenan en centavos para mayor precisión
- El endpoint maneja automáticamente la conversión entre pesos y centavos
- Si un cliente ya existe, se actualizan solo los campos proporcionados
- El estado del pedido se establece automáticamente como "confirmado"
- El estado de pago se establece como "pagado" por defecto
- Se genera automáticamente un número de pedido único
- Todos los cambios se realizan dentro de una transacción atómica para garantizar la integridad de los datos