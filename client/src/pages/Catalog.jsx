import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiSliders, FiX, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { getProducts } from '../api';
import ProductCard from '../components/product/ProductCard';

const ALL_CATEGORIES = ['Skinny', 'Straight', 'Ripped', 'Mom Fit', 'Baggy', 'Wide Leg', 'Bootcut', 'Shorts', 'Jackets'];
const ALL_SIZES = ['26', '28', '30', '32', '34', '36', '38', '40'];
const ALL_COLORS = ['Black', 'Blue', 'Light Wash', 'Dark Wash', 'White', 'Grey', 'Indigo'];
const ALL_FABRICS = ['Denim', 'Stretch Denim', 'Raw Denim', 'Cotton'];
const ALL_OCCASIONS = ['Casual', 'Work', 'Party'];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const CATEGORY_DESCRIPTIONS = {
  'All': 'Explore our full collection of premium denim jeans crafted for comfort and style. From skinny to wide leg, find your perfect fit.',
  'Skinny': 'Our skinny jeans hug your curves for a sleek, streamlined silhouette. Premium stretch denim for all-day comfort.',
  'Straight': 'Classic straight-leg jeans — a timeless cut that works with everything in your wardrobe.',
  'Ripped': 'Distressed and deconstructed. Our ripped jeans bring edge and attitude to any outfit.',
  'Mom Fit': 'High-waisted, relaxed through the hip and thigh. The mom fit is comfort meets vintage cool.',
  'Baggy': 'Oversized and effortless. Our baggy jeans deliver maximum comfort with streetwear style.',
  'Wide Leg': 'Flowing from the hip, wide leg jeans make a statement with every step.',
};

