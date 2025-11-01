// Mock data with moderation-ready structure for gaming/tech marketplace

export const productStatus = {
  PENDING: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DRAFT: 'draft'
};

export const products = [
  // MOUSE CATEGORY
  {
    id: 'mouse-001',
    name: 'Razer DeathAdder V3 Pro',
    category: 'MOUSE',
    price: 149.99,
    originalPrice: 179.99,
    image: 'https://images.unsplash.com/photo-1628832307345-7404b47f1751',
    images: [
      'https://images.unsplash.com/photo-1628832307345-7404b47f1751',
      'https://images.unsplash.com/photo-1613141412501-9012977f1969'
    ],
    description: 'Professional wireless gaming mouse with RGB lighting and ergonomic design',
    longDescription: 'Experience ultimate precision with our flagship gaming mouse featuring advanced optical sensors, customizable RGB lighting, and ergonomic design for extended gaming sessions.',
    specifications: {
      dpi: '30000',
      connectivity: 'Wireless',
      weight: '63g',
      buttons: '8 programmable'
    },
    inStock: true,
    rating: 4.8,
    reviewCount: 247,
    status: productStatus.APPROVED,
    submittedBy: 'user-101',
    moderatedBy: 'mod-005',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: 'mouse-002',
    name: 'Logitech G Pro X Superlight',
    category: 'MOUSE',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1613141412501-9012977f1969',
    images: ['https://images.unsplash.com/photo-1613141412501-9012977f1969'],
    description: 'Ultra-lightweight professional gaming mouse',
    longDescription: 'Engineered for esports professionals with ultra-lightweight design and precise tracking.',
    specifications: {
      dpi: '25600',
      connectivity: 'Wireless',
      weight: '61g',
      buttons: '5'
    },
    inStock: true,
    rating: 4.9,
    reviewCount: 312,
    status: productStatus.APPROVED,
    submittedBy: 'user-102',
    moderatedBy: 'mod-005',
    createdAt: '2024-01-10T08:15:00Z',
    updatedAt: '2024-01-11T09:30:00Z'
  },
  {
    id: 'mouse-003',
    name: 'SteelSeries Rival 5',
    category: 'MOUSE',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8',
    images: ['https://images.unsplash.com/photo-1629429408209-1f912961dbd8'],
    description: 'Versatile gaming mouse with customizable buttons',
    longDescription: 'Highly customizable gaming mouse with 9 programmable buttons and stunning RGB.',
    specifications: {
      dpi: '18000',
      connectivity: 'Wired',
      weight: '85g',
      buttons: '9 programmable'
    },
    inStock: true,
    rating: 4.6,
    reviewCount: 189,
    status: productStatus.APPROVED,
    submittedBy: 'user-103',
    moderatedBy: 'mod-006',
    createdAt: '2024-01-12T11:45:00Z',
    updatedAt: '2024-01-12T15:20:00Z'
  },
  // KEYBOARD CATEGORY
  {
    id: 'keyboard-001',
    name: 'Corsair K100 RGB',
    category: 'KEYBOARD',
    price: 229.99,
    originalPrice: 259.99,
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae',
    images: [
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae',
      'https://images.unsplash.com/photo-1631449061775-c79df03a44f6'
    ],
    description: 'Premium mechanical gaming keyboard with per-key RGB',
    longDescription: 'Flagship mechanical keyboard featuring Cherry MX switches, per-key RGB lighting, and premium build quality for competitive gaming.',
    specifications: {
      switches: 'Cherry MX Speed',
      lighting: 'Per-key RGB',
      connectivity: 'Wired USB-C',
      features: 'Media controls, macro keys'
    },
    inStock: true,
    rating: 4.9,
    reviewCount: 423,
    status: productStatus.APPROVED,
    submittedBy: 'user-104',
    moderatedBy: 'mod-007',
    createdAt: '2024-01-08T13:20:00Z',
    updatedAt: '2024-01-09T10:15:00Z'
  },
  {
    id: 'keyboard-002',
    name: 'Keychron Q1 Pro',
    category: 'KEYBOARD',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1626958390898-162d3577f293',
    images: ['https://images.unsplash.com/photo-1626958390898-162d3577f293'],
    description: 'Custom mechanical keyboard with wireless connectivity',
    longDescription: 'Premium custom mechanical keyboard with hot-swappable switches and wireless connectivity.',
    specifications: {
      switches: 'Gateron Pro',
      lighting: 'RGB backlight',
      connectivity: 'Wireless/Wired',
      features: 'Hot-swappable, QMK/VIA'
    },
    inStock: true,
    rating: 4.8,
    reviewCount: 267,
    status: productStatus.APPROVED,
    submittedBy: 'user-105',
    moderatedBy: 'mod-007',
    createdAt: '2024-01-14T09:30:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    id: 'keyboard-003',
    name: 'Razer Huntsman Elite',
    category: 'KEYBOARD',
    price: 169.99,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc',
    images: ['https://images.unsplash.com/photo-1538481199705-c710c4e965fc'],
    description: 'Opto-mechanical gaming keyboard with RGB underglow',
    longDescription: 'Advanced opto-mechanical switches for faster actuation and stunning RGB lighting effects.',
    specifications: {
      switches: 'Razer Opto-mechanical',
      lighting: 'Chroma RGB underglow',
      connectivity: 'Wired USB',
      features: 'Media keys, wrist rest'
    },
    inStock: true,
    rating: 4.7,
    reviewCount: 345,
    status: productStatus.APPROVED,
    submittedBy: 'user-106',
    moderatedBy: 'mod-008',
    createdAt: '2024-01-11T14:10:00Z',
    updatedAt: '2024-01-11T18:25:00Z'
  },
  // MONITOR CATEGORY
  {
    id: 'monitor-001',
    name: 'Samsung Odyssey G9',
    category: 'MONITOR',
    price: 1299.99,
    originalPrice: 1499.99,
    image: 'https://images.unsplash.com/photo-1635976457744-900f79574c3d',
    images: [
      'https://images.unsplash.com/photo-1635976457744-900f79574c3d',
      'https://images.unsplash.com/photo-1614624532983-4ce03382d63d'
    ],
    description: '49" Curved Gaming Monitor with 240Hz refresh rate',
    longDescription: 'Ultra-wide curved gaming monitor with stunning visuals, 240Hz refresh rate, and immersive 1000R curvature for competitive gaming.',
    specifications: {
      size: '49 inches',
      resolution: '5120x1440 (DQHD)',
      refreshRate: '240Hz',
      panelType: 'VA, 1000R curve'
    },
    inStock: true,
    rating: 4.9,
    reviewCount: 512,
    status: productStatus.APPROVED,
    submittedBy: 'user-107',
    moderatedBy: 'mod-009',
    createdAt: '2024-01-05T11:20:00Z',
    updatedAt: '2024-01-06T09:15:00Z'
  },
  {
    id: 'monitor-002',
    name: 'ASUS ROG Swift PG27UQ',
    category: 'MONITOR',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d',
    images: ['https://images.unsplash.com/photo-1614624532983-4ce03382d63d'],
    description: '27" 4K Gaming Monitor with HDR',
    longDescription: 'Premium 4K gaming monitor with G-SYNC, HDR support, and stunning color accuracy.',
    specifications: {
      size: '27 inches',
      resolution: '3840x2160 (4K UHD)',
      refreshRate: '144Hz',
      panelType: 'IPS, G-SYNC'
    },
    inStock: true,
    rating: 4.8,
    reviewCount: 378,
    status: productStatus.APPROVED,
    submittedBy: 'user-108',
    moderatedBy: 'mod-009',
    createdAt: '2024-01-07T10:45:00Z',
    updatedAt: '2024-01-07T14:30:00Z'
  },
  {
    id: 'monitor-003',
    name: 'LG UltraGear 34GP83A',
    category: 'MONITOR',
    price: 699.99,
    image: 'https://images.unsplash.com/photo-1666771410140-0573b232426e',
    images: ['https://images.unsplash.com/photo-1666771410140-0573b232426e'],
    description: '34" Curved Ultrawide Gaming Monitor',
    longDescription: 'Ultrawide curved gaming monitor with fast response time and vibrant colors.',
    specifications: {
      size: '34 inches',
      resolution: '3440x1440 (UWQHD)',
      refreshRate: '165Hz',
      panelType: 'Nano IPS, 1800R curve'
    },
    inStock: true,
    rating: 4.7,
    reviewCount: 291,
    status: productStatus.APPROVED,
    submittedBy: 'user-109',
    moderatedBy: 'mod-010',
    createdAt: '2024-01-13T15:30:00Z',
    updatedAt: '2024-01-13T17:45:00Z'
  },
  // MOUSEPAD CATEGORY
  {
    id: 'mousepad-001',
    name: 'Razer Firefly V2',
    category: 'MOUSEPAD',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7'],
    description: 'RGB Gaming Mouse Pad with hard surface',
    longDescription: 'Premium RGB mouse pad with hard surface for precise tracking and stunning lighting effects.',
    specifications: {
      surface: 'Hard micro-textured',
      size: 'Medium (355 x 255mm)',
      lighting: 'Chroma RGB',
      connectivity: 'USB'
    },
    inStock: true,
    rating: 4.6,
    reviewCount: 156,
    status: productStatus.APPROVED,
    submittedBy: 'user-110',
    moderatedBy: 'mod-011',
    createdAt: '2024-01-09T12:15:00Z',
    updatedAt: '2024-01-09T16:40:00Z'
  }
];

