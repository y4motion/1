/**
 * OSWidget.jsx
 * System status widget for Minimal OS
 * Download button appears on hover
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { KineticWidget, StatusDot, DotText } from './KineticWidget';
import { systemToast } from '../system';

export const OSWidget = ({ 
  version = '2.0.4',
  downloads = 12847,
  status = 'online',
  onDownload,
  className = ''
}) => {
  const handleDownload = () => {
    systemToast.success('DOWNLOAD STARTED');
    onDownload?.();
  };
  
  return (
    <KineticWidget className={`os-widget-container ${className}`} glow>
      <div className="os-widget">
        <div className="os-header">
          <div className="os-info">
            <h3>MINIMAL OS</h3>
            <DotText size="sm" color="muted">VERSION {version}</DotText>
          </div>
          <StatusDot status={status} label={status.toUpperCase()} />
        </div>
        
        <div className="os-stats">
          <div className="os-stat">
            <span className="stat-label">DOWNLOADS</span>
            <span className="stat-value">{downloads.toLocaleString()}</span>
          </div>
          <div className="os-stat">
            <span className="stat-label">SIZE</span>
            <span className="stat-value">2.4 GB</span>
          </div>
        </div>
        
        <div className="os-download">
          <motion.button
            className="download-btn"
            onClick={handleDownload}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={16} />
            DOWNLOAD NOW
          </motion.button>
        </div>
      </div>
    </KineticWidget>
  );
};

export default OSWidget;
