import React from 'react';
import './TabStyles.css';

// Full specifications data for Sony WH-1000XM5
const defaultSpecs = {
  "General Specifications": {
    "Brand": "Sony",
    "Model": "WH-1000XM5",
    "Product Type": "Over-Ear Headphones",
    "Weight": "250g",
    "Dimensions": "7.3 x 8.7 x 3.0 inches",
    "Color Options": "Black, Silver, Midnight Blue"
  },
  "Audio Specifications": {
    "Driver Size": "30mm",
    "Frequency Response": "4Hz - 40kHz",
    "Impedance": "48Ω",
    "Sensitivity": "104.5dB/mW",
    "Audio Codecs": "LDAC, AAC, SBC",
    "Hi-Res Audio": "Yes (wired mode)"
  },
  "Connectivity": {
    "Bluetooth Version": "5.2",
    "Bluetooth Range": "30 feet (10m)",
    "NFC": "Yes",
    "Multipoint Connection": "Yes (2 devices)",
    "Wired Connection": "3.5mm audio jack",
    "USB Audio": "USB-C (digital audio)"
  },
  "Battery & Power": {
    "Battery Life (ANC On)": "30 hours",
    "Battery Life (ANC Off)": "40 hours",
    "Charging Time": "3.5 hours",
    "Quick Charge": "3 min = 3 hours playback",
    "Charging Port": "USB-C",
    "Battery Type": "Lithium-ion"
  },
  "Features": {
    "Touch Controls": "Full touch panel",
    "Voice Assistant": "Google, Alexa, Siri",
    "Wearing Detection": "Auto play/pause",
    "Speak-to-Chat": "Yes",
    "Adaptive Sound Control": "Yes",
    "360 Reality Audio": "Yes"
  },
  "Noise Cancellation": {
    "Type": "Industry-leading ANC",
    "Processor": "QN1 + V1 chips",
    "Mics for ANC": "8 microphones",
    "Ambient Sound Mode": "20 levels",
    "Wind Noise Reduction": "Yes"
  },
  "Microphone": {
    "Type": "Beamforming array",
    "Number of Mics": "4 for calls",
    "Noise Reduction": "AI-based",
    "Call Quality": "Crystal clear"
  },
  "In the Box": {
    "Headphones": "1x WH-1000XM5",
    "Carrying Case": "Premium hard case",
    "Audio Cable": "1.2m with mic",
    "USB Cable": "USB-C to USB-A",
    "Airplane Adapter": "Included",
    "Documentation": "Quick start guide"
  }
};

const SpecsTab = ({ product }) => {
  // Use product specifications if available, otherwise use defaults
  const specifications = product.specifications?.length > 0 
    ? groupSpecsFromArray(product.specifications) 
    : defaultSpecs;

  // Helper to group flat specs array into categories
  function groupSpecsFromArray(specs) {
    const groups = {};
    specs.forEach(spec => {
      const category = spec.category || 'General';
      if (!groups[category]) {
        groups[category] = {};
      }
      groups[category][spec.name] = spec.value;
    });
    return Object.keys(groups).length > 0 ? groups : defaultSpecs;
  }

  const hasSpecs = Object.keys(specifications).length > 0;

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
      {Object.entries(specifications).map(([category, items]) => (
        <div key={category} className="spec-category glass-card">
          <h3 className="spec-category-title">{category}</h3>
          <table className="spec-table">
            <tbody>
              {Object.entries(items).map(([key, val], idx) => (
                <tr key={key} className={idx % 2 === 0 ? 'striped' : ''}>
                  <td className="spec-label">{key}</td>
                  <td className="spec-value">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
