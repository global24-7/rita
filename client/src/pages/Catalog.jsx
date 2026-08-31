import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiSliders } from 'react-icons/fi';
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
  const [stickyVisible, setStickyVisible] = useState(false);
  const filterBarRef = useRef(null);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page')) || 1;
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
    params.delete('page');
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

  const pageTitle = flashSale ? 'Flash Sales' : newArrival ? 'New Arrivals' : 'All Jeans';

  return (
    <div className="catalog-page" id="catalog-page">
      <div className="catalog-header">
        <div className="container">
          <h1 className="catalog-title">{pageTitle}</h1>
        </div>
      </div>

      <div ref={filterBarRef}>
        <div className={`filter-bar ${stickyVisible ? 'filter-bar-sticky' : ''}`}>
          <div className="container">
            <div className="filter-bar-inner">
              <div className="filter-bar-categories">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`filter-pill ${currentCategory === cat ? 'active' : ''}`}
                    onClick={() => updateFilter('category', cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="filter-bar-right">
                <form className="filter-search" onSubmit={handleSearch}>
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
                  value={currentSort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="filter-count">{total} products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="catalog-content">
        <div className="container">
          {loading ? (
            <div className="loader">
              <div className="spinner"></div>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="product-grid product-grid-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
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
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
