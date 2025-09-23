// Datos estáticos para la aplicación AP Soluciones
// Sin dependencias de API o backend

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface SubCategoria {
  id: number;
  nombre: string;
  descripcion?: string;
  slug: string;
  categoria_padre_id: number;
  activa: boolean;
  orden?: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  slug: string;
  categoria_nombre?: string;
  categoria?: number;
  subcategoria_nombre?: string;
  subcategoria?: number;
  stock?: number;
  imagen_principal?: string;
  colores?: Array<{
    id: number;
    nombre: string;
    codigo_hex: string;
    stock: number;
  }>;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  slug: string;
  activa: boolean;
  orden?: number;
  imagen?: string;
  cantidad_productos?: number;
}

// Usuario por defecto
export const defaultUser: User = {
  id: 1,
  username: 'apsoluciones',
  email: 'admin@apsoluciones.com',
  first_name: 'AP',
  last_name: 'Soluciones'
};

// Categorías estáticas
export const categorias: Categoria[] = [
  {
    id: 1,
    nombre: "Equipos de Protección",
    descripcion: "Equipos especializados para protección contra sobretensiones y descargas eléctricas",
    slug: "equipos-proteccion",
    activa: true,
    orden: 1,
    cantidad_productos: 12
  },
  {
    id: 2,
    nombre: "Sistemas de Puesta a Tierra",
    descripcion: "Soluciones completas para sistemas de puesta a tierra y conexiones equipotenciales",
    slug: "sistemas-puesta-tierra",
    activa: true,
    orden: 2,
    cantidad_productos: 8
  },
  {
    id: 3,
    nombre: "Medición y Análisis",
    descripcion: "Instrumentos de medición y análisis para sistemas eléctricos y de protección",
    slug: "medicion-analisis",
    activa: true,
    orden: 3,
    cantidad_productos: 15
  },
  {
    id: 4,
    nombre: "Servicios Especializados",
    descripcion: "Servicios de consultoría, instalación y mantenimiento especializado",
    slug: "servicios-especializados",
    activa: true,
    orden: 4,
    cantidad_productos: 6
  }
];

// Sub-categorías organizadas por categoría padre
export const subcategorias: SubCategoria[] = [
  // Subcategorías para "Equipos de Protección" (id: 1)
  {
    id: 1,
    nombre: "Supresores de Sobretensión",
    descripcion: "Dispositivos para protección contra sobretensiones transitorias",
    slug: "supresores-sobretension",
    categoria_padre_id: 1,
    activa: true,
    orden: 1
  },
  {
    id: 2,
    nombre: "Pararrayos",
    descripcion: "Sistemas de protección contra descargas atmosféricas",
    slug: "pararrayos",
    categoria_padre_id: 1,
    activa: true,
    orden: 2
  },
  {
    id: 3,
    nombre: "Protectores de Línea",
    descripcion: "Equipos de protección para líneas de transmisión y distribución",
    slug: "protectores-linea",
    categoria_padre_id: 1,
    activa: true,
    orden: 3
  },
  
  // Subcategorías para "Sistemas de Puesta a Tierra" (id: 2)
  {
    id: 4,
    nombre: "Electrodos de Tierra",
    descripcion: "Varillas y electrodos especializados para puesta a tierra",
    slug: "electrodos-tierra",
    categoria_padre_id: 2,
    activa: true,
    orden: 1
  },
  {
    id: 5,
    nombre: "Conectores y Accesorios",
    descripcion: "Conectores, abrazaderas y accesorios para sistemas de tierra",
    slug: "conectores-accesorios",
    categoria_padre_id: 2,
    activa: true,
    orden: 2
  },
  {
    id: 6,
    nombre: "Soldadura Exotérmica",
    descripcion: "Materiales y equipos para soldadura exotérmica",
    slug: "soldadura-exotermica",
    categoria_padre_id: 2,
    activa: true,
    orden: 3
  },
  
  // Subcategorías para "Medición y Análisis" (id: 3)
  {
    id: 7,
    nombre: "Medidores de Resistencia",
    descripcion: "Instrumentos para medición de resistencia de tierra y aislamiento",
    slug: "medidores-resistencia",
    categoria_padre_id: 3,
    activa: true,
    orden: 1
  },
  {
    id: 8,
    nombre: "Analizadores de Calidad",
    descripcion: "Equipos para análisis de calidad de energía eléctrica",
    slug: "analizadores-calidad",
    categoria_padre_id: 3,
    activa: true,
    orden: 2
  },
  {
    id: 9,
    nombre: "Detectores de Fallas",
    descripcion: "Instrumentos para detección y localización de fallas",
    slug: "detectores-fallas",
    categoria_padre_id: 3,
    activa: true,
    orden: 3
  },
  {
    id: 10,
    nombre: "Equipos de Prueba",
    descripcion: "Equipos especializados para pruebas eléctricas",
    slug: "equipos-prueba",
    categoria_padre_id: 3,
    activa: true,
    orden: 4
  },
  
  // Subcategorías para "Servicios Especializados" (id: 4)
  {
    id: 11,
    nombre: "Consultoría Técnica",
    descripcion: "Servicios de consultoría y asesoría técnica especializada",
    slug: "consultoria-tecnica",
    categoria_padre_id: 4,
    activa: true,
    orden: 1
  },
  {
    id: 12,
    nombre: "Instalación y Puesta en Marcha",
    descripcion: "Servicios de instalación y puesta en marcha de equipos",
    slug: "instalacion-puesta-marcha",
    categoria_padre_id: 4,
    activa: true,
    orden: 2
  },
  {
    id: 13,
    nombre: "Mantenimiento Preventivo",
    descripcion: "Servicios de mantenimiento preventivo y correctivo",
    slug: "mantenimiento-preventivo",
    categoria_padre_id: 4,
    activa: true,
    orden: 3
  }
];

