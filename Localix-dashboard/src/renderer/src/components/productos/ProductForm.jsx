
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { CheckCircle, AlertCircle, Info, Save, X, DollarSign, Image, FolderOpen, Truck, Palette, Search, Package, Settings } from 'lucide-react';
import ProductFormColors from './ProductFormColors';
import ProductFormCaracteristicas from './ProductFormCaracteristicas';
import { API_URL, RESOURCE_URL } from '../../api/apiConfig';

// Constantes
const PRODUCT_TYPES = [{ value: 'fisico', label: 'Físico' }, { value: 'digital', label: 'Digital' }, { value: 'servicio', label: 'Servicio' }];
const PRODUCT_STATUSES = [{ value: 'borrador', label: 'Borrador' }, { value: 'publicado', label: 'Publicado' }, { value: 'agotado', label: 'Agotado' }, { value: 'descontinuado', label: 'Descontinuado' }];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];


export default function ProductForm({ productToEdit, onSuccess, onCancel, compact = false }) {
  const { slug: slugFromParams } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Asegurar que la pestaña activa sea válida
  useEffect(() => {
    if (!productToEdit && (activeTab === 'colores' || activeTab === 'caracteristicas')) {
      setActiveTab('general');
    }
  }, [productToEdit, activeTab]);
  const [productId, setProductId] = useState(null);

  // Funciones para formatear precios sin decimales innecesarios
  const formatPrice = (value) => {
    if (!value || value === '' || isNaN(value)) return '';
    const num = parseFloat(value);
    // Solo mostrar decimales si no es un número entero
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  const parsePriceInput = (value) => {
    if (!value || value === '') return 0;
    // Remover cualquier carácter que no sea número o punto decimal
    const cleanValue = value.toString().replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handlePriceBlur = (fieldName) => (e) => {
    const value = e.target.value;
    if (value && value !== '') {
      const parsedValue = parsePriceInput(value);
      const formattedValue = formatPrice(parsedValue);
      setValue(fieldName, parsedValue);
      e.target.value = formattedValue;
    } else {
      // Para campos opcionales como precio_comparacion, permitir que queden vacíos
      if (fieldName === 'precio_comparacion') {
        setValue(fieldName, null);
        e.target.value = '';
      } else {
        setValue(fieldName, 0);
        e.target.value = '0';
      }
    }
  };

  const handlePriceFocus = (e) => {
    if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '') {
      e.target.value = '';
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      sku: `PROD-${Date.now()}`, // Generar SKU único por defecto
      tipo: 'fisico',
      estado: 'borrador',
      descripcion_corta: 'Descripción breve del producto', // Valor por defecto
      descripcion_larga: 'Descripción detallada del producto con todas sus características.', // Valor por defecto
      precio: 0,
      precio_comparacion: null,
      costo: 0,
      gestion_stock: true,
      stock: 0,
      stock_minimo: 5,
      peso: 0,
      dimensiones: '',
      categoria_id: '',
      meta_titulo: '',
      meta_descripcion: '',
      imagen_principal: null
    }
  });

  // Validar imagen obligatoria al crear
  const validateImageRequired = () => {
    // Solo obligatorio si es creación
    if (!productToEdit && !watch('imagen_principal')) {
      setError('❌ Error: La imagen principal es obligatoria para crear un nuevo producto. Por favor, selecciona una imagen.');
      toast.showError('Imagen requerida', 'Debes seleccionar una imagen principal para el producto.');
      return false;
    }
    return true;
  };

  // Validar categoría obligatoria
  const validateCategoryRequired = () => {
    const categoriaId = watch('categoria_id');
    if (!categoriaId || categoriaId === '') {
      setError('❌ Error: Debes seleccionar una categoría para el producto. La categoría es obligatoria.');
      toast.showError('Categoría requerida', 'Por favor, selecciona una categoría para el producto.');
      return false;
    }
    return true;
  };

  // Validar datos del formulario
  const validateFormData = (data) => {
    const errors = [];
    
    // Validar nombre (obligatorio)
    if (!data.nombre || data.nombre.trim().length < 3) {
      errors.push('El nombre del producto debe tener al menos 3 caracteres');
    }
    
    // Validar SKU (obligatorio)
    if (!data.sku || data.sku.trim().length === 0) {
      errors.push('El SKU es obligatorio');
    } else if (data.sku.length > 50) {
      errors.push('El SKU no puede tener más de 50 caracteres');
    }
    
    // Validar descripción corta (obligatoria)
    if (!data.descripcion_corta || data.descripcion_corta.trim().length === 0) {
      errors.push('La descripción corta es obligatoria');
    } else if (data.descripcion_corta.length > 160) {
      errors.push('La descripción corta no puede tener más de 160 caracteres');
    }
    
    // Validar descripción larga (obligatoria)
    if (!data.descripcion_larga || data.descripcion_larga.trim().length === 0) {
      errors.push('La descripción detallada es obligatoria');
    }
    
    // Validar precio (obligatorio y mayor a 0)
    if (!data.precio || parseFloat(data.precio) <= 0) {
      errors.push('El precio debe ser mayor a 0');
    }
    
    // Validar costo (obligatorio y no negativo)
    if (data.costo === undefined || data.costo === null || parseFloat(data.costo) < 0) {
      errors.push('El costo no puede ser negativo');
    }
    
    // Validar stock si la gestión está habilitada
    if (data.gestion_stock && (data.stock === undefined || data.stock === null || parseInt(data.stock) < 0)) {
      errors.push('El stock no puede ser negativo');
    }
    
    return errors;
  };

  // Función para asegurar que existe la categoría "General"
  const ensureGeneralCategory = async () => {
    try {
      console.log('🔍 Asegurando que existe la categoría "General"...');
      
      // Paso 1: Intentar usar el método ensureGeneral optimizado
      try {
        const generalCategory = await window.electronAPI.categorias.ensureGeneral();
        if (generalCategory) {
          console.log('✅ Categoría "General" disponible:', generalCategory);
          return generalCategory;
        }
      } catch (ensureError) {
        console.warn('⚠️ Error en ensureGeneral:', ensureError.message);
      }
      
      // Paso 2: Buscar si ya existe una categoría "General"
      try {
        const categoriesData = await window.electronAPI.categorias.listar();
        const existingGeneral = categoriesData.find(cat => 
          cat.nombre.toLowerCase() === 'general'
        );
        if (existingGeneral) {
          console.log('✅ Encontrada categoría "General" existente:', existingGeneral);
          return existingGeneral;
        }
      } catch (searchError) {
        console.warn('⚠️ Error buscando categoría existente:', searchError.message);
      }
      
      // Paso 3: Intentar crear la categoría "General"
      try {
        console.log('🆕 Intentando crear categoría "General"...');
        const newGeneralCategory = await window.electronAPI.categorias.crear({
          nombre: 'General',
          descripcion: 'Categoría general para productos sin clasificación específica',
          activa: true,
          orden: 0
        });
        console.log('✅ Categoría "General" creada exitosamente:', newGeneralCategory);
        return newGeneralCategory;
      } catch (createError) {
        console.error('❌ Error creando categoría "General":', createError.message);
        
        // Paso 4: Como último recurso, buscar cualquier categoría que contenga "general"
        try {
          const categoriesData = await window.electronAPI.categorias.listar();
          const anyGeneral = categoriesData.find(cat => 
            cat.nombre.toLowerCase().includes('general') ||
            cat.slug.toLowerCase().includes('general')
          );
          if (anyGeneral) {
            console.log('✅ Encontrada categoría similar a "General":', anyGeneral);
            return anyGeneral;
          }
        } catch (finalSearchError) {
          console.error('❌ Error en búsqueda final:', finalSearchError.message);
        }
        
        // Si todo falla, devolver null y mostrar advertencia
        console.warn('⚠️ No se pudo asegurar la categoría "General". El usuario deberá seleccionar una categoría manualmente.');
        return null;
      }
    } catch (error) {
      console.error('❌ Error general en ensureGeneralCategory:', error);
      return null;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Solo usar slug si es válido y no es 'producto'
        const validSlug = productToEdit?.slug || (slugFromParams && slugFromParams !== 'producto' ? slugFromParams : null);
        
        // Asegurar que existe la categoría "General" primero
        const generalCategory = await ensureGeneralCategory();
        
        // Cargar categorías actualizadas
        const categoriesData = await window.electronAPI.categorias.listar();
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
        setCategories(categoriesArray);
        
        if (validSlug) {
          const product = productToEdit || (await window.electronAPI.productos.obtener(validSlug));
          reset({
            ...product,
            nombre: product.nombre || '',
            categoria_id: product.categoria?.id || generalCategory?.id || null,
            precio: parseFloat(product.precio || 0),
            precio_comparacion: product.precio_comparacion ? parseFloat(product.precio_comparacion) : null,
            costo: parseFloat(product.costo || 0),
            stock_minimo: product.stock_minimo || 5,
            peso: product.peso || 0
          });

          // Establecer el ID del producto para la gestión de colores
          setProductId(product.id);
          // Mostrar la imagen principal actual si existe
          if (product.imagen_principal_url) {
            setImagePreview(product.imagen_principal_url);
          }
        } else {
          // Para productos nuevos, establecer categoría "General" por defecto
          if (generalCategory) {
            setValue('categoria_id', generalCategory.id);
          }
        }

      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    const cleanupErrorListener = window.electronAPI.eventos.onError((err) => {
      setError(err.message || 'Error desconocido');
    });

    loadInitialData();

    return () => {
      cleanupErrorListener();
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [productToEdit, slugFromParams, reset]);

  // Efecto para formatear precios cuando se cargan los datos
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'precio' || name === 'precio_comparacion' || name === 'costo') {
        // Formatear el valor en el DOM después de un pequeño delay
        setTimeout(() => {
          const input = document.querySelector(`input[name="${name}"]`);
          if (input && value[name] !== null && value[name] !== undefined && value[name] !== '') {
            const formattedValue = formatPrice(value[name]);
            if (input.value !== formattedValue) {
              input.value = formattedValue;
            }
          }
        }, 100);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, formatPrice]);

  // Función de utilidad para limpiar categorías duplicadas (disponible en window para debugging)
  useEffect(() => {
    window.cleanupDuplicateCategories = async () => {
      try {
        console.log('🧹 Iniciando limpieza manual de categorías duplicadas...');
        const result = await window.electronAPI.categorias.cleanupDuplicateGeneral();
        console.log('✅ Limpieza completada:', result);
        
        // Recargar las categorías en el formulario
        const categoriesData = await window.electronAPI.categorias.listar();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        return result;
      } catch (error) {
        console.error('❌ Error en limpieza manual:', error);
        throw error;
      }
    };

    // Limpiar al desmontar el componente
    return () => {
      delete window.cleanupDuplicateCategories;
    };
  }, []);

  // --- MANEJADOR DE IMAGEN PRINCIPAL ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        setError('La imagen no debe superar los 5MB.');
        return;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError('Tipo de imagen no válido. Use JPG, PNG o WebP.');
        return;
      }

      // Crear vista previa con base64 (como en categorías)
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result.split(',')[1]; // Solo la parte base64
        setImagePreview(e.target.result); // URL completa para vista previa
        
        // Guardar en el formulario con estructura similar a categorías
        setValue('imagen_principal', {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: base64Data // base64 puro
        });
        
        setError(null);
      };
      reader.onerror = () => {
        setError('Error al leer el archivo. Intenta con otra imagen.');
      };
      reader.readAsDataURL(file);
    }
  };

  // --- MANEJADOR DE SUBMIT ---
  const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// --- MANEJADOR DE SUBMIT ---
