import React from 'react';
import './TabStyles.css';

const SpecsTab = ({ product }) => {
  const specifications = product.specifications || [];
  
  // Group specs by category if available
  const groupSpecs = (specs) => {
    if (!specs || specs.length === 0) return {};
    
    const groups = {};
    specs.forEach(spec => {
      const category = spec.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(spec);
    });
    return groups;
  };

  const groupedSpecs = groupSpecs(specifications);
  const hasSpecs = specifications.length > 0;

  if (!hasSpecs) {
    return (
      <div className="tab-specs">
        <div className="tab-no-content">
          <span className="no-content-icon">📝</span>
          <p>No specifications available for this product.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-specs">
      {Object.entries(groupedSpecs).map(([category, specs]) => (
        <div key={category} className="spec-category">
          <h3 className="spec-category-title">{category.toUpperCase()}</h3>
          <div className="spec-table">
            {specs.map((spec, idx) => (
              <div key={idx} className="spec-row">
                <span className="spec-label">{spec.name}</span>
                <span className="spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Comparison tip */}
      <div className="spec-tip">
        <span>💡</span>
        <span>Pro Tip: Compare specifications with similar products to find the best match for your needs.</span>
      </div>
    </div>
  );
};

export default SpecsTab;
