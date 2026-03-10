import { useEffect, useState } from 'react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filtered = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(query.toLowerCase());
    const matchesLocation =
      locationFilter === 'all' ||
      (p.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    return matchesQuery && matchesLocation;
  });

  const addToCart = (product) => {
    const stored = localStorage.getItem('cart');
    const current = stored ? JSON.parse(stored) : [];
    const existing = current.find((i) => i._id === product._id);

    if (existing) {
      existing.quantityKg += 1;
    } else {
      current.push({ ...product, quantityKg: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(current));
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-emerald-50">
      <Navbar />

      {/* page header */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-center text-emerald-900">
          Fresh Marketplace
        </h1>
        <p className="text-center text-sm text-emerald-900/70 mt-1">
          Browse fresh produce directly from local farmers
        </p>

        {/* search bar */}
        <div className="mt-6 flex justify-center gap-3">
          <div className="w-full max-w-xl flex items-center bg-white border border-emerald-100 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <span className="text-emerald-500 mr-2">🔍</span>
            <input
              className="flex-1 bg-transparent outline-none text-sm text-emerald-900"
              placeholder="Search for crops, vegetables, fruits..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              const sr = window.SpeechRecognition || window.webkitSpeechRecognition;
              if (sr) {
                const rec = new sr();
                rec.onresult = (e) => setQuery(e.results[0][0].transcript);
                rec.start();
              }
            }}
            className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shadow-md"
            title="Search by voice"
          >
            🎙️
          </button>
        </div>
      </section>

      {/* content */}
      <main className="mx-auto max-w-6xl px-4 pb-10 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
        {/* filters */}
        <aside className="bg-white rounded-2xl border border-emerald-100 p-4 h-fit sticky top-4">
          <h2 className="text-sm font-semibold text-emerald-900 mb-4">
            Filters
          </h2>

          <div className="mb-4">
            <p className="text-xs text-emerald-900/70 mb-1">Location</p>
            <select
              className="w-full border border-emerald-100 rounded-lg px-2 py-1.5 text-sm bg-emerald-50 outline-none"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All locations</option>
              {Array.from(new Set(products.map((p) => p.location))).map(
                (loc) =>
                  loc && (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  )
              )}
            </select>
          </div>

          <div>
            <p className="text-xs text-emerald-900/70 mb-1">Price Range</p>
            <input type="range" min="0" max="500" className="w-full accent-emerald-600" />
            <p className="text-[11px] text-emerald-900/60 mt-1">
              Visual only; real filter can be added later.
            </p>
          </div>
        </aside>

        {/* products grid */}
        <section>
          <p className="text-xs text-emerald-900/70 mb-3">
            {filtered.length} products found
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              // ✅ FULLY CLICKABLE PRODUCT CARD - navigates to details
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="block hover:shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200"
              >
                <article className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col h-full">
                  {/* Image Section */}
                  <div className="h-40 bg-gray-100 relative group-hover:brightness-105">
                    {p.image ? (
                      <img
                        src={`http://localhost:5000${p.image}`}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-500 text-sm bg-emerald-50">
                        No Image
                      </div>
                    )}
                    {p.category && (
                      <span className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-lg text-emerald-800 shadow-md border border-emerald-200">
                        {p.category}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-emerald-900 text-base leading-tight line-clamp-2">
                        {p.name}
                      </h3>
                      <span className="text-sm font-bold text-emerald-900 ml-2 whitespace-nowrap">
                        ₹{p.pricePerKg}
                        <span className="text-[11px] text-emerald-900/70 font-normal">
                          /{p.unit || 'kg'}
                        </span>
                      </span>
                    </div>

                    {/* ✅ FARMER LINK */}
                    {p.farmer && (
                      <div className="text-[11px] mb-2 text-emerald-700/90 hover:text-emerald-600 transition-colors">
                        👨‍🌾 {p.farmer.name || 'Local Farmer'} • {p.location || 'Nearby'}
                      </div>
                    )}

                    <p className="text-[12px] text-emerald-900/70 mb-3 flex-1 line-clamp-2 leading-relaxed">
                      {p.description || 'Fresh produce from local farmers. Harvested today!'}
                    </p>

                    {/* Stock & Action - Fixed at bottom */}
                    <div className="flex items-center justify-between pt-2 border-t border-emerald-50 mt-auto">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${p.stockKg < 10 ? 'bg-red-50 text-red-700 border-red-200' :
                          p.stockKg < 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                        {p.stockKg} {p.unit || 'kg'} left
                      </span>

                      {/* Quick Add Button - Still works on hover */}
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigation
                          e.stopPropagation(); // Stop bubbling
                          addToCart(p);
                        }}
                        className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                      >
                        + Quick Add
                      </button>
                    </div>
                  </div>
                </article>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-10 text-center bg-white rounded-2xl border border-emerald-100">
                <div className="text-emerald-900/50">
                  <p className="text-lg mb-2">No products match your search.</p>
                  <button
                    onClick={() => { setQuery(''); setLocationFilter('all') }}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductList;
