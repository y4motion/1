import React from 'react';
import { Check, Package } from 'lucide-react';
import './TabStyles.css';

// Default content for Sony WH-1000XM5
const defaultContent = {
  description: `Experience unparalleled audio excellence with the Sony WH-1000XM5 wireless headphones. Featuring industry-leading noise cancellation powered by the integrated Processor V1 and eight microphones, these headphones adapt to your environment for the perfect listening experience.

The new synthetic leather material and improved headband design provide exceptional comfort for extended wear, while the 30mm driver unit delivers Hi-Res Audio quality. With 30 hours of battery life and quick charging capability, you'll never be without your music.`,
  
  keyFeatures: [
    'Industry-leading noise cancellation with 8 microphones',
    'Premium Hi-Res Audio with 30mm drivers',
    '30-hour battery life (ANC on)',
    'Multipoint connection for 2 devices',
    'Speak-to-Chat auto-pause feature',
    'Touch controls on ear cup',
    'Crystal-clear calls with beamforming mics',
    'Lightweight design at only 250g'
  ],
  
  whatsInBox: [
    'Sony WH-1000XM5 Headphones',
    'Premium Carrying Case',
    '1.2m Audio Cable with Mic',
    'USB-C Charging Cable',
    'Airplane Adapter',
    'Quick Start Guide'
  ],
  
  highlights: [
    { icon: '🎧', title: 'Premium Quality', desc: 'Hi-Res Audio certified' },
    { icon: '🔇', title: 'Best-in-Class ANC', desc: '8 microphones' },
    { icon: '⚡', title: 'Quick Charge', desc: '3 min = 3 hours' },
    { icon: '🔋', title: '30h Battery', desc: 'All-day listening' },
    { icon: '🎤', title: 'Crystal Calls', desc: 'Beamforming mics' },
    { icon: '📱', title: 'Multipoint', desc: '2 device connection' },
    { icon: '🪶', title: 'Lightweight', desc: 'Only 250 grams' }
  ]
};

const OverviewTab = ({ product }) => {
  // Use product data if available, otherwise use defaults
  const description = product.description || defaultContent.description;
  const keyFeatures = product.key_features?.length > 0 ? product.key_features : defaultContent.keyFeatures;
  const whatsInBox = product.whats_in_box?.length > 0 ? product.whats_in_box : defaultContent.whatsInBox;
  const highlights = product.highlights?.length > 0 ? product.highlights : defaultContent.highlights;

  return (
    <div className="tab-overview">
      {/* Section 1: Description */}
      <section className="tab-section">
        <h3 className="tab-section-title">Description</h3>
        <div className="tab-description">
          {description.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Section 2: Key Features */}
      <section className="tab-section">
        <h3 className="tab-section-title">Key Features</h3>
        <div className="tab-features-grid">
          {keyFeatures.map((feature, index) => (
            <div key={index} className="tab-feature-item glass-card">
              <Check size={18} className="feature-check" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: What's in the Box */}
      <section className="tab-section">
        <h3 className="tab-section-title">
          <Package size={20} style={{ marginRight: '0.5rem' }} />
          What&apos;s in the Box
        </h3>
        <div className="tab-box-grid">
          {whatsInBox.map((item, index) => (
            <div key={index} className="tab-box-item">
              📦 {item}
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Product Highlights (7 Cards) */}
      <section className="tab-section">
        <h3 className="tab-section-title">Product Highlights</h3>
        <div className="tab-highlights-grid">
          {highlights.map((highlight, index) => (
            <div key={index} className="tab-highlight-card glass-card">
              <span className="highlight-icon">{highlight.icon}</span>
              <div className="highlight-text">
                <strong>{highlight.title}</strong>
                <span>{highlight.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