// Productos estáticos
export const productos: Producto[] = [
  // Productos para "Supresores de Sobretensión" (subcategoria_id: 1)
  {
    id: 1,
    nombre: "Supresor de Sobretensión Clase I",
    descripcion: "Supresor de sobretensión para instalaciones de baja tensión, protección contra rayos y sobretensiones transitorias",
    precio: "1250.00",
    slug: "supresor-sobretension-clase-i",
    categoria: 1,
    subcategoria: 1,
    categoria_nombre: "Equipos de Protección",
    subcategoria_nombre: "Supresores de Sobretensión",
    stock: 15,
    imagen_principal: "https://via.placeholder.com/400x300/2563eb/ffffff?text=Supresor+Clase+I"
  },
  {
    id: 2,
    nombre: "Supresor de Sobretensión Clase II",
    descripcion: "Supresor de sobretensión para cuadros de distribución, alta capacidad de descarga",
    precio: "850.00",
    slug: "supresor-sobretension-clase-ii",
    categoria: 1,
    subcategoria: 1,
    categoria_nombre: "Equipos de Protección",
    subcategoria_nombre: "Supresores de Sobretensión",
    stock: 22,
    imagen_principal: "https://via.placeholder.com/400x300/2563eb/ffffff?text=Supresor+Clase+II"
  },
  {
    id: 3,
    nombre: "Supresor Trifásico Industrial",
    descripcion: "Supresor de sobretensión trifásico para aplicaciones industriales de alta potencia",
    precio: "2100.00",
    slug: "supresor-trifasico-industrial",
    categoria: 1,
    subcategoria: 1,
    categoria_nombre: "Equipos de Protección",
    subcategoria_nombre: "Supresores de Sobretensión",
    stock: 8,
    imagen_principal: "https://via.placeholder.com/400x300/2563eb/ffffff?text=Supresor+Trifásico"
  },

  // Productos para "Pararrayos" (subcategoria_id: 2)
  {
    id: 4,
    nombre: "Pararrayos Franklin Profesional",
    descripcion: "Sistema de pararrayos Franklin con mástil de 6 metros, ideal para edificaciones comerciales",
    precio: "3500.00",
    slug: "pararrayos-franklin-profesional",
    categoria: 1,
    subcategoria: 2,
    categoria_nombre: "Equipos de Protección",
    subcategoria_nombre: "Pararrayos",
    stock: 5,
    imagen_principal: "https://via.placeholder.com/400x300/16a34a/ffffff?text=Pararrayos+Franklin"
  },
  {
    id: 5,
    nombre: "Pararrayos ESE Avanzado",
    descripcion: "Pararrayos con dispositivo de cebado ESE, radio de protección de 107 metros",
    precio: "5200.00",
    slug: "pararrayos-ese-avanzado",
    categoria: 1,
    subcategoria: 2,
    categoria_nombre: "Equipos de Protección",
    subcategoria_nombre: "Pararrayos",
    stock: 3,
    imagen_principal: "https://via.placeholder.com/400x300/16a34a/ffffff?text=Pararrayos+ESE"
  },

  // Productos para "Protectores de Línea" (subcategoria_id: 3)
  {
    id: 6,
    nombre: "Protector de Línea MT",
    descripcion: "Protector para líneas de media tensión, resistente a condiciones climáticas extremas",
    precio: "1800.00",
    slug: "protector-linea-mt",
    categoria: 1,
    subcategoria: 3,
    categoria_nombre: "Equipos de Protección",
    subcategoria_nombre: "Protectores de Línea",
    stock: 12,
    imagen_principal: "https://via.placeholder.com/400x300/dc2626/ffffff?text=Protector+MT"
  },
  {
    id: 7,
    nombre: "Protector de Línea BT",
    descripcion: "Protector para líneas de baja tensión, instalación rápida y mantenimiento mínimo",
    precio: "950.00",
    slug: "protector-linea-bt",
    categoria: 1,
    subcategoria: 3,
    categoria_nombre: "Equipos de Protección",
    subcategoria_nombre: "Protectores de Línea",
    stock: 18,
    imagen_principal: "https://via.placeholder.com/400x300/dc2626/ffffff?text=Protector+BT"
  },

  // Productos para "Electrodos de Tierra" (subcategoria_id: 4)
  {
    id: 8,
    nombre: "Electrodo Copperweld 5/8\"",
    descripcion: "Varilla de tierra Copperweld de 5/8\" x 2.4m, núcleo de acero con recubrimiento de cobre",
    precio: "180.00",
    slug: "electrodo-copperweld-5-8",
    categoria: 2,
    subcategoria: 4,
    categoria_nombre: "Sistemas de Puesta a Tierra",
    subcategoria_nombre: "Electrodos de Tierra",
    stock: 50,
    imagen_principal: "https://via.placeholder.com/400x300/ea580c/ffffff?text=Electrodo+5/8"
  },
  {
    id: 9,
    nombre: "Electrodo Copperweld 3/4\"",
    descripcion: "Varilla de tierra Copperweld de 3/4\" x 3m, para aplicaciones de alta corriente",
    precio: "280.00",
    slug: "electrodo-copperweld-3-4",
    categoria: 2,
    subcategoria: 4,
    categoria_nombre: "Sistemas de Puesta a Tierra",
    subcategoria_nombre: "Electrodos de Tierra",
    stock: 35,
    imagen_principal: "https://via.placeholder.com/400x300/ea580c/ffffff?text=Electrodo+3/4"
  },

  // Productos para "Conectores y Accesorios" (subcategoria_id: 5)
  {
    id: 10,
    nombre: "Conector Mecánico Universal",
    descripcion: "Conector mecánico para unión de conductores de cobre, bronce y aluminio",
    precio: "45.00",
    slug: "conector-mecanico-universal",
    categoria: 2,
    subcategoria: 5,
    categoria_nombre: "Sistemas de Puesta a Tierra",
    subcategoria_nombre: "Conectores y Accesorios",
    stock: 100,
    imagen_principal: "https://via.placeholder.com/400x300/7c3aed/ffffff?text=Conector+Mecánico"
  },
  {
    id: 11,
    nombre: "Abrazadera de Tierra Bronce",
    descripcion: "Abrazadera de bronce para conexión a tubería, disponible en varios diámetros",
    precio: "65.00",
    slug: "abrazadera-tierra-bronce",
    categoria: 2,
    subcategoria: 5,
    categoria_nombre: "Sistemas de Puesta a Tierra",
    subcategoria_nombre: "Conectores y Accesorios",
    stock: 75,
    imagen_principal: "https://via.placeholder.com/400x300/7c3aed/ffffff?text=Abrazadera+Bronce"
  },

  // Productos para "Soldadura Exotérmica" (subcategoria_id: 6)
  {
    id: 12,
    nombre: "Kit Soldadura Exotérmica Básico",
    descripcion: "Kit completo para soldadura exotérmica, incluye moldes y cargas para 50 soldaduras",
    precio: "320.00",
    slug: "kit-soldadura-exotermica-basico",
    categoria: 2,
    subcategoria: 6,
    categoria_nombre: "Sistemas de Puesta a Tierra",
    subcategoria_nombre: "Soldadura Exotérmica",
    stock: 25,
    imagen_principal: "https://via.placeholder.com/400x300/059669/ffffff?text=Kit+Soldadura"
  },

  // Productos para "Medidores de Resistencia" (subcategoria_id: 7)
  {
    id: 13,
    nombre: "Telurómetro Digital Profesional",
    descripcion: "Medidor de resistencia de tierra digital con pantalla LCD, rango de 0.01Ω a 2000Ω",
    precio: "1450.00",
    slug: "telurometro-digital-profesional",
    categoria: 3,
    subcategoria: 7,
    categoria_nombre: "Medición y Análisis",
    subcategoria_nombre: "Medidores de Resistencia",
    stock: 12,
    imagen_principal: "https://via.placeholder.com/400x300/0891b2/ffffff?text=Telurómetro"
  },
  {
    id: 14,
    nombre: "Megóhmetro 5kV",
    descripcion: "Medidor de aislamiento hasta 5kV, ideal para pruebas en cables y transformadores",
    precio: "2200.00",
    slug: "megohmetro-5kv",
    categoria: 3,
    subcategoria: 7,
    categoria_nombre: "Medición y Análisis",
    subcategoria_nombre: "Medidores de Resistencia",
    stock: 8,
    imagen_principal: "https://via.placeholder.com/400x300/0891b2/ffffff?text=Megóhmetro"
  },

  // Productos para "Analizadores de Calidad" (subcategoria_id: 8)
  {
    id: 15,
    nombre: "Analizador de Calidad Trifásico",
    descripcion: "Analizador de calidad de energía trifásico con registro de eventos y armónicos",
    precio: "3800.00",
    slug: "analizador-calidad-trifasico",
    categoria: 3,
    subcategoria: 8,
    categoria_nombre: "Medición y Análisis",
    subcategoria_nombre: "Analizadores de Calidad",
    stock: 6,
    imagen_principal: "https://via.placeholder.com/400x300/be185d/ffffff?text=Analizador+Trifásico"
  },
  {
    id: 16,
    nombre: "Monitor de Armónicos Portátil",
    descripcion: "Monitor portátil para análisis de armónicos y distorsión en redes eléctricas",
    precio: "2650.00",
    slug: "monitor-armonicos-portatil",
    categoria: 3,
    subcategoria: 8,
    categoria_nombre: "Medición y Análisis",
    subcategoria_nombre: "Analizadores de Calidad",
    stock: 10,
    imagen_principal: "https://via.placeholder.com/400x300/be185d/ffffff?text=Monitor+Armónicos"
  },

  // Productos para "Detectores de Fallas" (subcategoria_id: 9)
  {
    id: 17,
    nombre: "Localizador de Fallas por Arco",
    descripcion: "Detector ultrasónico para localización de fallas por arco eléctrico",
    precio: "1950.00",
    slug: "localizador-fallas-arco",
    categoria: 3,
    subcategoria: 9,
    categoria_nombre: "Medición y Análisis",
    subcategoria_nombre: "Detectores de Fallas",
    stock: 7,
    imagen_principal: "https://via.placeholder.com/400x300/7c2d12/ffffff?text=Detector+Arco"
  },

  // Productos para "Equipos de Prueba" (subcategoria_id: 10)
  {
    id: 18,
    nombre: "Probador de Relés Multifunción",
    descripcion: "Equipo de prueba para relés de protección, incluye software de análisis",
    precio: "8500.00",
    slug: "probador-reles-multifuncion",
    categoria: 3,
    subcategoria: 10,
    categoria_nombre: "Medición y Análisis",
    subcategoria_nombre: "Equipos de Prueba",
    stock: 3,
    imagen_principal: "https://via.placeholder.com/400x300/1e40af/ffffff?text=Probador+Relés"
  },
  {
    id: 19,
    nombre: "Inyector de Corriente Primaria",
    descripcion: "Inyector de corriente primaria hasta 2000A para pruebas de transformadores de corriente",
    precio: "4200.00",
    slug: "inyector-corriente-primaria",
    categoria: 3,
    subcategoria: 10,
    categoria_nombre: "Medición y Análisis",
    subcategoria_nombre: "Equipos de Prueba",
    stock: 5,
    imagen_principal: "https://via.placeholder.com/400x300/1e40af/ffffff?text=Inyector+Corriente"
  }
];

