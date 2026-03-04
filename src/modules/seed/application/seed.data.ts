export interface SeedProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
}

export interface SeedReviewData {
  title: string;
  description: string;
  rating: number;
}

export const SEED_REVIEW_TEMPLATES: { title: string; description: string }[] = [
  {
    title: 'Excelente producto',
    description: 'Me encantó este producto, la calidad es increíble y superó mis expectativas por mucho.',
  },
  {
    title: 'Muy buena compra',
    description: 'Relación calidad-precio muy buena. Lo recomiendo ampliamente a quien busque algo así.',
  },
  {
    title: 'Buen producto en general',
    description: 'Cumple con lo esperado, buena calidad de materiales y el acabado es muy profesional.',
  },
  {
    title: 'Recomendado totalmente',
    description: 'El producto llegó en perfectas condiciones y es exactamente como se describe en la tienda.',
  },
  {
    title: 'Satisfecho con la compra',
    description: 'Estoy muy satisfecho con mi compra. La calidad del producto es excelente y duradera.',
  },
  {
    title: 'Gran calidad y diseño',
    description: 'El diseño es moderno y elegante. Los materiales son de primera calidad, vale la pena.',
  },
  {
    title: 'Cumple expectativas',
    description: 'El producto cumple con todas las especificaciones mencionadas. Muy contento con la compra.',
  },
  {
    title: 'Ideal para el hogar',
    description: 'Perfecto para mi hogar. Se ve muy bien y es funcional, justo lo que necesitaba encontrar.',
  },
];

export const SEED_STORE = {
  name: 'Prismart Demo Store',
  address: {
    street: 'Av. Reforma 222, Piso 10',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '06600',
    country: 'México',
  },
};

