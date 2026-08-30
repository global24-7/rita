import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { createProduct, updateProduct, getProduct } from '../../api';
import { getImageUrl } from '../../utils/helpers';

const allSizes = ['26', '28', '30', '32', '34', '36', '38', '40'];
const categories = ['Skinny', 'Straight', 'Ripped', 'Mom Fit', 'Baggy', 'Wide Leg'];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Skinny',
    price: '',
    discountPercent: '0',
    saleStartsAt: '',
    saleEndsAt: '',
    sizes: [],
    stock: '',
    isNewArrival: false,
    isFlashSale: false,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(isEdit);

  useEffect(() => {
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getProduct(id);
      const p = res.data;
      setForm({
        name: p.name,
        description: p.description,
        category: p.category,
        price: String(p.price),
        discountPercent: String(p.discountPercent || 0),
        saleStartsAt: p.saleStartsAt ? new Date(p.saleStartsAt).toISOString().slice(0, 16) : '',
        saleEndsAt: p.saleEndsAt ? new Date(p.saleEndsAt).toISOString().slice(0, 16) : '',
        sizes: p.sizes || [],
        stock: String(p.stock),
        isNewArrival: p.isNewArrival,
        isFlashSale: p.isFlashSale,
      });
      setExistingImages(p.images || []);
    } catch (error) {
      toast.error('Product not found');
      navigate('/admin/products');
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.stock) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.sizes.length === 0) {
      toast.error('Please select at least one size');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('discountPercent', form.discountPercent);
      formData.append('stock', form.stock);
      formData.append('isNewArrival', form.isNewArrival);
      formData.append('isFlashSale', form.isFlashSale);
      formData.append('sizes', JSON.stringify(form.sizes));

      if (form.saleStartsAt) formData.append('saleStartsAt', form.saleStartsAt);
      if (form.saleEndsAt) formData.append('saleEndsAt', form.saleEndsAt);

      if (isEdit) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      images.forEach((file) => {
        formData.append('images', file);
      });

      if (isEdit) {
        await updateProduct(id, formData);
        toast.success('Product updated!');
      } else {
        await createProduct(formData);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return <div className="loader"><div className="spinner"></div></div>;
  }

  return (
    <div id="product-form">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input type="text" id="name" name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="e.g. Classic Dark Wash Skinny" />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select id="category" name="category" className="form-select" value={form.category} onChange={handleChange}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" className="form-input" rows="3" value={form.description} onChange={handleChange} placeholder="Describe the product..." />
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="price">Price (GH₵) *</label>
            <input type="number" id="price" name="price" className="form-input" value={form.price} onChange={handleChange} min="0" step="0.01" placeholder="0.00" />
          </div>
          <div className="form-group">
            <label htmlFor="discountPercent">Discount %</label>
            <input type="number" id="discountPercent" name="discountPercent" className="form-input" value={form.discountPercent} onChange={handleChange} min="0" max="100" />
          </div>
          <div className="form-group">
            <label htmlFor="stock">Stock *</label>
            <input type="number" id="stock" name="stock" className="form-input" value={form.stock} onChange={handleChange} min="0" placeholder="0" />
          </div>
        </div>

        {/* Sizes */}
        <div className="form-group">
          <label>Available Sizes *</label>
          <div className="sizes-grid">
            {allSizes.map((size) => (
              <label key={size}>
                <input type="checkbox" checked={form.sizes.includes(size)} onChange={() => toggleSize(size)} />
                {size}
              </label>
            ))}
          </div>
        </div>

        {/* Flash Sale Settings */}
        <div className="form-row">
          <div className="checkbox-group">
            <input type="checkbox" id="isFlashSale" name="isFlashSale" checked={form.isFlashSale} onChange={handleChange} />
            <label htmlFor="isFlashSale">Flash Sale</label>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="isNewArrival" name="isNewArrival" checked={form.isNewArrival} onChange={handleChange} />
            <label htmlFor="isNewArrival">New Arrival</label>
          </div>
        </div>

        {form.isFlashSale && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="saleStartsAt">Sale Starts</label>
              <input type="datetime-local" id="saleStartsAt" name="saleStartsAt" className="form-input" value={form.saleStartsAt} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="saleEndsAt">Sale Ends</label>
              <input type="datetime-local" id="saleEndsAt" name="saleEndsAt" className="form-input" value={form.saleEndsAt} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className="form-group">
          <label>Product Images</label>
          <label className="image-upload-area" htmlFor="image-upload">
            <div className="upload-icon"><FiUpload /></div>
            <p>Click to upload images (JPEG, PNG, WebP — max 5MB each)</p>
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div className="image-previews">
            {existingImages.map((img, idx) => (
              <div key={`existing-${idx}`} className="image-preview">
                <img src={getImageUrl(img)} alt="" />
                <button type="button" className="remove-btn" onClick={() => removeExistingImage(idx)}>
                  <FiX />
                </button>
              </div>
            ))}
            {images.map((file, idx) => (
              <div key={`new-${idx}`} className="image-preview">
                <img src={URL.createObjectURL(file)} alt="" />
                <button type="button" className="remove-btn" onClick={() => removeNewImage(idx)}>
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--space-lg)' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
