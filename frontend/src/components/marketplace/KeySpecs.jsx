import React from 'react';
import './KeySpecs.css';

// Category-specific key specs templates
const categoryKeySpecs = {
  headphones: [
    { label: 'Driver Type', key: 'driver_type', default: 'Dynamic, Closed 30mm' },
    { label: 'Battery Life', key: 'battery_life', default: '30 hours (ANC On)' },
    { label: 'Weight', key: 'weight', default: '250g' },
    { label: 'Connectivity', key: 'connectivity', default: 'Bluetooth 5.2, LDAC' }
  ],
  mouse: [
    { label: 'Sensor', key: 'sensor', default: 'Optical' },
    { label: 'DPI Range', key: 'dpi', default: '100 - 25,600' },
    { label: 'Weight', key: 'weight', default: '63g' },
    { label: 'Polling Rate', key: 'polling_rate', default: '8000Hz' }
  ],
  keyboard: [
    { label: 'Switch Type', key: 'switch_type', default: 'Mechanical' },
    { label: 'Layout', key: 'layout', default: 'Full-size / TKL / 60%' },
    { label: 'Battery Life', key: 'battery_life', default: '200 hours' },
    { label: 'Connectivity', key: 'connectivity', default: 'USB-C / 2.4GHz / BT' }
  ],
  monitor: [
    { label: 'Panel Type', key: 'panel_type', default: 'IPS / OLED / VA' },
    { label: 'Resolution', key: 'resolution', default: '3840 x 2160 (4K)' },
    { label: 'Refresh Rate', key: 'refresh_rate', default: '144Hz' },
    { label: 'Response Time', key: 'response_time', default: '1ms GTG' }
  ],
  gpu: [
    { label: 'GPU Chip', key: 'chip', default: 'NVIDIA / AMD' },
    { label: 'VRAM', key: 'vram', default: '12GB GDDR6X' },
    { label: 'TDP', key: 'tdp', default: '320W' },
    { label: 'Boost Clock', key: 'boost_clock', default: '2.5 GHz' }
  ],
  default: [
    { label: 'Brand', key: 'brand', default: 'Premium' },
    { label: 'Model', key: 'model', default: 'Latest' },
    { label: 'Weight', key: 'weight', default: 'N/A' },
    { label: 'Warranty', key: 'warranty', default: '1 Year' }
  ]
};

const KeySpecs = ({ product, category }) => {
  // Determine category from product or prop
  const productCategory = category || product?.category?.toLowerCase() || 'default';
  
  // Get the right template
  const getTemplate = () => {
    if (productCategory.includes('headphone') || productCategory.includes('audio')) return categoryKeySpecs.headphones;
    if (productCategory.includes('mouse') || productCategory.includes('mice')) return categoryKeySpecs.mouse;
    if (productCategory.includes('keyboard')) return categoryKeySpecs.keyboard;
    if (productCategory.includes('monitor') || productCategory.includes('display')) return categoryKeySpecs.monitor;
    if (productCategory.includes('gpu') || productCategory.includes('graphics')) return categoryKeySpecs.gpu;
    return categoryKeySpecs.default;
  };

  const template = getTemplate();
  
  // Get spec value from product specifications or use default
  const getSpecValue = (spec) => {
    // Check in product specifications
    if (product?.specifications) {
      // Handle array format
      if (Array.isArray(product.specifications)) {
        const found = product.specifications.find(
          s => s.name?.toLowerCase().includes(spec.key) || s.key?.toLowerCase().includes(spec.key)
        );
        if (found) return found.value;
      }
      // Handle object format
      if (typeof product.specifications === 'object') {
        for (const category of Object.values(product.specifications)) {
          if (typeof category === 'object') {
            for (const [key, value] of Object.entries(category)) {
              if (key.toLowerCase().includes(spec.key)) return value;
            }
          }
        }
      }
    }
    
    // Check direct product properties
    if (product?.[spec.key]) return product[spec.key];
    
    return spec.default;
  };

  return (
    <div className="key-specs">
      {template.slice(0, 4).map((spec, index) => (
        <div key={index} className="spec-line">
          <span className="spec-label">{spec.label}</span>
          <span className="spec-separator">//</span>
          <span className="spec-value">{getSpecValue(spec)}</span>
        </div>
      ))}
    </div>
  );
};

export default KeySpecs;
