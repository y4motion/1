import React, { useState } from 'react';
import { X, Search, ChevronDown, ChevronUp, Bookmark, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FilterPanel = ({ 
  personas, 
  selectedPersona, 
  onPersonaChange,
  specificFilters,
  activeFilters,
  onFilterChange,
  onResetFilters,
  onSaveFilterSet,
  onClose
}) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    personas: true,
    common: true,
    specific: true
  });
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = () => {
    onFilterChange('price', { min: minPrice, max: maxPrice });
  };

  return (
    <div
      data-filter-panel="true"
      className={theme === 'minimal-mod' ? '' : 'glass-strong'}
      style={{
        position: 'fixed',
        top: '100px',
        left: 0,
        bottom: 0,
        width: '400px',
        borderTopRightRadius: theme === 'minimal-mod' ? '0' : '16px',
        background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
        backdropFilter: theme === 'minimal-mod' ? 'none' : undefined,
        border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
        borderLeft: 'none',
        zIndex: 40,
        padding: '2rem',
        overflowY: 'auto',
        animation: 'slideInFromLeft 0.3s ease-out',
        fontFamily: theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
        color: theme === 'dark' ? '#fff' : theme === 'light' ? '#1a1a1a' : '#f1f1f1'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: theme === 'minimal-mod'
          ? '1px solid rgba(241, 241, 241, 0.12)'
          : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)')
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '500',
          letterSpacing: '0.5px'
        }}>
          ФИЛЬТРЫ
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: '6px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: theme === 'dark' ? '#fff' : '#1a1a1a'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.border = theme === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1px solid rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.border = '1px solid transparent';
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Search Inside Filters */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search 
          size={16} 
          style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            opacity: 0.5
          }} 
        />
        <input
          type="text"
          placeholder="Поиск фильтров..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 1rem 0.5rem 2.75rem',
            borderRadius: '6px',
            border: '1px solid transparent',
            background: 'transparent',
            color: theme === 'dark' ? '#fff' : '#1a1a1a',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = theme === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.background = theme === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.05)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid transparent';
            e.currentTarget.style.background = 'transparent';
          }}
        />
      </div>

      {/* BLOCK 1: PERSONAS (Super-Filter) */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => toggleSection('personas')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            padding: '0.75rem 0',
            cursor: 'pointer',
            color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#fff' : '#1a1a1a'),
            marginBottom: '1rem'
          }}
        >
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            letterSpacing: '0.5px',
            color: theme === 'minimal-mod' ? '#f1f1f1' : 'inherit'
          }}>
            СУПЕР-ФИЛЬТР: ПЕРСОНЫ
          </h3>
          {expandedSections.personas ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.personas && (
          <div 
            className="persona-scroll-vertical"
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxHeight: '280px',
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}
          >
            {/* No persona option - Minimalist Power button style */}
            <button
              onClick={() => onPersonaChange(null)}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '6px',
                border: selectedPersona === null 
                  ? theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(0, 0, 0, 0.2)'
                  : '1px solid transparent',
                background: selectedPersona === null
                  ? theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)'
                  : 'transparent',
                color: theme === 'dark' ? '#fff' : '#000',
                fontSize: '0.8125rem',
                fontWeight: '500',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if (selectedPersona !== null) {
                  e.currentTarget.style.border = '1px solid transparent';
                  e.currentTarget.style.background = 'transparent';
                }
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ВСЕ ТОВАРЫ
            </button>

            {/* Personas - Minimalist, thin borders like Power button */}
            {Object.values(personas).map((persona) => (
              <button
                key={persona.id}
                onClick={() => onPersonaChange(persona.id)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '6px',
                  border: selectedPersona === persona.id 
                    ? theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.2)'
                    : '1px solid transparent',
                  background: selectedPersona === persona.id
                    ? theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)'
                    : 'transparent',
                  color: theme === 'dark' ? '#fff' : '#000',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.background = theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  if (selectedPersona !== persona.id) {
                    e.currentTarget.style.border = '1px solid transparent';
                    e.currentTarget.style.background = 'transparent';
                  }
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {persona.name_en.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* BLOCK 2: COMMON FILTERS */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => toggleSection('common')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            padding: '0.75rem 0',
            cursor: 'pointer',
            color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#fff' : '#1a1a1a'),
            marginBottom: '1rem'
          }}
        >
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            letterSpacing: '0.5px',
            color: theme === 'minimal-mod' ? '#f1f1f1' : 'inherit'
          }}>
            ОБЩИЕ ФИЛЬТРЫ
          </h3>
          {expandedSections.common ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.common && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Price Range */}
            <div>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.75rem',
                opacity: 0.8
              }}>
                Цена
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="От"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid transparent',
                    background: 'transparent',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = theme === 'dark' 
                      ? '1px solid rgba(255, 255, 255, 0.2)' 
                      : '1px solid rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.background = theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid transparent';
                    e.currentTarget.style.background = 'transparent';
                    handlePriceChange();
                  }}
                />
                <input
                  type="number"
                  placeholder="До"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid transparent',
                    background: 'transparent',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = theme === 'dark' 
                      ? '1px solid rgba(255, 255, 255, 0.2)' 
                      : '1px solid rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.background = theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid transparent';
                    e.currentTarget.style.background = 'transparent';
                    handlePriceChange();
                  }}
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.75rem',
                opacity: 0.8
              }}>
                Наличие
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ fontSize: '0.875rem' }}>В наличии</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ fontSize: '0.875rem' }}>Предзаказ</span>
                </label>
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.75rem',
                opacity: 0.8
              }}>
                Рейтинг
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[5, 4, 3].map(rating => (
                  <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" />
                    <span style={{ fontSize: '0.875rem' }}>{rating}★ и выше</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BLOCK 3: SPECIFIC FILTERS */}
      {Object.keys(specificFilters).length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => toggleSection('specific')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              padding: '0.75rem 0',
              cursor: 'pointer',
              color: theme === 'dark' ? '#fff' : '#1a1a1a',
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: '600', letterSpacing: '0.5px' }}>
              СПЕЦИФИЧЕСКИЕ ФИЛЬТРЫ
            </h3>
            {expandedSections.specific ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {expandedSections.specific && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.entries(specificFilters).map(([filterKey, filterConfig]) => (
                <div key={filterKey}>
                  <h4 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.75rem',
                    opacity: 0.8,
                    textTransform: 'capitalize'
                  }}>
                    {filterKey.replace(/_/g, ' ')}
                  </h4>
                  
                  {/* Checkbox filter */}
                  {filterConfig.type === 'checkbox' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {filterConfig.values.map(value => (
                        <label 
                          key={value}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            cursor: 'pointer',
                            fontSize: '0.8125rem'
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={activeFilters[filterKey]?.includes(value) || false}
                            onChange={(e) => {
                              const current = activeFilters[filterKey] || [];
                              const newValue = e.target.checked
                                ? [...current, value]
                                : current.filter(v => v !== value);
                              onFilterChange(filterKey, newValue);
                            }}
                            style={{ accentColor: theme === 'dark' ? '#fff' : '#000' }}
                          />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {/* Range filter */}
                  {filterConfig.type === 'range' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        placeholder={`Min (${filterConfig.min})`}
                        min={filterConfig.min}
                        max={filterConfig.max}
                        value={activeFilters[filterKey]?.min || ''}
                        onChange={(e) => onFilterChange(filterKey, {
                          ...activeFilters[filterKey],
                          min: e.target.value
                        })}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid transparent',
                          background: 'transparent',
                          color: theme === 'dark' ? '#fff' : '#1a1a1a',
                          fontSize: '0.8125rem',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = theme === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.2)' 
                            : '1px solid rgba(0, 0, 0, 0.2)';
                          e.currentTarget.style.background = theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.05)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = '1px solid transparent';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      />
                      <input
                        type="number"
                        placeholder={`Max (${filterConfig.max})`}
                        min={filterConfig.min}
                        max={filterConfig.max}
                        value={activeFilters[filterKey]?.max || ''}
                        onChange={(e) => onFilterChange(filterKey, {
                          ...activeFilters[filterKey],
                          max: e.target.value
                        })}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid transparent',
                          background: 'transparent',
                          color: theme === 'dark' ? '#fff' : '#1a1a1a',
                          fontSize: '0.8125rem',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = theme === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.2)' 
                            : '1px solid rgba(0, 0, 0, 0.2)';
                          e.currentTarget.style.background = theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.05)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = '1px solid transparent';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Boolean filter */}
                  {filterConfig.type === 'boolean' && (
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      cursor: 'pointer',
                      fontSize: '0.8125rem'
                    }}>
                      <input 
                        type="checkbox"
                        checked={activeFilters[filterKey] || false}
                        onChange={(e) => onFilterChange(filterKey, e.target.checked)}
                        style={{ accentColor: theme === 'dark' ? '#fff' : '#000' }}
                      />
                      <span>Enabled</span>
                    </label>
                  )}
                  
                  {/* Text filter */}
                  {filterConfig.type === 'text' && (
                    <input
                      type="text"
                      placeholder="Enter value..."
                      value={activeFilters[filterKey] || ''}
                      onChange={(e) => onFilterChange(filterKey, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        background: 'transparent',
                        color: theme === 'dark' ? '#fff' : '#1a1a1a',
                        fontSize: '0.8125rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border = theme === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.2)' 
                          : '1px solid rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.background = theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.05)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = '1px solid transparent';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        paddingTop: '1.5rem',
        borderTop: theme === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        {/* Save Filter Set Button */}
        <button
          onClick={onSaveFilterSet}
          style={{
            width: '100%',
            padding: '0.875rem',
            borderRadius: theme === 'minimal-mod' ? '0' : '8px',
            border: theme === 'minimal-mod' 
              ? '1px solid rgba(241, 241, 241, 0.2)'
              : '1px solid transparent',
            background: 'transparent',
            color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#fff' : '#1a1a1a'),
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (theme === 'minimal-mod') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            } else {
              e.currentTarget.style.border = theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.background = theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.2)' : '1px solid transparent';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Bookmark size={16} />
          Сохранить набор фильтров
        </button>

        {/* Reset Filters Button */}
        <button
          onClick={onResetFilters}
          style={{
            width: '100%',
            padding: '0.875rem',
            borderRadius: '8px',
            border: '1px solid transparent',
            background: 'transparent',
            color: theme === 'dark' ? '#fff' : '#1a1a1a',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = theme === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.background = theme === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1px solid transparent';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <RotateCcw size={16} />
          Сбросить все фильтры
        </button>

        {/* Apply Filters Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: theme === 'minimal-mod' ? '0' : '8px',
            border: theme === 'minimal-mod' 
              ? '1px solid rgba(241, 241, 241, 0.2)'
              : '1px solid rgba(139, 92, 246, 0.5)',
            background: theme === 'minimal-mod' 
              ? 'transparent'
              : 'rgba(139, 92, 246, 0.15)',
            color: theme === 'minimal-mod' ? '#f1f1f1' : '#fff',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '0.5px',
            boxShadow: theme === 'minimal-mod' ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (theme === 'minimal-mod') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            } else {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (theme === 'minimal-mod') {
              e.currentTarget.style.background = 'transparent';
            } else {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }
          }}
        >
          ПРИМЕНИТЬ ФИЛЬТРЫ
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
