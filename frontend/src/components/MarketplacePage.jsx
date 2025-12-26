import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Eye,
  Star,
  X,
  ShoppingCart,
  Grid,
  List,
  Zap,
  CreditCard,
  MapPin,
  User as UserIcon,
  Menu,
  Share2,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import FilterPanel from './FilterPanel';
import CatalogMega from './CatalogMega';
import OptimizedImage from './OptimizedImage';
import QuickViewModal from './QuickViewModal';
import { ProductGrid, FastBuyModal } from './marketplace';
import '../styles/glassmorphism.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const MarketplacePage = () => {
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCatalogMega, setShowCatalogMega] = useState(false); // New mega catalog
  const [showFilterPanel, setShowFilterPanel] = useState(false); // Sliding filter panel
  const [showSearchHistory, setShowSearchHistory] = useState(false); // Search history dropdown
  const [searchHistory, setSearchHistory] = useState([]); // Stores last 10 searches
  const [expandedSections, setExpandedSections] = useState({}); // Collapsible sections
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // New catalog system states
  const [personas, setPersonas] = useState({});
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [catalogCategories, setCatalogCategories] = useState({});
  const [specificFilters, setSpecificFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [savedFilterSets, setSavedFilterSets] = useState([]);
  const [catalogData, setCatalogData] = useState(null); // Preloaded catalog data

  // Refs for click outside detection
  const filterButtonRef = useRef(null);
  const catalogButtonRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading search history:', e);
      }
    }
  }, []);

  // Preload catalog data on mount
  useEffect(() => {
    const preloadCatalog = async () => {
      try {
        const response = await fetch(`${API_URL}/api/marketplace/catalog`);
        const data = await response.json();
        setCatalogData(data.catalog || {});
      } catch (error) {
        console.error('Error preloading catalog:', error);
      }
    };
    preloadCatalog();
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchPersonas();
    fetchCatalogCategories();
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedPersona,
    selectedTag,
    sortBy,
    searchTerm,
    minPrice,
    maxPrice,
    itemsPerPage,
    activeFilters,
  ]);

  // Load specific filters when subcategory changes
  useEffect(() => {
    if (selectedSubcategory) {
      fetchSpecificFilters(selectedSubcategory);
    } else {
      setSpecificFilters({}); // Clear filters when no subcategory
    }
  }, [selectedSubcategory]);

  // Apply persona presets when persona is selected
  useEffect(() => {
    if (selectedPersona && selectedCategory && selectedCategory !== 'all') {
      applyPersonaPresets(selectedPersona, selectedCategory);
    }
  }, [selectedPersona, selectedCategory]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close filter panel if click outside
      if (showFilterPanel) {
        const filterPanelElement = document.querySelector('[data-filter-panel="true"]');
        const isClickInsideButton =
          filterButtonRef.current && filterButtonRef.current.contains(event.target);
        const isClickInsidePanel = filterPanelElement && filterPanelElement.contains(event.target);

        if (!isClickInsideButton && !isClickInsidePanel) {
          setShowFilterPanel(false);
        }
      }

      // Close catalog dropdown if click outside
      if (showCatalogMega) {
        const catalogElement = document.querySelector('[data-catalog="true"]');
        const isClickInsideButton =
          catalogButtonRef.current && catalogButtonRef.current.contains(event.target);
        const isClickInsideCatalog = catalogElement && catalogElement.contains(event.target);

        if (!isClickInsideButton && !isClickInsideCatalog) {
          setShowCatalogMega(false);
        }
      }

      // Close search category dropdown if click outside
      if (showSearchHistory) {
        const isClickInsideSearch =
          searchContainerRef.current && searchContainerRef.current.contains(event.target);

        if (!isClickInsideSearch) {
          setShowSearchHistory(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterPanel, showCatalogMega, showSearchHistory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories/`); // Added trailing slash
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchPersonas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/catalog/personas`);
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas || {});
      }
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    }
  };

  const fetchCatalogCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/catalog`);
      if (response.ok) {
        const data = await response.json();
        setCatalogCategories(data.catalog || {});
      }
    } catch (error) {
      console.error('Failed to fetch catalog categories:', error);
    }
  };

  const fetchSpecificFilters = async (subcategoryId) => {
    try {
      const response = await fetch(`${API_URL}/api/catalog/filters/${subcategoryId}`);
      if (response.ok) {
        const data = await response.json();
        setSpecificFilters(data.filters || {});
      }
    } catch (error) {
      console.error('Failed to fetch specific filters:', error);
    }
  };

  const applyPersonaPresets = async (personaId, categoryId) => {
    try {
      const response = await fetch(`${API_URL}/api/catalog/presets/${personaId}`);
      if (response.ok) {
        const data = await response.json();
        const presets = data.presets || {};

        // Apply presets for the selected category if they exist
        if (presets[categoryId]) {
          const categoryPresets = presets[categoryId];
          const newFilters = { ...activeFilters };

          // Merge presets into active filters
          Object.entries(categoryPresets).forEach(([key, value]) => {
            newFilters[key] = value;
          });

          setActiveFilters(newFilters);
        }
      }
    } catch (error) {
      console.error('Failed to fetch persona presets:', error);
    }
  };

  // Search history management
  const addToSearchHistory = (query) => {
    if (!query || query.trim() === '') return;

    const updated = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleSearchSubmit = (query) => {
    if (query && query.trim()) {
      addToSearchHistory(query.trim());
      setSearchTerm(query.trim());
      setShowSearchHistory(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/products/?limit=${itemsPerPage}&sort_by=${sortBy}&sort_order=desc`;

      // Category filters
      if (selectedCategory !== 'all') {
        url += `&category_id=${selectedCategory}`;
      }

      if (selectedSubcategory) {
        url += `&subcategory_id=${selectedSubcategory}`;
      }

      // Persona filter
      if (selectedPersona) {
        url += `&persona_id=${selectedPersona}`;
      }

      // Search
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      // Price range
      if (minPrice) {
        url += `&min_price=${minPrice}`;
      }

      if (maxPrice) {
        url += `&max_price=${maxPrice}`;
      }

      // Specific filters (dynamic filters from catalog)
      if (Object.keys(activeFilters).length > 0) {
        const cleanFilters = {};
        Object.entries(activeFilters).forEach(([key, value]) => {
          // Only include non-empty filters
          if (
            value &&
            ((Array.isArray(value) && value.length > 0) ||
              (typeof value === 'object' && (value.min || value.max)) ||
              typeof value === 'boolean' ||
              (typeof value === 'string' && value.trim()))
          ) {
            cleanFilters[key] = value;
          }
        });

        if (Object.keys(cleanFilters).length > 0) {
          url += `&specific_filters=${encodeURIComponent(JSON.stringify(cleanFilters))}`;
        }
      }

      const response = await fetch(url);
      if (response.ok) {
        let data = await response.json();

        // Filter by featured tag if selected
        if (selectedTag !== 'all') {
          data = data.filter((p) => p.tags && p.tags.includes(selectedTag));
        }

        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!token) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${productId}/wishlist`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  // New filter handlers
  const handlePersonaChange = (personaId) => {
    setSelectedPersona(personaId);
    // Apply persona presets
    // TODO: Fetch and apply persona filter presets
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleResetFilters = () => {
    setSelectedPersona(null);
    setActiveFilters({});
    setMinPrice('');
    setMaxPrice('');
  };

  const handleSaveFilterSet = () => {
    const filterSetName = prompt('Введите название набора фильтров:');
    if (filterSetName) {
      const newFilterSet = {
        name: filterSetName,
        persona: selectedPersona,
        filters: activeFilters,
        timestamp: new Date().toISOString(),
      };
      setSavedFilterSets((prev) => [...prev, newFilterSet]);
      alert(`Набор "${filterSetName}" сохранен!`);
    }
  };

  const handleFeaturedChipClick = (tag) => {
    setSelectedTag(tag);
    setSelectedCategory('all');
  };

  // Featured chips removed - now using personas in filter panel instead

  // Generate active filter chips for display
  const getActiveFilterChips = () => {
    const chips = [];

    // Add persona chip
    if (selectedPersona && personas[selectedPersona]) {
      chips.push({
        id: 'persona',
        label: personas[selectedPersona].name,
        type: 'persona',
        value: selectedPersona,
      });
    }

    // Add category chip (if not 'all')
    if (selectedCategory !== 'all' && catalogCategories[selectedCategory]) {
      chips.push({
        id: 'category',
        label: catalogCategories[selectedCategory].name,
        type: 'category',
        value: selectedCategory,
      });
    }

    // Add price range chip
    if (minPrice || maxPrice) {
      chips.push({
        id: 'price',
        label: `₽${minPrice || '0'} - ₽${maxPrice || '∞'}`,
        type: 'price',
        value: { min: minPrice, max: maxPrice },
      });
    }

    // Add other active filters from activeFilters state
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        chips.push({
          id: key,
          label: `${key}: ${value}`,
          type: 'filter',
          value: value,
        });
      }
    });

    return chips;
  };

  return (
    <div
      className="dark-bg"
      style={{
        minHeight: '100vh',
        paddingTop: '6rem',
        paddingBottom: '4rem',
        paddingLeft: showFilterPanel ? '400px' : '0', // Pushes content when panel opens
        transition: 'padding-left 0.3s ease',
      }}
    >
      <div className="grain-overlay" />

      <div
        style={{
          maxWidth: showFilterPanel ? '1200px' : '1400px', // Narrows when panel is open
          margin: '0 auto',
          padding: '0 2rem',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Header - MINIMAL MARKET */}
        <div
          style={{
            marginBottom: '3rem',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '4rem',
              fontWeight: '900',
              marginBottom: '0.5rem',
              letterSpacing: '3px',
              background:
                theme === 'minimal-mod'
                  ? 'linear-gradient(135deg, #f1f1f1 0%, #b0b0b0 100%)'
                  : 'linear-gradient(135deg, #fff 0%, #a8a8a8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              fontFamily:
                theme === 'minimal-mod'
                  ? '"SF Mono", Menlo, Consolas, Monaco, monospace'
                  : 'inherit',
            }}
          >
            MINIMAL MARKET
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              opacity: 0.7,
              fontFamily:
                theme === 'minimal-mod'
                  ? '"SF Mono", Menlo, Consolas, Monaco, monospace'
                  : 'inherit',
            }}
          >
            Discover premium gaming gear from verified sellers
          </p>
        </div>

        {/* NEW: Centered Search Bar with Integrated Category Dropdown */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '3rem',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Search Bar with Category Integration */}
          <div
            ref={searchContainerRef}
            style={{
              position: 'relative',
              flex: 1,
              maxWidth: '700px',
            }}
          >
            {/* Catalog Button - Left Side */}
            <button
              ref={catalogButtonRef}
              onClick={() => {
                console.log('Catalog button clicked, current state:', showCatalogMega);
                setShowCatalogMega(!showCatalogMega);
              }}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 3,
                background: showCatalogMega ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: showCatalogMega ? '#8b5cf6' : theme === 'dark' ? '#fff' : '#1a1a1a',
                fontSize: '0.875rem',
                fontWeight: '500',
                padding: '0.5rem',
                borderRadius: theme === 'minimal-mod' ? '0' : '6px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!showCatalogMega && theme !== 'minimal-mod') {
                  e.currentTarget.style.background =
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showCatalogMega) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Menu size={18} />
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                {selectedSubcategory
                  ? catalogCategories[selectedCategory]?.subcategories?.[
                      selectedSubcategory
                    ]?.name_en
                      ?.toUpperCase()
                      .substring(0, 12) || 'SUBCATEGORY'
                  : selectedCategory === 'all'
                    ? 'ALL'
                    : catalogCategories[selectedCategory]?.name_en
                        ?.toUpperCase()
                        .substring(0, 12) || 'CATEGORY'}
              </span>
            </button>

            <input
              type="text"
              placeholder="Search for gear..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(searchTerm);
                }
              }}
              className="minimal-search"
              style={{
                width: '100%',
                padding: '1rem 3rem 1rem 140px',
                borderRadius: '50px',
                border: 'none',
                background: 'transparent',
                color: theme === 'dark' ? '#fff' : theme === 'light' ? '#1a1a1a' : '#f1f1f1',
                fontSize: '1rem',
                fontFamily:
                  theme === 'minimal-mod'
                    ? '"SF Mono", Menlo, Consolas, Monaco, monospace'
                    : 'inherit',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.currentTarget && theme !== 'minimal-mod') {
                  e.currentTarget.style.background =
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.backdropFilter = 'blur(10px)';
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.currentTarget) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.backdropFilter = 'none';
                }
              }}
            />

            {/* Search Icon - Right Side */}
            <Search
              size={20}
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.4,
                pointerEvents: 'none',
                zIndex: 2,
                color: theme === 'dark' ? '#fff' : theme === 'light' ? '#1a1a1a' : '#f1f1f1',
              }}
            />

            {/* Category Dropdown */}
            {showSearchHistory && (
              <div
                className="glass-strong"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  left: 0,
                  right: 0,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  borderRadius: '16px',
                  padding: '1rem',
                  zIndex: 100,
                  animation: 'slideDown 0.3s ease-out',
                }}
              >
                {/* Search History */}
                {searchHistory.length > 0 ? (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 1rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          opacity: 0.6,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {language === 'ru' ? 'История поиска' : 'Search History'}
                      </span>
                      <button
                        onClick={clearSearchHistory}
                        style={{
                          fontSize: '0.6875rem',
                          color: '#8b5cf6',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {language === 'ru' ? 'Очистить' : 'Clear'}
                      </button>
                    </div>

                    {searchHistory.map((historyItem, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSearchTerm(historyItem);
                          handleSearchSubmit(historyItem);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          marginBottom: '0.25rem',
                          border: '1px solid transparent',
                          background: 'transparent',
                          transition: 'all 0.2s ease',
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                        onMouseEnter={(e) => {
                          if (theme !== 'minimal-mod') {
                            e.currentTarget.style.border =
                              theme === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.background =
                              theme === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(0, 0, 0, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.border = '1px solid transparent';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Search size={14} opacity={0.5} />
                        <span>{historyItem}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div
                    style={{
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      fontSize: '0.8125rem',
                      opacity: 0.5,
                    }}
                  >
                    {language === 'ru' ? 'История поиска пуста' : 'No search history yet'}
                  </div>
                )}{' '}
              </div>
            )}

            {/* Catalog Mega Menu - positioned relative to search container */}
            {showCatalogMega && catalogData && (
              <CatalogMega
                theme={theme}
                catalogData={catalogData}
                onClose={() => setShowCatalogMega(false)}
                onCategorySelect={(categoryId, subcategoryId, item) => {
                  setSelectedCategory(categoryId);
                  setSelectedSubcategory(subcategoryId);
                  setShowCatalogMega(false);
                }}
              />
            )}
          </div>
        </div>

        {/* Backdrop when catalog is open */}
        {showCatalogMega && (
          <div
            onClick={() => setShowCatalogMega(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 98,
              animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        )}

        {/* Floating Filter Button - Unified with Header Style */}
        <button
          ref={filterButtonRef}
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          style={{
            position: 'fixed',
            left: showFilterPanel ? '380px' : '1rem',
            top: '40%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '100px',
            borderRadius: theme === 'minimal-mod' ? '0' : '6px',
            border:
              theme === 'minimal-mod'
                ? 'none'
                : theme === 'dark'
                  ? '1px solid transparent'
                  : '1px solid rgba(0, 0, 0, 0.1)',
            background:
              theme === 'minimal-mod'
                ? 'transparent'
                : theme === 'dark'
                  ? 'transparent'
                  : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: theme === 'minimal-mod' ? 'none' : 'blur(10px)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 0',
            color: theme === 'dark' ? '#fff' : theme === 'light' ? '#1a1a1a' : '#f1f1f1',
          }}
          onMouseEnter={(e) => {
            if (theme !== 'minimal-mod') {
              e.currentTarget.style.border =
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.background =
                theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.transform = 'translateY(-50%) translateX(2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (theme !== 'minimal-mod') {
              e.currentTarget.style.border =
                theme === 'dark' ? '1px solid transparent' : '1px solid rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.background =
                theme === 'dark' ? 'transparent' : 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'translateY(-50%)';
            }
          }}
        >
          <SlidersHorizontal size={16} />
          <div
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '0.625rem',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}
          >
            FILTERS
          </div>
        </button>

        {/* New Filter Panel Component */}
        {showFilterPanel && (
          <FilterPanel
            personas={personas}
            selectedPersona={selectedPersona}
            onPersonaChange={handlePersonaChange}
            specificFilters={specificFilters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSaveFilterSet={handleSaveFilterSet}
            onClose={() => setShowFilterPanel(false)}
          />
        )}

        {/* Products Grid/List */}
        <div
          style={{
            padding: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {loading ? (
            <div
              style={{ textAlign: 'center', padding: '3rem', fontSize: '0.875rem', opacity: 0.7 }}
            >
              {language === 'ru' ? 'Загрузка товаров...' : 'Loading products...'}
            </div>
          ) : products.length === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '3rem', fontSize: '0.875rem', opacity: 0.7 }}
            >
              {language === 'ru' ? 'Товары не найдены' : 'No products found'}
            </div>
          ) : viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
              }}
            >
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  theme={theme}
                  onToggleWishlist={handleToggleWishlist}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {products.map((product) => (
                <ProductCardList
                  key={product.id}
                  product={product}
                  theme={theme}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Collapsible Filter Component - Unified with Header Style
const CollapsibleFilter = ({ title, id, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0',
          background: 'none',
          border: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          opacity: 0.7,
          transition: 'opacity 0.3s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
      >
        {title}
        <span
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease',
            fontSize: '1.25rem',
          }}
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            paddingTop: '1rem',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Pinterest-Style Product Card Component with Carousel
const ProductCard = ({ product, theme, onToggleWishlist, index = 0 }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPriceTag, setShowPriceTag] = useState(true);
  const [showQuickView, setShowQuickView] = useState(false);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [{ url: 'https://via.placeholder.com/300x400?text=No+Image', alt: product.title }];

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <Link
          to={`/product/${product.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="glass-subtle product-card"
            style={{
              borderRadius: theme === 'minimal-mod' ? '0' : '20px',
              overflow: 'visible',
              border: theme === 'minimal-mod' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transform:
                theme === 'minimal-mod' ? 'none' : isHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow:
                theme === 'minimal-mod'
                  ? 'none'
                  : isHovered
                    ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                    : 'none',
              position: 'relative',
              background: theme === 'minimal-mod' ? 'transparent' : undefined,
              fontFamily:
                theme === 'minimal-mod'
                  ? '"SF Mono", Menlo, Consolas, Monaco, monospace'
                  : 'inherit',
            }}
          >
            {/* Image Container with OptimizedImage */}
            <div
              style={{
                position: 'relative',
                paddingTop: '133%',
                background:
                  theme === 'minimal-mod'
                    ? 'transparent'
                    : 'linear-gradient(135deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 20, 0.9) 100%)',
                overflow: 'hidden',
                borderRadius: theme === 'minimal-mod' ? '0' : '20px',
              }}
            >
              {/* OptimizedImage with lazy loading */}
              <OptimizedImage
                src={
                  (!imageError && images[currentImageIndex]?.url) ||
                  'https://via.placeholder.com/300x400?text=No+Image'
                }
                alt={images[currentImageIndex]?.alt || product.title}
                priority={index < 4}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              />

              {/* Carousel Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      color: '#fff',
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      color: '#fff',
                    }}
                  >
                    ›
                  </button>

                  {/* Carousel Dots */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '0.375rem',
                    }}
                  >
                    {images.map((_, index) => (
                      <div
                        key={index}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background:
                            index === currentImageIndex
                              ? 'rgba(255, 255, 255, 0.9)'
                              : 'rgba(255, 255, 255, 0.3)',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Price Tag - Apple-style rounded (White Matted Acrylic) */}
              {showPriceTag && (
                <div
                  className="price-tag"
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '12px',
                    fontSize: '0.8125rem',
                    fontWeight: '800',
                    color: '#000',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    opacity: isHovered ? 0 : 1,
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '32px',
                    minWidth: '70px',
                    justifyContent: 'center',
                  }}
                >
                  ${product.price}
                </div>
              )}

              {/* Quick Buy Button - Apple-style rounded (Purple Acrylic) */}
              {product.stock > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQuickBuy(true);
                  }}
                  onMouseEnter={() => setShowPriceTag(false)}
                  onMouseLeave={() => setShowPriceTag(true)}
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background:
                      'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(107, 70, 193, 0.95) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: 'none',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.8125rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                    boxShadow:
                      '0 4px 16px rgba(139, 92, 246, 0.4), 0 1px 3px rgba(139, 92, 246, 0.2)',
                    letterSpacing: '0.5px',
                    pointerEvents: isHovered ? 'auto' : 'none',
                    height: '32px',
                    minWidth: '100px',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow =
                      '0 6px 24px rgba(139, 92, 246, 0.6), 0 2px 6px rgba(139, 92, 246, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow =
                      '0 4px 16px rgba(139, 92, 246, 0.4), 0 1px 3px rgba(139, 92, 246, 0.2)';
                  }}
                >
                  <Zap size={14} />
                  BUY NOW
                </button>
              )}

              {/* Out of Stock Badge */}
              {product.stock === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255, 59, 48, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 16px rgba(255, 59, 48, 0.4)',
                  }}
                >
                  OUT OF STOCK
                </div>
              )}

              {/* Mini Rating & Wishlist - Bottom Right (наполовину выходят за карточку) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-10px',
                  right: '-10px',
                  display: 'flex',
                  gap: '0.375rem',
                  zIndex: 15,
                }}
              >
                {/* Mini Rating Badge - Минималистичный, статичный */}
                {product.average_rating > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.3rem 0.55rem',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: '0.6875rem',
                      fontWeight: '700',
                      color: '#fff', // Белый минималистичный
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <Star size={10} fill="none" color="#fff" strokeWidth={2.5} />
                    {product.average_rating.toFixed(1)}
                  </div>
                )}

                {/* Mini Wishlist Button - Показывает счетчик при наведении/клике */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleWishlist(product.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.3rem 0.55rem',
                    borderRadius: '8px',
                    background: product.is_wishlisted
                      ? 'rgba(255, 59, 48, 0.75)'
                      : 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: product.is_wishlisted
                      ? '1px solid rgba(255, 59, 48, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    color: '#fff',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 59, 48, 0.9)';
                    e.currentTarget.style.border = '1px solid rgba(255, 59, 48, 0.6)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = product.is_wishlisted
                      ? 'rgba(255, 59, 48, 0.75)'
                      : 'rgba(0, 0, 0, 0.75)';
                    e.currentTarget.style.border = product.is_wishlisted
                      ? '1px solid rgba(255, 59, 48, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Heart
                    size={10}
                    fill={product.is_wishlisted ? '#ff3b30' : 'none'}
                    color={product.is_wishlisted ? '#ff3b30' : '#fff'}
                    strokeWidth={2.5}
                  />
                  {/* Счетчик показывается при наведении или если товар в избранном */}
                  {(isHovered || product.is_wishlisted) && (
                    <span>{product.wishlist_count || 0}</span>
                  )}
                </button>

                {/* Quick View Button */}
                <button
                  onClick={handleQuickView}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.3rem 0.55rem',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    color: '#fff',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    opacity: isHovered ? 1 : 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(168, 85, 247, 0.9)';
                    e.currentTarget.style.border = '1px solid rgba(168, 85, 247, 0.6)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Eye size={10} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </Link>

        {/* Product Title - Below Card (Acrylic, muted → bright on hover) */}
        <div
          style={{
            marginTop: '0.625rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            background: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s ease',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: '700',
              lineHeight: '1.3',
              color: '#fff',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              opacity: isHovered ? 1 : 0.6,
              transition: 'opacity 0.3s ease',
            }}
          >
            {product.title}
          </h3>
        </div>
      </div>

      {/* Quick Buy Modal */}
      {showQuickBuy && <QuickBuyModal product={product} onClose={() => setShowQuickBuy(false)} />}

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal 
          product={{ 
            ...product, 
            name: product.title, 
            image: product.images?.[0]?.url 
          }} 
          onClose={() => setShowQuickView(false)} 
        />
      )}
    </>
  );
};