// Funciones de utilidad para simular operaciones de API
export const getProductos = (params?: {
  page?: number;
  search?: string;
  categoria?: number;
  ordering?: string;
}) => {
  let filteredProductos = [...productos];
  
  // Filtrar por categoría
  if (params?.categoria) {
    filteredProductos = filteredProductos.filter(p => p.categoria === params.categoria);
  }
  
  // Filtrar por búsqueda
  if (params?.search) {
    const searchTerm = params.search.toLowerCase();
    filteredProductos = filteredProductos.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm) ||
      p.descripcion.toLowerCase().includes(searchTerm)
    );
  }
  
  // Ordenar
  if (params?.ordering) {
    switch (params.ordering) {
      case 'precio':
        filteredProductos.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
        break;
      case '-precio':
        filteredProductos.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
        break;
      case 'nombre':
        filteredProductos.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
    }
  }
  
  // Simular paginación
  const page = params?.page || 1;
  const pageSize = 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProductos.slice(startIndex, endIndex);
  
  return {
    count: filteredProductos.length,
    next: endIndex < filteredProductos.length ? `page=${page + 1}` : null,
    previous: page > 1 ? `page=${page - 1}` : null,
    results: paginatedProducts
  };
};

export const getProducto = (slug: string) => {
  const producto = productos.find(p => p.slug === slug);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }
  return producto;
};

export const getCategorias = () => {
  return categorias.filter(c => c.activa);
};

export const getCategoria = (id: number) => {
  const categoria = categorias.find(c => c.id === id);
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }
  return categoria;
};

export const getSubCategorias = (categoria_padre_id?: number) => {
  if (categoria_padre_id) {
    return subcategorias.filter(sc => sc.categoria_padre_id === categoria_padre_id && sc.activa);
  }
  return subcategorias.filter(sc => sc.activa);
};

export const getSubCategoria = (id: number) => {
  const subcategoria = subcategorias.find(sc => sc.id === id);
  if (!subcategoria) {
    throw new Error('Sub-categoría no encontrada');
  }
  return subcategoria;
};

// Función de login simplificada (sin backend)
export const login = (username: string, password: string) => {
  // Validación simple sin backend
  if (username === 'admin' && password === 'admin123') {
    return {
      user: defaultUser,
      tokens: { 
        access: 'static-token-' + Date.now(), 
        refresh: 'static-refresh-' + Date.now() 
      }
    };
  }
  throw new Error('Credenciales inválidas');
};

export const logout = () => {
  // Limpiar datos de sesión local
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};