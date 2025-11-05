import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import * as Icons from 'lucide-react';
import { ChevronRight, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const CatalogMega = ({ onClose, onCategorySelect }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [catalog, setCatalog] = useState({});
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('CatalogMega rendered', { loading, catalogKeys: Object.keys(catalog) });

  useEffect(() => {
    fetchCatalog();
  }, []);

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

  if (loading) {
    return (
      <div style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        padding: '2rem',
        textAlign: 'center',
        background: theme === 'dark' ? 'rgba(10, 10, 10, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 1000
      }}>
        <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
          {language === 'ru' ? 'Загрузка каталога...' : 'Loading catalog...'}
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: '1200px',
        maxHeight: '80vh',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        background: theme === 'dark' ? 'rgba(10, 10, 10, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 9999
      }}
    >
      {/* Left Sidebar - Main Categories */}
      <div style={{
        overflowY: 'auto',
        borderRight: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
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
                borderRadius: '8px',
                border: 'none',
                background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                color: isSelected ? '#8b5cf6' : 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontSize: '0.9375rem',
                fontWeight: isSelected ? '600' : '500'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
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
        {selectedCategory && (
          <div>
            {Object.entries(selectedCategory.subcategories).map(([subcategoryId, subcategory]) => (
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
  );
};

export default CatalogMega;
