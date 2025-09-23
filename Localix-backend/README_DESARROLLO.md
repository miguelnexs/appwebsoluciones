# Guía de Configuración para Desarrollo - Localix Backend

## Descripción
Este es el backend de Localix, una aplicación Django REST Framework para gestión de productos, ventas y pedidos.

## Requisitos Previos
- Python 3.8 o superior
- PostgreSQL 12 o superior
- pip (gestor de paquetes de Python)

## Configuración del Entorno de Desarrollo

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd Localix-backend
```

### 2. Crear y Activar Entorno Virtual
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar Base de Datos PostgreSQL

#### Crear Base de Datos
```sql
-- Conectarse a PostgreSQL como superusuario
CREATE DATABASE localix;
CREATE USER localix_user WITH PASSWORD 'migel1457';
GRANT ALL PRIVILEGES ON DATABASE localix TO localix_user;
```

### 5. Configurar Variables de Entorno

El archivo `.env` ya está configurado con valores por defecto para desarrollo. Puedes modificar estos valores según tu configuración:

```env
# Configuración de desarrollo para Localix Backend
DEBUG=True
SECRET_KEY=04d2f0c4-d175-4d78-91d5-fc2ea459d3a6

# Configuración de la base de datos PostgreSQL
DATABASE_NAME=localix
DATABASE_USER=localix_user
DATABASE_PASSWORD=migel1457
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Hosts permitidos
ALLOWED_HOSTS=localhost,127.0.0.1,*

# Configuración de CORS para desarrollo
CORS_ALLOW_ALL_ORIGINS=True
FRONTEND_URL=http://localhost:5173

# Configuración de archivos estáticos y media
STATIC_URL=/static/
MEDIA_URL=/media/

# Configuración de seguridad para desarrollo
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
SECURE_SSL_REDIRECT=False
```

### 6. Ejecutar Migraciones
```bash
python manage.py migrate
```

### 7. Crear Superusuario (Opcional)
```bash
python manage.py createsuperuser
```

### 8. Ejecutar Servidor de Desarrollo
```bash
python manage.py runserver 8000
```

El servidor estará disponible en: http://127.0.0.1:8000/

## Características de Desarrollo Habilitadas

### Django Debug Toolbar
- **URL**: Aparece automáticamente en el lado derecho cuando DEBUG=True
- **Funcionalidad**: Muestra información detallada sobre consultas SQL, tiempo de respuesta, templates, etc.

### API Browsable
- **URL**: http://127.0.0.1:8000/api/
- **Funcionalidad**: Interfaz web para explorar y probar los endpoints de la API

### Admin Panel
- **URL**: http://127.0.0.1:8000/admin/
- **Funcionalidad**: Panel de administración de Django para gestionar datos

## Estructura del Proyecto

```
Localix-backend/
├── Backend/                 # Configuración principal del proyecto
│   ├── settings.py         # Configuraciones (ahora usa variables de entorno)
│   ├── urls.py            # URLs principales
│   └── views.py           # Vistas generales
├── api/                   # API pública
├── categorias/           # App de categorías
├── productos/            # App de productos
├── pedidos/             # App de pedidos
├── usuarios/            # App de usuarios
├── ventas/              # App de ventas
├── static/              # Archivos estáticos
├── media/               # Archivos de media
├── .env                 # Variables de entorno (no versionar)
├── requirements.txt     # Dependencias Python
└── manage.py           # Script de gestión Django
```

## Comandos Útiles para Desarrollo

### Verificar Configuración
```bash
python manage.py check
```

### Ver Estado de Migraciones
```bash
python manage.py showmigrations
```

### Crear Migraciones
```bash
python manage.py makemigrations
```

### Aplicar Migraciones
```bash
python manage.py migrate
```

### Recopilar Archivos Estáticos
```bash
python manage.py collectstatic
```

### Ejecutar Tests
```bash
python manage.py test
```

## Configuración de CORS

El proyecto está configurado para permitir requests desde:
- http://localhost:3000 (React)
- http://localhost:5173 (Vite)
- http://localhost:8080 (Vue)
- Y la URL configurada en FRONTEND_URL

## Autenticación

El proyecto utiliza dos métodos de autenticación:
1. **JWT Authentication**: Para el dashboard/panel de administración
2. **API Key Authentication**: Para la API pública

## Solución de Problemas Comunes

### Error de Conexión a Base de Datos
- Verificar que PostgreSQL esté ejecutándose
- Comprobar credenciales en el archivo `.env`
- Verificar que la base de datos `localix` exista

### Error de Migraciones
```bash
python manage.py migrate --fake-initial
```

### Error de Archivos Estáticos
```bash
python manage.py collectstatic --clear
```

### Problemas con CORS
- Verificar que FRONTEND_URL esté configurado correctamente
- Comprobar que CORS_ALLOW_ALL_ORIGINS=True en desarrollo

## Contacto y Soporte

Para problemas o preguntas sobre el desarrollo, contactar al equipo de desarrollo.

## Notas Importantes

- **NO** subir el archivo `.env` al repositorio
- Mantener `DEBUG=True` solo en desarrollo
- Usar `python manage.py check` regularmente para verificar la configuración
- El Django Debug Toolbar solo aparece cuando `DEBUG=True` y desde IPs en `INTERNAL_IPS`