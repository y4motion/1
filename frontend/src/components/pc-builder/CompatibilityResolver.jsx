/**
 * CompatibilityResolver - Smart Conflict Resolution Widget
 * 
 * Показывает ошибки совместимости и предлагает решения.
 * "Заботливый помощник" - не просто ругает, а помогает.
 */

import React, { useState, useCallback } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  X, 
  ChevronRight, 
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import './CompatibilityResolver.css';

// Use relative URLs to avoid mixed content
const API_URL = '';

const CompatibilityResolver = ({ 
  errors = [], 
  warnings = [],
  onSwapProduct,
  onDismiss,
  compact = false 
}) => {
  const [loadingAlternatives, setLoadingAlternatives] = useState({});
  const [alternatives, setAlternatives] = useState({});
  const [expandedError, setExpandedError] = useState(null);

  // Fetch compatible alternatives for a specific error
  const fetchAlternatives = useCallback(async (error, index) => {
    const key = `${error.issue_type}_${index}`;
    
    if (alternatives[key]) {
      setExpandedError(expandedError === key ? null : key);
      return;
    }

    setLoadingAlternatives(prev => ({ ...prev, [key]: true }));

    try {
      // Determine what to search for based on error type
      let searchParams = {};
      
      if (error.issue_type === 'socket_mismatch') {
        // Extract socket from error message (e.g., "AM5" or "LGA1700")
        const socketMatch = error.message.match(/\(([A-Z0-9]+)\)/g);
        if (socketMatch && socketMatch.length >= 2) {
          // First socket is CPU, second is motherboard
          // We want to find motherboard with CPU's socket
          const cpuSocket = socketMatch[0].replace(/[()]/g, '');
          searchParams = { category: 'motherboard', socket: cpuSocket };
        }
      } else if (error.issue_type === 'ram_type_mismatch') {
        const ramMatch = error.message.match(/(DDR[45])/gi);
        if (ramMatch) {
          searchParams = { category: 'ram', ram_type: ramMatch[ramMatch.length - 1] };
        }
      } else if (error.issue_type === 'gpu_too_long') {
        // Find cases with more space
        searchParams = { category: 'case', min_gpu_length: 350 };
      } else if (error.issue_type === 'psu_insufficient' || error.issue_type === 'psu_insufficient_for_gpu') {
        // Find more powerful PSUs
        searchParams = { category: 'psu', min_wattage: 750 };
      }

      // Fetch alternatives from API
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_URL}/api/products/?${queryString}&limit=4`);
      
      if (response.ok) {
        const products = await response.json();
        setAlternatives(prev => ({ ...prev, [key]: products.slice(0, 3) }));
        setExpandedError(key);
      }
    } catch (err) {
      console.error('Failed to fetch alternatives:', err);
    } finally {
      setLoadingAlternatives(prev => ({ ...prev, [key]: false }));
    }
  }, [alternatives, expandedError]);

  // Handle swap product
  const handleSwap = useCallback((newProduct, error) => {
    if (onSwapProduct) {
      onSwapProduct(newProduct, error);
    }
    // Close the alternatives panel
    setExpandedError(null);
  }, [onSwapProduct]);

  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  const issueTypeLabels = {
    socket_mismatch: 'Несовместимый сокет',
    ram_type_mismatch: 'Несовместимая память',
    gpu_too_long: 'Видеокарта не влезет',
    gpu_tight_fit: 'Впритык по размеру',
    psu_insufficient: 'Недостаточно мощности',
    psu_insufficient_for_gpu: 'Слабый БП для GPU',
    psu_low_headroom: 'Мало запаса мощности',
    cooler_too_tall: 'Кулер не влезет',
    form_factor_mismatch: 'Неподходящий форм-фактор',
    too_many_ram_modules: 'Слишком много RAM',
    missing_psu: 'Нет блока питания'
  };

  return (
    <div className={`compatibility-resolver ${compact ? 'compact' : ''}`} data-testid="compatibility-resolver">
      {/* Header */}
      <div className="resolver-header">
        <div className="resolver-title">
          <AlertTriangle className="title-icon error" size={20} />
          <span>Обнаружены проблемы совместимости</span>
        </div>
        {onDismiss && (
          <button className="dismiss-btn" onClick={onDismiss}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Errors List */}
      <div className="resolver-issues">
        {errors.map((error, index) => {
          const key = `${error.issue_type}_${index}`;
          const isExpanded = expandedError === key;
          const isLoading = loadingAlternatives[key];
          const alts = alternatives[key] || [];

          return (
            <div 
              key={key} 
              className={`issue-card error ${isExpanded ? 'expanded' : ''}`}
              data-testid={`issue-card-${error.issue_type}`}
            >
              {/* Issue Header */}
              <div className="issue-header">
                <div className="issue-badge error">
                  <AlertTriangle size={14} />
                  <span>{issueTypeLabels[error.issue_type] || error.issue_type}</span>
                </div>
              </div>

              {/* Issue Content */}
              <div className="issue-content">
                <div className="issue-components">
                  <span className="component-name">{error.component1}</span>
                  <X size={14} className="conflict-icon" />
                  <span className="component-name">{error.component2}</span>
                </div>
                <p className="issue-message">{error.message}</p>
                
                {error.suggestion && (
                  <p className="issue-suggestion">
                    <Sparkles size={14} />
                    {error.suggestion}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button 
                className={`find-alternatives-btn ${isLoading ? 'loading' : ''}`}
                onClick={() => fetchAlternatives(error, index)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Ищу замену...</span>
                  </>
                ) : isExpanded ? (
                  <>
                    <ChevronRight size={16} className="rotate-down" />
                    <span>Скрыть варианты</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Найти совместимую замену</span>
                  </>
                )}
              </button>

              {/* Alternatives Panel */}
              {isExpanded && alts.length > 0 && (
                <div className="alternatives-panel">
                  <div className="alternatives-header">
                    <Zap size={14} />
                    <span>Совместимые альтернативы</span>
                  </div>
                  <div className="alternatives-carousel">
                    {alts.map((product, pIndex) => (
                      <div key={product._id || pIndex} className="alternative-card">
                        <div className="alt-image">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.title} />
                          ) : (
                            <div className="alt-placeholder">📦</div>
                          )}
                        </div>
                        <div className="alt-info">
                          <h4 className="alt-title">{product.title}</h4>
                          <div className="alt-specs">
                            {product.specs?.socket && <span>Socket: {product.specs.socket}</span>}
                            {product.specs?.type && <span>{product.specs.type}</span>}
                            {product.specs?.wattage && <span>{product.specs.wattage}W</span>}
                          </div>
                          <div className="alt-price">${product.price}</div>
                        </div>
                        <button 
                          className="swap-btn"
                          onClick={() => handleSwap(product, error)}
                          data-testid={`swap-btn-${pIndex}`}
                        >
                          <ArrowRight size={14} />
                          <span>Заменить</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  {alts.length === 0 && !isLoading && (
                    <div className="no-alternatives">
                      <span>Не найдено подходящих альтернатив</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Warnings (less prominent) */}
        {warnings.map((warning, index) => (
          <div key={`warning_${index}`} className="issue-card warning">
            <div className="issue-header">
              <div className="issue-badge warning">
                <AlertTriangle size={14} />
                <span>{issueTypeLabels[warning.issue_type] || 'Предупреждение'}</span>
              </div>
            </div>
            <div className="issue-content">
              <p className="issue-message">{warning.message}</p>
              {warning.suggestion && (
                <p className="issue-suggestion">
                  <Sparkles size={14} />
                  {warning.suggestion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="resolver-summary">
        <span className="summary-text">
          {errors.length > 0 
            ? `⚠️ Исправьте ${errors.length} проблем(ы) перед оформлением заказа`
            : `💡 ${warnings.length} предупреждений — можно продолжить`
          }
        </span>
      </div>
    </div>
  );
};

// Compact version for inline use (e.g., in cart)
export const CompatibilityBadge = ({ errors = [], warnings = [], onClick }) => {
  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className="compatibility-badge success" onClick={onClick}>
        <Check size={14} />
        <span>Совместимо</span>
      </div>
    );
  }

  return (
    <div 
      className={`compatibility-badge ${errors.length > 0 ? 'error' : 'warning'}`}
      onClick={onClick}
    >
      <AlertTriangle size={14} />
      <span>
        {errors.length > 0 
          ? `${errors.length} конфликт(ов)` 
          : `${warnings.length} предупр.`
        }
      </span>
      <ChevronRight size={14} />
    </div>
  );
};

export default CompatibilityResolver;
