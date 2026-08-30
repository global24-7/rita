import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProducts, deleteProduct } from '../../api';
import { formatPrice, calculateDiscount, getImageUrl } from '../../utils/helpers';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ page, limit: 20 });
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div id="product-manager">
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h2>Products</h2>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">
            <FiPlus /> Add Product
          </Link>
        </div>

        {loading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : (
          <div className="table-overflow" style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ width: 40, height: 50, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-surface-light)' }}>
                        {product.images?.[0] ? (
                          <img src={getImageUrl(product.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}>👖</div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{product.name}</td>
                    <td>{product.category}</td>
                    <td>
                      {product.discountPercent > 0 ? (
                        <span>{formatPrice(calculateDiscount(product.price, product.discountPercent))} <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{formatPrice(product.price)}</span></span>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </td>
                    <td>{product.stock}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {product.isNewArrival && <span className="badge badge-new" style={{ fontSize: '0.6rem' }}>New</span>}
                        {product.isFlashSale && <span className="badge badge-sale" style={{ fontSize: '0.6rem' }}>Sale</span>}
                        {product.stock <= 0 && <span className="badge badge-out" style={{ fontSize: '0.6rem' }}>Out</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.4rem' }}
                        >
                          <FiEdit />
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.4rem' }}
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 'var(--space-lg)' }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
