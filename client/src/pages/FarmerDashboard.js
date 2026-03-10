import { useEffect, useState, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import VoiceInput from '../components/VoiceInput';
import { api } from '../api';

function FarmerDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const initialFormState = {
    name: '',
    category: '',
    unit: 'kg',
    pricePerKg: '',
    stockKg: '',
    description: '',
    location: '',
    image: null,
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  // 🚀 NEW: Smart Voice Auto-fill Handler
  const handleSmartVoiceFill = useCallback((parsed) => {
    console.log('🗣️ Smart Voice Result:', parsed);
    
    // Auto-fill matched fields
    if (parsed.smartData.name) {
      setFormData(prev => ({ ...prev, name: parsed.smartData.name }));
    }
    if (parsed.smartData.category) {
      setFormData(prev => ({ ...prev, category: parsed.smartData.category }));
    }
    if (parsed.smartData.pricePerKg) {
      setFormData(prev => ({ ...prev, pricePerKg: parsed.smartData.pricePerKg }));
    }
    if (parsed.smartData.stockKg) {
      setFormData(prev => ({ ...prev, stockKg: parsed.smartData.stockKg }));
    }
    if (parsed.smartData.location) {
      setFormData(prev => ({ ...prev, location: parsed.smartData.location }));
    }
    if (parsed.smartData.description) {
      setFormData(prev => ({ ...prev, description: parsed.smartData.description }));
    }

    // Success feedback
    if (parsed.confidence > 1) {
      const fields = Object.keys(parsed.smartData).length;
      alert(`✅ Auto-filled ${fields} fields! 🎉\n\nWhat was heard: "${parsed.singleField}"`);
    } else {
      // Single field fallback
      setFormData(prev => ({ ...prev, name: parsed.singleField }));
    }
  }, []);

  // Load Products Function
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token || !user?.id) return;

      const res = await api.get('/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const mine = res.data.filter((p) => 
        p.farmer === user.id || p.farmer?._id === user.id
      );
      setProducts(mine);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load Orders
  const loadOrders = useCallback(() => {
    try {
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    if (!user || user.role !== 'farmer') {
      setLoading(false);
      return;
    }
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders, user]);

  // Reset Form
  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setEditingProduct(null);
  }, []);

  // Input Change Handler
  const handleInputChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files?.[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  // Open Edit Modal
  const handleEditClick = useCallback((product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      unit: product.unit || 'kg',
      pricePerKg: product.pricePerKg || '',
      stockKg: product.stockKg || '',
      description: product.description || '',
      location: product.location || '',
      image: null,
    });
    setShowEditModal(true);
  }, []);

  // Close Modal Helper
  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  }, [resetForm]);

  // Delete Product
  const handleDelete = useCallback(async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  }, [loadProducts]);

  // Validate Form
  const validateForm = useCallback(() => {
    const requiredFields = ['name', 'category', 'pricePerKg', 'stockKg', 'location'];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        return false;
      }
    }
    return true;
  }, [formData]);

  // Submit New Product
  const handleAddSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please fill all required fields');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '' && value !== undefined) {
          data.append(key, value);
        }
      });

      await api.post('/products', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      closeModal();
      await loadProducts();
      alert('✅ Product added successfully!');
    } catch (err) {
      console.error('Add error:', err.response?.data || err.message);
      alert(`Failed to add product: ${err.response?.data?.message || 'Server error'}`);
    }
  }, [formData, validateForm, closeModal, loadProducts]);

  // Submit Update Product
  const handleUpdateSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please fill all required fields');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && !formData.image) return;
        if (value !== null && value !== '' && value !== undefined) {
          data.append(key, value);
        }
      });

      await api.put(`/products/${editingProduct._id}`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      closeModal();
      await loadProducts();
      alert('✅ Product updated successfully!');
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      alert(`Failed to update product: ${err.response?.data?.message || 'Server error'}`);
    }
  }, [formData, editingProduct, validateForm, closeModal, loadProducts]);

  // Memoized Stats
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const activeOrders = orders.length;
    return { totalRevenue, activeOrders };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-900">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-4 hover:text-red-900 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-emerald-900/70">Welcome back,</p>
            <h1 className="text-2xl font-bold text-emerald-900">
              {user?.name || 'Farmer'}
            </h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-5 py-2.5 rounded-full bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition shadow-sm flex items-center gap-2"
            aria-label="Add new product"
          >
            <span>+</span> Add Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <p className="text-sm text-emerald-600 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-emerald-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <p className="text-sm text-emerald-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-900">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <p className="text-sm text-emerald-600 mb-1">Active Orders</p>
            <p className="text-2xl font-bold text-emerald-900">{stats.activeOrders}</p>
          </div>
        </div>

        {/* Products Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-emerald-900 mb-4">Your Inventory</h2>
          
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-emerald-100 p-12 text-center">
              <p className="text-emerald-900/60">No products yet. Add your first product above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p._id} className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm hover:shadow-md transition">
                  <div className="h-40 rounded-xl bg-gray-100 mb-4 overflow-hidden relative group">
                    {p.image ? (
                      <img
                        src={`http://localhost:5000${p.image}`}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400 text-sm">No Image</div>
                    )}
                    <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold text-emerald-700 shadow-sm">
                      {p.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-emerald-900 text-lg mb-1 line-clamp-2">{p.name}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-emerald-600 font-medium">₹{parseFloat(p.pricePerKg || 0).toFixed(2)}/{p.unit}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {parseFloat(p.stockKg || 0).toFixed(1)} {p.unit}
                    </p>
                  </div>

                  <div className="flex gap-2 border-t border-gray-100 pt-3">
                    <button 
                      onClick={() => handleEditClick(p)}
                      className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition"
                      aria-label={`Edit ${p.name}`}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(p._id)}
                      className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
                      aria-label={`Delete ${p.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Orders Section */}
        <section>
          <h2 className="text-lg font-bold text-emerald-900 mb-4">Recent Orders</h2>
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-emerald-900/60">No orders received yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-emerald-50 text-emerald-900">
                    <tr>
                      <th className="p-4 font-semibold min-w-[100px]">Order ID</th>
                      <th className="p-4 font-semibold min-w-[200px]">Items</th>
                      <th className="p-4 font-semibold text-right min-w-[100px]">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-emerald-50 transition">
                        <td className="p-4 text-emerald-900 font-medium">#{o.id.toString().slice(-4)}</td>
                        <td className="p-4 text-gray-600 max-w-[200px] truncate">
                          {o.items?.map(i => `${i.name} (${i.qty})`).join(', ') || 'N/A'}
                        </td>
                        <td className="p-4 text-right font-medium text-emerald-700">₹{o.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 🚀 NEW: Smart Voice Modal */}
      {(showAddModal || showEditModal) && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 id="modal-title" className="text-xl font-bold text-emerald-900">
                {showEditModal ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 -m-1 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={showEditModal ? handleUpdateSubmit : handleAddSubmit} className="p-6 space-y-4">
  {/* 🚀 AI TAMIL VOICE - ONE BUTTON FILLS PERFECT ENGLISH */}
  <div className="bg-gradient-to-br from-purple-50 to-emerald-50 p-6 rounded-3xl border-4 border-purple-200 shadow-2xl">
    <div className="text-center mb-4">
      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent mb-2">
        🤖 AI Tamil Voice Assistant
      </h3>
      <p className="text-sm text-purple-800 font-medium">
        Say: "உருளைக்கிழங்கு கிலோ 70 பெரம்பலூர்" → Gets "Fresh Potato, ₹70/kg, Perambalur"
      </p>
    </div>
    
    <VoiceInput 
      onSmartFill={handleSmartVoiceFill}
      label="AI Tamil → Perfect English"
      language="ta-IN"
    />
    
    <div className="mt-4 p-3 bg-white/60 rounded-2xl border text-xs text-purple-700 text-center">
      Works perfectly: உருளைக்கிழங்கு, தக்காளி, வெங்காயம், அரிசி, மாம்பழம்
    </div>
  </div>

              {/* Name Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-emerald-50"
                  placeholder="e.g. Fresh Potatoes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-emerald-50"
                  >
                    <option value="">Select...</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-emerald-50"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="liter">Liter (L)</option>
                    <option value="piece">Piece</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="pricePerKg"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerKg}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-emerald-50"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="stockKg"
                    type="number"
                    min="0"
                    value={formData.stockKg}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-emerald-50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-emerald-50"
                  placeholder="e.g. Perambalur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition bg-emerald-50"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition"
                />
                {formData.image && (
                  <p className="mt-1 text-xs text-emerald-600">Image selected: {formData.image.name}</p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!validateForm()}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition"
                >
                  {showEditModal ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerDashboard;
