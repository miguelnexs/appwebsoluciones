export const initialCategories = [
  { id: 1, nombre: 'Ropa', descripcion: 'Prendas de vestir', icono: '👕' },
  { id: 2, nombre: 'Calzado', descripcion: 'Zapatos y zapatillas', icono: '👟' },
  { id: 3, nombre: 'Electrónica', descripcion: 'Dispositivos electrónicos', icono: '📱' },
  { id: 4, nombre: 'Hogar', descripcion: 'Artículos para el hogar', icono: '🏠' },
  { id: 5, nombre: 'Deportes', descripcion: 'Artículos deportivos', icono: '⚽' },
];

export const initialProducts = [
  {
    id: 1,
    nombre: 'Camiseta Premium Algodón Orgánico',
    descripcion: 'Camiseta de algodón 100% orgánico, suave y transpirable. Ideal para uso diario con un ajuste moderno.',
    categoria: { id: 1, nombre: 'Ropa' },
    precio: 29.99,
    precio_original: 39.99,
    costo: 12.50,
    sku: 'CAMS-001',
    marca: 'EcoWear',
    stock: 45,
    stock_minimo: 10,
    disponible: true,
    destacado: true,
    tags: ['algodón', 'orgánico', 'básico'],
    imagenes: [
      'https://placehold.co/600x600?text=Product+Image',
      'https://placehold.co/600x600?text=Product+Image',
      'https://placehold.co/600x600?text=Product+Image',

    ],
    tallas: ['S', 'M', 'L', 'XL'],
    peso: 0.3,
    dimensiones: { largo: 70, ancho: 50, alto: 1 },
    valoracion: 4.7,
    reseñas: 128,
    fecha_creacion: '2023-05-15',
    fecha_actualizacion: '2023-10-20',
    proveedor: 'Textiles Sostenibles S.A.',
    garantia: '6 meses',
    variantes: [
      { id: 101, color: 'Blanco', talla: 'S', stock: 10, sku: 'CAMS-001-WS' },
      { id: 102, color: 'Blanco', talla: 'M', stock: 15, sku: 'CAMS-001-WM' },
      { id: 103, color: 'Negro', talla: 'L', stock: 12, sku: 'CAMS-001-BL' },
      { id: 104, color: 'Azul', talla: 'XL', stock: 8, sku: 'CAMS-001-BXL' }
    ],
    historial: [
      { fecha: '2023-05-20', accion: 'Creación', usuario: 'admin' },
      { fecha: '2023-07-15', accion: 'Actualización de precio', detalles: 'De $35.99 a $39.99', usuario: 'manager' },
      { fecha: '2023-10-20', accion: 'Oferta especial', detalles: 'Precio reducido a $29.99', usuario: 'marketing' }
    ]
  },
  // ... otros productos
];
