import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import * as Icons from 'lucide-react';
import { ChevronRight, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const CatalogMega = ({ theme: themeOverride, catalogData: preloadedCatalog, onClose, onCategorySelect }) => {
  const { language } = useLanguage();
  const { theme: contextTheme } = useTheme();
  const theme = themeOverride || contextTheme;
  const navigate = useNavigate();
  
  const [catalog, setCatalog] = useState(preloadedCatalog || {});
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [loading, setLoading] = useState(!preloadedCatalog);

  console.log('CatalogMega rendered', { loading, catalogKeys: Object.keys(catalog), hasPreloaded: !!preloadedCatalog });

  useEffect(() => {
    // Only fetch if no preloaded data
    if (!preloadedCatalog) {
      fetchCatalog();
    } else {
      // Auto-select first category from preloaded data
      const firstCategory = Object.keys(preloadedCatalog)[0];
      if (firstCategory) {
        setSelectedMainCategory(firstCategory);
      }
    }
  }, [preloadedCatalog]);

  const fetchCatalog = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/catalog`);
      const data = await response.json();
      setCatalog(data.catalog || {});
      
      // Auto-select first category
      const firstCategory = Object.keys(data.catalog || {})[0];
      if (firstCategory) {
        setSelectedMainCategory(firstCategory);
      }
    } catch (error) {
      console.error('Error fetching catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedMainCategory(categoryId);
    setHoveredSubcategory(null);
  };

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId, subcategoryId);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleItemClick = (categoryId, subcategoryId, item) => {
    // Navigate to marketplace with filters
    if (onCategorySelect) {
      onCategorySelect(categoryId, subcategoryId, item);
    }
    if (onClose) {
      onClose();
    }
  };

  // Get icon component
  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent || Icons.Package;
  };

  const selectedCategory = selectedMainCategory ? catalog[selectedMainCategory] : null;

  // No loading state needed - data is preloaded
  return (
    <>
      {/* Catalog Panel */}
      <div
        className={theme === 'minimal-mod' ? '' : 'glass'}
        data-catalog="true"
        style={{
        position: 'absolute',
        top: 'calc(100% + 0.5rem)',
        left: '0',
        width: '90vw',
        maxWidth: '1200px',
        maxHeight: '80vh',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        background: theme === 'minimal-mod' 
          ? 'rgba(0, 0, 0, 0.95)' 
          : (theme === 'dark' ? 'rgba(10, 10, 10, 0.98)' : 'rgba(255, 255, 255, 0.98)'),
        backdropFilter: theme === 'minimal-mod' ? 'none' : 'blur(20px)',
        border: theme === 'minimal-mod' 
          ? '1px solid rgba(241, 241, 241, 0.12)'
          : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'),
        borderRadius: theme === 'minimal-mod' ? '0' : '12px',
        overflow: 'hidden',
        boxShadow: theme === 'minimal-mod' ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.4)',
        fontFamily: theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
        zIndex: 99,
        animation: 'smoothSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Left Sidebar - Main Categories */}
      <div style={{
        overflowY: 'auto',
        borderRight: theme === 'minimal-mod'
          ? '1px solid rgba(241, 241, 241, 0.12)'
          : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
        padding: '0.5rem'
      }}>
        {Object.entries(catalog).map(([categoryId, category]) => {
          const IconComponent = getIcon(category.icon);
          const isSelected = selectedMainCategory === categoryId;
          
          return (
            <button
              key={categoryId}
              onClick={() => handleCategoryClick(categoryId)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                marginBottom: '0.25rem',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                border: 'none',
                background: theme === 'minimal-mod'
                  ? 'transparent'
                  : (isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent'),
                color: theme === 'minimal-mod'
                  ? (isSelected ? '#f1f1f1' : 'rgba(241, 241, 241, 0.9)')
                  : (isSelected ? '#8b5cf6' : 'inherit'),
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontSize: '0.9375rem',
                fontWeight: isSelected ? '600' : '500'
              }}
              onMouseEnter={(e) => {
                if (!isSelected && theme !== 'minimal-mod') {
                  e.currentTarget.style.background = theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <IconComponent size={20} strokeWidth={2} />
              <span style={{ flex: 1 }}>
                {language === 'ru' ? category.name_ru : category.name_en}
              </span>
              <ChevronRight size={16} opacity={0.5} />
            </button>
          );
        })}
      </div>

      {/* Right Area - Subcategories & Items */}
      <div style={{
        overflowY: 'auto',
        padding: '1.5rem'
      }}>
        {selectedMainCategory && catalog[selectedMainCategory] && (
          <div>
            {Object.entries(catalog[selectedMainCategory].subcategories || {}).map(([subcategoryId, subcategory]) => (
              <div
                key={subcategoryId}
                style={{
                  marginBottom: '2rem'
                }}
              >
                {/* Subcategory Header */}
                <button
                  onClick={() => handleSubcategoryClick(selectedMainCategory, subcategoryId)}
                  onMouseEnter={() => setHoveredSubcategory(subcategoryId)}
                  onMouseLeave={() => setHoveredSubcategory(null)}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    marginBottom: '0.75rem',
                    letterSpacing: '0.5px',
                    color: hoveredSubcategory === subcategoryId ? '#8b5cf6' : 'inherit',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {language === 'ru' ? subcategory.name_ru : subcategory.name_en}
                  <ChevronRight 
                    size={14} 
                    style={{
                      opacity: hoveredSubcategory === subcategoryId ? 1 : 0.5,
                      transform: hoveredSubcategory === subcategoryId ? 'translateX(4px)' : 'translateX(0)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </button>

                {/* Items Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.5rem'
                }}>
                  {subcategory.items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(selectedMainCategory, subcategoryId, item)}
                      style={{
                        padding: '0.625rem 0.875rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: 'inherit',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.color = '#8b5cf6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'inherit';
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          color: 'inherit'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
          e.currentTarget.style.color = '#8b5cf6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.color = 'inherit';
        }}
      >
        <X size={18} />
      </button>
    </div>
    </>
  );
};

export default CatalogMega;