const PRICE_RANGES = [
  { label: 'Under GH₵200', min: 0, max: 200 },
  { label: 'GH₵200 - GH₵400', min: 200, max: 400 },
  { label: 'GH₵400 - GH₵600', min: 400, max: 600 },
  { label: 'Over GH₵600', min: 600, max: Infinity },
];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({ category: true, size: true, color: false, fabric: false, occasion: false, price: false });
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    sizes: [],
    colors: [],
    fabrics: [],
    occasions: [],
    priceRange: null,
    availability: null,
  });
  const [sortBy, setSortBy] = useState('featured');
  const [displayCount, setDisplayCount] = useState(12);
  const filterBarRef = useRef(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const flashSale = searchParams.get('flashSale');
  const newArrival = searchParams.get('newArrival');

  useEffect(() => {
    const handleScroll = () => {
      if (filterBarRef.current) {
        const rect = filterBarRef.current.getBoundingClientRect();
        setStickyVisible(rect.top <= 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchAllProducts();
  }, [currentCategory, currentSearch, flashSale, newArrival]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allProducts, activeFilters, sortBy, displayCount]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      let allFetched = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const params = { page, limit: 50, sort: 'newest' };
        if (currentCategory !== 'All') params.category = currentCategory;
        if (currentSearch) params.search = currentSearch;
        if (flashSale) params.flashSale = flashSale;
        if (newArrival) params.newArrival = newArrival;

        const res = await getProducts(params);
        allFetched = [...allFetched, ...res.data.products];
        hasMore = page < res.data.totalPages;
        page++;
      }

      setAllProducts(allFetched);
      setTotal(allFetched.length);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...allProducts];

    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter((p) => activeFilters.categories.includes(p.category));
    }
    if (activeFilters.sizes.length > 0) {
      filtered = filtered.filter((p) => p.sizes?.some((s) => activeFilters.sizes.includes(s)));
    }
    if (activeFilters.colors.length > 0) {
      filtered = filtered.filter((p) => p.colors?.some((c) => activeFilters.colors.includes(c)));
    }
    if (activeFilters.fabrics.length > 0) {
      filtered = filtered.filter((p) => activeFilters.fabrics?.includes(p.fabric));
    }
    if (activeFilters.occasions.length > 0) {
      filtered = filtered.filter((p) => p.tags?.some((t) => activeFilters.occasions.includes(t)));
    }
    if (activeFilters.priceRange) {
      const { min, max } = activeFilters.priceRange;
      filtered = filtered.filter((p) => {
        const price = p.discountedPrice || p.price;
        return price >= min && price < max;
      });
    }
    if (activeFilters.availability === 'in_stock') {
      filtered = filtered.filter((p) => p.stock > 0);
    } else if (activeFilters.availability === 'out_of_stock') {
      filtered = filtered.filter((p) => p.stock <= 0);
    }

    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'best_selling':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      default:
        break;
    }

    setProducts(filtered);
    setTotal(filtered.length);
  }, [allProducts, activeFilters, sortBy]);

  const toggleFilter = (type, value) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
    setDisplayCount(12);
  };

  const toggleExpand = (key) => {
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      categories: [],
      sizes: [],
      colors: [],
      fabrics: [],
      occasions: [],
      priceRange: null,
      availability: null,
    });
    setDisplayCount(12);
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== null
  );

  const getCountForFilter = (type, value) => {
    return allProducts.filter((p) => {
      if (type === 'categories') return p.category === value;
      if (type === 'sizes') return p.sizes?.includes(value);
      if (type === 'colors') return p.colors?.includes(value);
      return false;
    }).length;
  };

  const updateSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = new URLSearchParams(searchParams);
    const search = formData.get('search');
    if (search) params.set('search', search);
    else params.delete('search');
    params.delete('page');
    setSearchParams(params);
  };

  const pageTitle = flashSale ? 'Flash Sales' : newArrival ? 'New Arrivals' : currentCategory !== 'All' ? currentCategory : 'All Jeans';
  const displayedProducts = products.slice(0, displayCount);
  const hasMore = displayCount < products.length;

  const FilterSection = ({ title, filterKey, items, type, countFn }) => (
    <div className="filter-section">
      <button className="filter-section-header" onClick={() => toggleExpand(filterKey)}>
        <span>{title}</span>
        {expandedFilters[filterKey] ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
      </button>
      {expandedFilters[filterKey] && (
        <div className="filter-section-body">
          {items.map((item) => {
            const isActive = activeFilters[type]?.includes(item.value || item);
            const count = countFn ? countFn(type, item.value || item) : null;
            return (
              <label key={item.value || item} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleFilter(type, item.value || item)}
                />
                <span className="filter-checkbox-mark" />
                <span className="filter-checkbox-label">{item.label || item}</span>
                {count !== null && count > 0 && (
                  <span className="filter-checkbox-count">{count}</span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="catalog-page" id="catalog-page">
      {/* Breadcrumbs */}
      <div className="catalog-breadcrumbs">
        <div className="container">
          <nav className="breadcrumbs">
            <Link to="/">Home</Link>
            <FiChevronRight size={12} />
            <span>{pageTitle}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="catalog-header">
        <div className="container">
          <h1 className="catalog-title">{pageTitle}</h1>
        </div>
      </div>

      {/* Sticky Filter/Sort Bar */}
      <div ref={filterBarRef}>
        <div className={`filter-bar ${stickyVisible ? 'filter-bar-sticky' : ''}`}>
          <div className="container">
            <div className="filter-bar-inner">
              <div className="filter-bar-left">
                <button className="filter-bar-toggle" onClick={() => setSidebarOpen(true)}>
                  <FiSliders size={16} />
                  <span>Filter & Sort</span>
                  {hasActiveFilters && (
                    <span className="filter-bar-count">
                      {Object.values(activeFilters).flat().filter(Boolean).length}
                    </span>
                  )}
                </button>
                <span className="filter-count">{total} products</span>
              </div>
              <div className="filter-bar-right">
                <form className="filter-search" onSubmit={updateSearch}>
                  <FiSearch size={16} />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search..."
                    defaultValue={currentSearch}
                  />
                </form>
                <select
                  className="filter-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sidebar Overlay */}
      {sidebarOpen && (
        <div className="filter-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="filter-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="filter-sidebar-header">
              <h2>Filter & Sort</h2>
              <button onClick={() => setSidebarOpen(false)}><FiX size={20} /></button>
            </div>

            <div className="filter-sidebar-body">
              {/* Sort */}
              <div className="filter-section">
                <div className="filter-section-header"><span>Sort By</span></div>
                <div className="filter-section-body">
                  {SORT_OPTIONS.map((opt) => (
                    <label key={opt.value} className="filter-radio">
                      <input
                        type="radio"
                        name="sort"
                        checked={sortBy === opt.value}
                        onChange={() => setSortBy(opt.value)}
                      />
                      <span className="filter-radio-mark" />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <FilterSection title="Category" filterKey="category" items={ALL_CATEGORIES.map((c) => ({ label: c, value: c }))} type="categories" countFn={getCountForFilter} />
              <FilterSection title="Size" filterKey="size" items={ALL_SIZES.map((s) => ({ label: s, value: s }))} type="sizes" countFn={getCountForFilter} />
              <FilterSection title="Color" filterKey="color" items={ALL_COLORS.map((c) => ({ label: c, value: c }))} type="colors" countFn={getCountForFilter} />
              <FilterSection title="Fabric" filterKey="fabric" items={ALL_FABRICS.map((f) => ({ label: f, value: f }))} type="fabrics" />
              <FilterSection title="Occasion" filterKey="occasion" items={ALL_OCCASIONS.map((o) => ({ label: o, value: o }))} type="occasions" />

              {/* Price Range */}
              <div className="filter-section">
                <button className="filter-section-header" onClick={() => toggleExpand('price')}>
                  <span>Price Range</span>
                  {expandedFilters.price ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                </button>
                {expandedFilters.price && (
                  <div className="filter-section-body">
                    {PRICE_RANGES.map((range) => (
                      <label key={range.label} className="filter-radio">
                        <input
                          type="radio"
                          name="price"
                          checked={activeFilters.priceRange?.label === range.label}
                          onChange={() => setActiveFilters((prev) => ({ ...prev, priceRange: prev.priceRange?.label === range.label ? null : range }))}
                        />
                        <span className="filter-radio-mark" />
                        <span>{range.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="filter-section">
                <button className="filter-section-header" onClick={() => toggleExpand('availability')}>
                  <span>Availability</span>
                  {expandedFilters.availability ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                </button>
                {expandedFilters.availability && (
                  <div className="filter-section-body">
                    <label className="filter-radio">
                      <input type="radio" name="availability" checked={activeFilters.availability === 'in_stock'} onChange={() => setActiveFilters((prev) => ({ ...prev, availability: prev.availability === 'in_stock' ? null : 'in_stock' }))} />
                      <span className="filter-radio-mark" />
                      <span>In Stock</span>
                    </label>
                    <label className="filter-radio">
                      <input type="radio" name="availability" checked={activeFilters.availability === 'out_of_stock'} onChange={() => setActiveFilters((prev) => ({ ...prev, availability: prev.availability === 'out_of_stock' ? null : 'out_of_stock' }))} />
                      <span className="filter-radio-mark" />
                      <span>Out of Stock</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="filter-sidebar-footer">
              {hasActiveFilters && (
                <button className="btn btn-ghost" onClick={clearAllFilters}>Clear All</button>
              )}
              <button className="btn btn-primary" onClick={() => setSidebarOpen(false)}>
                Show {total} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="catalog-active-filters">
          <div className="container">
            <div className="active-pills">
              {Object.entries(activeFilters).map(([type, values]) => {
                if (!values || (Array.isArray(values) && values.length === 0)) return null;
                const items = Array.isArray(values) ? values : [values];
                return items.map((val) => {
                  const label = typeof val === 'object' ? val.label : val;
                  return (
                    <span key={`${type}-${label}`} className="active-pill">
                      {label}
                      <button onClick={() => {
                        if (typeof val === 'object') {
                          setActiveFilters((prev) => ({ ...prev, priceRange: null }));
                        } else {
                          toggleFilter(type, val);
                        }
                      }}>
                        <FiX size={12} />
                      </button>
                    </span>
                  );
                });
              })}
              <button className="active-pill-clear" onClick={clearAllFilters}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* SEO Description */}
      {CATEGORY_DESCRIPTIONS[currentCategory] && (
        <div className="catalog-seo">
          <div className="container">
            <p>{CATEGORY_DESCRIPTIONS[currentCategory]}</p>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="catalog-content">
        <div className="container">
          {loading ? (
            <div className="loader">
              <div className="spinner"></div>
            </div>
          ) : displayedProducts.length > 0 ? (
            <>
              <div className="product-grid product-grid-4">
                {displayedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-wrapper">
                  <button
                    className="btn btn-outline load-more-btn"
                    onClick={() => setDisplayCount((prev) => prev + 12)}
                  >
                    Load More ({products.length - displayCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiSearch size={48} strokeWidth={1} />
              </div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search criteria.</p>
              {hasActiveFilters && (
                <button className="btn btn-primary" onClick={clearAllFilters}>Clear All Filters</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
