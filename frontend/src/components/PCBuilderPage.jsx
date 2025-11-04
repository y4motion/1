import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, Plus, Check, Info, ShoppingCart, Wrench } from 'lucide-react';

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

  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPower, setTotalPower] = useState(0);
  const [recommendedPSU, setRecommendedPSU] = useState(0);

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

  // Mock component data
  const components = {
    cpu: [
      { id: 'cpu1', name: 'AMD Ryzen 7 9700X', price: 359, tdp: 65, specs: '8-Core, 16-Thread, 4.5GHz Boost' },
      { id: 'cpu2', name: 'AMD Ryzen 7 9800X3D', price: 479, tdp: 120, specs: '8-Core, 16-Thread, 5.2GHz Boost, 3D V-Cache' },
      { id: 'cpu3', name: 'Intel Core i7-14700K', price: 409, tdp: 125, specs: '20-Core, 28-Thread, 5.6GHz Boost' },
      { id: 'cpu4', name: 'AMD Ryzen 9 9900X', price: 499, tdp: 170, specs: '12-Core, 24-Thread, 5.4GHz Boost' }
    ],
    gpu: [
      { id: 'gpu1', name: 'NVIDIA RTX 5060', price: 299, tdp: 115, specs: '8GB GDDR6, 1080p Gaming' },
      { id: 'gpu2', name: 'NVIDIA RTX 5070 Ti', price: 599, tdp: 285, specs: '16GB GDDR6X, 1440p Gaming' },
      { id: 'gpu3', name: 'NVIDIA RTX 5080', price: 999, tdp: 320, specs: '16GB GDDR6X, 4K Gaming' },
      { id: 'gpu4', name: 'AMD RX 9070 XT', price: 649, tdp: 300, specs: '16GB GDDR6, 1440p Gaming' }
    ],
    motherboard: [
      { id: 'mb1', name: 'MSI B650 TOMAHAWK', price: 229, specs: 'ATX, PCIe 5.0, DDR5' },
      { id: 'mb2', name: 'ASUS ROG STRIX X670E', price: 399, specs: 'ATX, PCIe 5.0, DDR5, Wi-Fi 6E' },
      { id: 'mb3', name: 'GIGABYTE Z790 AORUS', price: 329, specs: 'ATX, PCIe 5.0, DDR5, Thunderbolt 4' }
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
      { id: 'case1', name: 'NZXT H7 Flow White', price: 129, specs: 'Mid Tower, Tempered Glass, 3x120mm Fans' },
      { id: 'case2', name: 'NZXT H7 Flow Black', price: 129, specs: 'Mid Tower, Tempered Glass, 3x120mm Fans' },
      { id: 'case3', name: 'Lian Li O11 Dynamic', price: 159, specs: 'Mid Tower, Dual Tempered Glass' }
    ],
    cooling: [
      { id: 'cool1', name: 'NZXT Kraken 240 RGB', price: 129, power: 10, specs: '240mm AIO, RGB' },
      { id: 'cool2', name: 'NZXT Kraken 360 RGB', price: 179, power: 15, specs: '360mm AIO, RGB, LCD Screen' },
      { id: 'cool3', name: 'Noctua NH-D15', price: 109, power: 0, specs: 'Dual Tower Air Cooler' }
    ]
  };

  const componentCategories = [
    { key: 'cpu', name: language === 'ru' ? 'ПРОЦЕССОР' : 'CPU', icon: '🔲', required: true },
    { key: 'gpu', name: language === 'ru' ? 'ВИДЕОКАРТА' : 'GPU', icon: '🎮', required: true },
    { key: 'motherboard', name: language === 'ru' ? 'МАТЕРИНСКАЯ ПЛАТА' : 'MOTHERBOARD', icon: '🔧', required: true },
    { key: 'ram', name: language === 'ru' ? 'ПАМЯТЬ' : 'RAM', icon: '📊', required: true },
    { key: 'storage', name: language === 'ru' ? 'НАКОПИТЕЛЬ' : 'STORAGE', icon: '💾', required: true },
    { key: 'psu', name: language === 'ru' ? 'БЛОК ПИТАНИЯ' : 'POWER SUPPLY', icon: '⚡', required: true },
    { key: 'case', name: language === 'ru' ? 'КОРПУС' : 'CASE', icon: '📦', required: false },
    { key: 'cooling', name: language === 'ru' ? 'ОХЛАЖДЕНИЕ' : 'COOLING', icon: '❄️', required: false }
  ];

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
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '2rem'
      }}>
        {/* Component Selection */}
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
                    <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
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

        {/* Summary Sidebar */}
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