const onSubmit = async (data) => {
  setIsLoading(true);
  setError(null);

  // Validar imagen obligatoria
  if (!validateImageRequired()) {
    setIsLoading(false);
    return;
  }

  // Validar categoría obligatoria
  if (!validateCategoryRequired()) {
    setIsLoading(false);
    return;
  }

  // Validar datos del formulario
  const validationErrors = validateFormData(data);
  if (validationErrors.length > 0) {
    const errorMessage = `❌ Errores en el formulario:\n${validationErrors.map(err => `• ${err}`).join('\n')}`;
    setError(errorMessage);
    toast.showError('Formulario incompleto', validationErrors[0]);
    setIsLoading(false);
    return;
  }

  try {
    // Log completo de los datos antes de enviar
    console.log('📦 PAYLOAD COMPLETO a enviar:', {
      ...data,
      imagen_principal: data.imagen_principal ? {
        name: data.imagen_principal.name,
        type: data.imagen_principal.type,
        size: data.imagen_principal.size
      } : null
    });
    
    // Solo usar slug si es válido y no es 'producto'
    const validSlug = productToEdit?.slug || (slugFromParams && slugFromParams !== 'producto' ? slugFromParams : null);
    let productoResult = null;
    let productoSlug = validSlug;
    let productoId = productToEdit?.id;

    // 1. Crear o actualizar producto con imagen incluida (como en categorías)
    if (validSlug) {
      // Actualizar producto existente
      // Estandarizar imagen si existe
      let payload = { ...data };
      if (data.imagen_principal && data.imagen_principal.data) {
        payload.imagen_principal = {
          name: data.imagen_principal.name || 'imagen.jpg',
          type: data.imagen_principal.type || 'image/jpeg',
          size: data.imagen_principal.size,
          lastModified: data.imagen_principal.lastModified,
          data: data.imagen_principal.data
        };
      }
      productoResult = await window.electronAPI.productos.actualizar(validSlug, payload);
      productoSlug = validSlug;
      // Para actualización, la respuesta es directa
      productoId = productoResult.id;
    } else {
      // Crear nuevo producto
      // Estandarizar imagen si existe
      let payload = { ...data };
      if (data.imagen_principal && data.imagen_principal.data) {
        payload.imagen_principal = {
          name: data.imagen_principal.name || 'imagen.jpg',
          type: data.imagen_principal.type || 'image/jpeg',
          size: data.imagen_principal.size,
          lastModified: data.imagen_principal.lastModified,
          data: data.imagen_principal.data
        };
      }
      productoResult = await window.electronAPI.productos.crear(payload);
      
      // Debug logging para verificar la respuesta
      console.log('🔍 Respuesta completa al crear producto:', productoResult);
      
      // La respuesta del backend está envuelta en un objeto con clave 'producto'
      productoSlug = productoResult.producto?.slug || productoResult.slug;
      productoId = productoResult.producto?.id || productoResult.id;
      
      // Verificar que tenemos los datos necesarios
      console.log('✅ Datos extraídos - Slug:', productoSlug, 'ID:', productoId);
      
      if (!productoSlug || !productoId) {
        console.error('⚠️ Producto creado pero faltan datos críticos:', { productoSlug, productoId });
        setError('Producto creado parcialmente. Por favor, recarga la página.');
      }
    }

    setProductId(productoId);
    toast.showProductSaved(!validSlug);
    
    // Solo navegar automáticamente si estamos en la pestaña general
    // Para pestañas como características o colores, mantener al usuario en el formulario
    if (activeTab === 'general') {
      if (onSuccess) {
        onSuccess(!validSlug); // true = nuevo producto, false = editado
      } else {
        navigate('/products');
        setTimeout(() => window.location.reload(), 100);
      }
    }
    // Si estamos en otras pestañas, solo mostrar el toast de éxito sin navegar
  } catch (err) {
    console.error('❌ Error al guardar producto:', err);
    
    let errorMessage = '❌ Error al guardar el producto';
    let toastTitle = 'Error al guardar';
    let toastMessage = 'Ha ocurrido un error inesperado';
    
    // Analizar el tipo de error para proporcionar mensajes específicos
    if (err.message) {
      if (err.message.includes('400')) {
        errorMessage = '❌ Error: Los datos del producto no son válidos. Por favor, revisa la información ingresada.';
        toastTitle = 'Datos inválidos';
        toastMessage = 'Revisa que todos los campos estén correctamente completados';
      } else if (err.message.includes('401')) {
        errorMessage = '❌ Error: No tienes permisos para realizar esta acción. Verifica tu sesión.';
        toastTitle = 'Sin permisos';
        toastMessage = 'Tu sesión puede haber expirado';
      } else if (err.message.includes('404')) {
        errorMessage = '❌ Error: El producto no fue encontrado. Puede haber sido eliminado.';
        toastTitle = 'Producto no encontrado';
        toastMessage = 'El producto que intentas editar no existe';
      } else if (err.message.includes('409')) {
        errorMessage = '❌ Error: Ya existe un producto con el mismo nombre o SKU. Por favor, usa valores únicos.';
        toastTitle = 'Producto duplicado';
        toastMessage = 'El nombre o SKU ya están en uso';
      } else if (err.message.includes('500')) {
        errorMessage = '❌ Error del servidor: Hay un problema técnico. Intenta nuevamente en unos minutos.';
        toastTitle = 'Error del servidor';
        toastMessage = 'Problema técnico temporal';
      } else if (err.message.includes('Network Error') || err.message.includes('fetch')) {
        errorMessage = '❌ Error de conexión: Verifica tu conexión a internet e intenta nuevamente.';
        toastTitle = 'Sin conexión';
        toastMessage = 'Revisa tu conexión a internet';
      } else {
        errorMessage = `❌ Error: ${err.message}`;
        toastMessage = err.message;
      }
    }
    
    setError(errorMessage);
    toast.error(toastTitle, toastMessage);
  } finally {
    setIsLoading(false);
  }
};

  // --- MANEJADOR DE CATEGORÍAS SECUNDARIAS ---
  // Elimina handleSecondaryCategoriesChange

  // Removido: Pantalla de carga completa
  // Ahora el loading se maneja de forma más sutil en el botón de guardar

  const tabs = [
    { id: 'general', label: 'Información General', icon: '📝' },
    // Solo mostrar pestañas de colores y características si es edición (productToEdit existe)
    ...(productToEdit ? [{ id: 'colores', label: 'Colores', icon: '🎨' }] : []),
    ...(productToEdit ? [{ id: 'caracteristicas', label: 'Características', icon: '⚙️' }] : []),
    { id: 'seo', label: 'SEO', icon: '🔍' }
  ];

  return (
    <div className={`${compact ? 'p-4' : 'p-6'} bg-theme-background`}>
      {!compact && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-theme-primary bg-opacity-10 rounded-lg border border-theme-primary border-opacity-20">
              <Package className="h-6 w-6 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-text">{productToEdit ? 'Editar Producto' : 'Crear Producto'}</h1>
          </div>
          <p className="text-theme-textSecondary text-lg">
            {productToEdit ? 'Modifica la información del producto' : 'Completa la información del nuevo producto'}
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-theme-error bg-opacity-10 border border-theme-error text-theme-error px-6 py-4 rounded-xl relative mb-6 flex items-center gap-3" role="alert">
          <AlertCircle className="h-6 w-6 text-theme-error" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Pestañas mejoradas */}
        <div className="bg-theme-surface rounded-xl border border-theme-border p-1">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-theme-primary text-white shadow-md'
                    : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-secondary'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda */}
            <div className="lg:col-span-2 space-y-8">
              {/* Información General */}
              <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
                <div className="bg-theme-primary bg-opacity-5 px-6 py-4 border-b border-theme-border">
                  <h2 className="text-xl font-semibold text-theme-text flex items-center gap-2">
                    <Package className="h-5 w-5 text-theme-primary" />
                    Información General
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Nombre del Producto *</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors" 
                        placeholder="Ej: Bolso de Cuero Premium"
                        {...register('nombre', { required: 'El nombre es obligatorio' })} 
                      />
                      {errors.nombre && <p className="mt-2 text-sm text-theme-error flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.nombre.message}
                      </p>}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">SKU *</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors" 
                        placeholder="Ej: BOL-001"
                        required
                        {...register('sku', { required: 'El SKU es obligatorio', maxLength: { value: 50, message: 'El SKU no puede tener más de 50 caracteres' } })} 
                      />
                      {errors.sku && <p className="mt-1 text-sm text-red-500">{errors.sku.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Descripción Corta *</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors" 
                      rows={3} 
                      placeholder="Descripción breve del producto..."
                      required
                      {...register('descripcion_corta', { required: 'La descripción corta es obligatoria' })} 
                    />
                    {errors.descripcion_corta && <p className="mt-1 text-sm text-red-500">{errors.descripcion_corta.message}</p>}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Descripción Larga *</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors" 
                      rows={6} 
                      placeholder="Descripción detallada del producto..."
                      required
                      {...register('descripcion_larga', { required: 'La descripción larga es obligatoria' })} 
                    />
                    {errors.descripcion_larga && <p className="mt-1 text-sm text-red-500">{errors.descripcion_larga.message}</p>}
                  </div>
                </div>
              </div>

              {/* Sección de Precios */}
              <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
                <div className="bg-theme-primary bg-opacity-5 px-6 py-4 border-b border-theme-border">
                  <h2 className="text-xl font-semibold text-theme-text flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-theme-primary" />
                    Precios y Costos
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Precio de Venta *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-textSecondary">$</span>
                        <input 
                          type="number"
                          step="1" 
                          min="0"
                          className="w-full pl-8 pr-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" 
                          placeholder="0"
                          {...register('precio', { 
                            required: 'El precio es obligatorio',
                            valueAsNumber: true,
                            min: { value: 0, message: 'El precio no puede ser negativo' },
                            validate: value => Number.isInteger(value) || 'Debe ser un número entero'
                          })}
                          onFocus={handlePriceFocus}
                          onBlur={handlePriceBlur('precio')}
                        />
                      </div>
                      <span className="text-xs text-theme-textSecondary mt-1 block">Precio en números enteros (ej: 120000)</span>
                      {errors.precio && <p className="mt-2 text-sm text-theme-error flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.precio.message}
                      </p>}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Precio de Comparación <span className='text-xs text-theme-textSecondary'>(opcional)</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-textSecondary">$</span>
                        <input 
                          type="number"
                          step="1" 
                          min="0"
                          className="w-full pl-8 pr-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" 
                          placeholder="0"
                          {...register('precio_comparacion', { 
                            valueAsNumber: true,
                            min: { value: 0, message: 'Debe ser un valor positivo' },
                            validate: value => value === null || value === undefined || value === '' || Number.isInteger(value) || 'Debe ser un número entero'
                          })}
                          onFocus={handlePriceFocus}
                          onBlur={handlePriceBlur('precio_comparacion')}
                        />
                      </div>
                      <span className="text-xs text-theme-textSecondary mt-1 block">Precio anterior en números enteros (ej: 150000)</span>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Costo</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-textSecondary">$</span>
                        <input 
                          type="number"
                          step="1" 
                          min="0"
                          className="w-full pl-8 pr-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-colors appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" 
                          placeholder="0"
                          {...register('costo', { 
                            valueAsNumber: true,
                            min: { value: 0, message: 'Debe ser un valor positivo' },
                            validate: value => Number.isInteger(value) || 'Debe ser un número entero'
                          })}
                          onFocus={handlePriceFocus}
                          onBlur={handlePriceBlur('costo')}
                        />
                      </div>
                      <span className="text-xs text-theme-textSecondary mt-1 block">Costo en números enteros (ej: 80000)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Inventario */}
              <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
                <div className="bg-theme-warning bg-opacity-10 px-6 py-4 border-b border-theme-border">
                  <h2 className="text-xl font-semibold text-theme-text flex items-center gap-2">
                    <Package className="h-5 w-5 text-theme-warning" />
                    Gestión de Inventario
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Stock Disponible</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-warning focus:border-theme-warning transition-colors" 
                        placeholder="0"
                        {...register('stock', { 
                          valueAsNumber: true, 
                          min: { value: 0, message: 'El stock no puede ser negativo' },
                          validate: value => value >= 0 || 'El stock debe ser mayor o igual a 0'
                        })} 
                      />
                      {errors.stock && <p className="mt-2 text-sm text-theme-error flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.stock.message}
                      </p>}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Stock Mínimo</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-warning focus:border-theme-warning transition-colors" 
                        placeholder="5"
                        {...register('stock_minimo', { 
                          valueAsNumber: true, 
                          min: { value: 0, message: 'El stock mínimo no puede ser negativo' },
                          validate: value => value >= 0 || 'El stock mínimo debe ser mayor o igual a 0'
                        })} 
                      />
                      {errors.stock_minimo && <p className="mt-2 text-sm text-theme-error flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.stock_minimo.message}
                      </p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-8">
              {/* Organización */}
              <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
                <div className="bg-theme-accent bg-opacity-10 px-6 py-4 border-b border-theme-border">
                  <h2 className="text-xl font-semibold text-theme-text flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-theme-accent" />
                    Organización
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Tipo de Producto</label>
                    <select className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-colors" {...register('tipo')}>
                      {PRODUCT_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Estado</label>
                    <select className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-colors" {...register('estado')}>
                      {PRODUCT_STATUSES.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                  </div>
                  <div>
                                          <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">
                        Categoría Principal *
                        <span className="text-theme-error ml-1">*</span>
                      </label>
                      <select 
                        className={`w-full px-4 py-3 bg-theme-surface border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-colors ${
                          errors.categoria_id ? 'border-theme-error bg-theme-error bg-opacity-10' : 'border-theme-border'
                        }`}
                        {...register('categoria_id', { 
                          required: 'Debes seleccionar una categoría',
                          validate: value => value !== '' || 'Debes seleccionar una categoría'
                        })}
                      >
                        <option value="">Selecciona una categoría...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.categoria_id && (
                        <p className="mt-1 text-sm text-theme-error flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.categoria_id.message}
                        </p>
                      )}
                  </div>
                  {/* Elimina el select de categorías secundarias del render */}
                </div>
              </div>

              {/* Imagen Principal */}
              <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
                <div className="bg-theme-success bg-opacity-10 px-6 py-4 border-b border-theme-border">
                  <h2 className="text-xl font-semibold text-theme-text flex items-center gap-2">
                    <Image className="h-5 w-5 text-theme-success" />
                    Imagen Principal
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Imagen Principal *</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <label className="inline-flex items-center px-4 py-2 bg-theme-primary text-white rounded-lg cursor-pointer hover:bg-theme-primary hover:opacity-90 transition-colors">
                        <Image className="mr-2" />
                        Seleccionar Imagen
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {imagePreview && (
                        <div className="flex flex-col items-start gap-2">
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="rounded-lg max-h-32 border border-theme-border shadow-sm"
                            />
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 w-6 h-6 bg-theme-error text-white rounded-full hover:bg-theme-error hover:opacity-90 flex items-center justify-center text-xs"
                              onClick={() => {
                                setImagePreview('');
                                setValue('imagen_principal', null);
                              }}
                            >
                              ×
                            </button>
                          </div>
                          <span className="text-xs text-theme-textSecondary">
                            {watch('imagen_principal')?.name || 'Imagen seleccionada'}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-theme-textSecondary mt-2">Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 5MB.</p>
                    {error && error.toLowerCase().includes('imagen') && (
                      <p className="mt-2 text-sm text-theme-error flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Envío */}
              <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
                <div className="bg-theme-accent bg-opacity-10 px-6 py-4 border-b border-theme-border">
                  <h2 className="text-xl font-semibold text-theme-text flex items-center gap-2">
                    <Truck className="h-5 w-5 text-theme-accent" />
                    Información de Envío
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Peso (kg)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-colors" 
                        placeholder="0.5"
                        {...register('peso', { valueAsNumber: true, min: 0 })} 
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Dimensiones</label>
                      <input 
                        type="text" 
                        placeholder="Largo x Ancho x Alto" 
                        className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-colors" 
                        {...register('dimensiones')} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña de Colores */}
        {activeTab === 'colores' && (
          <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
            <div className="bg-theme-accent bg-opacity-10 px-6 py-4 border-b border-theme-border">
              <h2 className="text-xl font-semibold text-theme-text flex items-center gap-2">
                <Palette className="h-5 w-5 text-theme-accent" />
                Gestión de Colores
              </h2>
            </div>
            <div className="p-6">
              <ProductFormColors 
                productId={productId} 
                onColorsChange={() => {
                  // Callback cuando se cambian los colores
                }}
              />
            </div>
          </div>
        )}

        {/* Pestaña de Características */}
        {activeTab === 'caracteristicas' && (
          <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
            <div className="bg-theme-warning bg-opacity-10 px-6 py-4 border-b border-theme-border">
              <h2 className="text-xl font-semibold text-theme-text flex items-center gap-2">
                <Settings className="h-5 w-5 text-theme-warning" />
                Gestión de Características
              </h2>
            </div>
            <div className="p-6">
              <ProductFormCaracteristicas 
                productId={productId} 
                onCaracteristicasChange={() => {
                  // Callback cuando se cambian las características
                }}
              />
            </div>
          </div>
        )}

        {/* Pestaña de SEO */}
        {activeTab === 'seo' && (
          <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
            <div className="bg-theme-success bg-opacity-10 px-6 py-4 border-b border-theme-border">
              <h2 className="text-xl font-semibold text-theme-text flex items-center gap-2">
                <Search className="h-5 w-5 text-theme-success" />
                Optimización para Buscadores (SEO)
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Meta Título</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-success focus:border-theme-success transition-colors" 
                  placeholder="Título optimizado para buscadores"
                  {...register('meta_titulo')} 
                />
                <p className="mt-1 text-xs text-theme-textSecondary">Recomendado: 50-60 caracteres</p>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-theme-textSecondary">Meta Descripción</label>
                <textarea 
                  className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-theme-text rounded-lg focus:ring-2 focus:ring-theme-success focus:border-theme-success transition-colors" 
                  rows={4} 
                  placeholder="Descripción que aparecerá en los resultados de búsqueda"
                  {...register('meta_descripcion')} 
                />
                <p className="mt-1 text-xs text-theme-textSecondary">Recomendado: 150-160 caracteres</p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-theme-border">
          {onCancel && (
                      <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-theme-textSecondary bg-theme-secondary border border-theme-border rounded-lg hover:bg-theme-border transition-colors"
          >
            Cancelar
          </button>
          )}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="px-6 py-2 text-white bg-theme-primary rounded-lg hover:bg-theme-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{isLoading ? 'Guardando...' : (productToEdit ? 'Actualizar Producto' : 'Crear Producto')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
