// src/ProductDetail.js - CORRECTED IMPORTS
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';        // ✅ FIXED: ./components/
import Footer from './components/Footer';        // ✅ FIXED: ./components/
import { api } from './api';

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Product fetch error:', err);
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  const addToCart = () => {
    const cartItem = {
      _id: product._id,
      name: product.name,
      pricePerKg: product.pricePerKg,
      unit: product.unit,
      image: product.image,
      quantityKg: quantity
    };
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item._id === product._id);
    
    if (existing) {
      existing.quantityKg += quantity;
    } else {
      cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${quantity} ${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-lg text-emerald-600 animate-pulse">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-lg text-emerald-600">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-white rounded-2xl shadow-xl overflow-hidden">
              <img 
                src={`http://localhost:5000${product.image}`} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Farmer */}
            {product.farmer && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    👨‍🌾
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sold by</p>
                    <p className="font-semibold text-emerald-900">{product.farmer.name}</p>
                    <p className="text-xs text-gray-500">{product.location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-emerald-900 mb-3">{product.name}</h1>
              {product.category && (
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
              )}
            </div>

            {/* Price & Stock */}
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-emerald-900">₹{product.pricePerKg}</span>
                <span className="text-xl text-gray-500">per {product.unit}</span>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  product.stockKg < 10 ? 'bg-red-100 text-red-700' : 
                  product.stockKg < 50 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  Stock: {product.stockKg} {product.unit}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Quantity</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-emerald-900 w-24 text-center">
                  {quantity} {product.unit}
                </span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stockKg, quantity + 1))}
                  className="w-14 h-14 bg-emerald-100 hover:bg-emerald-200 rounded-2xl flex items-center justify-center text-2xl font-bold text-emerald-700 transition-all"
                >
                  +
                </button>
                <button
                  onClick={addToCart}
                  disabled={quantity > product.stockKg}
                  className="ml-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                <h3 className="text-xl font-bold text-emerald-900 mb-4">About this product</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer - Safe conditional render */}
      {Footer && <Footer />}
    </div>
  );
}

export default ProductDetail;
