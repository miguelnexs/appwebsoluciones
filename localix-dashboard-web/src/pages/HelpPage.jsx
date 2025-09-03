import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useState, useMemo } from 'react';
import { 
  HelpCircle, ChevronDown, ChevronUp, Mail, Phone, Info, CheckCircle, 
  TrendingUp, User, Search, BookOpen, AlertTriangle, Zap, Shield,
  Play, FileText, Settings, ShoppingCart, Package, Users, BarChart3,
  Lightbulb, ArrowRight, ExternalLink, MessageCircle, Video, Clock
} from 'lucide-react';

const quickGuides = [
  {
    title: '🚀 Primeros Pasos',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    items: [
      'Configurar información básica de la tienda',
      'Agregar tu primer producto',
      'Crear categorías principales',
      'Configurar métodos de pago'
    ]
  },
  {
    title: '📦 Gestión de Productos',
    icon: Package,
            color: 'from-blue-500 to-blue-600',
    items: [
      'Agregar productos con variantes y colores',
      'Gestionar stock e inventario',
      'Configurar alertas de stock bajo',
      'Importar productos masivamente'
    ]
  },
  {
    title: '🛒 Ventas y Pedidos',
    icon: ShoppingCart,
    color: 'from-purple-500 to-purple-600',
    items: [
      'Registrar una venta rápida',
      'Crear pedidos personalizados',
      'Gestionar estados de pedidos',
      'Generar reportes de ventas'
    ]
  },
  {
    title: '👥 Gestión de Clientes',
    icon: Users,
    color: 'from-orange-500 to-orange-600',
    items: [
      'Agregar nuevos clientes',
      'Ver historial de compras',
      'Gestionar datos de contacto',
      'Configurar descuentos especiales'
    ]
  }
];

const faqs = [
  {
    category: 'Productos',
    question: '¿Cómo agrego un producto con múltiples colores y tallas?',
    answer: 'Ve a Productos → Agregar Producto. En la sección de variantes, puedes agregar diferentes colores y tallas. Cada combinación puede tener su propio stock y precio.',
    tags: ['productos', 'variantes', 'colores', 'stock']
  },
  {
    category: 'Ventas',
    question: '¿Cómo registro una venta rápida?',
    answer: 'En Ventas, usa el botón "Venta Rápida". Busca el producto, selecciona cantidad y color, agrega cliente (opcional) y confirma la venta.',
    tags: ['ventas', 'venta rápida', 'registro']
  },
  {
    category: 'Inventario',
    question: '¿Cómo configuro alertas de stock bajo?',
    answer: 'En cada producto, puedes establecer un "Stock Mínimo". El sistema te alertará automáticamente cuando el stock esté por debajo de este límite.',
    tags: ['stock', 'alertas', 'inventario', 'configuración']
  },
  {
    category: 'Clientes',
    question: '¿Cómo veo el historial completo de un cliente?',
    answer: 'Ve a Clientes, selecciona el cliente y haz clic en "Ver Historial". Verás todas sus compras, pedidos pendientes y estadísticas.',
    tags: ['clientes', 'historial', 'compras']
  },
  {
    category: 'Reportes',
    question: '¿Cómo genero reportes de ventas por período?',
    answer: 'En Dashboard, usa los filtros de fecha para seleccionar el período. Puedes exportar los datos o ver gráficos interactivos.',
    tags: ['reportes', 'ventas', 'estadísticas', 'dashboard']
  },
  {
    category: 'Pedidos',
    question: '¿Cómo cambio el estado de un pedido?',
    answer: 'En Pedidos, selecciona el pedido y usa el menú desplegable de estado. Puedes cambiar entre: Pendiente, En Proceso, Enviado, Entregado.',
    tags: ['pedidos', 'estados', 'gestión']
  },
  {
    category: 'Configuración',
    question: '¿Cómo configuro los métodos de pago?',
    answer: 'Ve a Configuración → Métodos de Pago. Puedes habilitar/deshabilitar efectivo, tarjetas, transferencias, etc.',
    tags: ['configuración', 'pagos', 'métodos']
  },
  {
    category: 'Errores',
    question: '¿Qué hago si no puedo agregar un producto?',
    answer: 'Verifica que todos los campos obligatorios estén completos: nombre, precio, categoría. Si el error persiste, revisa la conexión a internet.',
    tags: ['errores', 'productos', 'solución', 'campos obligatorios']
  }
];

