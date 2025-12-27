import React from 'react';
import { Check, Package } from 'lucide-react';
import './TabStyles.css';

const OverviewTab = ({ product }) => {
  return (
    <div className="tab-overview">
      <div className="tab-section">
        <h3 className="tab-section-title">Description</h3>
        <p className="tab-description">{product.description || 'No description available.'}</p>
      </div>

      {product.key_features && product.key_features.length > 0 && (
        <div className="tab-section">
          <h3 className="tab-section-title">Key Features</h3>
          <ul className="tab-features-list">
            {product.key_features.map((feature, index) => (
              <li key={index} className="tab-feature-item">
                <Check size={18} className="feature-check" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.whats_in_box && product.whats_in_box.length > 0 && (
        <div className="tab-section">
          <h3 className="tab-section-title">
            <Package size={20} style={{ marginRight: '0.5rem' }} />
            What's in the Box
          </h3>
          <ul className="tab-box-list">
            {product.whats_in_box.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Highlights */}
      <div className="tab-section">
        <h3 className="tab-section-title">Product Highlights</h3>
        <div className="tab-highlights-grid">
          <div className="tab-highlight-card">
            <span className="highlight-icon">🌟</span>
            <div>
              <strong>Premium Quality</strong>
              <span>Built with high-quality materials</span>
            </div>
          </div>
          <div className="tab-highlight-card">
            <span className="highlight-icon">⚡</span>
            <div>
              <strong>Fast Performance</strong>
              <span>Optimized for speed and efficiency</span>
            </div>
          </div>
          <div className="tab-highlight-card">
            <span className="highlight-icon">🛡️</span>
            <div>
              <strong>Warranty Included</strong>
              <span>Full manufacturer warranty</span>
            </div>
          </div>
          <div className="tab-highlight-card">
            <span className="highlight-icon">📦</span>
            <div>
              <strong>Free Shipping</strong>
              <span>On orders over $100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