export const categories = [
  { id: 'mouse', name: 'MOUSE', slug: 'mouse' },
  { id: 'mousepad', name: 'MOUSEPAD', slug: 'mousepad' },
  { id: 'keyboard', name: 'KEYBOARD', slug: 'keyboard' },
  { id: 'pc', name: 'PC', slug: 'pc' },
  { id: 'components', name: 'COMPONENTS', slug: 'components' },
  { id: 'monitor', name: 'MONITOR', slug: 'monitor' },
  { id: 'audio', name: 'AUDIO', slug: 'audio' },
  { id: 'ergonomics', name: 'ERGONOMICS', slug: 'ergonomics' },
  { id: 'custom', name: 'CUSTOM', slug: 'custom' }
];

export const userLevels = {
  1: { name: 'Novice', minXP: 0, color: '#888' },
  2: { name: 'Gamer', minXP: 100, color: '#4CAF50' },
  3: { name: 'Pro', minXP: 500, color: '#2196F3' },
  4: { name: 'Elite', minXP: 1500, color: '#9C27B0' },
  5: { name: 'Legend', minXP: 5000, color: '#FF9800' }
};

export const mockUser = {
  id: 'user-001',
  username: 'ProGamer_2024',
  level: 3,
  xp: 1250,
  nextLevelXP: 1500,
  avatar: null,
  joinedDate: '2024-01-01',
  cartItems: 2,
  messages: 5
};
