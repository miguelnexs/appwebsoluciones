# API Pública - Guía para Agregar Nuevos Usuarios

## 📋 Resumen

Esta guía te explica cómo agregar nuevos usuarios que puedan acceder a la API pública de Localix para integrar datos en sus páginas web.

## 🚀 Método 1: Script Automático (Recomendado)

### Uso Básico
```bash
python setup_new_user.py <username> <email> <nombre_completo> [password]
```

### Ejemplos
```bash
# Crear usuario con contraseña automática
python setup_new_user.py mipagina info@mipagina.com "Mi Página Web"

# Crear usuario con contraseña específica
python setup_new_user.py tiendaonline admin@tienda.com "Tienda Online" mipassword123

# Crear usuario para una empresa
python setup_new_user.py empresaabc contacto@empresaabc.com "Empresa ABC"
```

### ✅ Lo que hace el script:
- ✅ Crea el usuario si no existe
- ✅ Actualiza los datos si ya existe
- ✅ Genera una API Key única
- ✅ Habilita el acceso público
- ✅ Genera una contraseña segura (si no se proporciona)
- ✅ Muestra ejemplos de uso de la API

## 🛠️ Método 2: Manual (Django Admin)

### Paso 1: Crear el usuario
1. Ve al panel de administración: `http://localhost:8000/admin/`
2. Navega a **Usuarios** → **Agregar usuario**
3. Completa los campos:
   - **Username**: nombre único del usuario
   - **Email**: correo electrónico
   - **Nombre completo**: nombre descriptivo
   - **Rol**: admin (recomendado)
   - **Es activo**: ✅ marcado

### Paso 2: Habilitar acceso público
1. Edita el usuario creado
2. Marca la casilla **Allow public access**
3. Guarda los cambios

### Paso 3: Generar API Key
El API Key se genera automáticamente cuando se habilita el acceso público.

## 📊 Información que recibirá el usuario

Después de crear el usuario, proporciona esta información:

### 🔑 Credenciales de Acceso
- **Username**: [username]
- **Password**: [password generado]
- **API Key**: [clave única de 64 caracteres]

### 🌐 Endpoints Disponibles
- `GET /api/public/user/` - Información del usuario
- `GET /api/public/stats/` - Estadísticas generales
- `GET /api/public/categorias/` - Lista de categorías
- `GET /api/public/productos/` - Lista de productos
- `GET /api/public/productos/{id}/` - Detalle de producto específico

### 📋 Headers Requeridos
```
Authorization: Bearer [API_KEY]
Content-Type: application/json
```

## 💻 Ejemplos de Integración

### JavaScript (Fetch API)
```javascript
const apiKey = 'TU_API_KEY_AQUI';
const baseURL = 'http://localhost:8000/api/public/';

async function obtenerProductos() {
    const response = await fetch(baseURL + 'productos/', {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

// Usar la función
obtenerProductos().then(productos => {
    console.log('Productos:', productos);
    // Aquí puedes mostrar los productos en tu página
});
```

### jQuery
```javascript
const apiKey = 'TU_API_KEY_AQUI';
const baseURL = 'http://localhost:8000/api/public/';

$.ajaxSetup({
    beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + apiKey);
        xhr.setRequestHeader('Content-Type', 'application/json');
    }
});

// Obtener productos
$.get(baseURL + 'productos/', function(data) {
    console.log('Productos:', data);
    // Mostrar productos en la página
});
```

### cURL (para pruebas)
```bash
curl -H "Authorization: Bearer TU_API_KEY_AQUI" \
     -H "Content-Type: application/json" \
     http://localhost:8000/api/public/productos/
```

## 🔒 Seguridad

### ⚠️ Importante:
- **Nunca** compartas el API Key públicamente
- **Siempre** usa HTTPS en producción
- **Rota** las API Keys periódicamente
- **Monitorea** el uso de la API

### 🔄 Regenerar API Key
Si necesitas regenerar el API Key de un usuario:

```python
# En el shell de Django
python manage.py shell

from usuarios.models import Usuario
user = Usuario.objects.get(username='nombre_usuario')
new_api_key = user.generate_api_key()
print(f"Nueva API Key: {new_api_key}")
```

## 📈 Filtros y Parámetros

### Productos
```
GET /api/public/productos/?categoria=1&ordering=nombre&search=termo
```

Parámetros disponibles:
- `categoria`: ID de categoría
- `ordering`: `nombre`, `-nombre`, `precio`, `-precio`
- `search`: búsqueda por nombre
- `page`: número de página
- `page_size`: elementos por página (máx. 100)

### Categorías
```
GET /api/public/categorias/?ordering=nombre&search=bebidas
```

## 🚨 Solución de Problemas

### Error 401 - No autorizado
- Verifica que el API Key sea correcto
- Asegúrate de incluir el header `Authorization: Bearer [API_KEY]`
- Confirma que el usuario tenga `allow_public_access = True`

### Error 403 - Prohibido
- El usuario no tiene permisos de acceso público
- Verifica que `es_activo = True`

### Error 404 - No encontrado
- Verifica la URL del endpoint
- Confirma que el servidor esté ejecutándose

## 📞 Soporte

Para soporte técnico o dudas sobre la integración, contacta al equipo de desarrollo.

---

**Nota**: Esta API está diseñada para mostrar información pública de productos y categorías. No incluye funcionalidades de compra o modificación de datos.