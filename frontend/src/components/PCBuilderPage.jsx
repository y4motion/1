import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ChevronDown,
  Plus,
  Check,
  Info,
  ShoppingCart,
  Wrench,
  Cpu,
  Monitor,
  HardDrive,
  Box,
  Gauge,
  Snowflake,
  Zap,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { CompatibilityResolver } from './pc-builder';

// Use relative URLs for API calls
const API_URL = '';

// Component Icons (NZXT-inspired minimalist SVG)
const ComponentIcons = {
  cpu: (props) => <Cpu {...props} />,
  gpu: (props) => <Monitor {...props} />,
  motherboard: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="3" height="3" />
      <rect x="14" y="7" width="3" height="3" />
      <rect x="7" y="14" width="3" height="3" />
      <rect x="14" y="14" width="3" height="3" />
    </svg>
  ),
  ram: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="6" width="16" height="12" rx="1" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="16" y1="10" x2="16" y2="14" />
    </svg>
  ),
  storage: (props) => <HardDrive {...props} />,
  psu: (props) => <Zap {...props} />,
  case: (props) => <Box {...props} />,
  cooling: (props) => <Snowflake {...props} />,
};

const PCBuilderPage = () => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { formatPrice, currency } = require('../contexts/CurrencyContext').useCurrency();

  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null,
    gpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    psu: null,
    case: null,
    cooling: null,
  });

  const [buildType, setBuildType] = useState(null); // Mini-ITX, Micro-ATX, Mid-Tower, Full-Tower
  const [performanceResolution, setPerformanceResolution] = useState('1440'); // 1080, 1440, 4K

  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPower, setTotalPower] = useState(0);
  const [recommendedPSU, setRecommendedPSU] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [savedBuildId, setSavedBuildId] = useState(null);

  // API Compatibility Validation State
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showCompatibilityPanel, setShowCompatibilityPanel] = useState(true);

  // Smart filter toggle (global)
  const [smartFilter, setSmartFilter] = useState(true);

  // Category-specific filters and search
  const [categoryFilters, setCategoryFilters] = useState({});
  const [categorySearch, setCategorySearch] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);

  // Determine build type based on case selection
  useEffect(() => {
    if (selectedComponents.case) {
      const caseSize = selectedComponents.case.formFactor;
      setBuildType(caseSize);
    }
  }, [selectedComponents.case]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showFilterDropdown && !e.target.closest('[data-filter-dropdown]')) {
        setShowFilterDropdown(null);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterDropdown]);

  // Calculate total power consumption and recommended PSU
  useEffect(() => {
    const powerConsumption = {
      cpu: selectedComponents.cpu?.tdp || 0,
      gpu: selectedComponents.gpu?.tdp || 0,
      motherboard: 50,
      ram: (selectedComponents.ram?.modules || 0) * 5,
      storage: (selectedComponents.storage?.count || 0) * 10,
      cooling: selectedComponents.cooling?.power || 15,
      fans: 30,
    };

    const total = Object.values(powerConsumption).reduce((sum, val) => sum + val, 0);
    setTotalPower(total);

    // Recommended PSU with 20% headroom + round up to nearest standard wattage
    const recommended = Math.ceil((total * 1.2) / 50) * 50;
    setRecommendedPSU(recommended);
  }, [selectedComponents]);

  // Calculate total price
  useEffect(() => {
    const total = Object.values(selectedComponents)
      .filter((comp) => comp !== null)
      .reduce((sum, comp) => sum + (comp.price || 0), 0);
    setTotalPrice(total);
  }, [selectedComponents]);

  // Real-time API Compatibility Validation
  const validateBuildAPI = useCallback(async () => {
    // Collect all selected component IDs (if they have real DB IDs)
    const selectedParts = Object.entries(selectedComponents)
      .filter(([_, comp]) => comp !== null && comp.dbId)
      .map(([category, comp]) => ({
        id: comp.dbId,
        title: comp.name,
        category,
        specs: comp
      }));

    // Skip if less than 2 components with DB IDs
    if (selectedParts.length < 2) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    
    try {
      const productIds = selectedParts.map(p => p.id);
      const response = await fetch(`${API_URL}/api/builder/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: productIds })
      });

      if (response.ok) {
        const data = await response.json();
        setValidationResult(data.report);
        
        // Trigger Glassy Mind if build is perfect
        if (data.report.is_compatible && data.report.errors.length === 0) {
          triggerGlassyMindSuccess();
        }
      }
    } catch (error) {
      console.error('Validation API error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [selectedComponents]);

  // Debounced validation - run when components change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateBuildAPI();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [validateBuildAPI]);

  // Trigger Glassy Mind success message
  const triggerGlassyMindSuccess = async () => {
    try {
      await fetch(`${API_URL}/api/mind/event`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          event_type: 'build_complete',
          metadata: { 
            message: 'Отличная сборка! Все компоненты совместимы.',
            total_price: totalPrice
          }
        })
      });
    } catch (e) {
      // Silent fail
    }
  };

  // Handle swap product from CompatibilityResolver
  const handleSwapProduct = (newProduct, error) => {
    // Determine which category to swap based on error
    const category = newProduct.category || 
      (error.issue_type === 'socket_mismatch' ? 'motherboard' : 
       error.issue_type === 'ram_type_mismatch' ? 'ram' :
       error.issue_type === 'psu_insufficient' ? 'psu' : null);
    
    if (category && newProduct) {
      setSelectedComponents(prev => ({
        ...prev,
        [category]: {
          ...newProduct,
          dbId: newProduct._id || newProduct.id,
          name: newProduct.title,
        }
      }));
    }
  };

  // Mock component data with enhanced details including filters
  const components = {
    cpu: [
      {
        id: 'cpu1',
        name: 'AMD Ryzen 7 9700X',
        brand: 'AMD',
        socket: 'AM5',
        price: 359,
        tdp: 65,
        specs: '8-Core, 16-Thread, 4.5GHz Boost',
        performanceScore: 75,
        year: 2024,
      },
      {
        id: 'cpu2',
        name: 'AMD Ryzen 7 9800X3D',
        brand: 'AMD',
        socket: 'AM5',
        price: 479,
        tdp: 120,
        specs: '8-Core, 16-Thread, 5.2GHz Boost, 3D V-Cache',
        performanceScore: 95,
        year: 2024,
      },
      {
        id: 'cpu3',
        name: 'Intel Core i7-14700K',
        brand: 'Intel',
        socket: 'LGA1700',
        price: 409,
        tdp: 125,
        specs: '20-Core, 28-Thread, 5.6GHz Boost',
        performanceScore: 85,
        year: 2023,
      },
      {
        id: 'cpu4',
        name: 'AMD Ryzen 9 9900X',
        brand: 'AMD',
        socket: 'AM5',
        price: 499,
        tdp: 170,
        specs: '12-Core, 24-Thread, 5.4GHz Boost',
        performanceScore: 100,
        year: 2024,
      },
      {
        id: 'cpu5',
        name: 'Intel Core i5-14600K',
        brand: 'Intel',
        socket: 'LGA1700',
        price: 289,
        tdp: 125,
        specs: '14-Core, 20-Thread, 5.3GHz Boost',
        performanceScore: 70,
        year: 2023,
      },
      {
        id: 'cpu6',
        name: 'AMD Ryzen 5 9600X',
        brand: 'AMD',
        socket: 'AM5',
        price: 279,
        tdp: 65,
        specs: '6-Core, 12-Thread, 5.4GHz Boost',
        performanceScore: 65,
        year: 2024,
      },
    ],
    gpu: [
      {
        id: 'gpu1',
        name: 'NVIDIA RTX 5060',
        brand: 'NVIDIA',
        length: 242,
        price: 299,
        tdp: 115,
        specs: '8GB GDDR6, 1080p Gaming',
        performanceScore: 60,
        year: 2025,
      },
      {
        id: 'gpu2',
        name: 'NVIDIA RTX 5070 Ti',
        brand: 'NVIDIA',
        length: 304,
        price: 599,
        tdp: 285,
        specs: '16GB GDDR6X, 1440p Gaming',
        performanceScore: 85,
        year: 2025,
      },
      {
        id: 'gpu3',
        name: 'NVIDIA RTX 5080',
        brand: 'NVIDIA',
        length: 336,
        price: 999,
        tdp: 320,
        specs: '16GB GDDR6X, 4K Gaming',
        performanceScore: 100,
        year: 2025,
      },
      {
        id: 'gpu4',
        name: 'AMD RX 9070 XT',
        brand: 'AMD',
        length: 310,
        price: 649,
        tdp: 300,
        specs: '16GB GDDR6, 1440p Gaming',
        performanceScore: 80,
        year: 2025,
      },
      {
        id: 'gpu5',
        name: 'NVIDIA RTX 4090',
        brand: 'NVIDIA',
        length: 304,
        price: 1599,
        tdp: 450,
        specs: '24GB GDDR6X, 4K Gaming',
        performanceScore: 110,
        year: 2023,
      },
      {
        id: 'gpu6',
        name: 'AMD RX 7900 XTX',
        brand: 'AMD',
        length: 287,
        price: 899,
        tdp: 355,
        specs: '24GB GDDR6, 4K Gaming',
        performanceScore: 95,
        year: 2023,
      },
    ],
    motherboard: [
      {
        id: 'mb1',
        name: 'MSI B650 TOMAHAWK',
        brand: 'MSI',
        socket: 'AM5',
        price: 229,
        specs: 'ATX, PCIe 5.0, DDR5',
        formFactor: 'ATX',
        year: 2023,
      },
      {
        id: 'mb2',
        name: 'ASUS ROG STRIX X670E',
        brand: 'ASUS',
        socket: 'AM5',
        price: 399,
        specs: 'ATX, PCIe 5.0, DDR5, Wi-Fi 6E',
        formFactor: 'ATX',
        year: 2023,
      },
      {
        id: 'mb3',
        name: 'GIGABYTE Z790 AORUS',
        brand: 'GIGABYTE',
        socket: 'LGA1700',
        price: 329,
        specs: 'ATX, PCIe 5.0, DDR5, Thunderbolt 4',
        formFactor: 'ATX',
        year: 2023,
      },
      {
        id: 'mb4',
        name: 'ASUS ROG STRIX B650I',
        brand: 'ASUS',
        socket: 'AM5',
        price: 279,
        specs: 'Mini-ITX, PCIe 5.0, DDR5, Wi-Fi 6E',
        formFactor: 'Mini-ITX',
        year: 2024,
      },
      {
        id: 'mb5',
        name: 'ASRock B650M Pro',
        brand: 'ASRock',
        socket: 'AM5',
        price: 179,
        specs: 'Micro-ATX, PCIe 4.0, DDR5',
        formFactor: 'Micro-ATX',
        year: 2023,
      },
    ],
    ram: [
      {
        id: 'ram1',
        name: 'Corsair Vengeance 32GB DDR5 4800MHz',
        brand: 'Corsair',
        price: 109,
        modules: 2,
        specs: '2x16GB, CL40',
        color: 'Black',
        year: 2023,
      },
      {
        id: 'ram2',
        name: 'G.Skill Trident Z5 64GB DDR5 6000MHz',
        brand: 'G.Skill',
        price: 229,
        modules: 2,
        specs: '2x32GB, CL36',
        color: 'Silver',
        year: 2024,
      },
      {
        id: 'ram3',
        name: 'Corsair Dominator 32GB DDR5 6400MHz RGB',
        brand: 'Corsair',
        price: 149,
        modules: 2,
        specs: '2x16GB, CL32, RGB',
        color: 'RGB',
        year: 2024,
      },
      {
        id: 'ram4',
        name: 'Kingston Fury 32GB DDR5 5600MHz',
        brand: 'Kingston',
        price: 119,
        modules: 2,
        specs: '2x16GB, CL36',
        color: 'Black',
        year: 2023,
      },
    ],
    storage: [
      {
        id: 'ssd1',
        name: 'Samsung 980 PRO 1TB NVMe Gen4',
        brand: 'Samsung',
        price: 89,
        count: 1,
        specs: '7000MB/s Read',
        year: 2023,
      },
      {
        id: 'ssd2',
        name: 'WD Black SN850X 2TB NVMe Gen4',
        brand: 'WD',
        price: 149,
        count: 1,
        specs: '7450MB/s Read',
        year: 2024,
      },
      {
        id: 'ssd3',
        name: 'Crucial T700 4TB NVMe Gen5',
        brand: 'Crucial',
        price: 449,
        count: 1,
        specs: '12000MB/s Read',
        year: 2024,
      },
      {
        id: 'ssd4',
        name: 'Kingston KC3000 1TB NVMe Gen4',
        brand: 'Kingston',
        price: 79,
        count: 1,
        specs: '7000MB/s Read',
        year: 2023,
      },
    ],
    psu: [
      {
        id: 'psu1',
        name: 'Corsair RM650x 650W 80+ Gold',
        brand: 'Corsair',
        price: 89,
        wattage: 650,
        length: 160,
        specs: 'Modular, 10 Year Warranty',
        year: 2023,
      },
      {
        id: 'psu2',
        name: 'EVGA SuperNOVA 750W 80+ Gold',
        brand: 'EVGA',
        price: 109,
        wattage: 750,
        length: 180,
        specs: 'Fully Modular, 10 Year Warranty',
        year: 2023,
      },
      {
        id: 'psu3',
        name: 'Seasonic Focus 850W 80+ Platinum',
        brand: 'Seasonic',
        price: 159,
        wattage: 850,
        length: 170,
        specs: 'Fully Modular, 12 Year Warranty',
        year: 2024,
      },
      {
        id: 'psu4',
        name: 'be quiet! Dark Power 1000W 80+ Platinum',
        brand: 'be quiet!',
        price: 199,
        wattage: 1000,
        length: 180,
        specs: 'Fully Modular, 12 Year Warranty',
        year: 2024,
      },
    ],
    case: [
      {
        id: 'case1',
        name: 'NZXT H210i',
        brand: 'NZXT',
        price: 99,
        specs: 'Mini-ITX, Tempered Glass, RGB',
        formFactor: 'Mini-ITX',
        image: '🔲',
        maxGPULength: 325,
        maxPSULength: 180,
        supportedMobo: ['Mini-ITX'],
        supportsCooling: ['Air', 'AIO-240'],
        color: 'Black',
        year: 2023,
      },
      {
        id: 'case2',
        name: 'Cooler Master Q300L',
        brand: 'Cooler Master',
        price: 49,
        specs: 'Micro-ATX, Acrylic Window',
        formFactor: 'Micro-ATX',
        image: '🔳',
        maxGPULength: 360,
        maxPSULength: 180,
        supportedMobo: ['Micro-ATX', 'Mini-ITX'],
        supportsCooling: ['Air', 'AIO-240'],
        color: 'Black',
        year: 2022,
      },
      {
        id: 'case3',
        name: 'NZXT H7 Flow White',
        brand: 'NZXT',
        price: 129,
        specs: 'Mid Tower, Tempered Glass, 3x120mm Fans',
        formFactor: 'Mid-Tower',
        image: '⬜',
        maxGPULength: 400,
        maxPSULength: 220,
        supportedMobo: ['ATX', 'Micro-ATX', 'Mini-ITX'],
        supportsCooling: ['Air', 'AIO-240', 'AIO-360'],
        color: 'White',
        year: 2024,
      },
      {
        id: 'case4',
        name: 'NZXT H7 Flow Black',
        brand: 'NZXT',
        price: 129,
        specs: 'Mid Tower, Tempered Glass, 3x120mm Fans',
        formFactor: 'Mid-Tower',
        image: '⬛',
        maxGPULength: 400,
        maxPSULength: 220,
        supportedMobo: ['ATX', 'Micro-ATX', 'Mini-ITX'],
        supportsCooling: ['Air', 'AIO-240', 'AIO-360'],
        color: 'Black',
        year: 2024,
      },
      {
        id: 'case5',
        name: 'Lian Li O11 Dynamic',
        brand: 'Lian Li',
        price: 159,
        specs: 'Mid Tower, Dual Tempered Glass',
        formFactor: 'Mid-Tower',
        image: '◼️',
        maxGPULength: 420,
        maxPSULength: 220,
        supportedMobo: ['ATX', 'Micro-ATX', 'Mini-ITX'],
        supportsCooling: ['Air', 'AIO-240', 'AIO-360', 'Custom'],
        color: 'Black',
        year: 2023,
      },
      {
        id: 'case6',
        name: 'Corsair 7000D Airflow',
        brand: 'Corsair',
        price: 249,
        specs: 'Full Tower, Massive Airflow, 10x140mm Support',
        formFactor: 'Full-Tower',
        image: '⬛',
        maxGPULength: 500,
        maxPSULength: 250,
        supportedMobo: ['E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX'],
        supportsCooling: ['Air', 'AIO-240', 'AIO-360', 'AIO-420', 'Custom'],
        color: 'Black',
        year: 2023,
      },
    ],
    cooling: [
      {
        id: 'cool1',
        name: 'NZXT Kraken 240 RGB',
        brand: 'NZXT',
        price: 129,
        power: 10,
        type: 'AIO-240',
        specs: '240mm AIO, RGB',
        color: 'Black',
        year: 2024,
      },
      {
        id: 'cool2',
        name: 'NZXT Kraken 360 RGB',
        brand: 'NZXT',
        price: 179,
        power: 15,
        type: 'AIO-360',
        specs: '360mm AIO, RGB, LCD Screen',
        color: 'Black',
        year: 2024,
      },
      {
        id: 'cool3',
        name: 'Noctua NH-D15',
        brand: 'Noctua',
        price: 109,
        power: 0,
        type: 'Air',
        specs: 'Dual Tower Air Cooler',
        color: 'Brown',
        year: 2023,
      },
      {
        id: 'cool4',
        name: 'Arctic Liquid Freezer II 280',
        brand: 'Arctic',
        price: 99,
        power: 12,
        type: 'AIO-240',
        specs: '280mm AIO',
        color: 'Black',
        year: 2023,
      },
      {
        id: 'cool5',
        name: 'Corsair iCUE H150i Elite',
        brand: 'Corsair',
        price: 189,
        power: 15,
        type: 'AIO-360',
        specs: '360mm AIO, RGB',
        color: 'Black',
        year: 2024,
      },
    ],
  };

  // Get available filter options based on current category
  const getFilterOptions = (category) => {
    const items = components[category] || [];
    return {
      brands: [...new Set(items.map((item) => item.brand).filter(Boolean))],
      sockets: [...new Set(items.map((item) => item.socket).filter(Boolean))],
      colors: [...new Set(items.map((item) => item.color).filter(Boolean))],
      years: [...new Set(items.map((item) => item.year).filter(Boolean))].sort((a, b) => b - a),
    };
  };

  // Check component compatibility with selected case
  const checkCompatibility = (component, category) => {
    if (!selectedComponents.case) return { compatible: true, reason: '' };

    const selectedCase = selectedComponents.case;

    switch (category) {
      case 'gpu':
        if (component.length > selectedCase.maxGPULength) {
          return {
            compatible: false,
            reason:
              language === 'ru' ? 'Не подходит под корпус (длина)' : 'Does not fit case (length)',
          };
        }
        break;
      case 'motherboard':
        if (!selectedCase.supportedMobo.includes(component.formFactor)) {
          return {
            compatible: false,
            reason:
              language === 'ru'
                ? 'Не подходит под корпус (форм-фактор)'
                : 'Does not fit case (form factor)',
          };
        }
        break;
      case 'psu':
        if (component.length > selectedCase.maxPSULength) {
          return {
            compatible: false,
            reason:
              language === 'ru'
                ? 'Не подходит под корпус (длина БП)'
                : 'Does not fit case (PSU length)',
          };
        }
        break;
      case 'cooling':
        if (!selectedCase.supportsCooling.includes(component.type)) {
          return {
            compatible: false,
            reason:
              language === 'ru'
                ? 'Не подходит под корпус (охлаждение)'
                : 'Does not fit case (cooling)',
          };
        }
        break;
    }

    return { compatible: true, reason: '' };
  };

  // Filter components based on category-specific filters and compatibility
  const getFilteredComponents = (category) => {
    let items = components[category] || [];
    const filters = categoryFilters[category] || { brand: [], size: [] };
    const search = categorySearch[category] || '';

    // SMART FILTER: Auto-filter based on selected components
    if (smartFilter) {
      // If CPU is selected, filter motherboards by socket
      if (category === 'motherboard' && selectedComponents.cpu) {
        items = items.filter((item) => item.socket === selectedComponents.cpu.socket);
      }

      // If motherboard is selected, filter CPUs by socket
      if (category === 'cpu' && selectedComponents.motherboard) {
        items = items.filter((item) => item.socket === selectedComponents.motherboard.socket);
      }

      // If PSU is selected, filter by recommended wattage
      if (category !== 'psu' && selectedComponents.psu) {
        const maxAllowedPower = selectedComponents.psu.wattage * 0.8; // 80% utilization max
        items = items.filter((item) => {
          const itemPower = item.tdp || 0;
          return (
            totalPower - (selectedComponents[category]?.tdp || 0) + itemPower <= maxAllowedPower
          );
        });
      }
    }

    // Apply category-specific search
    if (search) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.brand && item.brand.toLowerCase().includes(search.toLowerCase())) ||
          (item.specs && item.specs.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply category-specific brand filter
    if (filters.brand && filters.brand.length > 0) {
      items = items.filter((item) => filters.brand.includes(item.brand));
    }

    // Apply category-specific size filter (formFactor for motherboards/cases)
    if (filters.size && filters.size.length > 0) {
      if (category === 'motherboard' || category === 'case') {
        items = items.filter((item) => filters.size.includes(item.formFactor));
      }
    }

    // Filter out incompatible components if case is selected
    if (selectedComponents.case) {
      items = items.map((item) => ({
        ...item,
        compatibility: checkCompatibility(item, category),
      }));

      // Hide incompatible items if smart filter is on
      if (smartFilter) {
        items = items.filter((item) => !item.compatibility || item.compatibility.compatible);
      }
    }

    return items;
  };

  // Toggle category filter
  const toggleCategoryFilter = (category, filterType, value) => {
    setCategoryFilters((prev) => {
      const catFilters = prev[category] || { brand: [], size: [] };
      const current = catFilters[filterType] || [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      return {
        ...prev,
        [category]: {
          ...catFilters,
          [filterType]: newValues,
        },
      };
    });
  };

  // Update category search
  const updateCategorySearch = (category, value) => {
    setCategorySearch((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  // Get available brands for a category
  const getAvailableBrands = (category) => {
    const items = components[category] || [];
    return [...new Set(items.map((item) => item.brand).filter(Boolean))].sort();
  };

  // Get available sizes for a category
  const getAvailableSizes = (category) => {
    const items = components[category] || [];
    if (category === 'motherboard' || category === 'case') {
      return [...new Set(items.map((item) => item.formFactor).filter(Boolean))].sort();
    }
    return [];
  };

  // Performance metrics calculator based on selected components
  const calculatePerformance = (resolution) => {
    const cpuScore = selectedComponents.cpu?.performanceScore || 0;
    const gpuScore = selectedComponents.gpu?.performanceScore || 0;

    // Base FPS calculation (simplified algorithm)
    const basePerformance = cpuScore * 0.3 + gpuScore * 0.7;

    const games = [
      { name: 'Counter-Strike 2', baseMultiplier: 4.5 },
      { name: 'Valorant', baseMultiplier: 7.0 },
      { name: 'Fortnite', baseMultiplier: 2.1 },
      { name: 'GTA V', baseMultiplier: 2.3 },
      { name: 'League of Legends', baseMultiplier: 2.8 },
      { name: 'Cyberpunk 2077', baseMultiplier: 1.6 },
      { name: 'Black Myth: Wukong', baseMultiplier: 1.0 },
    ];

    const resolutionMultiplier = {
      1080: 1.0,
      1440: 0.75,
      '4K': 0.45,
    };

    return games.map((game) => ({
      name: game.name,
      fps: Math.round(basePerformance * game.baseMultiplier * resolutionMultiplier[resolution]),
    }));
  };

  const componentCategories = [
    { key: 'case', name: language === 'ru' ? 'КОРПУС' : 'CASE', icon: 'case', required: true },
    { key: 'cpu', name: language === 'ru' ? 'ПРОЦЕССОР' : 'CPU', icon: 'cpu', required: true },
    { key: 'gpu', name: language === 'ru' ? 'ВИДЕОКАРТА' : 'GPU', icon: 'gpu', required: true },
    {
      key: 'motherboard',
      name: language === 'ru' ? 'МАТЕРИНСКАЯ ПЛАТА' : 'MOTHERBOARD',
      icon: 'motherboard',
      required: true,
    },
    { key: 'ram', name: language === 'ru' ? 'ПАМЯТЬ' : 'RAM', icon: 'ram', required: true },
    {
      key: 'storage',
      name: language === 'ru' ? 'НАКОПИТЕЛЬ' : 'STORAGE',
      icon: 'storage',
      required: true,
    },
    {
      key: 'psu',
      name: language === 'ru' ? 'БЛОК ПИТАНИЯ' : 'POWER SUPPLY',
      icon: 'psu',
      required: true,
    },
    {
      key: 'cooling',
      name: language === 'ru' ? 'ОХЛАЖДЕНИЕ' : 'COOLING',
      icon: 'cooling',
      required: false,
    },
  ];

  const performanceData = calculatePerformance(performanceResolution);

  const [expandedCategory, setExpandedCategory] = useState(null);

  const selectComponent = (category, component) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [category]: component,
    }));
    setExpandedCategory(null);
  };

  const isConfigComplete = () => {
    return componentCategories
      .filter((cat) => cat.required)
      .every((cat) => selectedComponents[cat.key] !== null);
  };

  // Save build and add to cart
  const handleAddToCart = async (asAssembled = false) => {
    if (!isConfigComplete()) return;

    setIsAddingToCart(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

      // Convert components to backend format
      const componentsData = {};
      Object.keys(selectedComponents).forEach((key) => {
        const comp = selectedComponents[key];
        if (comp) {
          componentsData[key] = {
            component_id: comp.id,
            component_type: key,
            name: comp.name,
            price: comp.price,
            specs: comp.specs || '',
            tdp: comp.tdp || 0,
          };
        }
      });

      // Create or update build
      let buildId = savedBuildId;

      if (!buildId) {
        // Create new build
        const buildResponse = await fetch(`${BACKEND_URL}/api/pc-builds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            build_name: `${buildType || 'Custom'} Build`,
            components: componentsData,
          }),
        });

        if (!buildResponse.ok) {
          throw new Error('Failed to create build');
        }

        const build = await buildResponse.json();
        buildId = build.id;
        setSavedBuildId(buildId);
      }

      // Add to cart
      const cartResponse = await fetch(
        `${BACKEND_URL}/api/pc-builds/${buildId}/add-to-cart?as_assembled=${asAssembled}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!cartResponse.ok) {
        const errorData = await cartResponse.json();
        throw new Error(errorData.detail || 'Failed to add to cart');
      }

      const result = await cartResponse.json();

      alert(
        asAssembled
          ? language === 'ru'
            ? `Сборка добавлена в корзину! (+$99 за сборку)`
            : `Build added to cart! (+$99 assembly fee)`
          : language === 'ru'
            ? `${result.items_added} компонентов добавлено в корзину`
            : `${result.items_added} components added to cart`
      );

      // Optionally redirect to cart
      // window.location.href = '/cart';
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(
        language === 'ru'
          ? 'Ошибка при добавлении в корзину. Попробуйте войти в систему.'
          : 'Error adding to cart. Please try logging in.'
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '80px',
        background: theme === 'minimal-mod' ? '#000000' : theme === 'dark' ? '#0a0a0a' : '#ffffff',
        color: theme === 'minimal-mod' ? '#f1f1f1' : theme === 'dark' ? '#ffffff' : '#1a1a1a',
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          padding: '4rem 2rem 2rem',
          textAlign: 'center',
          background:
            theme === 'dark'
              ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(10, 10, 10, 0) 100%)'
              : 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1rem',
            letterSpacing: '1px',
          }}
        >
          {language === 'ru' ? 'СБОРОЧНАЯ' : 'PC BUILDER'}
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            opacity: 0.7,
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {language === 'ru'
            ? 'Создайте идеальную конфигурацию для игр и работы'
            : 'Build your perfect gaming and productivity machine'}
        </p>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: '350px 1fr 400px',
          gap: '2rem',
        }}
      >
        {/* Left Column - Case Render & Performance */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          {/* Case Render */}
          <div
            className="glass"
            style={{
              padding: '2rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border:
                theme === 'minimal-mod'
                  ? '1px solid rgba(241, 241, 241, 0.12)'
                  : theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              minHeight: '250px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {selectedComponents.case ? (
              <>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
                  {selectedComponents.case.image}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  {selectedComponents.case.name}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    borderRadius: '4px',
                    color: '#8b5cf6',
                    fontWeight: '600',
                  }}
                >
                  {buildType || 'Select Case'}
                </div>
              </>
            ) : (
              <>
                <Box
                  size={80}
                  color={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                  strokeWidth={1}
                />
                <div style={{ fontSize: '0.875rem', opacity: 0.5, marginTop: '1rem' }}>
                  {language === 'ru' ? 'Выберите корпус' : 'Select a Case'}
                </div>
              </>
            )}
          </div>

          {/* Performance Section */}
          {selectedComponents.cpu && selectedComponents.gpu && (
            <div
              className="glass"
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
                border:
                  theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  letterSpacing: '0.5px',
                }}
              >
                {language === 'ru' ? 'ПРОИЗВОДИТЕЛЬНОСТЬ' : 'PERFORMANCE'}
              </h3>

              {/* Game Performance List */}
              <div style={{ marginBottom: '1rem' }}>
                {performanceData.map((game, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      paddingBottom: '0.75rem',
                      borderBottom:
                        idx < performanceData.length - 1
                          ? theme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.05)'
                            : '1px solid rgba(0, 0, 0, 0.05)'
                          : 'none',
                    }}
                  >
                    <span style={{ fontSize: '0.8125rem', opacity: 0.9 }}>{game.name}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color:
                            game.fps >= 120 ? '#10b981' : game.fps >= 60 ? '#8b5cf6' : '#f59e0b',
                        }}
                      >
                        {game.fps}
                      </span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>FPS</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resolution Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {['1080', '1440', '4K'].map((res) => (
                  <button
                    key={res}
                    onClick={() => setPerformanceResolution(res)}
                    className="glass-subtle"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border:
                        performanceResolution === res
                          ? '1px solid rgba(139, 92, 246, 0.5)'
                          : theme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                      background:
                        performanceResolution === res ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                      color: performanceResolution === res ? '#8b5cf6' : 'inherit',
                      fontSize: '0.8125rem',
                      fontWeight: performanceResolution === res ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (performanceResolution !== res) {
                        e.currentTarget.style.background =
                          theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (performanceResolution !== res) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {res}
                  </button>
                ))}
              </div>

              <div
                style={{
                  fontSize: '0.6875rem',
                  opacity: 0.5,
                  textAlign: 'center',
                  marginTop: '0.75rem',
                }}
              >
                {language === 'ru'
                  ? 'Тестирование на ультра настройках'
                  : 'Tested at Ultra High Settings'}
              </div>
            </div>
          )}
        </div>

        {/* Center Column - Component Selection */}
        <div>
          {componentCategories.map((category) => {
            const selected = selectedComponents[category.key];
            const isExpanded = expandedCategory === category.key;

            return (
              <div
                key={category.key}
                className="glass"
                style={{
                  marginBottom: '1rem',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: selected
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.08)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Category Header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.key)}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color:
                      theme === 'minimal-mod'
                        ? '#f1f1f1'
                        : theme === 'dark'
                          ? '#ffffff'
                          : '#1a1a1a',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      className="glass-subtle"
                      style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        border: selected
                          ? '1px solid rgba(139, 92, 246, 0.5)'
                          : theme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                        background: selected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {ComponentIcons[category.icon]({
                        size: 20,
                        color: selected
                          ? '#8b5cf6'
                          : theme === 'minimal-mod'
                            ? '#f1f1f1'
                            : theme === 'dark'
                              ? '#ffffff'
                              : '#1a1a1a',
                        strokeWidth: 2,
                      })}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div
                        style={{ fontSize: '0.875rem', fontWeight: '700', letterSpacing: '0.5px' }}
                      >
                        {category.name}
                        {category.required && (
                          <span style={{ color: '#8b5cf6', marginLeft: '0.5rem' }}>*</span>
                        )}
                      </div>
                      {selected && (
                        <div style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>
                          {selected.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {selected && <Check size={20} color="#8b5cf6" />}
                    {selected ? (
                      <span style={{ fontSize: '1rem', fontWeight: '600' }}>${selected.price}</span>
                    ) : (
                      <Plus size={20} />
                    )}
                    <ChevronDown
                      size={20}
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  </div>
                </button>

                {/* Component Options */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop:
                        theme === 'minimal-mod'
                          ? '1px solid rgba(241, 241, 241, 0.12)'
                          : theme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    {/* Search and Filters Row */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                        alignItems: 'center',
                      }}
                    >
                      {/* Search Input */}
                      <input
                        type="text"
                        placeholder={language === 'ru' ? '🔍 Поиск...' : '🔍 Search...'}
                        value={categorySearch[category.key] || ''}
                        onChange={(e) => updateCategorySearch(category.key, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border:
                            theme === 'minimal-mod'
                              ? '1px solid rgba(241, 241, 241, 0.12)'
                              : theme === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.08)'
                                : '1px solid rgba(0, 0, 0, 0.08)',
                          background:
                            theme === 'minimal-mod'
                              ? 'rgba(241, 241, 241, 0.05)'
                              : theme === 'dark'
                                ? 'rgba(255, 255, 255, 0.03)'
                                : 'rgba(0, 0, 0, 0.03)',
                          color:
                            theme === 'minimal-mod'
                              ? '#f1f1f1'
                              : theme === 'dark'
                                ? '#ffffff'
                                : '#1a1a1a',
                          fontSize: '0.8125rem',
                          outline: 'none',
                        }}
                      />

                      {/* Brand Filter Dropdown */}
                      {getAvailableBrands(category.key).length > 0 && (
                        <div style={{ position: 'relative' }} data-filter-dropdown>
                          <button
                            onClick={() =>
                              setShowFilterDropdown(
                                showFilterDropdown === `${category.key}-brand`
                                  ? null
                                  : `${category.key}-brand`
                              )
                            }
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: '6px',
                              border:
                                categoryFilters[category.key]?.brand?.length > 0
                                  ? '1px solid rgba(139, 92, 246, 0.5)'
                                  : theme === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.08)'
                                    : '1px solid rgba(0, 0, 0, 0.08)',
                              background:
                                categoryFilters[category.key]?.brand?.length > 0
                                  ? 'rgba(139, 92, 246, 0.2)'
                                  : 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: 'inherit',
                            }}
                          >
                            {language === 'ru' ? 'Бренд' : 'Brand'}
                            {categoryFilters[category.key]?.brand?.length > 0 && (
                              <span
                                style={{
                                  background: '#8b5cf6',
                                  color: 'white',
                                  borderRadius: '10px',
                                  padding: '0 0.375rem',
                                  fontSize: '0.625rem',
                                }}
                              >
                                {categoryFilters[category.key].brand.length}
                              </span>
                            )}
                            <ChevronDown size={12} />
                          </button>

                          {showFilterDropdown === `${category.key}-brand` && (
                            <div
                              className="glass"
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 0.5rem)',
                                left: 0,
                                zIndex: 1000,
                                minWidth: '180px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border:
                                  theme === 'minimal-mod'
                                    ? '1px solid rgba(241, 241, 241, 0.15)'
                                    : theme === 'dark'
                                      ? '1px solid rgba(255, 255, 255, 0.1)'
                                      : '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                              }}
                            >
                              {getAvailableBrands(category.key).map((brand) => (
                                <label
                                  key={brand}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontSize: '0.8125rem',
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      theme === 'dark'
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'rgba(0,0,0,0.05)')
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = 'transparent')
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={(categoryFilters[category.key]?.brand || []).includes(
                                      brand
                                    )}
                                    onChange={() =>
                                      toggleCategoryFilter(category.key, 'brand', brand)
                                    }
                                    style={{ accentColor: '#8b5cf6' }}
                                  />
                                  <span>{brand}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Size Filter Dropdown (for motherboard/case) */}
                      {getAvailableSizes(category.key).length > 0 && (
                        <div style={{ position: 'relative' }} data-filter-dropdown>
                          <button
                            onClick={() =>
                              setShowFilterDropdown(
                                showFilterDropdown === `${category.key}-size`
                                  ? null
                                  : `${category.key}-size`
                              )
                            }
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: '6px',
                              border:
                                categoryFilters[category.key]?.size?.length > 0
                                  ? '1px solid rgba(139, 92, 246, 0.5)'
                                  : theme === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.08)'
                                    : '1px solid rgba(0, 0, 0, 0.08)',
                              background:
                                categoryFilters[category.key]?.size?.length > 0
                                  ? 'rgba(139, 92, 246, 0.2)'
                                  : 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: 'inherit',
                            }}
                          >
                            {language === 'ru' ? 'Размер' : 'Size'}
                            {categoryFilters[category.key]?.size?.length > 0 && (
                              <span
                                style={{
                                  background: '#8b5cf6',
                                  color: 'white',
                                  borderRadius: '10px',
                                  padding: '0 0.375rem',
                                  fontSize: '0.625rem',
                                }}
                              >
                                {categoryFilters[category.key].size.length}
                              </span>
                            )}
                            <ChevronDown size={12} />
                          </button>

                          {showFilterDropdown === `${category.key}-size` && (
                            <div
                              className="glass"
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 0.5rem)',
                                right: 0,
                                zIndex: 1000,
                                minWidth: '150px',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border:
                                  theme === 'minimal-mod'
                                    ? '1px solid rgba(241, 241, 241, 0.15)'
                                    : theme === 'dark'
                                      ? '1px solid rgba(255, 255, 255, 0.1)'
                                      : '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                              }}
                            >
                              {getAvailableSizes(category.key).map((size) => (
                                <label
                                  key={size}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontSize: '0.8125rem',
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      theme === 'dark'
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'rgba(0,0,0,0.05)')
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = 'transparent')
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={(categoryFilters[category.key]?.size || []).includes(
                                      size
                                    )}
                                    onChange={() =>
                                      toggleCategoryFilter(category.key, 'size', size)
                                    }
                                    style={{ accentColor: '#8b5cf6' }}
                                  />
                                  <span>{size}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Component List */}
                    <div
                      style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                      }}
                    >
                      {getFilteredComponents(category.key).map((component) => {
                        const isIncompatible =
                          component.compatibility && !component.compatibility.compatible;
                        return (
                          <button
                            key={component.id}
                            onClick={() =>
                              !isIncompatible && selectComponent(category.key, component)
                            }
                            className="glass-subtle"
                            style={{
                              width: '100%',
                              padding: '0.625rem 0.75rem',
                              marginBottom: '0.375rem',
                              borderRadius: '6px',
                              border: isIncompatible
                                ? '1px solid rgba(239, 68, 68, 0.5)'
                                : selected?.id === component.id
                                  ? '1px solid rgba(139, 92, 246, 0.5)'
                                  : theme === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.05)'
                                    : '1px solid rgba(0, 0, 0, 0.05)',
                              background: isIncompatible
                                ? 'rgba(239, 68, 68, 0.1)'
                                : selected?.id === component.id
                                  ? 'rgba(139, 92, 246, 0.1)'
                                  : 'transparent',
                              cursor: isIncompatible ? 'not-allowed' : 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s ease',
                              opacity: isIncompatible ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (selected?.id !== component.id && !isIncompatible) {
                                e.currentTarget.style.background =
                                  theme === 'dark'
                                    ? 'rgba(255, 255, 255, 0.03)'
                                    : 'rgba(0, 0, 0, 0.03)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selected?.id !== component.id && !isIncompatible) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.25rem',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: '600',
                                      fontSize: '0.8125rem',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {component.name}
                                  </span>
                                  {component.brand && (
                                    <span
                                      style={{
                                        fontSize: '0.625rem',
                                        padding: '0.125rem 0.375rem',
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        borderRadius: '3px',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {component.brand}
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.6875rem',
                                    opacity: 0.6,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {component.specs}
                                </div>
                                {isIncompatible && (
                                  <div
                                    style={{
                                      fontSize: '0.625rem',
                                      color: '#ef4444',
                                      marginTop: '0.25rem',
                                      fontWeight: '600',
                                    }}
                                  >
                                    ⚠ {component.compatibility.reason}
                                  </div>
                                )}
                              </div>
                              <div
                                style={{
                                  fontWeight: '700',
                                  fontSize: '0.875rem',
                                  color: isIncompatible ? '#ef4444' : '#8b5cf6',
                                  marginLeft: '0.75rem',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {formatPrice(component.price)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {getFilteredComponents(category.key).length === 0 && (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '1.5rem',
                            fontSize: '0.8125rem',
                            opacity: 0.5,
                          }}
                        >
                          {language === 'ru' ? 'Нет компонентов' : 'No components found'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column - Summary Sidebar */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          {/* Smart Filter Block */}
          <div
            className="glass"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Smart Filter Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                cursor: 'pointer',
                borderRadius: '6px',
                background: smartFilter ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                border: smartFilter ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                marginBottom: '0.75rem',
              }}
              onMouseEnter={(e) => {
                if (!smartFilter) {
                  e.currentTarget.style.background =
                    theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!smartFilter) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <input
                type="checkbox"
                checked={smartFilter}
                onChange={(e) => setSmartFilter(e.target.checked)}
                style={{ accentColor: '#8b5cf6' }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                {language === 'ru' ? '🧠 Умная фильтрация' : '🧠 Smart Filter'}
              </span>
              <span style={{ fontSize: '0.625rem', opacity: 0.6 }}>
                ({language === 'ru' ? 'совместимость' : 'compatibility'})
              </span>
            </label>
          </div>

          {/* Power Calculator */}
          <div
            className="glass"
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
            >
              <Info size={18} color="#8b5cf6" />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>
                {language === 'ru' ? 'КАЛЬКУЛЯТОР МОЩНОСТИ' : 'POWER CALCULATOR'}
              </h3>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
              >
                <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                  {language === 'ru' ? 'Потребление:' : 'Consumption:'}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{totalPower}W</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                  {language === 'ru' ? 'Рекомендуемый БП:' : 'Recommended PSU:'}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#8b5cf6' }}>
                  {recommendedPSU}W+
                </span>
              </div>
            </div>
            {selectedComponents.psu && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background:
                    selectedComponents.psu.wattage >= recommendedPSU
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                  border:
                    selectedComponents.psu.wattage >= recommendedPSU
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '0.8125rem',
                  textAlign: 'center',
                }}
              >
                {selectedComponents.psu.wattage >= recommendedPSU
                  ? language === 'ru'
                    ? '✓ Достаточная мощность'
                    : '✓ Sufficient Power'
                  : language === 'ru'
                    ? '⚠ Недостаточная мощность'
                    : '⚠ Insufficient Power'}
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div
            className="glass"
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
              {language === 'ru' ? 'ИТОГО' : 'SUMMARY'}
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                  {language === 'ru' ? 'Компоненты:' : 'Components:'}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop:
                    theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.08)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                  {language === 'ru' ? 'Всего:' : 'Total:'}
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => handleAddToCart(false)}
              disabled={!isConfigComplete() || isAddingToCart}
              style={{
                width: '100%',
                padding: '0.875rem',
                marginBottom: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background:
                  isConfigComplete() && !isAddingToCart ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: '700',
                cursor: isConfigComplete() && !isAddingToCart ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (isConfigComplete() && !isAddingToCart) {
                  e.currentTarget.style.background = '#7c3aed';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (isConfigComplete() && !isAddingToCart) {
                  e.currentTarget.style.background = '#8b5cf6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <ShoppingCart size={18} />
              {isAddingToCart
                ? language === 'ru'
                  ? 'Добавление...'
                  : 'Adding...'
                : language === 'ru'
                  ? 'ДОБАВИТЬ В КОРЗИНУ'
                  : 'ADD TO CART'}
            </button>

            <button
              onClick={() => handleAddToCart(true)}
              disabled={!isConfigComplete() || isAddingToCart}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border:
                  isConfigComplete() && !isAddingToCart
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : '1px solid rgba(139, 92, 246, 0.2)',
                background: 'transparent',
                color:
                  isConfigComplete() && !isAddingToCart ? '#8b5cf6' : 'rgba(139, 92, 246, 0.5)',
                fontSize: '0.9375rem',
                fontWeight: '700',
                cursor: isConfigComplete() && !isAddingToCart ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (isConfigComplete() && !isAddingToCart) {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (isConfigComplete() && !isAddingToCart) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Wrench size={18} />
              {isAddingToCart
                ? language === 'ru'
                  ? 'Добавление...'
                  : 'Adding...'
                : language === 'ru'
                  ? 'ЗАКАЗАТЬ ГОТОВУЮ СБОРКУ'
                  : 'ORDER ASSEMBLED'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuilderPage;
