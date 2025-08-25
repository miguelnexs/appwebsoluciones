# 🚀 Localix - Sistema de Gestión de Inventario

![Localix Logo](https://img.shields.io/badge/Localix-Dashboard-blue?style=for-the-badge&logo=electron)
![Python](https://img.shields.io/badge/Python-3.8+-green?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)
![Electron](https://img.shields.io/badge/Electron-25+-purple?style=for-the-badge&logo=electron)
![Django](https://img.shields.io/badge/Django-4.2+-green?style=for-the-badge&logo=django)

## 📋 Descripción

**Localix** es un sistema completo de gestión de inventario desarrollado con tecnologías modernas. Combina un backend robusto en Django con un frontend elegante en React/Electron, proporcionando una solución integral para la gestión de productos, categorías, colores, imágenes y ventas.

## ✨ Características Principales

### 🎨 Gestión de Productos
- ✅ Creación y edición de productos con múltiples colores
- ✅ Gestión de imágenes por color
- ✅ Control de stock por color
- ✅ Categorización avanzada
- ✅ Exportación a Excel con información completa

### 📊 Dashboard Inteligente
- ✅ Estadísticas en tiempo real
- ✅ Gráficos interactivos
- ✅ Resumen de ventas y productos
- ✅ Indicadores de rendimiento

### 🛒 Sistema de Ventas
- ✅ Ventas rápidas
- ✅ Gestión de clientes
- ✅ Historial de transacciones
- ✅ Control de inventario automático

### 🎯 Gestión de Clientes
- ✅ Base de datos de clientes
- ✅ Historial de compras
- ✅ Estadísticas por cliente
- ✅ Búsqueda avanzada

## 🏗️ Arquitectura del Proyecto

```
Localix/
├── Localix-backend/          # Backend Django
│   ├── api/                  # API REST
│   ├── productos/            # App de productos
│   ├── categorias/           # App de categorías
│   ├── ventas/              # App de ventas
│   └── clientes/            # App de clientes
├── Localix-dashboard/        # Frontend Electron/React
│   ├── src/
│   │   ├── main/            # Proceso principal Electron
│   │   ├── preload/         # Scripts de preload
│   │   └── renderer/        # Aplicación React
│   └── public/              # Archivos estáticos
└── docs/                    # Documentación
```

## 🚀 Tecnologías Utilizadas

### Backend
- **Django 4.2+** - Framework web robusto
- **Django REST Framework** - API REST
- **PostgreSQL/SQLite** - Base de datos
- **Pillow** - Procesamiento de imágenes
- **Celery** - Tareas asíncronas (opcional)

### Frontend
- **React 18+** - Biblioteca de UI
- **Electron 25+** - Aplicación de escritorio
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos modernos
- **React Router** - Navegación
- **React Hook Form** - Formularios

### Herramientas de Desarrollo
- **Vite** - Bundler y dev server
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Git** - Control de versiones

## 📦 Instalación

### Prerrequisitos
- Python 3.8+
- Node.js 18+
- npm o yarn
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/miguelnexs/localix.git
cd localix
```

### 2. Configurar el Backend
```bash
cd Localix-backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

### 3. Configurar el Frontend
```bash
cd Localix-dashboard

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🔧 Configuración

### Variables de Entorno (Backend)
Crear archivo `.env` en `Localix-backend/`:
```env
DEBUG=True
SECRET_KEY=tu-clave-secreta
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Configuración del Frontend
El frontend se conecta automáticamente al backend en `http://localhost:8000`. Para cambiar la URL, modificar `src/renderer/src/api/apiConfig.js`.

## 📖 Uso

### Iniciar el Sistema Completo
1. **Backend**: `python manage.py runserver` (puerto 8000)
2. **Frontend**: `npm run dev` (puerto 5173)
3. **Electron**: Se abrirá automáticamente

### Funcionalidades Principales

#### Gestión de Productos
- Crear productos con múltiples colores
- Subir imágenes por color
- Controlar stock individual
- Exportar a Excel

#### Dashboard
- Ver estadísticas en tiempo real
- Monitorear ventas
- Analizar rendimiento

#### Ventas
- Procesar ventas rápidas
- Gestionar clientes
- Controlar inventario

## 🎨 Características de Diseño

- **Tema claro/oscuro** con transiciones suaves
- **Interfaz minimalista** y moderna
- **Responsive design** para diferentes pantallas
- **Animaciones fluidas** y feedback visual
- **Iconografía consistente** con Lucide React

## 📊 Exportación de Datos

### Excel con Información Completa
- ✅ Datos básicos del producto
- ✅ Colores disponibles con stock
- ✅ Imágenes por color
- ✅ Información de categorías
- ✅ Fechas de creación y actualización
- ✅ Metadatos SEO

## 🔒 Seguridad

- **Validación de datos** en frontend y backend
- **Autenticación** con Django
- **CORS configurado** para desarrollo
- **Sanitización de archivos** subidos
- **Protección CSRF** habilitada

## 🧪 Testing

### Backend
```bash
cd Localix-backend
python manage.py test
```

### Frontend
```bash
cd Localix-dashboard
npm test
```

## 📝 Scripts Disponibles

### Backend
```bash
python manage.py runserver    # Servidor de desarrollo
python manage.py migrate      # Aplicar migraciones
python manage.py collectstatic # Recolectar archivos estáticos
python manage.py shell        # Shell de Django
```

### Frontend
```bash
npm run dev                   # Desarrollo
npm run build                 # Construir para producción
npm run preview               # Vista previa de producción
npm run lint                  # Linting
npm run format                # Formatear código
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Miguel Núñez**
- GitHub: [@miguelnexs](https://github.com/miguelnexs)

## 🙏 Agradecimientos

- **Django** por el framework web robusto
- **React** por la biblioteca de UI
- **Electron** por hacer posible las apps de escritorio
- **Tailwind CSS** por el framework de estilos
- **Lucide** por los iconos hermosos

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda:

- 📧 Email: appwebsoluciones@appwebsoluciones.com
- 🐛 Issues: [GitHub Issues](https://github.com/miguelnexs/localix/issues)
- 📖 Wiki: [Documentación](https://github.com/miguelnexs/localix/wiki)

---

⭐ **¡No olvides darle una estrella al proyecto si te gusta!** ⭐