const commonErrors = [
  {
    error: 'No se pueden cargar los productos',
    icon: AlertTriangle,
    color: 'text-theme-error',
    solutions: [
      'Verificar conexión a internet',
      'Reiniciar la aplicación',
      'Verificar que el servidor backend esté funcionando',
      'Contactar soporte técnico'
    ]
  },
  {
    error: 'Error al guardar venta',
    icon: ShoppingCart,
    color: 'text-theme-warning',
    solutions: [
      'Verificar que el producto tenga stock disponible',
      'Comprobar que todos los campos estén completos',
      'Intentar con un cliente diferente',
      'Revisar la configuración de métodos de pago'
    ]
  },
  {
    error: 'Stock no se actualiza correctamente',
    icon: Package,
    color: 'text-theme-warning',
    solutions: [
      'Verificar que el producto tenga variantes configuradas correctamente',
      'Actualizar la página y intentar nuevamente',
      'Revisar los ajustes de inventario del producto',
      'Contactar soporte si el problema persiste'
    ]
  }
];

const resources = [
  {
    title: 'Manual de Usuario Completo',
    description: 'Guía detallada de todas las funcionalidades',
    icon: BookOpen,
    color: 'bg-theme-primary bg-opacity-10 text-theme-primary',
    link: '#manual'
  },
  {
    title: 'Video Tutoriales',
    description: 'Aprende visualmente paso a paso',
    icon: Video,
    color: 'bg-theme-accent/10 text-theme-accent',
    link: '#videos'
  },
  {
    title: 'Preguntas Frecuentes',
    description: 'Respuestas a dudas comunes',
    icon: MessageCircle,
    color: 'bg-theme-success bg-opacity-10 text-theme-success',
    link: '#faq'
  },
  {
    title: 'Soporte Técnico',
    description: 'Ayuda personalizada inmediata',
    icon: Settings,
    color: 'bg-theme-warning bg-opacity-10 text-theme-warning',
    link: '#soporte'
  }
];

const HelpPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = !searchTerm || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const highlightText = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.split(regex).map((part, index) => 
      regex.test(part) ? <span key={index} className="search-highlight">{part}</span> : part
    );
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-theme-primary rounded-2xl shadow-lg">
              <HelpCircle size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-theme-text">Centro de Ayuda</h1>
          </div>
          <p className="text-xl text-theme-textSecondary max-w-2xl mx-auto">
            Todo lo que necesitas saber para aprovechar al máximo tu sistema de gestión. 
            Encuentra respuestas rápidas y aprende nuevas funcionalidades.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-slide-in-left">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-textSecondary" size={20} />
            <input
              type="text"
              placeholder="Buscar en la ayuda... (ej: agregar producto, venta rápida, stock)"
              className="w-full pl-12 pr-4 py-4 border border-theme-border rounded-2xl shadow-sm focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-all text-lg bg-theme-surface text-theme-text placeholder-theme-textSecondary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Access Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-in-right">
          {resources.map((resource, index) => (
            <div key={index} className="help-card bg-theme-surface rounded-2xl p-6 shadow-sm border border-theme-border cursor-pointer hover:bg-theme-secondary transition-colors">
              <div className={`inline-flex p-3 rounded-xl ${resource.color} mb-4`}>
                <resource.icon size={24} />
              </div>
              <h3 className="font-semibold text-theme-text mb-2">{resource.title}</h3>
              <p className="text-sm text-theme-textSecondary mb-4">{resource.description}</p>
              <div className="flex items-center text-theme-primary text-sm font-medium">
                Ver más <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start Guides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-theme-text mb-6 flex items-center gap-3">
            <Lightbulb className="text-theme-warning" size={28} />
            Guías de Inicio Rápido
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quickGuides.map((guide, index) => (
              <div key={index} className="help-card bg-theme-surface rounded-2xl p-6 border border-theme-border hover:bg-theme-secondary transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-theme-primary rounded-xl shadow-lg">
                    <guide.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-text">{guide.title}</h3>
                </div>
                <ul className="space-y-2">
                  {guide.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-2 text-theme-textSecondary">
                      <CheckCircle size={16} className="text-theme-success flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-4 flex items-center gap-2 text-theme-primary hover:text-theme-primary hover:opacity-80 font-medium text-sm transition-colors">
                  <Play size={16} />
                  Ver guía completa
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-theme-text flex items-center gap-3 mb-4 md:mb-0">
              <MessageCircle className="text-theme-primary" size={28} />
              Preguntas Frecuentes
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-theme-primary text-white shadow-md'
                      : 'bg-theme-secondary text-theme-textSecondary hover:bg-theme-border'
                  }`}
                >
                  {category === 'all' ? 'Todas' : category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="help-card bg-theme-surface rounded-xl border border-theme-border shadow-sm overflow-hidden">
                <button
                  className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none hover:bg-theme-secondary transition-colors"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="px-2 py-1 bg-theme-primary bg-opacity-10 text-theme-primary text-xs font-medium rounded-full">
                        {faq.category}
                      </span>
                    </div>
                    <span className="font-medium text-theme-text">
                      {highlightText(faq.question, searchTerm)}
                    </span>
                  </div>
                  {openFaq === idx ? 
                    <ChevronUp size={20} className="text-theme-primary flex-shrink-0 ml-4" /> : 
                    <ChevronDown size={20} className="text-theme-textSecondary flex-shrink-0 ml-4" />
                  }
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 animate-fade-in">
                    <div className="bg-theme-secondary rounded-lg p-4">
                      <p className="text-theme-textSecondary mb-3">
                        {highlightText(faq.answer, searchTerm)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-theme-border text-theme-textSecondary text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="text-theme-textSecondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-theme-text mb-2">No se encontraron resultados</h3>
              <p className="text-theme-textSecondary">Intenta con otros términos de búsqueda o selecciona una categoría diferente.</p>
            </div>
          )}
        </div>

        {/* Common Errors Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-theme-text mb-6 flex items-center gap-3">
            <AlertTriangle className="text-theme-warning" size={28} />
            Solución de Problemas Comunes
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {commonErrors.map((error, index) => (
              <div key={index} className="help-card bg-theme-surface rounded-2xl p-6 border border-theme-border hover:bg-theme-secondary transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <error.icon size={24} className={error.color} />
                  <h3 className="font-semibold text-theme-text">{error.error}</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-theme-textSecondary font-medium">Soluciones:</p>
                  {error.solutions.map((solution, solutionIndex) => (
                    <div key={solutionIndex} className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-theme-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-theme-textSecondary">{solution}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-theme-primary bg-opacity-5 border border-theme-primary border-opacity-20 rounded-2xl p-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-theme-primary rounded-2xl shadow-lg">
                <Mail size={32} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-theme-text mb-3">
              ¿Necesitas ayuda personalizada?
            </h3>
            <p className="text-theme-textSecondary mb-6 text-lg">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier duda o problema técnico.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <a 
                href="mailto:soporte@mitienda.com" 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-theme-primary text-white rounded-xl font-semibold shadow-lg hover:bg-theme-primary hover:opacity-90 transition-all hover:scale-105"
              >
                <Mail size={20} />
                Enviar Email
              </a>
              <a 
                href="tel:+573001234567" 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-theme-primary text-white rounded-xl font-semibold shadow-lg hover:bg-theme-primary hover:opacity-90 transition-all hover:scale-105"
              >
                <Phone size={20} />
                Llamar Ahora
              </a>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-theme-textSecondary">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>Respuesta en 24h</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield size={16} />
                <span>Soporte gratuito</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpPage; 
