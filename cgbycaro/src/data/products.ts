export interface ProductColor {
  name: string;
  images: string[];
}

export interface Product {
  id: number;
  name: string;
  price: string;
  priceNumber: number;
  category: string;
  colors: ProductColor[];
  slug: string;
}

export const allProducts: Product[] = [
  // Bolsos grandes
  { 
    id: 1, 
    name: "Caipe", 
    price: "$600.000 COP", 
    priceNumber: 600000,
    category: "Bolsos grandes",
    slug: "caipe",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Marrón", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Beige", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 2, 
    name: "Milano", 
    price: "$700.000 COP", 
    priceNumber: 700000,
    category: "Bolsos grandes",
    slug: "milano",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cognac", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 3, 
    name: "Ventura", 
    price: "$780.000 COP", 
    priceNumber: 780000,
    category: "Bolsos grandes",
    slug: "ventura",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Bolsos pequeños
  { 
    id: 4, 
    name: "Pagaporte", 
    price: "$340.000 COP", 
    priceNumber: 340000,
    category: "Bolsos pequeños",
    slug: "pagaporte",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 5, 
    name: "Mini Clara", 
    price: "$260.000 COP", 
    priceNumber: 260000,
    category: "Bolsos pequeños",
    slug: "mini-clara",
    colors: [
      { name: "Rosa", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop"] },
      { name: "Negro", images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 6, 
    name: "Pocket", 
    price: "$300.000 COP", 
    priceNumber: 300000,
    category: "Bolsos pequeños",
    slug: "pocket",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Canguros
  { 
    id: 7, 
    name: "Sport", 
    price: "$180.000 COP", 
    priceNumber: 180000,
    category: "Canguros",
    slug: "sport",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 8, 
    name: "Urban", 
    price: "$220.000 COP", 
    priceNumber: 220000,
    category: "Canguros",
    slug: "urban",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 9, 
    name: "Travel", 
    price: "$260.000 COP", 
    priceNumber: 260000,
    category: "Canguros",
    slug: "travel",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Billeteras
  { 
    id: 10, 
    name: "Classic", 
    price: "$140.000 COP", 
    priceNumber: 140000,
    category: "Billeteras",
    slug: "classic",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 11, 
    name: "Slim", 
    price: "$160.000 COP", 
    priceNumber: 160000,
    category: "Billeteras",
    slug: "slim",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 12, 
    name: "Executive", 
    price: "$220.000 COP", 
    priceNumber: 220000,
    category: "Billeteras",
    slug: "executive",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Complementos
  { 
    id: 19, 
    name: "Canceuas", 
    price: "$480.000 COP", 
    priceNumber: 480000,
    category: "Complementos",
    slug: "canceuas",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 20, 
    name: "Elegante", 
    price: "$380.000 COP", 
    priceNumber: 380000,
    category: "Complementos",
    slug: "elegante",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Carpetas
  { 
    id: 23, 
    name: "Executive", 
    price: "$180.000 COP", 
    priceNumber: 180000,
    category: "Carpetas",
    slug: "executive-carpeta",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 24, 
    name: "Professional", 
    price: "$220.000 COP", 
    priceNumber: 220000,
    category: "Carpetas",
    slug: "professional",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Pasaporte/Guarda
  { 
    id: 26, 
    name: "Travel Pro", 
    price: "$100.000 COP", 
    priceNumber: 100000,
    category: "Pasaporte/Guarda",
    slug: "travel-pro",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 27, 
    name: "Secure", 
    price: "$120.000 COP", 
    priceNumber: 120000,
    category: "Pasaporte/Guarda",
    slug: "secure",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Cafe", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  },
  
  // Cosmetic
  { 
    id: 29, 
    name: "Beauty Case", 
    price: "$140.000 COP", 
    priceNumber: 140000,
    category: "Cosmeteria",
    slug: "beauty-case",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"] },
      { name: "Rosa", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop"] }
    ]
  },
  { 
    id: 30, 
    name: "Travel Kit", 
    price: "$168.000 COP", 
    priceNumber: 168000,
    category: "Cosmeteria",
    slug: "travel-kit",
    colors: [
      { name: "Negro", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"] },
      { name: "Rosa", images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"] }
    ]
  }
];

export const categories = [
  "Todos",
  "Bolsos grandes", 
  "Bolsos pequeños",
  "Canguros",
  "Billeteras", 
  "Complementos",
  "Carpetas",
  "Pasaporte/Guarda",
  "Cosmeteria"
];

export const colors = [
  "Todos",
  "Negro",
  "Cafe", 
  "Marrón",
  "Cognac",
  "Beige",
  "Rosa"
];