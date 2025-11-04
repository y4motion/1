import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, Plus, Check, Info, ShoppingCart, Wrench, Cpu, Monitor, HardDrive, Box, Gauge, Snowflake, Zap } from 'lucide-react';

// Component Icons (NZXT-inspired minimalist SVG)
const ComponentIcons = {
  cpu: (props) => <Cpu {...props} />,
  gpu: (props) => <Monitor {...props} />,
  motherboard: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <rect x="7" y="7" width="3" height="3"/>
      <rect x="14" y="7" width="3" height="3"/>
      <rect x="7" y="14" width="3" height="3"/>
      <rect x="14" y="14" width="3" height="3"/>
    </svg>
  ),
  ram: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="6" width="16" height="12" rx="1"/>
      <line x1="8" y1="10" x2="8" y2="14"/>
      <line x1="12" y1="10" x2="12" y2="14"/>
      <line x1="16" y1="10" x2="16" y2="14"/>
    </svg>
  ),
  storage: (props) => <HardDrive {...props} />,
  psu: (props) => <Zap {...props} />,
  case: (props) => <Box {...props} />,
  cooling: (props) => <Snowflake {...props} />
};

const PCBuilderPage = () => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();

  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null,
    gpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    psu: null,
    case: null,
    cooling: null
  });

  const [buildType, setBuildType] = useState(null); // Mini-ITX, Micro-ATX, Mid-Tower, Full-Tower
  const [performanceResolution, setPerformanceResolution] = useState('1440'); // 1080, 1440, 4K

  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPower, setTotalPower] = useState(0);
  const [recommendedPSU, setRecommendedPSU] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [savedBuildId, setSavedBuildId] = useState(null);

  // Determine build type based on case selection
  useEffect(() => {
    if (selectedComponents.case) {
      const caseSize = selectedComponents.case.formFactor;
      setBuildType(caseSize);
    }
  }, [selectedComponents.case]);

  // Calculate total power consumption and recommended PSU
  useEffect(() => {
    const powerConsumption = {
      cpu: selectedComponents.cpu?.tdp || 0,
      gpu: selectedComponents.gpu?.tdp || 0,
      motherboard: 50,
      ram: (selectedComponents.ram?.modules || 0) * 5,
      storage: (selectedComponents.storage?.count || 0) * 10,
      cooling: selectedComponents.cooling?.power || 15,
      fans: 30
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
      .filter(comp => comp !== null)
      .reduce((sum, comp) => sum + (comp.price || 0), 0);
    setTotalPrice(total);
  }, [selectedComponents]);

  // Mock component data with enhanced details
  const components = {
    cpu: [
      { id: 'cpu1', name: 'AMD Ryzen 7 9700X', price: 359, tdp: 65, specs: '8-Core, 16-Thread, 4.5GHz Boost', performanceScore: 75 },
      { id: 'cpu2', name: 'AMD Ryzen 7 9800X3D', price: 479, tdp: 120, specs: '8-Core, 16-Thread, 5.2GHz Boost, 3D V-Cache', performanceScore: 95 },
      { id: 'cpu3', name: 'Intel Core i7-14700K', price: 409, tdp: 125, specs: '20-Core, 28-Thread, 5.6GHz Boost', performanceScore: 85 },
      { id: 'cpu4', name: 'AMD Ryzen 9 9900X', price: 499, tdp: 170, specs: '12-Core, 24-Thread, 5.4GHz Boost', performanceScore: 100 }
    ],
    gpu: [
      { id: 'gpu1', name: 'NVIDIA RTX 5060', price: 299, tdp: 115, specs: '8GB GDDR6, 1080p Gaming', performanceScore: 60 },
      { id: 'gpu2', name: 'NVIDIA RTX 5070 Ti', price: 599, tdp: 285, specs: '16GB GDDR6X, 1440p Gaming', performanceScore: 85 },
      { id: 'gpu3', name: 'NVIDIA RTX 5080', price: 999, tdp: 320, specs: '16GB GDDR6X, 4K Gaming', performanceScore: 100 },
      { id: 'gpu4', name: 'AMD RX 9070 XT', price: 649, tdp: 300, specs: '16GB GDDR6, 1440p Gaming', performanceScore: 80 }
    ],
    motherboard: [
      { id: 'mb1', name: 'MSI B650 TOMAHAWK', price: 229, specs: 'ATX, PCIe 5.0, DDR5', formFactor: 'ATX' },
      { id: 'mb2', name: 'ASUS ROG STRIX X670E', price: 399, specs: 'ATX, PCIe 5.0, DDR5, Wi-Fi 6E', formFactor: 'ATX' },
      { id: 'mb3', name: 'GIGABYTE Z790 AORUS', price: 329, specs: 'ATX, PCIe 5.0, DDR5, Thunderbolt 4', formFactor: 'ATX' },
      { id: 'mb4', name: 'ASUS ROG STRIX B650I', price: 279, specs: 'Mini-ITX, PCIe 5.0, DDR5, Wi-Fi 6E', formFactor: 'Mini-ITX' }
    ],
    ram: [
      { id: 'ram1', name: '32GB DDR5 4800MHz', price: 109, modules: 2, specs: '2x16GB, CL40' },
      { id: 'ram2', name: '64GB DDR5 6000MHz', price: 229, modules: 2, specs: '2x32GB, CL36' },
      { id: 'ram3', name: '32GB DDR5 6400MHz RGB', price: 149, modules: 2, specs: '2x16GB, CL32, RGB' }
    ],
    storage: [
      { id: 'ssd1', name: '1TB NVMe Gen4 SSD', price: 89, count: 1, specs: '7000MB/s Read' },
      { id: 'ssd2', name: '2TB NVMe Gen4 SSD', price: 149, count: 1, specs: '7450MB/s Read' },
      { id: 'ssd3', name: '4TB NVMe Gen5 SSD', price: 449, count: 1, specs: '12000MB/s Read' }
    ],
    psu: [
      { id: 'psu1', name: '650W 80+ Gold', price: 89, wattage: 650, specs: 'Modular, 10 Year Warranty' },
      { id: 'psu2', name: '750W 80+ Gold', price: 109, wattage: 750, specs: 'Fully Modular, 10 Year Warranty' },
      { id: 'psu3', name: '850W 80+ Platinum', price: 159, wattage: 850, specs: 'Fully Modular, 12 Year Warranty' },
      { id: 'psu4', name: '1000W 80+ Platinum', price: 199, wattage: 1000, specs: 'Fully Modular, 12 Year Warranty' }
    ],
    case: [
      { id: 'case1', name: 'NZXT H210i', price: 99, specs: 'Mini-ITX, Tempered Glass, RGB', formFactor: 'Mini-ITX', image: '🔲' },
      { id: 'case2', name: 'Cooler Master Q300L', price: 49, specs: 'Micro-ATX, Acrylic Window', formFactor: 'Micro-ATX', image: '🔳' },
      { id: 'case3', name: 'NZXT H7 Flow White', price: 129, specs: 'Mid Tower, Tempered Glass, 3x120mm Fans', formFactor: 'Mid-Tower', image: '⬜' },
      { id: 'case4', name: 'NZXT H7 Flow Black', price: 129, specs: 'Mid Tower, Tempered Glass, 3x120mm Fans', formFactor: 'Mid-Tower', image: '⬛' },
      { id: 'case5', name: 'Lian Li O11 Dynamic', price: 159, specs: 'Mid Tower, Dual Tempered Glass', formFactor: 'Mid-Tower', image: '◼️' },
      { id: 'case6', name: 'Corsair 7000D Airflow', price: 249, specs: 'Full Tower, Massive Airflow, 10x140mm Support', formFactor: 'Full-Tower', image: '⬛' }
    ],
    cooling: [
      { id: 'cool1', name: 'NZXT Kraken 240 RGB', price: 129, power: 10, specs: '240mm AIO, RGB' },
      { id: 'cool2', name: 'NZXT Kraken 360 RGB', price: 179, power: 15, specs: '360mm AIO, RGB, LCD Screen' },
      { id: 'cool3', name: 'Noctua NH-D15', price: 109, power: 0, specs: 'Dual Tower Air Cooler' }
    ]
  };

  // Performance metrics calculator based on selected components
  const calculatePerformance = (resolution) => {
    const cpuScore = selectedComponents.cpu?.performanceScore || 0;
    const gpuScore = selectedComponents.gpu?.performanceScore || 0;
    
    // Base FPS calculation (simplified algorithm)
    const basePerformance = (cpuScore * 0.3 + gpuScore * 0.7);
    
    const games = [
      { name: 'Counter-Strike 2', baseMultiplier: 4.5 },
      { name: 'Valorant', baseMultiplier: 7.0 },
      { name: 'Fortnite', baseMultiplier: 2.1 },
      { name: 'GTA V', baseMultiplier: 2.3 },
      { name: 'League of Legends', baseMultiplier: 2.8 },
      { name: 'Cyberpunk 2077', baseMultiplier: 1.6 },
      { name: 'Black Myth: Wukong', baseMultiplier: 1.0 }
    ];

    const resolutionMultiplier = {
      '1080': 1.0,
      '1440': 0.75,
      '4K': 0.45
    };

    return games.map(game => ({
      name: game.name,
      fps: Math.round(basePerformance * game.baseMultiplier * resolutionMultiplier[resolution])
    }));
  };

  const componentCategories = [
    { key: 'case', name: language === 'ru' ? 'КОРПУС' : 'CASE', icon: 'case', required: true },
    { key: 'cpu', name: language === 'ru' ? 'ПРОЦЕССОР' : 'CPU', icon: 'cpu', required: true },
    { key: 'gpu', name: language === 'ru' ? 'ВИДЕОКАРТА' : 'GPU', icon: 'gpu', required: true },
    { key: 'motherboard', name: language === 'ru' ? 'МАТЕРИНСКАЯ ПЛАТА' : 'MOTHERBOARD', icon: 'motherboard', required: true },
    { key: 'ram', name: language === 'ru' ? 'ПАМЯТЬ' : 'RAM', icon: 'ram', required: true },
    { key: 'storage', name: language === 'ru' ? 'НАКОПИТЕЛЬ' : 'STORAGE', icon: 'storage', required: true },
    { key: 'psu', name: language === 'ru' ? 'БЛОК ПИТАНИЯ' : 'POWER SUPPLY', icon: 'psu', required: true },
    { key: 'cooling', name: language === 'ru' ? 'ОХЛАЖДЕНИЕ' : 'COOLING', icon: 'cooling', required: false }
  ];

  const performanceData = calculatePerformance(performanceResolution);

  const [expandedCategory, setExpandedCategory] = useState(null);

  const selectComponent = (category, component) => {
    setSelectedComponents(prev => ({
      ...prev,
      [category]: component
    }));
    setExpandedCategory(null);
  };

  const isConfigComplete = () => {
    return componentCategories
      .filter(cat => cat.required)
      .every(cat => selectedComponents[cat.key] !== null);
  };

  // Save build and add to cart
  const handleAddToCart = async (asAssembled = false) => {
    if (!isConfigComplete()) return;
    
    setIsAddingToCart(true);
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
      
      // Convert components to backend format
      const componentsData = {};
      Object.keys(selectedComponents).forEach(key => {
        const comp = selectedComponents[key];
        if (comp) {
          componentsData[key] = {
            component_id: comp.id,
            component_type: key,
            name: comp.name,
            price: comp.price,
            specs: comp.specs || '',
            tdp: comp.tdp || 0
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
            components: componentsData
          })
        });
        
        if (!buildResponse.ok) {
          throw new Error('Failed to create build');
        }
        
        const build = await buildResponse.json();
        buildId = build.id;
        setSavedBuildId(buildId);
      }
      
      // Add to cart
      const cartResponse = await fetch(`${BACKEND_URL}/api/pc-builds/${buildId}/add-to-cart?as_assembled=${asAssembled}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!cartResponse.ok) {
        const errorData = await cartResponse.json();
        throw new Error(errorData.detail || 'Failed to add to cart');
      }
      
      const result = await cartResponse.json();
      
      alert(
        asAssembled
          ? (language === 'ru' ? `Сборка добавлена в корзину! (+$99 за сборку)` : `Build added to cart! (+$99 assembly fee)`)
          : (language === 'ru' ? `${result.items_added} компонентов добавлено в корзину` : `${result.items_added} components added to cart`)
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
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
    }}>
      {/* Hero Section */}
      <div style={{
        padding: '4rem 2rem 2rem',
        textAlign: 'center',
        background: theme === 'dark' 
          ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(10, 10, 10, 0) 100%)'
          : 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0) 100%)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '1rem',
          letterSpacing: '1px'
        }}>
          {language === 'ru' ? 'СБОРОЧНАЯ' : 'PC BUILDER'}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          opacity: 0.7,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {language === 'ru' 
            ? 'Создайте идеальную конфигурацию для игр и работы'
            : 'Build your perfect gaming and productivity machine'}
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: '350px 1fr 400px',
        gap: '2rem'
      }}>
        {/* Left Column - Case Render & Performance */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          {/* Case Render */}
          <div
            className="glass"
            style={{
              padding: '2rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              minHeight: '250px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
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
                <div style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.75rem', 
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: '4px',
                  color: '#8b5cf6',
                  fontWeight: '600'
                }}>
                  {buildType || 'Select Case'}
                </div>
              </>
            ) : (
              <>
                <Box size={80} color={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeWidth={1} />
                <div style={{ fontSize: '0.875rem', opacity: 0.5, marginTop: '1rem' }}>
                  {language === 'ru' ? 'Выберите корпус' : 'Select a Case'}
                </div>
              </>
            )}
          </div>

          {/* Performance Section */}
          {(selectedComponents.cpu && selectedComponents.gpu) && (
            <div
              className="glass"
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.5px' }}>
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
                      borderBottom: idx < performanceData.length - 1 
                        ? (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)')
                        : 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.8125rem', opacity: 0.9 }}>
                      {game.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700',
                        color: game.fps >= 120 ? '#10b981' : game.fps >= 60 ? '#8b5cf6' : '#f59e0b'
                      }}>
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
                      border: performanceResolution === res
                        ? '1px solid rgba(139, 92, 246, 0.5)'
                        : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
                      background: performanceResolution === res ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                      color: performanceResolution === res ? '#8b5cf6' : 'inherit',
                      fontSize: '0.8125rem',
                      fontWeight: performanceResolution === res ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (performanceResolution !== res) {
                        e.currentTarget.style.background = theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.05)';
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
              
              <div style={{ 
                fontSize: '0.6875rem', 
                opacity: 0.5, 
                textAlign: 'center', 
                marginTop: '0.75rem' 
              }}>
                {language === 'ru' ? 'Тестирование на ультра настройках' : 'Tested at Ultra High Settings'}
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
                    : theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'
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
                    color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
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
                          : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
                        background: selected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {ComponentIcons[category.icon]({
                        size: 20,
                        color: selected ? '#8b5cf6' : (theme === 'dark' ? '#ffffff' : '#1a1a1a'),
                        strokeWidth: 2
                      })}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                        {category.name}
                        {category.required && <span style={{ color: '#8b5cf6', marginLeft: '0.5rem' }}>*</span>}
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
                      <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                        ${selected.price}
                      </span>
                    ) : (
                      <Plus size={20} />
                    )}
                    <ChevronDown 
                      size={20} 
                      style={{ 
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }} 
                    />
                  </div>
                </button>

                {/* Component Options */}
                {isExpanded && (
                  <div style={{
                    borderTop: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                    padding: '1rem'
                  }}>
                    {components[category.key].map((component) => (
                      <button
                        key={component.id}
                        onClick={() => selectComponent(category.key, component)}
                        className="glass-subtle"
                        style={{
                          width: '100%',
                          padding: '1rem',
                          marginBottom: '0.75rem',
                          borderRadius: '8px',
                          border: selected?.id === component.id
                            ? '1px solid rgba(139, 92, 246, 0.5)'
                            : theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                          background: selected?.id === component.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selected?.id !== component.id) {
                            e.currentTarget.style.background = theme === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selected?.id !== component.id) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9375rem' }}>
                            {component.name}
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '1rem', color: '#8b5cf6' }}>
                            ${component.price}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8125rem', opacity: 0.7 }}>
                          {component.specs}
                        </div>
                        {component.tdp && (
                          <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>
                            TDP: {component.tdp}W
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column - Summary Sidebar */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          {/* Power Calculator */}
          <div
            className="glass"
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Info size={18} color="#8b5cf6" />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>
                {language === 'ru' ? 'КАЛЬКУЛЯТОР МОЩНОСТИ' : 'POWER CALCULATOR'}
              </h3>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                  {language === 'ru' ? 'Потребление:' : 'Consumption:'}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {totalPower}W
                </span>
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
              <div style={{
                padding: '0.75rem',
                borderRadius: '6px',
                background: selectedComponents.psu.wattage >= recommendedPSU
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                border: selectedComponents.psu.wattage >= recommendedPSU
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.8125rem',
                textAlign: 'center'
              }}>
                {selectedComponents.psu.wattage >= recommendedPSU
                  ? (language === 'ru' ? '✓ Достаточная мощность' : '✓ Sufficient Power')
                  : (language === 'ru' ? '⚠ Недостаточная мощность' : '⚠ Insufficient Power')}
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div
            className="glass"
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
              {language === 'ru' ? 'ИТОГО' : 'SUMMARY'}
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                  {language === 'ru' ? 'Компоненты:' : 'Components:'}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  ${totalPrice}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingTop: '0.75rem', borderTop: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                  {language === 'ru' ? 'Всего:' : 'Total:'}
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>
                  ${totalPrice}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              disabled={!isConfigComplete()}
              style={{
                width: '100%',
                padding: '0.875rem',
                marginBottom: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: isConfigComplete() ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: '700',
                cursor: isConfigComplete() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (isConfigComplete()) {
                  e.currentTarget.style.background = '#7c3aed';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (isConfigComplete()) {
                  e.currentTarget.style.background = '#8b5cf6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <ShoppingCart size={18} />
              {language === 'ru' ? 'ДОБАВИТЬ В КОРЗИНУ' : 'ADD TO CART'}
            </button>

            <button
              disabled={!isConfigComplete()}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: isConfigComplete() ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(139, 92, 246, 0.2)',
                background: 'transparent',
                color: isConfigComplete() ? '#8b5cf6' : 'rgba(139, 92, 246, 0.5)',
                fontSize: '0.9375rem',
                fontWeight: '700',
                cursor: isConfigComplete() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (isConfigComplete()) {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (isConfigComplete()) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Wrench size={18} />
              {language === 'ru' ? 'ЗАКАЗАТЬ ГОТОВУЮ СБОРКУ' : 'ORDER ASSEMBLED'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuilderPage;
