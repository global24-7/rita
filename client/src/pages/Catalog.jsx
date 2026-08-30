import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { getProducts } from '../api';
import ProductCard from '../components/product/ProductCard';

const categories = ['All', 'Skinny', 'Straight', 'Ripped', 'Mom Fit', 'Baggy', 'Wide Leg'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page')) || 1;
  const flashSale = searchParams.get('flashSale');
  const newArrival = searchParams.get('newArrival');

  useEffect(() => {
    fetchProducts();
  }, [currentCategory, currentSearch, currentSort, currentPage, flashSale, newArrival]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sort: currentSort,
      };
      if (currentCategory !== 'All') params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;
      if (flashSale) params.flashSale = flashSale;
      if (newArrival) params.newArrival = newArrival;

      const res = await getProducts(params);
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset page on filter change
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateFilter('search', formData.get('search'));
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle = flashSale ? 'Flash Sales 🔥' : newArrival ? 'New Arrivals ✨' : 'All Jeans';

  return (
    <div className="catalog-page" id="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <h1>{pageTitle}</h1>
          <form className="search-bar" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              name="search"
              placeholder="Search jeans..."
              defaultValue={currentSearch}
              className="form-input"
              style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }}
            />
          </form>
        </div>

        {/* Category Filters */}
        <div className="catalog-filters" style={{ marginBottom: 'var(--space-lg)' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${currentCategory === cat ? 'active' : ''}`}
              onClick={() => updateFilter('category', cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="catalog-controls">
          <span className="results-count">{total} products found</span>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loader">
            <div className="spinner"></div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  ›
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="icon">👖</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
