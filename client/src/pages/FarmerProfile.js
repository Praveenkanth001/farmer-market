import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api';

function FarmerProfile() {
  const { id } = useParams(); 
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ UPDATED: Fetch from the dedicated endpoint we created
        // This returns { farmer: {...}, products: [...] }
        const res = await api.get(`/farmers/${id}`);
        
        setFarmer(res.data.farmer);
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to load farmer profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // ✅ ADDED: Function to handle Add to Cart
  const addToCart = (e, product) => {
    e.preventDefault(); // Prevent navigating to product page when clicking button
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage')); // Updates Navbar count
    alert(`${product.name} added to cart!`);
  };

  if (loading) return <div className="p-10 text-center text-lg font-semibold">Loading Profile...</div>;
  if (!farmer) return <div className="p-10 text-center text-red-500">Farmer not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header / Profile Card */}
      <div className="bg-emerald-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-700 text-3xl font-bold shadow-lg border-4 border-emerald-500">
             {farmer.name ? farmer.name[0].toUpperCase() : 'F'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{farmer.name}</h1>
            <p className="text-emerald-100 flex items-center justify-center md:justify-start gap-2 mt-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {farmer.location || 'Location not specified'}
            </p>
            <div className="mt-4 flex gap-4 text-sm font-medium justify-center md:justify-start">
               <span className="bg-emerald-800 px-3 py-1 rounded-full border border-emerald-500">
                 {products.length} Products Listed
               </span>
               <span className="bg-emerald-800 px-3 py-1 rounded-full border border-emerald-500">
                 Verified Seller ✅
               </span>
            </div>
            {/* Show About text if available */}
            {farmer.about && <p className="mt-4 text-emerald-50 max-w-2xl text-sm opacity-90">{farmer.about}</p>}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Farm Fresh Produce</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">This farmer has no active listings at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                to={`/product/${product._id}`} 
                key={product._id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-300 block"
              >
                <div className="h-48 bg-gray-100 relative">
                  <img 
                    src={product.image ? `http://localhost:5000${product.image}` : 'https://via.placeholder.com/300'} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-white/90 text-emerald-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                    {product.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2 h-10">{product.description}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-emerald-600">₹{product.price}/kg</span>
                    <button 
                      onClick={(e) => addToCart(e, product)}
                      className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700 active:scale-95 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FarmerProfile;
