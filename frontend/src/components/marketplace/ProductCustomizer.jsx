import React, { useState, useEffect, useMemo } from 'react';
import './ProductCustomizer.css';

// Weight modifiers for different options
const defaultWeightModifiers = {
  shell: {
    light: 0,
    solidSides: 1,
    solid: 2
  },
  coating: {
    standard: 0,
    ultragrip: 2
  },
  carbonFiber: {
    none: 0,
    single: 0.25,
    double: 0.5
  },
  scrollWheel: {
    magnesium: 0,
    aluminum: 0.5,
    ceramic: -0.5
  }
};

const ProductCustomizer = ({ 
  product, 
  baseWeight = 27, 
  weightModifiers = defaultWeightModifiers,
  onConfigChange,
  options = ['shell', 'coating', 'carbonFiber']
}) => {
  const [config, setConfig] = useState({
    shell: 'light',
    coating: 'standard',
    carbonFiber: 'none',
    scrollWheel: 'magnesium'
  });

  // Calculate total weight
  const totalWeight = useMemo(() => {
    let weight = baseWeight;
    
    if (options.includes('shell') && weightModifiers.shell) {
      weight += weightModifiers.shell[config.shell] || 0;
    }
    if (options.includes('coating') && weightModifiers.coating) {
      weight += weightModifiers.coating[config.coating] || 0;
    }
    if (options.includes('carbonFiber') && weightModifiers.carbonFiber) {
      weight += weightModifiers.carbonFiber[config.carbonFiber] || 0;
    }
    if (options.includes('scrollWheel') && weightModifiers.scrollWheel) {
      weight += weightModifiers.scrollWheel[config.scrollWheel] || 0;
    }
    
    return weight;
  }, [config, baseWeight, weightModifiers, options]);

  // Notify parent of config changes
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({ ...config, totalWeight });
    }
  }, [config, totalWeight, onConfigChange]);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderOptionButtons = (optionKey, optionConfig, label) => {
    if (!options.includes(optionKey)) return null;
    
    const modifiers = weightModifiers[optionKey] || {};
    
    return (
      <div className="customizer-option">
        <label className="option-label">
          {label}: <strong>{config[optionKey]}</strong>
        </label>
        <div className="option-buttons">
          {Object.entries(modifiers).map(([key, weight]) => {
            const weightStr = weight > 0 ? `+${weight}g` : weight < 0 ? `${weight}g` : '';
            return (
              <button
                key={key}
                className={`option-btn ${config[optionKey] === key ? 'active' : ''}`}
                onClick={() => updateConfig(optionKey, key)}
              >
                {formatOptionName(key)}
                {weightStr && <span className="weight-mod">[{weightStr}]</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const formatOptionName = (name) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="product-customizer">
      {/* Weight Display Header */}
      <div className="customizer-weight-header">
        <span className="weight-label">CONFIGURED WEIGHT</span>
        <span className="weight-value">{totalWeight.toFixed(totalWeight % 1 === 0 ? 0 : 2)}g</span>
      </div>

      {/* Weight Breakdown */}
      <div className="weight-breakdown">
        <div className="breakdown-item">
          <span>Base Weight</span>
          <span>{baseWeight}g</span>
        </div>
        {options.includes('shell') && config.shell !== 'light' && (
          <div className="breakdown-item modifier">
            <span>Shell ({config.shell})</span>
            <span>+{weightModifiers.shell[config.shell]}g</span>
          </div>
        )}
        {options.includes('coating') && config.coating !== 'standard' && (
          <div className="breakdown-item modifier">
            <span>Coating ({config.coating})</span>
            <span>+{weightModifiers.coating[config.coating]}g</span>
          </div>
        )}
        {options.includes('carbonFiber') && config.carbonFiber !== 'none' && (
          <div className="breakdown-item modifier">
            <span>Carbon Fiber ({config.carbonFiber})</span>
            <span>+{weightModifiers.carbonFiber[config.carbonFiber]}g</span>
          </div>
        )}
      </div>

      {/* Options */}
      {renderOptionButtons('shell', weightModifiers.shell, 'Shell Type')}
      {renderOptionButtons('coating', weightModifiers.coating, 'Coating')}
      {renderOptionButtons('carbonFiber', weightModifiers.carbonFiber, 'Carbon Fiber')}
      {renderOptionButtons('scrollWheel', weightModifiers.scrollWheel, 'Scroll Wheel')}
    </div>
  );
};

export default ProductCustomizer;