// Product Card List Component (Horizontal Layout)
const ProductCardList = ({ product, theme, onToggleWishlist }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const imageUrl =
    (!imageError && primaryImage?.url) || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <Link
      to={`/product/${product.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="glass-strong product-card"
        style={{
          borderRadius: theme === 'minimal-mod' ? '0' : '16px',
          border:
            theme === 'minimal-mod'
              ? 'none'
              : isHovered
                ? '1px solid rgba(255, 255, 255, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          display: 'grid',
          gridTemplateColumns: '240px 1fr auto',
          background: theme === 'minimal-mod' ? 'transparent' : undefined,
          fontFamily:
            theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
          gap: '2rem',
          padding: '1.5rem',
          transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
          backdropFilter: isHovered ? 'blur(20px)' : 'blur(10px)',
          background: isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
          boxShadow: isHovered ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.2)',
          alignItems: 'center',
        }}
      >
        {/* Image */}
        <div
          style={{
            position: 'relative',
            paddingTop: '100%',
            background: 'rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            borderRadius: '12px',
          }}
        >
          <img
            src={imageUrl}
            alt={product.title}
            onError={() => setImageError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />

          {/* Rating Badge */}
          {product.average_rating > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                left: '0.75rem',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                padding: '0.375rem 0.625rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Star size={14} fill="#FFD700" color="#FFD700" />
              <span style={{ fontSize: '0.8125rem', fontWeight: '700' }}>
                {product.average_rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255, 59, 48, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.5px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              OUT OF STOCK
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Title */}
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              lineHeight: '1.3',
              marginBottom: '0.5rem',
            }}
          >
            {product.title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: '0.9375rem',
              lineHeight: '1.6',
              opacity: 0.8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.description}
          </p>

          {/* Stats Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              fontSize: '0.875rem',
              opacity: 0.75,
              marginTop: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Eye size={16} />
              <span>{product.views || 0} views</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Heart size={16} />
              <span>{product.wishlist_count || 0} wishlist</span>
            </div>
            {product.total_reviews > 0 && (
              <span style={{ fontWeight: '600' }}>
                {product.total_reviews} {product.total_reviews === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>

          {/* Quick Specs */}
          {product.specifications && product.specifications.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginTop: '0.5rem',
              }}
            >
              {product.specifications.slice(0, 4).map((spec, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {spec.name}: {spec.value}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price & Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '1rem',
            minWidth: '200px',
          }}
        >
          {/* Price */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '2.25rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #fff 0%, #a8a8a8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem',
              }}
            >
              ${product.price}
            </div>
            {product.stock > 0 && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#4CAF50',
                  fontWeight: '600',
                }}
              >
                IN STOCK ({product.stock})
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log('Add to cart:', product.id);
              }}
              disabled={product.stock === 0}
              className="glass-strong"
              style={{
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background:
                  product.stock > 0
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: '700',
                cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                opacity: product.stock > 0 ? 1 : 0.5,
                transition: 'all 0.3s ease',
              }}
            >
              <ShoppingCart size={16} />
              ADD TO CART
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(product.id);
              }}
              className="glass-subtle"
              style={{
                padding: '0.875rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <Heart
                size={20}
                color="#fff"
                fill={product.wishlist_count > 0 ? '#ff3b30' : 'transparent'}
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Quick Buy Modal Component - Redesigned with wide layout
const QuickBuyModal = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'tinkoff_card', // 'tinkoff_card', 'tinkoff_sbp', 'crypto_usdt', etc.
  });
  const [loading, setLoading] = useState(false);
  const [isPreorder, setIsPreorder] = useState(product.stock === 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement actual order creation via API
    try {
      // Call /api/orders endpoint to create order
      console.log('Creating order:', {
        product_id: product.id,
        customer_full_name: formData.fullName,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        payment_method: formData.paymentMethod,
        preorder: isPreorder,
      });

      setTimeout(() => {
        alert(
          isPreorder
            ? `Предзаказ оформлен! Ожидаемая доставка: ${product.preorder_delivery_days || 14} дней. Мы свяжемся с вами для подтверждения.`
            : 'Заказ оформлен! Мы свяжемся с вами для подтверждения.'
        );
        setLoading(false);
        onClose();
      }, 1500);
    } catch (error) {
      alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="glass-strong"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1100px',
          width: '100%',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '2rem',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '300px 1fr 280px',
          gap: '2rem',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={22} />
        </button>

        {/* LEFT SECTION: Product Image & Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Product Image */}
          <div
            style={{
              width: '100%',
              height: '280px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {product.images && product.images[0] && (
              <img
                src={product.images[0].url}
                alt={product.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
          </div>

          {/* Product Details */}
          <div>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                lineHeight: '1.4',
              }}
            >
              {product.title}
            </h3>

            {/* Price */}
            <div
              style={{
                fontSize: '2rem',
                fontWeight: '900',
                marginBottom: '0.75rem',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6B46C1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ${product.price}
            </div>

            {/* Stock Status */}
            {isPreorder ? (
              <div
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(251, 146, 60, 0.15)',
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: '#fb923c',
                  marginBottom: '0.75rem',
                }}
              >
                ⚠ Под заказ (доставка {product.preorder_delivery_days || 14} дней)
              </div>
            ) : (
              <div
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: '#a78bfa',
                  marginBottom: '0.75rem',
                }}
              >
                ✓ В наличии ({product.stock} шт)
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: product.title,
                      text: product.description,
                      url: `${window.location.origin}/product/${product.id}`,
                    })
                    .catch((err) => console.log('Error sharing:', err));
                } else {
                  navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
                  alert('Ссылка скопирована в буфер обмена!');
                }
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Share2 size={16} />
              Поделиться товаром
            </button>
          </div>
        </div>

        {/* CENTER SECTION: Form */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2
              style={{
                fontSize: '1.875rem',
                fontWeight: '900',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6B46C1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              ⚡ Быстрая Покупка
            </h2>
            <p style={{ opacity: 0.65, fontSize: '0.9375rem' }}>Оформите заказ без регистрации</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* Full Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: 0.85,
                }}
              >
                <UserIcon size={16} />
                ФИО
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Иванов Иван Иванович"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: 0.85,
                }}
              >
                <CreditCard size={16} />
                Телефон
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: '1.5rem', flex: 1 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: 0.85,
                }}
              >
                <MapPin size={16} />
                Адрес доставки
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Город, улица, дом, квартира..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6B46C1 100%)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 24px rgba(139, 92, 246, 0.4)',
                opacity: loading ? 0.7 : 1,
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 32px rgba(139, 92, 246, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(139, 92, 246, 0.4)';
              }}
            >
              <Zap size={20} />
              {loading ? 'Оформление...' : 'Оформить заказ'}
            </button>

            {/* Info Text */}
            <div
              style={{
                marginTop: '0.875rem',
                fontSize: '0.75rem',
                opacity: 0.55,
                textAlign: 'center',
                lineHeight: '1.5',
              }}
            >
              После оформления с вами свяжется менеджер для подтверждения заказа
            </div>
          </form>
        </div>

        {/* RIGHT SECTION: Payment Methods */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              opacity: 0.9,
            }}
          >
            Способ оплаты
          </h3>

          {/* Tinkoff Card */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'tinkoff_card' })}
            className="glass-subtle"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border:
                formData.paymentMethod === 'tinkoff_card'
                  ? '2px solid rgba(139, 92, 246, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              background:
                formData.paymentMethod === 'tinkoff_card'
                  ? 'rgba(139, 92, 246, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (formData.paymentMethod !== 'tinkoff_card') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.paymentMethod !== 'tinkoff_card') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.25rem',
              }}
            >
              <CreditCard size={18} color="#8B5CF6" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Банковская карта</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.875rem' }}>
              Visa, Mastercard, МИР
            </p>
          </button>

          {/* Tinkoff SBP */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'tinkoff_sbp' })}
            className="glass-subtle"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border:
                formData.paymentMethod === 'tinkoff_sbp'
                  ? '2px solid rgba(139, 92, 246, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              background:
                formData.paymentMethod === 'tinkoff_sbp'
                  ? 'rgba(139, 92, 246, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (formData.paymentMethod !== 'tinkoff_sbp') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.paymentMethod !== 'tinkoff_sbp') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.25rem',
              }}
            >
              <Zap size={18} color="#8B5CF6" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>СБП (SBP)</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.875rem' }}>
              Система быстрых платежей
            </p>
          </button>

          {/* QR Code */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'qr_code' })}
            className="glass-subtle"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border:
                formData.paymentMethod === 'qr_code'
                  ? '2px solid rgba(139, 92, 246, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              background:
                formData.paymentMethod === 'qr_code'
                  ? 'rgba(139, 92, 246, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (formData.paymentMethod !== 'qr_code') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.paymentMethod !== 'qr_code') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.25rem',
              }}
            >
              <CreditCard size={18} color="#8B5CF6" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>QR-код</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.875rem' }}>
              Сканирование кода
            </p>
          </button>

          {/* Crypto */}
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                opacity: 0.9,
              }}
            >
              💎 Криптовалюта
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.65, lineHeight: '1.4' }}>
              USDT, USDC, DAI на Ethereum, BSC, Polygon, Tron, Solana
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
