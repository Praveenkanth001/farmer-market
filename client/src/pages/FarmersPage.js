import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Add if you have Footer
import { api } from '../api';

function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await api.get('/farmers');
        setFarmers(res.data);
      } catch (err) {
        console.error('Error fetching farmers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading our farmers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Farmers</h1>
          <p className="text-xl md:text-2xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Connect directly with the farmers who grow your food. Fresh from farm to table.
          </p>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {farmers.map((farmer) => (
            <Link 
              to={`/farmers/${farmer._id}`}
              key={farmer._id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-emerald-100 overflow-hidden"
            >
              {/* Farmer Avatar */}
              <div className="relative h-64 bg-gradient-to-br from-emerald-500 to-green-600 p-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                {farmer.avatar ? (
                  <img
                    src={`http://localhost:5000/uploads/${farmer.avatar}`}
                    alt={farmer.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl group-hover:shadow-white/50 transition-shadow"
                  />
                ) : (
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold text-white backdrop-blur-sm">
                    {farmer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Farmer Details */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  {farmer.name}
                </h3>
                
                {/* Location */}
                <div className="flex items-center text-emerald-700 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{farmer.location || 'Tamil Nadu'}</span>
                </div>

                {/* Products Count */}
                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>{farmer.productsCount || 0} Products Available</span>
                </div>

                {/* About (truncated) */}
                {farmer.about && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                    {farmer.about}
                  </p>
                )}

                {/* CTA Button */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Verified Farmer</span>
                  <span className="text-emerald-600 font-semibold text-lg group-hover:text-emerald-700 transition-colors">
                    View Profile →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {farmers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Farmers Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Be the first farmer to join our platform and connect directly with buyers.
            </p>
          </div>
        )}
      </div>

      <Footer /> {/* Add if you have footer component */}
    </div>
  );
}

export default FarmersPage;