export const SEED_PRODUCTS: SeedProductData[] = [
  {
    name: 'Mesa de trabajo rectangular básica',
    description:
      'Mesa de trabajo rectangular de 120 x 80 cm con cubierta de MDP y acabado en melamina blanca. Ideal para oficina en casa o espacios de estudio. Fácil de limpiar y resistente al uso diario.',
    price: 2799.0,
    stock: 6,
    sku: 'MESA-TRAB-120-BL',
    category: 'oficina',
  },
  {
    name: 'Sofá modular funcional 3 plazas',
    description:
      'Sofá modular de 3 plazas tapizado en tela gris. Diseño cómodo y práctico para salas de espera, áreas comunes u oficinas modernas. Estructura reforzada y cojines de espuma estándar.',
    price: 3699.0,
    stock: 3,
    sku: 'SOFA-MOD-3P-GRS',
    category: 'hogar',
  },
  {
    name: 'Silla ergonómica para oficina',
    description:
      'Silla de oficina con respaldo de malla, soporte lumbar fijo y ajuste de altura por pistón de gas. Ideal para jornadas laborales largas en escritorio.',
    price: 2399.0,
    stock: 8,
    sku: 'SILLA-ERG-OFC',
    category: 'oficina',
  },
  {
    name: 'Repisa flotante organizadora',
    description:
      'Repisa flotante de 80 cm en MDF con acabado tipo roble. Perfecta para organizar libros, carpetas o decoración ligera en oficina u hogar.',
    price: 749.0,
    stock: 10,
    sku: 'REP-FLOT-80-ROB',
    category: 'organizacion',
  },
  {
    name: 'Lámpara de pie para oficina',
    description:
      'Lámpara de pie con estructura metálica negra y pantalla orientable. Ideal para áreas de lectura, salas de espera u oficinas ejecutivas.',
    price: 1199.0,
    stock: 6,
    sku: 'LAMP-PIE-OFC-NG',
    category: 'iluminacion',
  },
  {
    name: 'Base de cama matrimonial funcional',
    description:
      'Base de cama matrimonial con estructura de madera y cabecera tapizada en tela beige. Diseño sencillo y funcional para recámaras modernas.',
    price: 3299.0,
    stock: 2,
    sku: 'CAMA-MAT-FUNC-BG',
    category: 'hogar',
  },
  {
    name: 'Mesa de centro práctica',
    description:
      'Mesa de centro con cubierta resistente tipo mármol sintético y base metálica. Ideal para salas de espera o áreas comunes.',
    price: 2199.0,
    stock: 4,
    sku: 'MESA-CENT-PRAC',
    category: 'hogar',
  },
  {
    name: 'Librero organizador vertical',
    description:
      'Librero abierto de 5 niveles con acabado natural. Ideal para archivar carpetas, libros y material de oficina.',
    price: 1699.0,
    stock: 6,
    sku: 'LIB-ORG-5NIV',
    category: 'organizacion',
  },
  {
    name: 'Escritorio en L para oficina',
    description:
      'Escritorio en L con cubierta de melamina color nogal. Incluye pasacables y estructura metálica resistente, ideal para estaciones de trabajo.',
    price: 2999.0,
    stock: 4,
    sku: 'ESC-L-OFC-NOG',
    category: 'oficina',
  },
  {
    name: 'Sillón reclinable para sala',
    description:
      'Sillón reclinable con tapizado sintético color café. Ideal para áreas de descanso, salas de espera o uso doméstico.',
    price: 3199.0,
    stock: 4,
    sku: 'SILL-RECL-CAF',
    category: 'hogar',
  },
  {
    name: 'Cómoda organizadora 6 cajones',
    description:
      'Cómoda con 6 cajones amplios y acabado blanco. Ideal para archivo ligero, papelería o almacenamiento general.',
    price: 2499.0,
    stock: 5,
    sku: 'COM-ORG-6CJ-BL',
    category: 'organizacion',
  },
  {
    name: 'Perchero de pared para oficina',
    description:
      'Perchero de pared con ganchos abatibles y barra decorativa. Ideal para oficinas, recepciones o salas de juntas.',
    price: 699.0,
    stock: 9,
    sku: 'PERCH-PAR-OFC',
    category: 'organizacion',
  },
  {
    name: 'Banco funcional para recibidor',
    description: 'Banco con asiento acolchado y repisa inferior. Ideal para entradas, salas de espera o áreas comunes.',
    price: 1399.0,
    stock: 6,
    sku: 'BANC-FUNC-REC',
    category: 'hogar',
  },
  {
    name: 'Espejo decorativo redondo',
    description:
      'Espejo circular con marco metálico dorado. Ideal para oficinas, recepciones o decoración de interiores.',
    price: 1099.0,
    stock: 7,
    sku: 'ESP-RED-DEC',
    category: 'decoracion',
  },
  {
    name: 'Mesa auxiliar multiusos',
    description: 'Mesa auxiliar compacta ideal como mesa lateral, mesa de noche o apoyo en oficina.',
    price: 999.0,
    stock: 6,
    sku: 'MESA-AUX-MULT',
    category: 'oficina',
  },
  {
    name: 'Organizador modular de closet',
    description: 'Sistema modular con repisas y barras para organizar ropa, cajas o material de oficina.',
    price: 1999.0,
    stock: 3,
    sku: 'ORG-MOD-CLOS',
    category: 'organizacion',
  },
  {
    name: 'Banco alto para barra',
    description:
      'Banco alto con asiento plástico resistente y patas de madera. Ideal para cafeterías, barras o áreas comunes.',
    price: 999.0,
    stock: 8,
    sku: 'BANC-ALTO-BAR',
    category: 'hogar',
  },
  {
    name: 'Sofá cama práctico',
    description:
      'Sofá cama individual con sistema abatible. Ideal para visitas, oficinas flexibles o espacios pequeños.',
    price: 2699.0,
    stock: 4,
    sku: 'SOFA-CAMA-PRAC',
    category: 'hogar',
  },
  {
    name: 'Vitrina organizadora con puertas',
    description: 'Vitrina con puertas de cristal ideal para exhibir productos, reconocimientos o material corporativo.',
    price: 2999.0,
    stock: 2,
    sku: 'VIT-ORG-CRIS',
    category: 'organizacion',
  },
  {
    name: 'Alfombra decorativa básica',
    description:
      'Alfombra rectangular de algodón en tono neutro. Ideal para oficinas, salas de espera o espacios comunes.',
    price: 1599.0,
    stock: 6,
    sku: 'ALF-DEC-BAS',
    category: 'decoracion',
  },
];
